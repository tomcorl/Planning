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

export function addWorkingDays(startDate, duration) {
  if (duration === 0) return startDate;
  let remaining = Math.abs(duration);
  const dir = duration > 0 ? 1 : -1;
  let current = startDate;
  while (remaining > 0) {
    current = addDays(current, dir);
    if (!isWeekend(current)) remaining--;
  }
  return current;
}

export function getWorkingDaysBetween(startDate, endDate) {
  let count = 0;
  let cur = startDate;
  const dir = startDate <= endDate ? 1 : -1;
  const end = endDate;
  while (true) {
    if (!isWeekend(cur)) count++;
    if (cur === end) break;
    cur = addDays(cur, dir);
  }
  return count;
}
