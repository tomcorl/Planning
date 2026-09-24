// Calcule la date de fin d'un bloc déposé sur (equipe, date de début).
// dur = duree - 1. Retourne 'YYYY-MM-DD' ou null si la case de départ ne permet pas de placer le bloc.
export function computeDragEndDate(startDate, eq, dur, forceAout, ferieSet, congeBlockedSet) {
  let y = (startDate.charCodeAt(0) - 48) * 1000 + (startDate.charCodeAt(1) - 48) * 100 + (startDate.charCodeAt(2) - 48) * 10 + (startDate.charCodeAt(3) - 48);
  let mo = (startDate.charCodeAt(5) - 48) * 10 + (startDate.charCodeAt(6) - 48);
  let dy = (startDate.charCodeAt(8) - 48) * 10 + (startDate.charCodeAt(9) - 48);
  let cnt = 0;
  const eqS = '' + eq;
  for (let i = 0; i < dur * 3 + 1; i++) {
    const mm = mo < 3 ? mo + 12 : mo, yy = mo < 3 ? y - 1 : y;
    const dow = (dy + yy + (yy >> 2) - (yy / 100 | 0) + (yy / 400 | 0) + ((31 * mm) / 7 | 0)) % 7;
    const ds = y + '-' + (mo < 10 ? '0' : '') + mo + '-' + (dy < 10 ? '0' : '') + dy;
    const blk = dow === 0 || dow === 6 || ferieSet.has(ds) || congeBlockedSet.has(eqS + '-' + ds);
    const aug = !forceAout && mo === 8 && dy >= 1 && dy <= 21;
    if (!blk && !aug) {
      cnt++;
      if (cnt >= dur) return ds;
    }
    dy++;
    if (dy > 31 || (dy > 30 && (mo === 4 || mo === 6 || mo === 9 || mo === 11)) || (dy > 29 && mo === 2) || (dy > 28 && mo === 2 && !((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0))) {
      dy = 1; mo++;
      if (mo > 12) { mo = 1; y++; }
    }
  }
  return null;
}
