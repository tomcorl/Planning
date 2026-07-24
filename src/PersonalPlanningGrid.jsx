import React from 'react';

const EMPTY = [];

const CellContent = React.memo(function CellContent({
  baseClassName, isSelected, isResizePreview,
  segments, dayIdx,
  cellWidth, blocH, blocT,
  selectedItem, canEdit, resize,
  cb, dayRowId, dayDa, dayIdxMap,
}) {
  const cellClassName = baseClassName
    + (isSelected ? ' selected' : '')
    + (isResizePreview ? ' resize-preview' : '');

  function dayIndex(date) {
    return dayIdxMap.get(date) ?? -1;
  }

  return (
    <div className={cellClassName} data-eq={dayRowId} data-da={dayDa}>
      {segments.filter(({ seg }) => dayIdx === seg.start && dayIdx <= seg.end).map(({ item, seg, segIndex, segCount, longestLen }) => {
        const segLen = seg.end - seg.start + 1;
        const isFirstSegment = segIndex === 0;
        const isLastSegment = segIndex === segCount - 1;
        let width = segLen * cellWidth - 8;
        if (resize?.id === item.id && resize.delta && resize.previewStart && resize.previewEnd) {
          const pStart = dayIndex(resize.previewStart);
          const pEnd = dayIndex(resize.previewEnd);
          if (pStart >= 0 && pEnd >= 0) {
            width = (pEnd - pStart + 1) * cellWidth - 8;
          }
        }
        const isLongestSeg = segLen === longestLen;

        return (
          <div
            key={`${item.id}-${segIndex}`}
            className={`bloc chantier ${selectedItem?.type === 'item' && selectedItem.id === item.id ? 'active-item' : ''}`}
            data-item={item.id}
            data-start={item.start}
            data-duree={item.duree}
            data-row={item.rowId}
            draggable={!resize && canEdit}
            onDragStart={(e) => cb.onDragStart(e, item.id)}
            style={{
              ...(resize?.id === item.id && !isFirstSegment ? { display: 'none' } : {}),
              width,
              top: blocT,
              height: blocH,
              background: item.color,
              zIndex: resize?.id === item.id ? 9999 : undefined,
              opacity: resize?.id === item.id ? 0.85 : undefined,
              ...(resize?.id === item.id && resize.previewStart && isFirstSegment
                ? { left: 3 + (dayIndex(resize.previewStart) - seg.start) * cellWidth }
                : {}),
            }}
            title={`${item.nom} (${item.duree}j)${item.note ? ` — ${item.note}` : ''}`}
          >
            {isFirstSegment && <div className="resize-handle left" data-rs="left" />}
            {item.note && isFirstSegment && (
              <div className="note-icon">💬<div className="tooltip">{item.note}</div></div>
            )}
            <div className="chantier-content">
              <div className="chantier-title-row">
                <strong>{item.nom}</strong>
              </div>
              {isLastSegment && <small>{item.duree} j</small>}
            </div>
            {isLastSegment && <div className="resize-handle right" data-rs="right" />}
          </div>
        );
      })}

      {resize?.previewStart && resize?.previewEnd && resize?.previewRowId === dayRowId && (() => {
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
  if (prev.dayRowId !== next.dayRowId || prev.dayDa !== next.dayDa) return false;
  if (prev.canEdit !== next.canEdit) return false;
  if (prev.segments !== next.segments) return false;
  if (prev.dayIdxMap !== next.dayIdxMap) return false;

  const ps = prev.selectedItem, ns = next.selectedItem;
  if (ps?.type !== ns?.type || ps?.id !== ns?.id) return false;

  const pr = prev.resize, nr = next.resize;
  if (pr?.id !== nr?.id || pr?.delta !== nr?.delta || pr?.previewStart !== nr?.previewStart || pr?.previewRowId !== nr?.previewRowId) return false;

  return true;
});

const PersonalPlanningGrid = React.memo(function PersonalPlanningGrid({
  gridRows,
  visibleDays,
  weekGroups,
  monthGroups,
  itemsParCellule,
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

  function isSelected(rowId, date) {
    if (!selection) return false;
    if (selection.rowId !== rowId) return false;
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
    const bloc = e.target.closest('[data-item]');
    const resizeHandle = e.target.closest('[data-rs]');
    const noteIcon = e.target.closest('.note-icon');
    const deleteBtn = e.target.closest('.delete-team');
    const taskInput = e.target.closest('.team-cell input');

    if (deleteBtn) return;
    if (taskInput) return;

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
      const blocEl = bloc || resizeHandle.closest('[data-item]');
      if (blocEl) {
        const side = resizeHandle.dataset.rs;
        e.stopPropagation();
        cb.startResize(e, {
          id: Number(blocEl.dataset.item),
          start: blocEl.dataset.start,
          duree: Number(blocEl.dataset.duree),
          rowId: Number(blocEl.dataset.row),
        }, side);
        return;
      }
    }

    if (type === 'mousedown') resizeDragRef.current = false;

    if (bloc) {
      const id = Number(bloc.dataset.item);
      if (type === 'mousedown') {
        e.stopPropagation();
        cb.setSelectedItem({ type: 'item', id });
        return;
      }
      if (type === 'dblclick') {
        cb.openEditItem({ id });
        return;
      }
      if (type === 'contextmenu') {
        e.preventDefault();
        cb.handleContextMenu(e, 'item', id);
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
    const rowId = Number(cell.dataset.eq);
    const date = cell.dataset.da;

    if (type === 'contextmenu') {
      e.preventDefault();
      cb.handleContextMenu(e, 'cell', null, rowId, date);
      return;
    }

    if (type === 'mousedown') {
      cb.startSelection(e, rowId, date);
      return;
    }
    if (type === 'mouseover') {
      if (isDraggingRef.current) return;
      const key = `${rowId}-${date}`;
      if (lastHoverRef.current === key) return;
      lastHoverRef.current = key;
      cb.updateSelection(rowId, date);
      return;
    }
    if (type === 'dragover') {
      e.preventDefault();
      const key = `${rowId}-${date}`;
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
      cb.onDrop(e, rowId, date);
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
              <strong>Tâches</strong>
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
                } ${d.date === today ? 'today' : ''} ${d.date === targetDate ? 'target-day' : ''}`}
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
            const rowId = row.id;

            return (
              <React.Fragment key={rowId}>
                <div className="grid-row" style={{ height: rowHeight }}>
                  <div className={`team-cell ${rowId % 2 ? 'odd' : ''}`}>
                    <div className="avatar">{row.ordre + 1}</div>
                    <input
                      key={`name-${row.nom}`}
                      defaultValue={row.nom}
                      aria-label="Nom de la tâche"
                      onBlur={(e) => cb.renameRow(rowId, e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                      style={{ fontSize: Math.round(13 + (cellWidth - 26) * 3 / 26) }}
                    />
                    {canEdit && <button
                      className="delete-team"
                      onClick={() => cb.deleteRow(rowId)}
                    >×</button>}
                  </div>

                  <div className="grid-row-body" style={{ '--cell-w': `${cellWidth}px` }}>
                    {visibleDays.map((day, dayIdx) => {
                      const segments = itemsParCellule.get(`${rowId}-${dayIdx}`) || EMPTY;
                      const blocH = Math.round(36 + (cellWidth - 26) * (54 - 36) / 26);
                      const blocT = Math.round(8 + (cellWidth - 26) * (11 - 8) / 26);

                      const baseClassName = `cell${rowId % 2 ? ' odd' : ''}${weekBoundarySet.has(day.date) ? ' week-boundary' : ''}${day.weekend ? ' weekend' : ''}${isFerie(day.date) ? ' ferie' : ''}${day.date === today ? ' today' : ''}`;
                      const sel = isSelected(rowId, day.date);
                      const res = resize?.previewStart && resize?.previewEnd && resize?.previewRowId === rowId && day.date >= resize.previewStart && day.date <= resize.previewEnd;

                      return (
                        <CellContent
                          key={`${rowId}-${day.date}`}
                          baseClassName={baseClassName}
                          isSelected={sel}
                          isResizePreview={res}
                          segments={segments}
                          dayIdx={dayIdx}
                          cellWidth={cellWidth}
                          blocH={blocH}
                          blocT={blocT}
                          selectedItem={selectedItem}
                          canEdit={canEdit}
                          resize={resize}
                          cb={cb}
                          dayRowId={rowId}
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

          <div className="grid-row" style={{ height: 40 }}>
            <div
              className="team-cell"
              onClick={() => cb.handleAddRow()}
              style={{ cursor: 'pointer', fontSize: 13, fontWeight: 500, color: 'var(--green)', width: 260 }}
            >
              + Ajouter une tâche
            </div>
            <div className="grid-row-body" style={{ '--cell-w': `${cellWidth}px` }} />
          </div>
        </div>
      </div>
    </div>
  );
});

export default PersonalPlanningGrid;
