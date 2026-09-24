import React from 'react';
// PERF_FIX_V1 rAF throttle + lazy cache - verifiable string
if (typeof window !== 'undefined') window.__NOREE_PERF_FIX = 'v6.2-vitesse+';

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
  if (dateStr.charCodeAt(5) !== 48 || dateStr.charCodeAt(6) !== 56) return false;
  const day = (dateStr.charCodeAt(8) - 48) * 10 + (dateStr.charCodeAt(9) - 48);
  return day >= 1 && day <= 21;
}

function getConducteur(conducteurs, id) {
  return (conducteurs || []).find((c) => c.id === Number(id));
}
function getVendeur(vendeurs, id) {
  return (vendeurs || []).find((v) => v.id === Number(id));
}
function getTypeChantier(typesChantier, id) {
  return (typesChantier || []).find((t) => t.id === Number(id));
}

const CellContent = React.memo(function CellContent({
  baseClassName, isSelected, isResizePreview,
  segments, congeItems, dayIdx,
  cellWidth, blocH, blocT,
  selectedItem, conducteurs, vendeurs, typesChantier, resize,
  dayEq, dayDa, dayIdxMap,
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
            {isFirstSegment && (() => {
              const vendeur = getVendeur(vendeurs, chantier.vendeurId);
              const typeChantier = getTypeChantier(typesChantier, chantier.typeChantierId);
              const hasInfo = chantier.numero_chantier || chantier.client_nom || chantier.client_adresse || chantier.client_telephone || vendeur || typeChantier || conducteur || Number(chantier.montant_devis) > 0 || chantier.detail;
              if (!hasInfo) return null;
              return (
                <div className="note-icon">💬<div className="tooltip">
                  <div style={{ fontWeight: 800, marginBottom: 6 }}>{chantier.nom}</div>
                  {chantier.numero_chantier && <div><strong>N°:</strong> {chantier.numero_chantier}</div>}
                  {chantier.client_nom && <div><strong>Client:</strong> {chantier.client_nom}</div>}
                  {chantier.client_adresse && <div><strong>Adresse:</strong> {chantier.client_adresse}</div>}
                  {chantier.client_telephone && <div><strong>Tél:</strong> {chantier.client_telephone}</div>}
                  {vendeur && <div><strong>Vendeur:</strong> {vendeur.nom}</div>}
                  {typeChantier && <div><strong>Type:</strong> {typeChantier.nom}</div>}
                  {conducteur && <div><strong>Conducteur:</strong> {conducteur.nom}</div>}
                  {Number(chantier.montant_devis) > 0 && <div><strong>CA:</strong> {Number(chantier.montant_devis).toLocaleString('fr-FR')} €</div>}
                  {chantier.detail && <div><strong>Détail:</strong> {chantier.detail}</div>}
                </div></div>
              );
            })()}
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
  if (prev.segments !== next.segments || prev.congeItems !== next.congeItems) return false;
  if (prev.conducteurs !== next.conducteurs) return false;
  if (prev.vendeurs !== next.vendeurs) return false;
  if (prev.typesChantier !== next.typesChantier) return false;
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
  vendeurs,
  typesChantier,
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
  const prevTargetDateRef = React.useRef(null);
  const indicatorRef = React.useRef(null);
  const lastDragKeyRef = React.useRef(null);
  const isDraggingRef = React.useRef(false);
  const dateCellRefs = React.useRef([]);
  const gridRef = React.useRef(null);
  const draggedItemRef = React.useRef(null);
  const endDateCacheRef = React.useRef(null);
  // Drag Pointer Events : candidat (avant seuil) + pointeur suivi.
  const dragCandidateRef = React.useRef(null);
  const dragPointerIdRef = React.useRef(null);
  // Fantôme du chantier déplacé : overlay DOM fixe, contenu figé à l'activation,
  // seul son transform est mis à jour par frame. Aucun setState, aucun rerender.
  const dragGhostRef = React.useRef(null);
  const dragGhostOffsetRef = React.useRef(null);
  const dragGhostPosRef = React.useRef(null);
  // Largeur réelle (border-box) du preview, figée à l'activation : réutilisée
  // pour placer le bord gauche rouge exactement au bord droit du preview.
  const dragGhostWidthRef = React.useRef(null);
  // Boucle rAF UNIQUE du drag (overlays + auto-scroll) : un seul id actif à la fois.
  const dragLoopRafRef = React.useRef(null);
  const dragRectRef = React.useRef(null);
  // Rect grille caché au dragstart + scroll de départ → zéro layout-read par event.
  const gridRectRef = React.useRef(null);
  const scrollStartRef = React.useRef(null);
  const dragOverlayRef = React.useRef(null);
  const dragEndOverlayRef = React.useRef(null);
  const dragClientPos = React.useRef({ x: 0, y: 0 });
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

    const teamColW = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--team-col-w')) || 260;
  const gridTemplateColumns = `${teamColW}px repeat(${totalDays}, ${cellWidth}px)`;
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

  const dayClassSuffix = React.useMemo(() => visibleDays.map((day) =>
    `${weekBoundarySet.has(day.date) ? ' week-boundary' : ''}${day.weekend ? ' weekend' : ''}${ferieSet.has(day.date) ? ' ferie' : ''}${isAugustClosure(day.date) ? ' august-closure' : ''}${day.date === today ? ' today' : ''}`
  ), [visibleDays, weekBoundarySet, ferieSet, today]);

  const rowPositionMap = React.useMemo(() => {
    const map = new Map();
    let acc = 0;
    for (let i = 0; i < gridRows.length; i++) {
      const r = gridRows[i];
      let h = rowHeight;
      if (r.type === 'company-header') h = 34;
      else if (r.type === 'separator') h = 8;
      const id = r.type === 'pending' ? r.equipeIndex : r.teamId;
      if (id != null) map.set(id, { top: acc, rowH: h, rowIdx: i });
      acc += h;
    }
    return map;
  }, [gridRows, rowHeight]);

  // Bandes verticales des lignes équipe (triées par top) pour le ciblage drag par coordonnées.
  const rowTopsArray = React.useMemo(() => {
    const arr = [];
    for (const [equipe, info] of rowPositionMap) {
      arr.push({ equipe: Number(equipe), top: info.top, rowH: info.rowH, rowIdx: info.rowIdx });
    }
    arr.sort((a, b) => a.top - b.top);
    return arr;
  }, [rowPositionMap]);

  // Table pixel Y → index de ligne : ciblage vertical O(1) strict, aucun parcours.
  // Construite une fois par rendu (hors drag), quelques Ko.
  const rowIndexByPixel = React.useMemo(() => {
    let total = 0;
    for (let i = 0; i < rowTopsArray.length; i++) {
      const r = rowTopsArray[i];
      const bottom = Math.ceil(r.top + r.rowH);
      if (bottom > total) total = bottom;
    }
    const arr = new Int16Array(total + 1).fill(-1);
    for (let i = 0; i < rowTopsArray.length; i++) {
      const r = rowTopsArray[i];
      const a = Math.max(0, Math.floor(r.top));
      const b = Math.min(total, Math.ceil(r.top + r.rowH) - 1);
      for (let p = a; p <= b; p++) arr[p] = i;
    }
    return arr;
  }, [rowTopsArray]);

  // Ciblage de la cellule de drop UNIQUEMENT par coordonnées pointeur — O(1) strict.
  // Indépendant de e.target : identique au-dessus d'une cellule vide,
  // d'un chantier, d'un congé, d'un texte ou d'un overlay.
  // ZÉRO lecture de layout : rect grille caché au dragstart + delta de scroll
  // (lectures scrollLeft/scrollTop seules, sans reflow). ~microsecondes.
  // Aucun parcours (ni cellules, ni équipes, ni chantiers), aucun setState.
  function getDragTargetFromPointer(clientX, clientY) {
    const grid = gridRef.current;
    if (!grid) return null;
    let dayIdx;
    let y;
    const cached = gridRectRef.current;
    const sc = scrollRef.current;
    const start = scrollStartRef.current;
    if (cached && sc && start) {
      const sl = sc.scrollLeft - start.left;
      const st = sc.scrollTop - start.top;
      dayIdx = Math.floor((clientX - cached.left + sl - teamColW) / cellWidth);
      y = clientY - cached.top + st;
    } else {
      const rect = grid.getBoundingClientRect();
      dayIdx = Math.floor((clientX - rect.left - teamColW) / cellWidth);
      y = clientY - rect.top;
    }
    if (dayIdx < 0 || dayIdx >= visibleDays.length) return null;
    const yi = Math.floor(y);
    const ri = (yi >= 0 && yi < rowIndexByPixel.length) ? rowIndexByPixel[yi] : -1;
    if (ri < 0) return null;
    const hit = rowTopsArray[ri];
    if (!hit) return null;
    const date = visibleDays[dayIdx] ? visibleDays[dayIdx].date : null;
    if (!date) return null;
    return { equipe: hit.equipe, date, dayIdx, rowIdx: hit.rowIdx, top: hit.top, rowH: hit.rowH };
  }

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
      ind.style.transform = `translateX(${teamColW + idx * cellWidth + cellWidth / 2}px)`;
      ind.style.opacity = '1';
    }
  }

  // Boucle rAF UNIQUE du drag : overlays + auto-scroll, un seul id actif à la fois.
  // - pointermove ne fait qu'écrire dragClientPos (aucun calcul, aucun timer) ;
  // - la boucle consomme la dernière position : cible O(1) + overlays si changée + scroll.
  // - AUCUN setTimeout/setInterval récurrent, AUCUN setState, AUCUN parcours.
  const EDGE_X = 80;
  const EDGE_Y = 60;
  const MIN_SPEED = 6;
  const MAX_SPEED = 16;
  function lerpSpeed(distFromEdge, edge) {
    const t = 1 - Math.max(0, Math.min(1, distFromEdge / edge));
    return Math.round(MIN_SPEED + (MAX_SPEED - MIN_SPEED) * t * t);
  }
  function stopDragLoop() {
    if (dragLoopRafRef.current) {
      cancelAnimationFrame(dragLoopRafRef.current);
      dragLoopRafRef.current = null;
    }
    if (scrollRef.current) scrollRef.current.removeAttribute('data-dragging');
  }
  // Activation du drag pointeur (seuil dépassé) : aucun gros calcul,
  // aucune boucle, aucun setState. La boucle rAF unique prend le relais.
  function activatePointerDrag(e) {
    const c = dragCandidateRef.current;
    if (!c) return;
    dragCandidateRef.current = null;
    isDraggingRef.current = true;
    // Anti-sélection texte : UNIQUEMENT quand le vrai drag démarre (seuil dépassé),
    // jamais sur simple pointerdown/clic. Retiré dans finishPointerDrag (tous les chemins).
    if (typeof document !== 'undefined') document.documentElement.classList.add('is-pointer-dragging');
    // Fantôme : clone exact du bloc source (texte, couleur, largeur), figé une fois.
    // Seul son transform bougera ensuite (par frame, sans recréation ni React).
    const ghost = dragGhostRef.current;
    if (ghost && c.el) {
      const srcRect = c.el.getBoundingClientRect();
      dragGhostOffsetRef.current = { x: c.startX - srcRect.left, y: c.startY - srcRect.top };
      dragGhostPosRef.current = null;
      ghost.innerHTML = '';
      const clone = c.el.cloneNode(true);
      clone.removeAttribute('data-ch');
      clone.removeAttribute('data-co');
      clone.removeAttribute('data-start');
      clone.removeAttribute('data-duree');
      clone.removeAttribute('data-equipe');
      clone.removeAttribute('data-force-aout');
      clone.classList.remove('dragging-source');
      clone.querySelectorAll('.resize-handle').forEach((n) => n.remove());
      clone.style.top = '0px';
      clone.style.left = '0px';
      ghost.appendChild(clone);
      ghost.style.display = 'block';
      // Largeur réelle du preview : style inline (.bloc sans padding/border) →
      // aucune lecture de layout. Fallback = largeur de colonne.
      dragGhostWidthRef.current = parseFloat(clone.style.width) || cellWidth;
      // Largeur rouge constante (colonne/jour) et hauteur ligne, posées une fois :
      // seul son transform bougera ensuite avec le bord droit du preview.
      if (dragEndOverlayRef.current) {
        dragEndOverlayRef.current.style.width = cellWidth + 'px';
        dragEndOverlayRef.current.style.height = rowHeight + 'px';
      }
    } else {
      dragGhostOffsetRef.current = { x: 0, y: 0 };
      dragGhostPosRef.current = null;
    }
    draggedItemRef.current = { id: c.id, type: c.itemType, duree: c.duree, force_aout: c.force_aout };
    lastDragKeyRef.current = null;
    try {
      gridRef.current?.setPointerCapture(e.pointerId);
    } catch { /* capture indisponible : le drag reste suivi via pointermove */
    }
    endDateCacheRef.current = new Map();
    // Caches : rect scroll + rect grille + scroll de départ → zéro layout-read ensuite.
    if (scrollRef.current) dragRectRef.current = scrollRef.current.getBoundingClientRect();
    if (gridRef.current) gridRectRef.current = gridRef.current.getBoundingClientRect();
    if (scrollRef.current) scrollStartRef.current = { left: scrollRef.current.scrollLeft, top: scrollRef.current.scrollTop };
    cb.setDragActive?.(true);
    const dragSrc = c.el;
    // Différé d'un macrotask : l'ajout synchrone de ces classes déclenche un
    // recalc de styles global qui bloquait le démarrage du drag.
    setTimeout(() => {
      if (!isDraggingRef.current) return;
      if (dragSrc) dragSrc.classList.add('dragging-source');
      gridRef.current?.classList.add('dragging-active');
    }, 0);
    dragClientPos.current = { x: e.clientX, y: e.clientY };
    if (scrollRef.current && !scrollRef.current.hasAttribute('data-dragging')) scrollRef.current.setAttribute('data-dragging', '1');
    startDragLoop();
  }
  // Fin du drag pointeur : commit = onDrop métier exact, cancel = rien ne bouge.
  function finishPointerDrag(commit, clientX, clientY) {
    const wasActive = isDraggingRef.current;
    const info = draggedItemRef.current;
    let target = null;
    if (commit && wasActive && info) {
      target = getDragTargetFromPointer(clientX, clientY);
    }
    const pid = dragPointerIdRef.current;
    isDraggingRef.current = false;
    // Nettoyage systématique de l'anti-sélection (pointerup, pointercancel,
    // perte de capture, annulation : tous les chemins passent par finishPointerDrag).
    if (typeof document !== 'undefined') document.documentElement.classList.remove('is-pointer-dragging');
    lastDragKeyRef.current = null;
    dragPointerIdRef.current = null;
    dragCandidateRef.current = null;
    stopDragLoop();
    try {
      if (gridRef.current && pid != null && gridRef.current.hasPointerCapture(pid)) gridRef.current.releasePointerCapture(pid);
    } catch { /* pas de capture active */
    }
    if (dragOverlayRef.current) dragOverlayRef.current.style.transform = 'translate(-9999px,0)';
    if (dragEndOverlayRef.current) dragEndOverlayRef.current.style.transform = 'translate(-9999px,0)';
    // Fantôme : masqué + contenu libéré + styles nettoyés (tous les chemins).
    if (dragGhostRef.current) {
      dragGhostRef.current.style.display = 'none';
      dragGhostRef.current.style.transform = 'translate3d(-9999px,0,0)';
      dragGhostRef.current.innerHTML = '';
    }
    dragGhostOffsetRef.current = null;
    dragGhostPosRef.current = null;
    dragGhostWidthRef.current = null;
    highlightTargetDate(null);
    draggedItemRef.current = null;
    endDateCacheRef.current = null;
    dragRectRef.current = null;
    gridRectRef.current = null;
    scrollStartRef.current = null;
    gridRef.current?.querySelector('.dragging-source')?.classList.remove('dragging-source');
    gridRef.current?.classList.remove('dragging-active');
    if (target && info) {
      // Même logique métier que l'ancien drop HTML5 : onDrop reçoit
      // EXACTEMENT (equipe, date) ; l'event factice ne sert qu'au dataTransfer.
      const fakeEvent = {
        preventDefault() {},
        stopPropagation() {},
        dataTransfer: {
          getData: (k) => (k === 'itemId' ? String(info.id) : k === 'itemType' ? info.type : ''),
        },
      };
      cb.onDrop(fakeEvent, target.equipe, target.date);
    }
    cb.setDragActive?.(false);
  }
  function startDragLoop() {
    if (dragLoopRafRef.current) return; // boucle déjà active → pas de doublon
    if (!isDraggingRef.current) return;
    if (scrollRef.current && !scrollRef.current.hasAttribute('data-dragging')) scrollRef.current.setAttribute('data-dragging', '1');
    dragLoopRafRef.current = requestAnimationFrame(tickDragLoop);
  }
  function applyDragPreview(t) {
    // overlay vert = case de début
    const startLeft = 260 + t.dayIdx * cellWidth;
    if (dragOverlayRef.current) {
      dragOverlayRef.current.style.width = cellWidth + 'px';
      dragOverlayRef.current.style.height = t.rowH + 'px';
      dragOverlayRef.current.style.transform = `translate(${startLeft}px,${t.top}px)`;
    }
    highlightTargetDate(t.date);
    // overlay rouge : positionné chaque frame au bord droit réel du preview
    // (voir boucle tickDragLoop) — plus de calcul de date ici.
  }
  function tickDragLoop() {
    dragLoopRafRef.current = null; // pattern single-RAF : reset dès l'exécution
    if (!isDraggingRef.current) {
      if (scrollRef.current) scrollRef.current.removeAttribute('data-dragging');
      return;
    }
    // 1. overlays depuis la dernière position pointeur (uniquement si la cible a changé)
    const pos = dragClientPos.current;
    const t = getDragTargetFromPointer(pos.x, pos.y);
    const key = t ? `${t.equipe}-${t.date}` : null;
    if (key && key !== lastDragKeyRef.current && t.dayIdx != null && t.rowIdx >= 0) {
      lastDragKeyRef.current = key;
      applyDragPreview(t);
    }
    // 1b. fantôme : suit le curseur à CHAQUE frame (même dans la même cellule).
    // Seule écriture : transform translate3d. Jamais recréé, jamais React.
    const ghost = dragGhostRef.current;
    const off = dragGhostOffsetRef.current;
    if (ghost && off) {
      const gx = Math.round(pos.x - off.x);
      const gy = Math.round(pos.y - off.y);
      const last = dragGhostPosRef.current;
      if (!last || last.x !== gx || last.y !== gy) {
        dragGhostPosRef.current = { x: gx, y: gy };
        ghost.style.transform = `translate3d(${gx}px,${gy}px,0)`;
        // Bord gauche rouge = bord droit réel du preview (endX = previewX + previewWidth),
        // converti en coordonnées grille (viewport - rect caché + delta scrollLeft).
        // Aucune valeur magique : mêmes coordonnées que le preview, largeur mesurée.
        const gw = dragGhostWidthRef.current;
        const grc = gridRectRef.current;
        const sst = scrollStartRef.current;
        const scEl = scrollRef.current;
        if (gw != null && grc && sst && scEl && t && dragEndOverlayRef.current) {
          const endX = gx + gw - grc.left + (scEl.scrollLeft - sst.left);
          dragEndOverlayRef.current.style.transform = `translate(${endX}px,${t.top}px)`;
        }
      }
    }
    // 2. auto-scroll depuis la dernière position (rect scroll caché, pas de layout-read)
    const el = scrollRef.current;
    if (el) {
      const rect = dragRectRef.current || el.getBoundingClientRect();
      const { x, y } = pos;
      let dx = 0;
      let dy = 0;
      // Horizontal - sur team div aussi (x < rect.left+260) doit scroller à gauche
      if (x > rect.right - EDGE_X) dx = lerpSpeed(rect.right - x, EDGE_X);
      else if (x < rect.left + EDGE_X) dx = -lerpSpeed(x - rect.left, EDGE_X);
      else if (x < rect.left + 260 + EDGE_X) dx = -lerpSpeed(x - (rect.left + 260), EDGE_X);
      // Vertical (exclure header)
      const headerH = 28 + 30 + dateGridH;
      const topLimit = rect.top + headerH;
      if (y > rect.bottom - EDGE_Y) dy = lerpSpeed(rect.bottom - y, EDGE_Y);
      else if (y < topLimit + EDGE_Y && y > topLimit) dy = -lerpSpeed(y - topLimit, EDGE_Y);
      if (dx !== 0 || dy !== 0) {
        el.scrollLeft += dx;
        el.scrollTop += dy;
      }
    }
    // 3. frame suivante — une seule boucle, jamais de doublon ni de timer
    dragLoopRafRef.current = requestAnimationFrame(tickDragLoop);
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

  // Seuil d'activation du drag pointeur (px) : en dessous = simple clic (sélection).
  const DRAG_THRESHOLD_SQ = 25;

  function handleGridEvent(e) {
    const type = e.type;
    // Chemin Pointer Events : retours immédiats AVANT toute requête DOM.
    if (type === 'pointermove') {
      const pid = dragPointerIdRef.current;
      if (pid == null || e.pointerId !== pid) return;
      if (isDraggingRef.current) {
        // Drag actif : SEULE écriture, la boucle rAF fait tout le reste.
        dragClientPos.current = { x: e.clientX, y: e.clientY };
        return;
      }
      const c = dragCandidateRef.current;
      if (!c) return;
      const dxm = e.clientX - c.startX;
      const dym = e.clientY - c.startY;
      if (dxm * dxm + dym * dym < DRAG_THRESHOLD_SQ) return; // sous le seuil = pas encore un drag
      activatePointerDrag(e);
      return;
    }
    if (type === 'pointerdown') {
      if (!canEdit || resize || e.button !== 0 || e.isPrimary === false) return;
      if (e.target.closest('[data-rs]')) return; // poignée resize → circuit resize inchangé
      const bch = e.target.closest('[data-ch]');
      const bco = e.target.closest('[data-co]');
      const b = bch || bco;
      if (!b) return;
      const isCh = !!bch;
      // Candidat uniquement : aucun calcul, aucune boucle, aucun timer, aucun setState.
      // Écrase un éventuel candidat orphelin (pointerup manqué hors grille).
      dragCandidateRef.current = {
        id: Number(isCh ? b.dataset.ch : b.dataset.co),
        itemType: isCh ? 'chantier' : 'conge',
        duree: isCh ? Number(b.dataset.duree) : (Number(b.dataset.duree) || 1),
        force_aout: isCh ? b.dataset.forceAout === '1' : false,
        el: b,
        startX: e.clientX,
        startY: e.clientY,
        pointerId: e.pointerId,
      };
      dragPointerIdRef.current = e.pointerId;
      return;
    }
    if (type === 'pointerup') {
      // preventDefault ICI (drag actif uniquement) supprime les mouseup/click
      // de compatibilité → pas de endSelection/modal parasite après un drag.
      // Jamais sur un simple clic : dblclick/sélection préservés.
      if (isDraggingRef.current && e.pointerId === dragPointerIdRef.current) {
        e.preventDefault();
        finishPointerDrag(true, e.clientX, e.clientY);
        return;
      }
      if (dragCandidateRef.current && dragCandidateRef.current.pointerId === e.pointerId) {
        dragCandidateRef.current = null; // clic sans déplacement : la sélection mousedown a déjà agi
        dragPointerIdRef.current = null;
      }
      return;
    }
    if (type === 'pointercancel') {
      if (e.pointerId === dragPointerIdRef.current) finishPointerDrag(false, 0, 0);
      return;
    }
    if (type === 'lostpointercapture') {
      if (isDraggingRef.current) finishPointerDrag(false, 0, 0);
      return;
    }
    // Pendant un drag pointeur, le mouseover ne doit faire AUCUNE requête DOM.
    if (type === 'mouseover' && isDraggingRef.current) return;
    const cell = e.target.closest('[data-eq]');
    let chantierBloc, congeBloc, resizeHandle, noteIcon, addBtn, deleteBtn, teamInput;
    chantierBloc = e.target.closest('[data-ch]');
    congeBloc = e.target.closest('[data-co]');
    resizeHandle = e.target.closest('[data-rs]');
    noteIcon = e.target.closest('.note-icon');
    addBtn = e.target.closest('.add-team-btn');
    deleteBtn = e.target.closest('.delete-team');
    teamInput = e.target.closest('.team-cell input');

    if (addBtn) return;
    if (deleteBtn) return;
    if (teamInput) return;

    if (!canEdit && (type === 'dblclick' || type === 'contextmenu' || type === 'mousedown')) return;

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
      const key = `${equipe}-${date}`;
      if (lastHoverRef.current === key) return;
      lastHoverRef.current = key;
      cb.updateSelection(equipe, date);
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
          onPointerDown={handleGridEvent}
          onPointerMove={handleGridEvent}
          onPointerUp={handleGridEvent}
          onPointerCancel={handleGridEvent}
          onLostPointerCapture={handleGridEvent}
          onDoubleClick={handleGridEvent}
          onContextMenu={handleGridEvent}
        >
          <div ref={dragOverlayRef} className="drag-overlay" />
          <div ref={dragEndOverlayRef} className="drag-end-overlay" />
          <div ref={dragGhostRef} className="drag-ghost" />
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

                      const baseClassName = `cell${equipeIndex % 2 ? ' odd' : ''}${dayClassSuffix[dayIdx]}${isPending ? ' pending-cell' : ''}`;
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
                          vendeurs={vendeurs}
                          typesChantier={typesChantier}
                          resize={resize}
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
