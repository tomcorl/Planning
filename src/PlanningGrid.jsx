import React from 'react';

function sameOrAfter(a, b) {
  if (!a || !b) return false;
  return a >= b;
}

function sameOrBefore(a, b) {
  if (!a || !b) return false;
  return a <= b;
}

function isAugustClosure(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.getMonth() === 7 && d.getDate() >= 1 && d.getDate() <= 21;
}

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
  callbacksRef,
  dragThrottle,
  scrollRef,
  viewportDayRange,
}) {
  const cb = callbacksRef.current;
  const lastHoverRef = React.useRef(null);
  const totalDays = visibleDays.length;
  const { start: vpStart, end: vpEnd } = viewportDayRange || { start: 0, end: totalDays - 1 };
  const visibleDaysSlice = visibleDays.slice(vpStart, vpEnd + 1);
  const sliceCount = visibleDaysSlice.length;
  const gridTemplateColumns = `260px repeat(${sliceCount}, ${cellWidth}px)`;
  const paddingLeft = vpStart * cellWidth;
  const paddingRight = (totalDays - 1 - vpEnd) * cellWidth;

  const slicedMonthGroups = React.useMemo(() => {
    const groups = [];
    visibleDaysSlice.forEach((day) => {
      const last = groups[groups.length - 1];
      if (!last || last.monthKey !== day.monthKey) {
        groups.push({ monthLabel: day.monthLabel, monthKey: day.monthKey, count: 1 });
      } else {
        last.count += 1;
      }
    });
    return groups;
  }, [visibleDaysSlice]);

  const slicedWeekGroups = React.useMemo(() => {
    const groups = [];
    visibleDaysSlice.forEach((day) => {
      const last = groups[groups.length - 1];
      if (!last || last.week !== day.week) {
        groups.push({ week: day.week, count: 1 });
      } else {
        last.count += 1;
      }
    });
    return groups;
  }, [visibleDaysSlice]);

  const dayIdxMemo = React.useMemo(() => {
    const map = new Map();
    visibleDays.forEach((d, i) => map.set(d.date, i));
    return map;
  }, [visibleDays]);

  function dayIndex(date) {
    return dayIdxMemo.get(date) ?? -1;
  }

  function isFerie(date) {
    return ferieSet.has(date);
  }

  function isSelected(equipe, date) {
    if (!selection) return false;
    if (selection.equipe !== equipe) return false;
    const startIdx = dayIndex(selection.startDate);
    const endIdx = dayIndex(selection.endDate);
    const idx = dayIndex(date);
    if (startIdx === -1 || endIdx === -1 || idx === -1) return false;
    const a = Math.min(startIdx, endIdx);
    const b = Math.max(startIdx, endIdx);
    return idx >= a && idx <= b;
  }

  function getConducteur(id) {
    const num = Number(id);
    return conducteurs.find((c) => c.id === num);
  }

  function handleGridEvent(e) {
    const type = e.type;
    const cell = e.target.closest('[data-eq]');
    const chantierBloc = e.target.closest('[data-ch]');
    const congeBloc = e.target.closest('[data-co]');
    const resizeHandle = e.target.closest('[data-rs]');
    const noteIcon = e.target.closest('.note-icon');
    const addBtn = e.target.closest('.add-team-btn');
    const deleteBtn = e.target.closest('.delete-team');
    const teamInput = e.target.closest('.team-cell input');

    if (addBtn) return;
    if (deleteBtn) return;
    if (teamInput) return;

    if (resizeHandle && type === 'mousedown') {
      const ch = chantierBloc || resizeHandle.closest('[data-ch]');
      if (ch) {
        const side = resizeHandle.dataset.rs;
        e.stopPropagation();
        cb.startResize(e, {
          id: Number(ch.dataset.ch),
          start: ch.dataset.start,
          duree: Number(ch.dataset.duree),
          equipe: Number(ch.dataset.equipe),
          force_aout: ch.dataset.forceAout === '1',
        }, side);
        return;
      }
    }

    if (chantierBloc) {
      const id = Number(chantierBloc.dataset.ch);
      if (type === 'mousedown') {
        e.stopPropagation();
        cb.setSelectedItem({ type: 'chantier', id });
        return;
      }
      if (type === 'dblclick') {
        cb.openEditChantier({ id });
        return;
      }
      if (type === 'contextmenu') {
        e.preventDefault();
        cb.handleContextMenu(e, 'chantier', id);
        return;
      }
    }

    if (congeBloc) {
      const id = Number(congeBloc.dataset.co);
      if (type === 'mousedown') {
        e.stopPropagation();
        cb.setSelectedItem({ type: 'conge', id });
        return;
      }
      if (type === 'dblclick') {
        cb.openEditConge({ id });
        return;
      }
      if (type === 'contextmenu') {
        e.preventDefault();
        cb.handleContextMenu(e, 'conge', id);
        return;
      }
    }

    if (noteIcon && type === 'mouseover') {
      const rect = noteIcon.getBoundingClientRect();
      const tip = noteIcon.querySelector('.tooltip');
      if (tip) {
        tip.style.left = (rect.left - 260) + 'px';
        tip.style.top = (rect.top - 10) + 'px';
      }
    }

    if (!cell) return;
    const equipe = Number(cell.dataset.eq);
    const date = cell.dataset.da;

    if (type === 'mousedown') {
      cb.startSelection(e, equipe, date);
      return;
    }
    if (type === 'mouseover') {
      const key = `${equipe}-${date}`;
      if (lastHoverRef.current === key) return;
      lastHoverRef.current = key;
      cb.updateSelection(equipe, date);
      return;
    }
    if (type === 'dragover') {
      e.preventDefault();
      if (!dragThrottle.current) {
        dragThrottle.current = requestAnimationFrame(() => {
          cb.setDragPreview({ equipe, date });
          dragThrottle.current = null;
        });
      }
      return;
    }
    if (type === 'drop') {
      e.preventDefault();
      cb.onDrop(e, equipe, date);
      return;
    }
  }

  return (
    <div className="planning-container">
      <div className="planning-scroll" ref={scrollRef} onScroll={cb.handleScroll}>
        <div className="planning-header">
          <div className="grid month-grid" style={{ gridTemplateColumns, paddingLeft, paddingRight }}>
            <div className="corner month-corner"></div>
            {slicedMonthGroups.map((g, i) => (
              <div
                className={`month-cell ${i % 2 === 0 ? 'month-even' : 'month-odd'}`}
                key={g.monthKey}
                style={{ gridColumn: `span ${g.count}` }}
              >
                {g.monthLabel}
              </div>
            ))}
          </div>

          <div className="grid week-grid" style={{ gridTemplateColumns, paddingLeft, paddingRight }}>
            <div className="corner week-corner">
              <strong>Équipes</strong>
            </div>
            {slicedWeekGroups.map((g, i) => (
              <div
                className="week-cell"
                key={`${g.week}-${i}`}
                style={{ gridColumn: `span ${g.count}` }}
              >
                S{g.week}
              </div>
            ))}
          </div>

          <div className="grid date-grid" style={{ gridTemplateColumns, paddingLeft, paddingRight, gridAutoRows: Math.round(28 + (cellWidth - 26) * (44 - 28) / 26) }}>
            <div className="corner date-corner"></div>
            {visibleDaysSlice.map((d) => (
              <div
                key={d.date}
                className={`date-cell ${d.weekend ? 'weekend' : ''} ${
                  isFerie(d.date) ? 'ferie' : ''
                } ${isAugustClosure(d.date) ? 'august-closure' : ''} ${d.date === today ? 'today' : ''}`}
                title={d.date}
              >
                {cellWidth >= 36 && <span>{d.weekday}</span>}
                <strong style={{ fontSize: Math.max(8, Math.min(12, 8 + (cellWidth - 26) * 4 / 26)) }}>{d.dayNumber}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="grid main-grid"
          style={{ gridTemplateColumns, paddingLeft, paddingRight, gridAutoRows: Math.round(56 + (cellWidth - 26) * (78 - 56) / 26) }}
          onMouseDown={handleGridEvent}
          onMouseOver={handleGridEvent}
          onDragOver={handleGridEvent}
          onDrop={handleGridEvent}
          onDoubleClick={handleGridEvent}
          onContextMenu={handleGridEvent}
        >
          {gridRows.map((row) => {
            if (row.type === 'separator') {
              return (
                <React.Fragment key={row.id}>
                  <div className="team-cell separator-row" />
                  {visibleDaysSlice.map((day) => (
                    <div key={`sep-${day.date}`} className="cell separator-cell" />
                  ))}
                </React.Fragment>
              );
            }

            if (row.type === 'company-header') {
              return (
                <React.Fragment key={row.id}>
                  <div className="team-cell company-header-cell"><span>{row.name}</span>{canEdit && <button className="add-team-btn" onClick={() => cb.addTeamToCompany(row.id.replace('ch-', ''))}>+</button>}</div>
                  {visibleDaysSlice.map((day) => (
                    <div key={`${row.id}-${day.date}`} className="cell company-header-day" />
                  ))}
                </React.Fragment>
              );
            }

            const equipeIndex = row.type === 'pending' ? row.equipeIndex : row.teamIndex;
            const isPending = row.type === 'pending';

            return (
              <React.Fragment key={isPending ? row.id : `team-${row.teamIndex}`}>
                <div className={`team-cell ${equipeIndex % 2 ? 'odd' : ''} ${isPending ? 'pending-team' : ''}`}>
                  {isPending ? null : (
                    <>
                      <div className="avatar" style={{ fontSize: Math.round(10 + (cellWidth - 26) * 4 / 26) }}>{row.numInCompany}</div>
                      <input
                        defaultValue={row.name}
                        onBlur={(e) => cb.updateTeam(row.teamIndex, e.target.value)}
                        style={{ fontSize: Math.round(11 + (cellWidth - 26) * 3 / 26) }}
                      />
                      {canEdit && <button
                        className="delete-team"
                        onClick={() => cb.deleteTeam(row.teamIndex)}
                      >×</button>}
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
                      className={`cell ${equipeIndex % 2 ? 'odd' : ''} ${
                        day.weekend ? 'weekend' : ''
                      } ${isFerie(day.date) ? 'ferie' : ''} ${
                        isAugustClosure(day.date) ? 'august-closure' : ''
                      } ${day.date === today ? 'today' : ''} ${
                        isSelected(equipeIndex, day.date) ? 'selected' : ''
                      } ${
                        dragPreview?.equipe === equipeIndex &&
                        dragPreview?.date === day.date
                          ? 'drag-preview'
                          : ''
                      } ${isPending ? 'pending-cell' : ''}`}
                      data-eq={equipeIndex}
                      data-da={day.date}
                    >
                      {segments.filter(({ seg }) => {
                        const visibleStart = Math.max(seg.start, vpStart);
                        return realIdx === visibleStart && realIdx <= seg.end;
                      }).map(({ chantier, seg, i, stack, segIndex, segCount, longestLen }) => {
                        const conducteur = getConducteur(chantier.conducteurId);
                        const clippedStart = Math.max(seg.start, vpStart);
                        const clippedEnd = Math.min(seg.end, vpEnd);
                        const segLen = clippedEnd - clippedStart + 1;
                        const isFirstSegment = segIndex === 0;
                        const isLastSegment = segIndex === segCount - 1;
                        let width = segLen * cellWidth - 8;
                        if (resize?.id === chantier.id && resize.delta) {
                          if (resize.side === 'right' && isLastSegment) {
                            width += resize.delta * cellWidth;
                          } else if (resize.side === 'left' && isFirstSegment) {
                            width -= resize.delta * cellWidth;
                          }
                        }
                        const isLongestSeg = segLen === longestLen;
                        const blocH = Math.round(36 + (cellWidth - 26) * (54 - 36) / 26);
                        const blocT = Math.round(8 + (cellWidth - 26) * (11 - 8) / 26);
                        const clippedLeft = seg.start < vpStart;
                        const clippedRight = seg.end > vpEnd;

                        return (
                          <div
                            key={`${chantier.id}-${i}`}
                            className={`bloc chantier ${
                              chantier.termine ? 'termine' : ''
                            } ${
                              clippedLeft ? 'bloc-clipped-left' : ''
                            } ${
                              clippedRight ? 'bloc-clipped-right' : ''
                            } ${
                              selectedItem?.type === 'chantier' &&
                              selectedItem.id === chantier.id
                                ? 'active-item'
                                : ''
                            }`}
                            data-ch={chantier.id}
                            data-start={chantier.start}
                            data-duree={chantier.duree}
                            data-equipe={chantier.equipe}
                            data-force-aout={chantier.force_aout ? 1 : 0}
                            draggable={!resize && canEdit}
                            onDragStart={(e) => cb.onDragStart(e, chantier.id, 'chantier')}
                            style={{
                              width,
                              top: blocT,
                              height: blocH,
                              background: chantier.color,
                              zIndex: resize?.id === chantier.id ? 100 : undefined,
                              ...(resize?.id === chantier.id && resize.side === 'left' && resize.delta && isFirstSegment
                                ? { left: 3 + resize.delta * cellWidth }
                                : {}),
                            }}
                            title={`${chantier.nom}${chantier.detail ? ` — ${chantier.detail}` : ''} (${chantier.duree}j)`}
                          >
                            {isFirstSegment && (
                              <div
                                className="resize-handle left"
                                data-rs="left"
                              />
                            )}

                            {chantier.note && isFirstSegment && (
                              <div className="note-icon">
                                💬
                                <div className="tooltip">{chantier.note}</div>
                              </div>
                            )}

                            {chantier.linked && cellWidth >= 22 && (
                              <div className="link-icon">🔗</div>
                            )}

                            <div className="chantier-content">
                              <div className="chantier-title-row">
                                <strong>{chantier.nom}</strong>
                                {(isLongestSeg || segLen > 15) && chantier.detail && <em>{chantier.detail}</em>}
                              </div>
                              {isLastSegment && <small>{chantier.duree} j</small>}
                            </div>

                            <div
                              className="conducteur-bar"
                              style={{
                                background: conducteur?.color || '#64748b',
                              }}
                            />

                            {isLastSegment && (
                              <div
                                className="resize-handle right"
                                data-rs="right"
                              />
                            )}
                          </div>
                        );
                      })}

                      {congeItems.filter(({ seg }) => {
                        const visibleStart = Math.max(seg.start, vpStart);
                        return realIdx === visibleStart && realIdx <= seg.end;
                      }).map(({ conge, seg }) => {
                        const clippedStart = Math.max(seg.start, vpStart);
                        const clippedEnd = Math.min(seg.end, vpEnd);
                        const segLen = clippedEnd - clippedStart + 1;
                        const cH = Math.round(36 + (cellWidth - 26) * (54 - 36) / 26);
                        const cT = Math.round(8 + (cellWidth - 26) * (11 - 8) / 26);
                        const clippedLeft = seg.start < vpStart;
                        return (
                        <div
                          key={conge.id}
                          className={`bloc conge ${
                            conge.allEquipes ? 'conge-entreprise' : ''
                          } ${
                            selectedItem?.type === 'conge' &&
                            selectedItem.id === conge.id
                              ? 'active-item'
                              : ''
                          } ${
                            clippedLeft ? 'bloc-clipped-left' : ''
                          }`}
                          data-co={conge.id}
                          draggable={!resize && canEdit}
                          onDragStart={(e) => cb.onDragStart(e, conge.id, 'conge')}
                          style={{
                            width: segLen * cellWidth - 8,
                            height: cH,
                            top: cT,
                            fontSize: 16,
                            padding: `${Math.max(4, Math.round(6 + (cellWidth - 26) * 2 / 26))}px ${Math.max(4, Math.round(8 + (cellWidth - 26) * 2 / 26))}px`,
                          }}
                        >
                          {conge.nom}
                        </div>
                        );
                      })}
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default PlanningGrid;
