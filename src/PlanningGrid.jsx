import React from 'react';
import { createPortal } from 'react-dom';

const EMPTY = [];

function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

function hexToRgb(hex) {
  const m = /^#?([a-f\d]{6})$/i.exec((hex || '').trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex({ r, g, b }) {
  return '#' + [r, g, b].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');
}

function rgbToHsv({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max === 0 ? 0 : d / max, v: max };
}

function hsvToRgb({ h, s, v }) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}

const PRESET_COLORS = [
  '#7dd3fc', '#38bdf8', '#2563eb', '#0ea5e9', '#22c55e', '#84cc16',
  '#ca8a04', '#f97316', '#ef4444', '#a855f7', '#ec4899', '#64748b',
  '#ffffff', '#94a3b8', '#111827', '#b91c1c',
];

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

const TeamColorPicker = React.memo(function TeamColorPicker({ initial, onPick, onClose, recentColors }) {
  const rgb = hexToRgb(initial) || { r: 125, g: 211, b: 252 };
  const [hsv, setHsv] = React.useState(rgbToHsv(rgb));
  const [hex, setHex] = React.useState(rgbToHex(rgb));
  const svAreaRef = React.useRef(null);
  const hueRef = React.useRef(null);
  const draggingRef = React.useRef(null);

  const svBg = React.useMemo(
    () => `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hsv.h}, 100%, 50%))`,
    [hsv.h]
  );

  function apply(updates) {
    const next = { ...hsv, ...updates };
    setHsv(next);
    const c = hexToRgb(rgbToHex(hsvToRgb(next)));
    setHex('#'.toLowerCase() + rgbToHex(c).replace('#', ''));
  }

  function applyHue(h) {
    const nh = clamp(Math.round(h), 0, 359);
    apply({ h: nh });
  }

  function onSvPointer(e) {
    const el = svAreaRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const s = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    const v = 1 - clamp((e.clientY - rect.top) / rect.height, 0, 1);
    apply({ s, v });
  }

  function onHuePointer(e) {
    const el = hueRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    applyHue(((e.clientX - rect.left) / rect.width) * 360);
  }

  React.useEffect(() => {
    function move(e) {
      if (draggingRef.current === 'sv') onSvPointer(e);
      else if (draggingRef.current === 'hue') onHuePointer(e);
    }
    function up() { draggingRef.current = null; }
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hsv.h]);

  const thumbPos = { left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%` };
  const current = rgbToHex(hsvToRgb(hsv));

  return (
    createPortal(
      <>
        <div className="team-color-backdrop" onMouseDown={onClose} />
        <div className="team-color-popover" onMouseDown={(e) => e.stopPropagation()}>
          <div className="tcp-header">
            <h3>Couleur de l'équipe</h3>
            <button className="tcp-close" onClick={onClose} aria-label="Fermer">×</button>
          </div>
          <div className="tcp-sv" ref={svAreaRef} style={{ background: svBg }}
            onPointerDown={(e) => { draggingRef.current = 'sv'; onSvPointer(e); }}
          >
            <div className="tcp-sv-thumb" style={{ left: thumbPos.left, top: thumbPos.top }} />
          </div>
          <div className="tcp-hue" ref={hueRef}
            onPointerDown={(e) => { draggingRef.current = 'hue'; onHuePointer(e); }}
          >
            <div className="tcp-hue-thumb" style={{ left: `${(hsv.h / 360) * 100}%` }} />
          </div>
          <div className="tcp-row">
            <div className="tcp-preview" style={{ background: current }} />
            <input
              className="tcp-hex"
              value={hex.toUpperCase()}
              spellCheck={false}
              onChange={(e) => {
                const v = e.target.value.toUpperCase();
                const prefixed = v.startsWith('#') ? v : '#' + v;
                setHex(prefixed);
                const c = hexToRgb(prefixed);
                if (c) setHsv(rgbToHsv(c));
              }}
              onBlur={() => setHex(rgbToHex(hsvToRgb(hsv)))}
              onKeyDown={(e) => { if (e.key === 'Enter') setHex(rgbToHex(hsvToRgb(hsv))); }}
            />
            <div className="tcp-presets">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  className={`tcp-preset ${current === c.toLowerCase() || current === c ? 'sel' : ''}`}
                  style={{ background: c }}
                  onClick={() => { apply(rgbToHsv(hexToRgb(c) || { r: 125, g: 211, b: 252 })); }}
                />
              ))}
            </div>
            {recentColors.length > 0 && (
              <div className="tcp-recents">
                <span className="tcp-recents-label">Récemment utilisées</span>
                <div className="tcp-recents-grid">
                  {recentColors.map((c) => (
                    <button
                      key={c}
                      className={`tcp-preset ${current === c.toLowerCase() || current === c ? 'sel' : ''}`}
                      style={{ background: c }}
                      onClick={() => { apply(rgbToHsv(hexToRgb(c) || { r: 125, g: 211, b: 252 })); }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          <button className="tcp-apply" onClick={() => onPick(current)}>Appliquer</button>
        </div>
      </>,
      document.body
    )
  );
});

const CellContent = React.memo(function CellContent({
  baseClassName, isSelected, isResizePreview,
  segments, congeItems, dayIdx,
  cellWidth, blocLayout, rowHeightActual,
  selectedItem, canEdit, resize,
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
        const hasBadges = isLongestSeg && (chantier.permis || chantier.financement || chantier.danger || chantier.reunion || chantier.facture);
        const { top, height } = blocLayout(i, stack);

        return (
          <div
            key={`${chantier.id}-${i}`}
            className={`bloc chantier ${chantier.facture ? 'facture' : ''} ${hasBadges ? 'with-badges' : ''} ${selectedItem?.type === 'chantier' && selectedItem.id === chantier.id ? 'active-item' : ''}`}
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
              top,
              height,
              background: chantier.color,
              zIndex: resize?.id === chantier.id ? 9999 : undefined,
              opacity: resize?.id === chantier.id ? 0.85 : undefined,
              ...(resize?.id === chantier.id && resize.previewStart && isFirstSegment
                ? { left: 3 + (dayIndex(resize.previewStart) - seg.start) * cellWidth }
                : {}),
            }}
            title={`${chantier.nom}${chantier.detail ? ` — ${chantier.detail}` : ''} (${chantier.duree}j)${chantier.facture ? ' — Facturé' : ''}`}
          >
            {isFirstSegment && <div className="resize-handle left" data-rs="left" />}
            {isLongestSeg && (
              <div className="chantier-icons">
                {chantier.note && (
                  <div className="note-icon">💬<div className="tooltip">{chantier.note}</div></div>
                )}
                {(chantier.permis || chantier.financement || chantier.danger || chantier.reunion || chantier.facture) && (
                  <span className="chantier-badges">
                    {chantier.permis && <span className="badge" title="Permis de construire">📄</span>}
                    {chantier.financement && <span className="badge" title="Financement">💶</span>}
                    {chantier.danger && <span className="badge" title="Danger">⚠️</span>}
                    {chantier.reunion && <span className="badge" title="Réunion">👥</span>}
                    {chantier.facture && <span className="badge badge-facture" title="Facturé">€</span>}
                  </span>
                )}
              </div>
            )}
            {chantier.linked && cellWidth >= 22 && <div className="link-icon">🔗</div>}
            <div className="chantier-content">
              <div className="chantier-title-row">
                <strong>{chantier.nom}</strong>
              </div>
              {isLastSegment && <small>{chantier.duree} j</small>}
              {chantier.detail && <div className="chantier-detail">{chantier.detail}</div>}
            </div>
            {isLastSegment && <div className="resize-handle right" data-rs="right" />}
          </div>
        );
      })}

      {congeItems.filter(({ seg }) => dayIdx === seg.start && dayIdx <= seg.end).map(({ conge, seg }) => {
        const segLen = seg.end - seg.start + 1;
        const cH = Math.max(10, rowHeightActual - 4);
        const cT = 2;
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
        const resizeEntry = resize?.id != null
          ? segments.find(({ chantier }) => chantier.id === resize.id)
          : null;
        const { top: pTop, height: pH } = blocLayout(
          resizeEntry ? resizeEntry.i : 0,
          resizeEntry ? resizeEntry.stack : 1
        );
        return (
          <div className="bloc resize-preview-bloc"
            style={{
              width: pLen * cellWidth - 8, top: pTop, height: pH,
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
  if (prev.cellWidth !== next.cellWidth || prev.blocLayout !== next.blocLayout) return false;
  if (prev.rowHeightActual !== next.rowHeightActual) return false;
  if (prev.dayEq !== next.dayEq || prev.dayDa !== next.dayDa) return false;
  if (prev.canEdit !== next.canEdit) return false;
  if (prev.segments !== next.segments || prev.congeItems !== next.congeItems) return false;
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
  selectedItem,
  selection,
  cellWidth,
  canEdit,
  resize,
  today,
  ferieSet,
  teamColors,
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
  const gridRef = React.useRef(null);
  const cellMapRef = React.useRef(new Map());
  const draggedItemRef = React.useRef(null);
  const prevDragEndCellRef = React.useRef(null);
  const endDateCacheRef = React.useRef(null);
  const [colorPickerTeam, setColorPickerTeam] = React.useState(null);
  const [recentColors, setRecentColors] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('recent_team_colors') || '[]'); } catch { return []; }
  });
  const rememberColor = React.useCallback((color) => {
    setRecentColors((prev) => {
      const next = [color.toLowerCase(), ...prev.filter((c) => c.toLowerCase() !== color.toLowerCase())].slice(0, 12);
      try { localStorage.setItem('recent_team_colors', JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);
  const totalDays = visibleDays.length;

  React.useEffect(() => {
    if (colorPickerTeam === null) return;
    function close(e) {
      if (!e.target.closest('.team-color-btn') && !e.target.closest('.team-color-popover')) {
        setColorPickerTeam(null);
      }
    }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [colorPickerTeam]);

  React.useEffect(() => {
    if (initialScrolled.current) return;
    initialScrolled.current = true;
    const idx = nearestDayIndex(today);
    if (idx < 0) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollLeft = Math.max(0, idx * cellWidth - 500);
  }, []);

  React.useEffect(() => {
    const map = new Map();
    const cells = gridRef.current?.querySelectorAll('[data-eq][data-da]');
    if (cells) {
      for (const el of cells)
        map.set(`${el.dataset.eq}|${el.dataset.da}`, el);
    }
    cellMapRef.current = map;
  }, [gridRows, visibleDays]);

  const gridTemplateColumns = `260px repeat(${totalDays}, ${cellWidth}px)`;
  const rowHeight = Math.round(60 + (cellWidth - 26) * (82 - 60) / 26);
  const blocH = Math.round(46 + (cellWidth - 26) * (72 - 46) / 26);
  const blocT = Math.round((rowHeight - blocH) / 2);
  const dateGridH = Math.round(28 + (cellWidth - 26) * (44 - 28) / 26);
  const headerHeight = 28 + 30 + dateGridH;

  const teamStackMap = React.useMemo(() => {
    const m = new Map();
    for (const arr of chantiersParCellule.values()) {
      for (const entry of arr) {
        const eq = entry?.chantier?.equipe;
        if (eq === undefined || eq === null) continue;
        if (entry.stack > (m.get(eq) || 0)) m.set(eq, entry.stack);
      }
    }
    return m;
  }, [chantiersParCellule]);

  function teamRowHeight(equipeIndex) {
    const stack = teamStackMap.get(equipeIndex) || 1;
    if (stack <= 1) return rowHeight;
    return Math.round(rowHeight + (stack - 1) * (blocH + 6));
  }

  const teamBlocLayoutsCacheRef = React.useRef(null);

  function getTeamBlocLayout(equipeIndex) {
    const rowH = teamRowHeight(equipeIndex);
    const cache = teamBlocLayoutsCacheRef.current;
    if (cache && cache.eq === equipeIndex && cache.rowH === rowH && cache.blocH === blocH && cache.blocT === blocT && cache.stack === teamStackMap.get(equipeIndex)) {
      return cache.fn;
    }
    const fn = (lane, stack) => {
      const effStack = stack > 0 ? stack : 1;
      if (effStack <= 1) return { top: blocT, height: blocH };
      const slot = Math.round((rowH - 6) / effStack);
      return { top: Math.round(2 + lane * slot), height: Math.max(10, slot - 4) };
    };
    teamBlocLayoutsCacheRef.current = { eq: equipeIndex, rowH, blocH, blocT, stack: teamStackMap.get(equipeIndex), fn };
    return fn;
  }

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
    // v3: no classList on date-cell to avoid Rendering 4.5s - only move indicator
    prevTargetDateRef.current = { date, el: null };
    if (!date) {
      if (indicatorRef.current) indicatorRef.current.style.opacity = '0';
      return;
    }
    const idx = dayIdxMemo.get(date);
    prevTargetDateRef.current = { date, el: null };
    const ind = indicatorRef.current;
    if (ind && idx != null) {
      ind.style.transform = `translateX(${260 + idx * cellWidth + cellWidth / 2}px)`;
      ind.style.opacity = '1';
    }
  }

  function dayIndex(date) {
    return dayIdxMemo.get(date) ?? -1;
  }

  function nearestDayIndex(date) {
    const idx = dayIndex(date);
    if (idx >= 0) return idx;
    const t = new Date(date + 'T12:00:00').getTime();
    let best = -1;
    let bestDist = Infinity;
    visibleDays.forEach((d, i) => {
      const dist = Math.abs(new Date(d.date + 'T12:00:00').getTime() - t);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    return best;
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
    let chantierBloc, congeBloc, resizeHandle, noteIcon, addBtn, deleteBtn, teamInput;
    if (type !== 'dragover' && type !== 'drop' && type !== 'dragstart') {
      chantierBloc = e.target.closest('[data-ch]');
      congeBloc = e.target.closest('[data-co]');
      resizeHandle = e.target.closest('[data-rs]');
      noteIcon = e.target.closest('.note-icon');
      addBtn = e.target.closest('.add-team-btn');
      deleteBtn = e.target.closest('.delete-team');
      teamInput = e.target.closest('.team-cell input');
    }

    if (addBtn) return;
    if (deleteBtn) return;
    if (teamInput) return;
    if (e.target.closest('.team-color-btn')) return;
    if (e.target.closest('.team-color-popover')) return;

    if (!canEdit && (type === 'dragstart' || type === 'drop' || type === 'dragover' || type === 'dblclick' || type === 'contextmenu' || type === 'mousedown')) return;

    if (type === 'dragstart') {
      isDraggingRef.current = true;
      const fromResize = resizeDragRef.current;
      resizeDragRef.current = false;
      if (fromResize) {
        e.preventDefault();
        return;
      }
      const dch = e.target.closest('[data-ch]');
      const dco = e.target.closest('[data-co]');
      if (dch) draggedItemRef.current = { duree: Number(dch.dataset.duree), force_aout: dch.dataset.forceAout === '1' };
      else if (dco) draggedItemRef.current = { duree: Number(dco.dataset.duree) || 1, force_aout: false };
      // SAFE: cache lazy pour éviter freeze au dragStart (15k addWorkingDays sync)
      const dragStartT0 = performance.now();
      endDateCacheRef.current = new Map();
      // log total cells for diagnosis
      if (cellMapRef.current.size > 0) console.log(`[dragStart] cells=${cellMapRef.current.size} days=${visibleDays.length} rows=${gridRows.length} t=${(performance.now()-dragStartT0).toFixed(1)}ms`);
      const dragSrc = dch || dco;
      if (dragSrc) dragSrc.classList.add('dragging-source');
      gridRef.current?.classList.add('dragging-active');
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

    if (!cell && type !== 'dragover' && type !== 'drop') return;
    const equipe = cell ? Number(cell.dataset.eq) : null;
    const date = cell ? cell.dataset.da : null;

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
      // v4: hit test par maths (0 closest) + overlay, gestion hauteurs variables
      const gridRect = gridRef.current?.getBoundingClientRect();
      if (!gridRect) return;
      const x = e.clientX - gridRect.left - 260;
      const y = e.clientY - gridRect.top;
      if (x < 0 || y < 0) return;
      const dayIdx = Math.floor(x / cellWidth);
      if (dayIdx < 0 || dayIdx >= visibleDays.length) return;
      const pDate = visibleDays[dayIdx]?.date;
      if (!pDate) return;
      // trouver rangée par Y en tenant compte des hauteurs variables (header 34, separator 8, row 56)
      let acc = 0;
      let rowIdx = -1;
      let top = 0;
      let pEquipe = null;
      let rowH = rowHeight;
      for (let i = 0; i < gridRows.length; i++) {
        const r = gridRows[i];
        let h = rowHeight;
        if (r.type === 'company-header') h = 34;
        else if (r.type === 'separator') h = 8;
        if (y >= acc && y < acc + h) {
          if (r.type === 'separator' || r.type === 'company-header') return;
          pEquipe = r.type === 'pending' ? r.equipeIndex : r.teamId;
          rowIdx = i;
          top = acc;
          rowH = h;
          break;
        }
        acc += h;
      }
      if (rowIdx === -1 || pEquipe == null) return;
      const key = `${pEquipe}-${pDate}`;
      if (lastDragKeyRef.current === key && !rafDragRef.current) return;
      pendingDragRef.current = { pEquipe, pDate, dayIdx, rowIdx, top, rowH, key };
      if (rafDragRef.current) return;
      rafDragRef.current = requestAnimationFrame(() => {
        const t0 = performance.now();
        rafDragRef.current = null;
        const pending = pendingDragRef.current;
        pendingDragRef.current = null;
        if (!pending) return;
        const { pEquipe: eq, pDate: d, dayIdx: di, rowIdx: ri, top: t, rowH: rh, key: k } = pending;
        if (lastDragKeyRef.current === k) return;
        lastDragKeyRef.current = k;
        // overlay vert = case de début
        if (di != null && ri >= 0) {
          const startLeft = 260 + di * cellWidth;
          if (dragOverlayRef.current) {
            dragOverlayRef.current.style.left = startLeft + 'px';
            dragOverlayRef.current.style.top = t + 'px';
            dragOverlayRef.current.style.width = cellWidth + 'px';
            dragOverlayRef.current.style.height = rh + 'px';
            dragOverlayRef.current.classList.add('visible');
          }
          highlightTargetDate(d);
          // overlay rouge = case de fin
          if (dragEndOverlayRef.current) dragEndOverlayRef.current.classList.remove('visible');
          if (draggedItemRef.current) {
            const cacheKey = `${eq}|${d}`;
            let endDate = endDateCacheRef.current?.get(cacheKey);
            if (!endDate) {
              endDate = cb.addWorkingDays(d, draggedItemRef.current.duree - 1, eq, { force_aout: draggedItemRef.current.force_aout });
              endDateCacheRef.current?.set(cacheKey, endDate);
            }
            if (endDate) {
              const endIdx = dayIdxMemo.get(endDate);
              if (endIdx != null && endIdx >= 0) {
                const endLeft = 260 + endIdx * cellWidth;
                if (dragEndOverlayRef.current) {
                  dragEndOverlayRef.current.style.left = endLeft + 'px';
                  dragEndOverlayRef.current.style.top = t + 'px';
                  dragEndOverlayRef.current.style.width = cellWidth + 'px';
                  dragEndOverlayRef.current.style.height = rh + 'px';
                  dragEndOverlayRef.current.classList.add('visible');
                }
              }
            }
          }
          }
        const dt = performance.now() - t0;
        if (dt > 8) console.log(`[drag] ${dt.toFixed(1)}ms key=${k} cells=${cellMapRef.current.size} di=${di} ri=${ri}`);
      });
      return;
    }
    if (type === 'drop') {
      e.preventDefault();
      isDraggingRef.current = false;
      lastDragKeyRef.current = null;
      if (rafDragRef.current) { cancelAnimationFrame(rafDragRef.current); rafDragRef.current = null; }
      pendingDragRef.current = null;
      if (dragOverlayRef.current) dragOverlayRef.current.classList.remove('visible');
      if (dragEndOverlayRef.current) dragEndOverlayRef.current.classList.remove('visible');
      if (prevDragCellRef.current) {
        prevDragCellRef.current.classList.remove('drag-preview');
        prevDragCellRef.current = null;
      }
      highlightTargetDate(null);
      if (prevDragEndCellRef.current) {
        prevDragEndCellRef.current.classList.remove('drag-end-preview');
        prevDragEndCellRef.current = null;
      }
      let dropEquipe = equipe;
      let dropDate = date;
      draggedItemRef.current = null;
      endDateCacheRef.current = null;
      gridRef.current?.querySelector('.dragging-source')?.classList.remove('dragging-source');
      gridRef.current?.classList.remove('dragging-active');
      if (dropEquipe && dropDate) cb.onDrop(e, dropEquipe, dropDate);
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
            <span ref={indicatorRef} className="day-indicator" style={{ position: 'absolute', bottom: 2, opacity: 0, pointerEvents: 'none', transform: 'translateX(0)' }} />
          </div>
        </div>

        <div className="main-grid" ref={gridRef}
          onMouseDown={handleGridEvent}
          onMouseOver={handleGridEvent}
          onDragStart={handleGridEvent}
          onDragOver={handleGridEvent}
          onDrop={handleGridEvent}
          onDragEnd={() => { isDraggingRef.current = false; lastDragKeyRef.current = null; if (rafDragRef.current) { cancelAnimationFrame(rafDragRef.current); rafDragRef.current = null; } pendingDragRef.current = null; if (dragOverlayRef.current) dragOverlayRef.current.classList.remove('visible'); if (dragEndOverlayRef.current) dragEndOverlayRef.current.classList.remove('visible'); if (prevDragCellRef.current) { prevDragCellRef.current.classList.remove('drag-preview'); prevDragCellRef.current = null; } highlightTargetDate(null); if (prevDragEndCellRef.current) { prevDragEndCellRef.current.classList.remove('drag-end-preview'); prevDragEndCellRef.current = null; } draggedItemRef.current = null; endDateCacheRef.current = null; gridRef.current?.querySelector('.dragging-source')?.classList.remove('dragging-source'); gridRef.current?.classList.remove('dragging-active'); }}
          onDoubleClick={handleGridEvent}
          onContextMenu={handleGridEvent}
        >
          <div ref={dragOverlayRef} className="drag-overlay" />
          <div ref={dragEndOverlayRef} className="drag-end-overlay" />
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
            const isCategory = row.type === 'category';

            return (
              <React.Fragment key={isPending ? row.id : `team-${row.teamId}`}>
                <div className={`grid-row${isCategory ? ' category-row' : ''}${equipeIndex % 2 ? ' odd' : ''}`} style={{ height: teamRowHeight(equipeIndex) }}>
                  <div
                    className={`team-cell ${equipeIndex % 2 ? 'odd' : ''} ${isPending ? 'pending-team' : ''} ${isCategory ? 'category-cell' : ''} ${colorPickerTeam === row.teamId ? 'color-picker-open' : ''}`}
                    style={isPending || isCategory ? undefined : { borderLeft: `6px solid ${row.color || '#7dd3fc'}`, boxShadow: `inset 0 0 0 999px ${row.color || '#7dd3fc'}12, 6px 0 16px var(--shadow)` }}
                  >
                    {isCategory ? (
                      <span className="category-name">{row.name}</span>
                    ) : isPending ? null : (
                      <>
                        <div
                          className={`avatar team-color-btn ${colorPickerTeam === row.teamId ? 'active' : ''}`}
                          title="Changer la couleur de l'équipe"
                          style={{ background: row.color || '#7dd3fc' }}
                          onClick={() => setColorPickerTeam((prev) => prev === row.teamId ? null : row.teamId)}
                        >
                          {row.numInCompany}
                        </div>
                        {colorPickerTeam === row.teamId && (
                          <TeamColorPicker
                            initial={row.color || '#7dd3fc'}
                            recentColors={recentColors}
                            onClose={() => setColorPickerTeam(null)}
                            onPick={(color) => {
                              cb.updateTeamColor(row.teamId, color);
                              rememberColor(color);
                              setColorPickerTeam(null);
                            }}
                          />
                        )}
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
                          blocLayout={getTeamBlocLayout(equipeIndex)}
                          rowHeightActual={teamRowHeight(equipeIndex)}
                          selectedItem={selectedItem}
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
