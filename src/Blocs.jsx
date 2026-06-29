import { memo } from 'react';

export const ChantierBloc = memo(function ChantierBloc({
  chantier, seg, i, stack, cellWidth,
  compact, segmentsLength, segLen, width, top, height,
  isFirstSegment, isLastSegment, isLongestSeg,
  isSelected, conducteur, canEdit, resize,
  onDragStart, onClick, onDoubleClick, onContextMenu, onMouseDown,
  noteIcon, linkIcon, content, duration, conducteurBar, resizeHandle,
}) {
  const cls = `bloc chantier ${compact ? 'compact-bloc' : ''} ${chantier.termine ? 'termine' : ''} ${isSelected ? 'active-item' : ''}`;

  return (
    <div
      key={`${chantier.id}-${i}`}
      className={cls}
      draggable={!resize && canEdit}
      onMouseDown={onMouseDown || ((e) => e.stopPropagation())}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      onDragStart={onDragStart}
      style={{
        width, height, top,
        fontSize: Math.max(9, Math.min(11, 9 + (cellWidth - 26) * 2 / 26)),
        padding: `${Math.max(4, Math.round(6 + (cellWidth - 26) * 2 / 26))}px ${Math.max(4, Math.round(8 + (cellWidth - 26) * 2 / 26))}px`,
        background: chantier.color,
      }}
    >
      {noteIcon}
      {linkIcon}
      {content}
      {duration}
      {conducteurBar}
      {resizeHandle}
    </div>
  );
});

export const CongeBloc = memo(function CongeBloc({
  conge, seg, cellWidth, cH, cT,
  isSelected, canEdit, resize,
  onDragStart, onClick, onDoubleClick, onContextMenu,
}) {
  const cls = `bloc conge ${conge.allEquipes ? 'conge-entreprise' : ''} ${isSelected ? 'active-item' : ''}`;

  return (
    <div
      key={conge.id}
      className={cls}
      draggable={!resize && canEdit}
      onDragStart={onDragStart}
      style={{
        width: (seg.end - seg.start + 1) * cellWidth - 8,
        height: cH,
        top: cT,
        fontSize: Math.max(9, Math.min(11, 9 + (cellWidth - 26) * 2 / 26)),
        padding: `${Math.max(4, Math.round(6 + (cellWidth - 26) * 2 / 26))}px ${Math.max(4, Math.round(8 + (cellWidth - 26) * 2 / 26))}px`,
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
    >
      {conge.nom}
    </div>
  );
});
