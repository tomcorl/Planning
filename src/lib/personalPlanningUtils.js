function toDate(v) {
  if (v instanceof Date) return v;
  if (!v || typeof v !== 'string') return new Date(NaN);
  const [y, m, d] = v.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function fmt(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(date, days) {
  const d = toDate(date);
  d.setDate(d.getDate() + days);
  return fmt(d);
}

export function isWeekend(dateStr) {
  const d = toDate(dateStr);
  return d.getDay() === 0 || d.getDay() === 6;
}

function easterSunday(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

export function generateFrenchHolidays(year) {
  const fixed = [
    [0, 1],    // 1er janvier
    [4, 1],    // 1er mai
    [4, 8],    // 8 mai
    [6, 14],   // 14 juillet
    [7, 15],   // 15 août
    [10, 1],   // 1er novembre
    [10, 11],  // 11 novembre
    [11, 25],  // 25 décembre
  ];
  const easter = easterSunday(year);
  const movable = [
    addDays(fmt(easter), 1),      // Lundi de Pâques
    addDays(fmt(easter), 39),     // Ascension
    addDays(fmt(easter), 50),     // Lundi de Pentecôte
  ];
  const holidays = new Set();
  for (const [m, d] of fixed) {
    holidays.add(`${year}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  }
  for (const h of movable) holidays.add(h);
  return holidays;
}

export function isWorkingDay(dateStr, ferieSet) {
  if (isWeekend(dateStr)) return false;
  if (ferieSet && ferieSet.has(dateStr)) return false;
  return true;
}

export function addWorkingDays(startDate, duration, ferieSet) {
  if (duration === 0) return startDate;
  let remaining = Math.abs(duration);
  const dir = duration > 0 ? 1 : -1;
  let current = startDate;
  while (remaining > 0) {
    current = addDays(current, dir);
    if (isWorkingDay(current, ferieSet)) remaining--;
  }
  return current;
}

export function getWorkingDaysBetween(startDate, endDate, ferieSet) {
  let count = 0;
  let cur = startDate;
  const dir = startDate <= endDate ? 1 : -1;
  const end = endDate;
  while (true) {
    if (isWorkingDay(cur, ferieSet)) count++;
    if (cur === end) break;
    cur = addDays(cur, dir);
  }
  return count;
}
