import React from 'react';

const EMPTY = [];

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

function getConducteur(conducteurs, id) {
  return conducteurs.find((c) => c.id === Number(id));
}

const CellContent = React.memo(function CellContent({
  baseClassName, isSelected, isResizePreview,
  segments, congeItems, dayIdx,
  cellWidth, blocH, blocT,
  selectedItem, conducteurs, canEdit, resize,
  cb, dayEq, dayDa, dayIdxMap,
}) {
  const cellClassName = baseClassName
    + (isSelected ? ' selected' : '')
    + (isResizePreview ? ' resize-preview' : '');

  function dayIndex(date) {
    return dayIdxMap.get(date) ?? -1;
  }

  return (
    <div className={cellClassName} data-eq={dayEq} data-da={dayDa}>
      {segments.filter(({ seg }) => dayIdx === seg.start && dayIdx <= seg.end).map(({ chantier, seg, i, stack, segIndex, segCount, longestLen }) => {
        const conducteur = getConducteur(conducteurs, chantier.conducteurId);
        const segLen = seg.end - seg.start + 1;
        const isFirstSegment = segIndex === 0;
        const isLastSegment = segIndex === segCount - 1;
        let width = segLen * cellWidth - 8;
        if (resize?.id === chantier.id && resize.delta && resize.previewStart && resize.previewEnd) {
          const pStart = dayIndex(resize.previewStart);
          const pEnd = dayIndex(resize.previewEnd);
          if (pStart >= 0 && pEnd >= 0) {
            width = (pEnd - pStart + 1) * cellWidth - 8;
          }
        }
        const isLongestSeg = segLen === longestLen;

        return (
          <div
            key={`${chantier.id}-${i}`}
            className={`bloc chantier ${chantier.termine ? 'termine' : ''} ${selectedItem?.type === 'chantier' && selectedItem.id === chantier.id ? 'active-item' : ''}`}
            data-ch={chantier.id}
            data-start={chantier.start}
            data-duree={chantier.duree}
            data-equipe={chantier.equipe}
            data-force-aout={chantier.force_aout ? 1 : 0}
            draggable={!resize && canEdit}
            onDragStart={(e) => cb.onDragStart(e, chantier.id, 'chantier')}
            style={{
              ...(resize?.id === chantier.id && !isFirstSegment ? { display: 'none' } : {}),
              width,
              top: blocT,
              height: blocH,
              background: chantier.color,
              zIndex: resize?.id === chantier.id ? 9999 : undefined,
              opacity: resize?.id === chantier.id ? 0.85 : undefined,
              ...(resize?.id === chantier.id && resize.previewStart && isFirstSegment
                ? { left: 3 + (dayIndex(resize.previewStart) - seg.start) * cellWidth }
                : {}),
            }}
            title={`${chantier.nom}${chantier.detail ? ` — ${chantier.detail}` : ''} (${chantier.duree}j)`}
          >
            {isFirstSegment && <div className="resize-handle left" data-rs="left" />}
            {chantier.note && isFirstSegment && (
              <div className="note-icon">💬<div className="tooltip">{chantier.note}</div></div>
            )}
            {chantier.linked && cellWidth >= 22 && <div className="link-icon">🔗</div>}
            <div className="chantier-content">
              <div className="chantier-title-row">
                <strong>{chantier.nom}</strong>
              </div>
              {isLastSegment && <small>{chantier.duree} j</small>}
            </div>
            {chantier.detail && <div className="chantier-detail">{chantier.detail}</div>}
            <div className="conducteur-bar" style={{ background: conducteur?.color || '#64748b' }} />
            {isLastSegment && <div className="resize-handle right" data-rs="right" />}
          </div>
        );
      })}

      {congeItems.filter(({ seg }) => dayIdx === seg.start && dayIdx <= seg.end).map(({ conge, seg }) => {
        const segLen = seg.end - seg.start + 1;
        const cH = Math.round(36 + (cellWidth - 26) * (54 - 36) / 26);
        const cT = Math.round(8 + (cellWidth - 26) * (11 - 8) / 26);
        return (
          <div
            key={conge.id}
            className={`bloc conge ${conge.allEquipes ? 'conge-entreprise' : ''} ${selectedItem?.type === 'conge' && selectedItem.id === conge.id ? 'active-item' : ''}`}
            data-co={conge.id}
            draggable={!resize && canEdit}
            onDragStart={(e) => cb.onDragStart(e, conge.id, 'conge')}
            style={{
              width: segLen * cellWidth - 8,
              height: cH, top: cT, fontSize: 16,
              padding: `${Math.max(4, Math.round(6 + (cellWidth - 26) * 2 / 26))}px ${Math.max(4, Math.round(8 + (cellWidth - 26) * 2 / 26))}px`,
            }}
          >
            {conge.nom}
          </div>
        );
      })}

      {resize?.previewStart && resize?.previewEnd && resize?.previewEquipe === dayEq && (() => {
        const pStart = dayIndex(resize.previewStart);
        const pEnd = dayIndex(resize.previewEnd);
        if (pStart === -1 || pEnd === -1) return null;
        if (dayIdx !== pStart) return null;
        const pLen = pEnd - pStart + 1;
        return (
          <div className="bloc resize-preview-bloc"
            style={{
              width: pLen * cellWidth - 8, top: blocT, height: blocH,
              left: 3, zIndex: 10000,
            }}
          />
        );
      })()}
    </div>
  );
}, function areEqual(prev, next) {
  if (prev.dayIdx !== next.dayIdx || prev.baseClassName !== next.baseClassName) return false;
  if (prev.isSelected !== next.isSelected || prev.isResizePreview !== next.isResizePreview) return false;
  if (prev.cellWidth !== next.cellWidth || prev.blocH !== next.blocH || prev.blocT !== next.blocT) return false;
  if (prev.dayEq !== next.dayEq || prev.dayDa !== next.dayDa) return false;
  if (prev.canEdit !== next.canEdit) return false;
  if (prev.segments !== next.segments || prev.congeItems !== next.congeItems) return false;
  if (prev.conducteurs !== next.conducteurs) return false;
  if (prev.dayIdxMap !== next.dayIdxMap) return false;

  const ps = prev.selectedItem, ns = next.selectedItem;
  if (ps?.type !== ns?.type || ps?.id !== ns?.id) return false;

  const pr = prev.resize, nr = next.resize;
  if (pr?.id !== nr?.id || pr?.delta !== nr?.delta || pr?.previewStart !== nr?.previewStart || pr?.previewEquipe !== nr?.previewEquipe) return false;

  return true;
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
  selection,
  cellWidth,
  canEdit,
  resize,
  today,
  ferieSet,
  callbacksRef,
  scrollRef,
}) {
  const cb = callbacksRef.current;
  const lastHoverRef = React.useRef(null);
  const resizeDragRef = React.useRef(false);
  const initialScrolled = React.useRef(false);
  const prevDragCellRef = React.useRef(null);
  const prevTargetDateRef = React.useRef(null);
  const indicatorRef = React.useRef(null);
  const lastDragKeyRef = React.useRef(null);
  const isDraggingRef = React.useRef(false);
  const dateCellRefs = React.useRef([]);
  const totalDays = visibleDays.length;

  React.useEffect(() => {
    if (initialScrolled.current) return;
    initialScrolled.current = true;
    const idx = dayIndex(today);
    if (idx < 0) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollLeft = Math.max(0, idx * cellWidth - 500);
  }, []);
  const gridTemplateColumns = `260px repeat(${totalDays}, ${cellWidth}px)`;
  const rowHeight = Math.round(56 + (cellWidth - 26) * (78 - 56) / 26);
  const dateGridH = Math.round(28 + (cellWidth - 26) * (44 - 28) / 26);
  const headerHeight = 28 + 30 + dateGridH;

  const targetDate = resize
    ? (resize.side === 'right' ? resize.previewEnd : resize.previewStart)
    : null;

  const dayIdxMemo = React.useMemo(() => {
    const map = new Map();
    visibleDays.forEach((d, i) => map.set(d.date, i));
    return map;
  }, [visibleDays]);

  const weekBoundarySet = React.useMemo(() => {
    const s = new Set();
    let idx = 0;
    for (const g of weekGroups) {
      idx += g.count;
      if (idx <= visibleDays.length) {
        s.add(visibleDays[idx - 1].date);
      }
    }
    return s;
  }, [weekGroups, visibleDays]);

  function highlightTargetDate(date) {
    if (prevTargetDateRef.current?.date === date) return;
    if (prevTargetDateRef.current?.el) {
      prevTargetDateRef.current.el.classList.remove('target-day');
    }
    if (!date) {
      prevTargetDateRef.current = null;
      if (indicatorRef.current) indicatorRef.current.style.opacity = '0';
      return;
    }
    const idx = dayIdxMemo.get(date);
    const cell = idx != null ? dateCellRefs.current[idx] : null;
    if (cell) {
      cell.classList.add('target-day');
    }
    prevTargetDateRef.current = { date, el: cell };
    const ind = indicatorRef.current;
    if (ind && idx != null) {
      ind.style.left = (260 + idx * cellWidth + cellWidth / 2) + 'px';
      ind.style.opacity = '1';
    }
  }

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

    if (!canEdit && (type === 'dragstart' || type === 'drop' || type === 'dragover' || type === 'dblclick' || type === 'contextmenu' || type === 'mousedown')) return;

    if (type === 'dragstart') {
      isDraggingRef.current = true;
      const fromResize = resizeDragRef.current;
      resizeDragRef.current = false;
      if (fromResize) {
        e.preventDefault();
        return;
      }
    }

    if (resizeHandle && type === 'mousedown') {
      resizeDragRef.current = true;
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

    // Reset resizeDragRef on any non-resize mousedown to prevent stale state
    if (type === 'mousedown') resizeDragRef.current = false;

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

    if (type === 'contextmenu') {
      e.preventDefault();
      cb.handleContextMenu(e, 'cell', null, equipe, date);
      return;
    }

    if (type === 'mousedown') {
      cb.startSelection(e, equipe, date);
      return;
    }
    if (type === 'mouseover') {
      if (isDraggingRef.current) return;
      const key = `${equipe}-${date}`;
      if (lastHoverRef.current === key) return;
      lastHoverRef.current = key;
      cb.updateSelection(equipe, date);
      return;
    }
    if (type === 'dragover') {
      e.preventDefault();
      const key = `${equipe}-${date}`;
      if (lastDragKeyRef.current === key) return;
      lastDragKeyRef.current = key;
      if (prevDragCellRef.current) {
        prevDragCellRef.current.classList.remove('drag-preview');
      }
      if (cell) cell.classList.add('drag-preview');
      prevDragCellRef.current = cell;
      highlightTargetDate(date);
      return;
    }
    if (type === 'drop') {
      e.preventDefault();
      isDraggingRef.current = false;
      lastDragKeyRef.current = null;
      if (prevDragCellRef.current) {
        prevDragCellRef.current.classList.remove('drag-preview');
        prevDragCellRef.current = null;
      }
      highlightTargetDate(null);
      cb.onDrop(e, equipe, date);
      return;
    }
  }

  return (
    <div className="planning-container">
      <div className="planning-scroll" ref={scrollRef} onScroll={cb.handleScroll}>
        <div className="planning-header">
          <div className="grid month-grid" style={{ gridTemplateColumns }}>
            <div className="corner month-corner"></div>
            {monthGroups.map((g, i) => (
              <div
                className={`month-cell ${i % 2 === 0 ? 'month-even' : 'month-odd'}`}
                key={g.monthKey}
                style={{ gridColumn: `span ${g.count}` }}
              >
                {g.monthLabel}
              </div>
            ))}
          </div>

          <div className="grid week-grid" style={{ gridTemplateColumns }}>
            <div className="corner week-corner">
              <strong>Équipes</strong>
            </div>
            {weekGroups.map((g, i) => (
              <div
                className="week-cell"
                key={`${g.week}-${i}`}
                style={{ gridColumn: `span ${g.count}` }}
              >
                S{g.week}
              </div>
            ))}
          </div>

          <div className="grid date-grid" style={{ gridTemplateColumns, gridAutoRows: dateGridH, position: 'relative' }}>
            <div className="corner date-corner"></div>
            {visibleDays.map((d, di) => (
              <div
                key={d.date}
                ref={(el) => { dateCellRefs.current[di] = el; }}
                className={`date-cell${weekBoundarySet.has(d.date) ? ' week-boundary' : ''} ${d.weekend ? 'weekend' : ''} ${
                  isFerie(d.date) ? 'ferie' : ''
                } ${isAugustClosure(d.date) ? 'august-closure' : ''} ${d.date === today ? 'today' : ''} ${d.date === targetDate ? 'target-day' : ''}`}
                title={d.date}
              >
                {cellWidth >= 36 && <span>{d.weekday}</span>}
                <strong>{d.dayNumber}</strong>
                {d.date === targetDate && <span className="day-indicator" />}
              </div>
            ))}
            <span ref={indicatorRef} className="day-indicator" style={{ position: 'absolute', bottom: 2, opacity: 0, pointerEvents: 'none' }} />
          </div>
        </div>

        <div className="main-grid"
          onMouseDown={handleGridEvent}
          onMouseOver={handleGridEvent}
          onDragStart={handleGridEvent}
          onDragOver={handleGridEvent}
          onDrop={handleGridEvent}
          onDragEnd={() => { isDraggingRef.current = false; lastDragKeyRef.current = null; if (prevDragCellRef.current) { prevDragCellRef.current.classList.remove('drag-preview'); prevDragCellRef.current = null; } highlightTargetDate(null); }}
          onDoubleClick={handleGridEvent}
          onContextMenu={handleGridEvent}
        >
          {gridRows.map((row) => {
            if (row.type === 'separator') {
              return (
                <React.Fragment key={row.id}>
                  <div className="grid-row">
                    <div className="team-cell separator-row" />
                    <div className="grid-row-body" style={{ '--cell-w': `${cellWidth}px` }}>
                      {visibleDays.map((day) => (
                        <div key={`sep-${day.date}`} className={`cell separator-cell${weekBoundarySet.has(day.date) ? ' week-boundary' : ''}`} />
                      ))}
                    </div>
                  </div>
                </React.Fragment>
              );
            }

            if (row.type === 'company-header') {
              return (
                <React.Fragment key={row.id}>
                  <div className="grid-row company-header-row" style={{ top: headerHeight }}>
                    <div className="team-cell company-header-cell"><span>{row.name}</span>{canEdit && <button className="add-team-btn" onClick={() => cb.addTeamToCompany(row.id.replace('ch-', ''))}>+</button>}</div>
                    <div className="grid-row-body" style={{ '--cell-w': `${cellWidth}px` }}>
                      {visibleDays.map((day) => (
                        <div key={`${row.id}-${day.date}`} className="cell company-header-day" />
                      ))}
                    </div>
                  </div>
                </React.Fragment>
              );
            }

            const equipeIndex = row.type === 'pending' ? row.equipeIndex : row.teamId;
            const isPending = row.type === 'pending';

            return (
              <React.Fragment key={isPending ? row.id : `team-${row.teamId}`}>
                <div className="grid-row" style={{ height: rowHeight }}>
                  <div className={`team-cell ${equipeIndex % 2 ? 'odd' : ''} ${isPending ? 'pending-team' : ''}`}>
                    {isPending ? null : (
                      <>
                        <div className="avatar">{row.numInCompany}</div>
                        <input
                          key={`name-${row.name}`}
                          defaultValue={row.name}
                          aria-label="Nom de l'équipe"
                          readOnly={!canEdit}
                          onBlur={(e) => cb.updateTeam(row.teamId, e.target.value)}
                          style={{ fontSize: Math.round(13 + (cellWidth - 26) * 3 / 26) }}
                        />
                        {canEdit && <button
                          className="delete-team"
                          onClick={() => cb.deleteTeam(row.teamId)}
                        >×</button>}
                      </>
                    )}
                  </div>

                  <div className="grid-row-body" style={{ '--cell-w': `${cellWidth}px` }}>
                    {visibleDays.map((day, dayIdx) => {
                      const segments = chantiersParCellule.get(`${equipeIndex}-${dayIdx}`) || EMPTY;
                      const congeItems = (congeSegments.get(`${equipeIndex}-${dayIdx}`) || EMPTY);
                      const blocH = Math.round(36 + (cellWidth - 26) * (54 - 36) / 26);
                      const blocT = Math.round(8 + (cellWidth - 26) * (11 - 8) / 26);

                      const baseClassName = `cell${equipeIndex % 2 ? ' odd' : ''}${weekBoundarySet.has(day.date) ? ' week-boundary' : ''}${day.weekend ? ' weekend' : ''}${isFerie(day.date) ? ' ferie' : ''}${isAugustClosure(day.date) ? ' august-closure' : ''}${day.date === today ? ' today' : ''}${isPending ? ' pending-cell' : ''}`;
                      const sel = isSelected(equipeIndex, day.date);
                      const res = resize?.previewStart && resize?.previewEnd && resize?.previewEquipe === equipeIndex && sameOrAfter(day.date, resize.previewStart) && sameOrBefore(day.date, resize.previewEnd);

                      return (
                        <CellContent
                          key={`${equipeIndex}-${day.date}`}
                          baseClassName={baseClassName}
                          isSelected={sel}
                          isResizePreview={res}
                          segments={segments}
                          congeItems={congeItems}
                          dayIdx={dayIdx}
                          cellWidth={cellWidth}
                          blocH={blocH}
                          blocT={blocT}
                          selectedItem={selectedItem}
                          conducteurs={conducteurs}
                          canEdit={canEdit}
                          resize={resize}
                          cb={cb}
                          dayEq={equipeIndex}
                          dayDa={day.date}
                          dayIdxMap={dayIdxMemo}
                        />
                      );
                    })}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default PlanningGrid;
