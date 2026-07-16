import React from 'react';

function isAugustClosure(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.getMonth() === 7 && d.getDate() >= 1 && d.getDate() <= 21;
}

function sameOrAfter(a, b) {
  if (!a || !b) return false;
  return a >= b;
}

function sameOrBefore(a, b) {
  if (!a || !b) return false;
  return a <= b;
}

const ChantierBlock = React.memo(function ChantierBlock({
  chantier, seg, segIndex, segCount, longestLen, stack, segmentsLength, cellWidth, isActive, resize, canEdit, conducteurMap, cb,
}) {
  const conducteur = conducteurMap.get(Number(chantier.conducteurId));
  const segLen = seg.end - seg.start + 1;
  const width = segLen * cellWidth - 8;
  const compact = segmentsLength > 1;
  const isFirstSegment = segIndex === 0;
  const isLastSegment = segIndex === segCount - 1;
  const isLongestSeg = segLen === longestLen;
  const blocH = Math.round(36 + (cellWidth - 26) * (54 - 36) / 26);
  const blocT = Math.round(8 + (cellWidth - 26) * (11 - 8) / 26);
  const height = compact
    ? Math.max(15, Math.min(Math.round(20 + (cellWidth - 26) * (26 - 20) / 26), blocH / segmentsLength))
    : blocH;
  const top = compact ? Math.round(5 + (cellWidth - 26) * (7 - 5) / 26) + stack * (height + 2) : blocT;

  return (
    <div
      className={`bloc chantier ${compact ? 'compact-bloc' : ''} ${chantier.termine ? 'termine' : ''} ${isActive ? 'active-item' : ''}`}
      draggable={!resize && canEdit}
      onMouseDown={(e) => {
        e.stopPropagation();
        cb.setSelectedItem({ type: 'chantier', id: chantier.id });
      }}
      onDoubleClick={() => cb.openEditChantier(chantier)}
      onContextMenu={(e) => cb.handleContextMenu(e, 'chantier', chantier.id)}
      onDragStart={(e) => cb.onDragStart(e, chantier.id, 'chantier')}
      style={{ width, top, height, background: chantier.color }}
      title={`${chantier.nom}${chantier.detail ? ` — ${chantier.detail}` : ''} (${chantier.duree}j)`}
    >
      <div className="resize-handle left" onMouseDown={(e) => cb.startResize(e, chantier, 'left')} />
      {chantier.note && isFirstSegment && (
        <div className="note-icon"
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const tip = e.currentTarget.querySelector('.tooltip');
            tip.style.left = (rect.left - 260) + 'px';
            tip.style.top = (rect.top - 10) + 'px';
          }}
        >
          💬
          <div className="tooltip">{chantier.note}</div>
        </div>
      )}
      {chantier.linked && cellWidth >= 22 && <div className="link-icon">🔗</div>}
      <div className="chantier-content">
        <div className="chantier-title-row">
          <strong>{chantier.nom}</strong>
          {(isLongestSeg || segLen > 15) && chantier.detail && <em>{chantier.detail}</em>}
        </div>
        {isLastSegment && <small>{chantier.duree} j</small>}
      </div>
      <div className="conducteur-bar" style={{ background: conducteur?.color || '#64748b' }} />
      <div className="resize-handle right" onMouseDown={(e) => cb.startResize(e, chantier, 'right')} />
    </div>
  );
});

const CongeBlock = React.memo(function CongeBlock({
  conge, seg, cellWidth, isActive, resize, canEdit, cb,
}) {
  const cH = Math.round(36 + (cellWidth - 26) * (54 - 36) / 26);
  const cT = Math.round(8 + (cellWidth - 26) * (11 - 8) / 26);
  return (
    <div
      className={`bloc conge ${conge.allEquipes ? 'conge-entreprise' : ''} ${isActive ? 'active-item' : ''}`}
      draggable={!resize && canEdit}
      onDragStart={(e) => cb.onDragStart(e, conge.id, 'conge')}
      style={{
        width: (seg.end - seg.start + 1) * cellWidth - 8,
        height: cH,
        top: cT,
        fontSize: 16,
        padding: `${Math.max(4, Math.round(6 + (cellWidth - 26) * 2 / 26))}px ${Math.max(4, Math.round(8 + (cellWidth - 26) * 2 / 26))}px`,
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        cb.setSelectedItem({ type: 'conge', id: conge.id });
      }}
      onDoubleClick={() => cb.openEditConge(conge)}
      onContextMenu={(e) => cb.handleContextMenu(e, 'conge', conge.id)}
    >
      {conge.nom}
    </div>
  );
});

const PlanningGrid = React.memo(function PlanningGrid({
  gridRows,
  visibleDays,
  weekGroups,
  monthGroups,
  chantiersParCellule,
  congeSegments,
  conducteurs,
  selectedItem,
  dragPreview,
  selection,
  cellWidth,
  canEdit,
  resize,
  today,
  ferieSet,
  viewportDayRange,
  callbacksRef,
  dragThrottle,
  scrollRef,
}) {
  const cb = callbacksRef.current;
  const gridTemplateColumns = `260px repeat(${visibleDays.length}, ${cellWidth}px)`;
  const conducteurMap = React.useMemo(() => new Map(conducteurs.map(c => [c.id, c])), [conducteurs]);

  const { start: vpStart, end: vpEnd } = viewportDayRange || { start: 0, end: visibleDays.length - 1 };
  const visibleDaysSlice = visibleDays.slice(vpStart, vpEnd + 1);

  function isSelected(equipe, date) {
    if (!selection) return false;
    if (selection.equipe !== equipe) return false;
    const startIdx = visibleDays.findIndex((d) => d.date === selection.startDate);
    const endIdx = visibleDays.findIndex((d) => d.date === selection.endDate);
    const idx = visibleDays.findIndex((d) => d.date === date);
    if (startIdx === -1 || endIdx === -1 || idx === -1) return false;
    const a = Math.min(startIdx, endIdx);
    const b = Math.max(startIdx, endIdx);
    return idx >= a && idx <= b;
  }

  function isFerie(date) {
    return ferieSet.has(date);
  }

  function isCongeActive(conge) {
    return selectedItem?.type === 'conge' && selectedItem.id === conge.id;
  }

  return (
    <div className="planning-container">
      <div className="planning-scroll" ref={scrollRef} onScroll={cb.handleScroll}>
        <div className="planning-header">
          <div className="grid month-grid" style={{ gridTemplateColumns }}>
            <div className="corner month-corner"></div>
            {monthGroups.map((g, i) => (
              <div className={`month-cell ${i % 2 === 0 ? 'month-even' : 'month-odd'}`} key={g.monthKey} style={{ gridColumn: `span ${g.count}` }}>
                {g.monthLabel}
              </div>
            ))}
          </div>

          <div className="grid week-grid" style={{ gridTemplateColumns }}>
            <div className="corner week-corner"><strong>Équipes</strong></div>
            {weekGroups.map((g, i) => (
              <div className="week-cell" key={`${g.week}-${i}`} style={{ gridColumn: `span ${g.count}` }}>
                S{g.week}
              </div>
            ))}
          </div>

          <div className="grid date-grid" style={{ gridTemplateColumns, gridAutoRows: Math.round(28 + (cellWidth - 26) * (44 - 28) / 26) }}>
            <div className="corner date-corner"></div>
            {visibleDays.map((d) => (
              <div
                key={d.date}
                className={`date-cell ${d.weekend ? 'weekend' : ''} ${isFerie(d.date) ? 'ferie' : ''} ${isAugustClosure(d.date) ? 'august-closure' : ''} ${d.date === today ? 'today' : ''}`}
                title={d.date}
              >
                {cellWidth >= 36 && <span>{d.weekday}</span>}
                <strong style={{ fontSize: Math.max(8, Math.min(12, 8 + (cellWidth - 26) * 4 / 26)) }}>{d.dayNumber}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="grid main-grid" style={{ gridTemplateColumns, gridAutoRows: Math.round(56 + (cellWidth - 26) * (78 - 56) / 26) }}>
          {gridRows.map((row) => {
            if (row.type === 'separator') {
              return (
                <React.Fragment key={row.id}>
                  <div className="team-cell separator-row" />
                  {visibleDays.map((day) => (
                    <div key={`sep-${day.date}`} className="cell separator-cell" />
                  ))}
                </React.Fragment>
              );
            }

            if (row.type === 'company-header') {
              return (
                <React.Fragment key={row.id}>
                  <div className="team-cell company-header-cell"><span>{row.name}</span>{canEdit && <button className="add-team-btn" onClick={() => cb.addTeamToCompany(row.id.replace('ch-', ''))}>+</button>}</div>
                  {visibleDays.map((day) => (
                    <div key={`${row.id}-${day.date}`} className="cell company-header-day" />
                  ))}
                </React.Fragment>
              );
            }

            const equipeIndex = row.type === 'pending' ? row.equipeIndex : row.teamIndex;
            const isPending = row.type === 'pending';

            return (
              <div key={isPending ? row.id : `team-${row.teamIndex}`} style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 80px' }}>
                <div className={`team-cell ${equipeIndex % 2 ? 'odd' : ''} ${isPending ? 'pending-team' : ''}`}>
                  {isPending ? null : (
                    <>
                      <div className="avatar" style={{ fontSize: Math.round(10 + (cellWidth - 26) * 4 / 26) }}>{row.numInCompany}</div>
                      <input
                        defaultValue={row.name}
                        onBlur={(e) => cb.updateTeam(row.teamIndex, e.target.value)}
                        style={{ fontSize: Math.round(11 + (cellWidth - 26) * 3 / 26) }}
                      />
                      {canEdit && <button className="delete-team" onClick={() => cb.deleteTeam(row.teamIndex)}>×</button>}
                    </>
                  )}
                </div>

                {visibleDaysSlice.map((day, _idx) => {
                  const realIdx = vpStart + _idx;
                  const segments = chantiersParCellule.get(`${equipeIndex}-${realIdx}`) || [];
                  const congeItems = (congeSegments.get(`${equipeIndex}-${realIdx}`) || []);

                  return (
                    <div
                      key={`${equipeIndex}-${day.date}`}
                      className={`cell ${equipeIndex % 2 ? 'odd' : ''} ${day.weekend ? 'weekend' : ''} ${isFerie(day.date) ? 'ferie' : ''} ${isAugustClosure(day.date) ? 'august-closure' : ''} ${day.date === today ? 'today' : ''} ${isSelected(equipeIndex, day.date) ? 'selected' : ''} ${dragPreview?.equipe === equipeIndex && dragPreview?.date === day.date ? 'drag-preview' : ''} ${isPending ? 'pending-cell' : ''}`}
                      onMouseDown={(e) => cb.startSelection(e, equipeIndex, day.date)}
                      onMouseEnter={() => cb.updateSelection(equipeIndex, day.date)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (!dragThrottle.current) {
                          dragThrottle.current = requestAnimationFrame(() => {
                            cb.setDragPreview({ equipe: equipeIndex, date: day.date });
                            dragThrottle.current = null;
                          });
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        cb.onDrop(e, row.teamIndex || equipeIndex, day.date);
                      }}
                    >
                      {segments.filter(({ seg }) => realIdx === seg.start).map(({ chantier, seg, i, stack, segIndex, segCount, longestLen }) => (
                        <ChantierBlock
                          key={`${chantier.id}-${i}`}
                          chantier={chantier}
                          seg={seg}
                          segIndex={segIndex}
                          segCount={segCount}
                          longestLen={longestLen}
                          stack={stack}
                          segmentsLength={segments.length}
                          cellWidth={cellWidth}
                          isActive={selectedItem?.type === 'chantier' && selectedItem.id === chantier.id}
                          resize={resize}
                          canEdit={canEdit}
                          conducteurMap={conducteurMap}
                          cb={cb}
                        />
                      ))}
                      {congeItems.map(({ conge, seg }) => (
                        <CongeBlock
                          key={conge.id}
                          conge={conge}
                          seg={seg}
                          cellWidth={cellWidth}
                          isActive={selectedItem?.type === 'conge' && selectedItem.id === conge.id}
                          resize={resize}
                          canEdit={canEdit}
                          cb={cb}
                        />
                      ))}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default PlanningGrid;
