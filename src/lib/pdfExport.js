import { jsPDF } from 'jspdf';
import { addWorkingDays, isWeekend } from './personalPlanningUtils.js';

function toDate(v) {
  if (v instanceof Date) return v;
  if (!v || typeof v !== 'string') return new Date(NaN);
  const [y, m, d] = v.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(date, days) {
  const d = toDate(date);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

function getIsoWeek(dateStr) {
  const date = toDate(dateStr);
  const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  return Math.ceil(((tmp - yearStart) / 86400000 + 1) / 7);
}

function getEndDate(item, ferieSet) {
  return addWorkingDays(item.start, item.duree - 1, ferieSet);
}

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)];
}

export function generatePdf({ planName, rangeStart, rangeEnd, rows, items, today, ferieSet }) {
  if (!rangeStart || !rangeEnd || rangeStart > rangeEnd) return null;

  const rangeDays = [];
  let cursor = rangeStart;
  while (cursor <= rangeEnd) {
    if (!isWeekend(cursor)) rangeDays.push(cursor);
    cursor = addDays(cursor, 1);
  }
  if (rangeDays.length === 0) return null;

  const dayIdxInPdf = new Map();
  rangeDays.forEach((d, i) => dayIdxInPdf.set(d, i));

  const colLeft = 35;
  const pageW = 297;
  const pageH = 210;
  const margin = 5;
  const availW = pageW - margin * 2 - colLeft;
  const dayW = Math.min(8, availW / rangeDays.length);
  const gridW = dayW * rangeDays.length;
  const rowH = 7;
  const headerMonthH = 6;
  const headerWeekH = 5;
  const headerDateH = 7;
  const headerH = headerMonthH + headerWeekH + headerDateH;
  const titleH = 10;
  const startY = margin + titleH + headerH + 2;

  const rowsOnPage = Math.floor((pageH - margin - startY) / rowH);
  const totalPages = Math.max(1, Math.ceil(rows.length / rowsOnPage || 1));

  function drawGrid(pdf, pageRows, pageIndex) {
    const ox = margin + colLeft;
    const oy = margin + titleH;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text(planName || 'Planning', margin, margin + 7);

    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(120, 120, 120);
    pdf.text(`${rangeStart} — ${rangeEnd}`, pageW - margin, margin + 7, { align: 'right' });
    pdf.setTextColor(0, 0, 0);

    const monthGroupsPdf = [];
    rangeDays.forEach((d, i) => {
      const dt = toDate(d);
      const mk = `${dt.getFullYear()}-${dt.getMonth()}`;
      const last = monthGroupsPdf[monthGroupsPdf.length - 1];
      if (!last || last.key !== mk) {
        monthGroupsPdf.push({ key: mk, start: i, count: 1, label: dt.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) });
      } else {
        last.count++;
      }
    });

    const weekGroupsPdf = [];
    rangeDays.forEach((d, i) => {
      const w = getIsoWeek(d);
      const last = weekGroupsPdf[weekGroupsPdf.length - 1];
      if (!last || last.week !== w) {
        weekGroupsPdf.push({ week: w, start: i, count: 1 });
      } else {
        last.count++;
      }
    });

    pdf.setFillColor(240, 240, 240);
    pdf.rect(margin, oy, colLeft, headerMonthH, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.text('Tâches', margin + 2, oy + 4.5);

    monthGroupsPdf.forEach((g, mi) => {
      const x = ox + g.start * dayW;
      const w = g.count * dayW;
      const even = mi % 2 === 0;
      pdf.setFillColor(even ? 220 : 235, even ? 245 : 240, even ? 220 : 225);
      pdf.rect(x, oy, w, headerMonthH, 'F');
      pdf.setDrawColor(200, 200, 200);
      pdf.rect(x, oy, w, headerMonthH, 'S');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(6);
      pdf.setTextColor(40, 40, 40);
      const label = g.label.length > 12 ? g.label.substring(0, 12) + '.' : g.label;
      pdf.text(label, x + w / 2, oy + 4, { align: 'center' });
    });

    const wy = oy + headerMonthH;
    pdf.setFillColor(245, 245, 245);
    pdf.rect(margin, wy, colLeft, headerWeekH, 'F');

    weekGroupsPdf.forEach((g) => {
      const x = ox + g.start * dayW;
      const w = g.count * dayW;
      pdf.setDrawColor(200, 200, 200);
      pdf.rect(x, wy, w, headerWeekH, 'S');
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(5.5);
      pdf.setTextColor(80, 80, 80);
      pdf.text(`S${g.week}`, x + w / 2, wy + 3.8, { align: 'center' });
    });

    const dy = wy + headerWeekH;
    pdf.setFillColor(248, 248, 248);
    pdf.rect(margin, dy, colLeft, headerDateH, 'F');

    rangeDays.forEach((d, i) => {
      const x = ox + i * dayW;
      const dt = toDate(d);
      const isToday = d === today;
      if (isToday) {
        pdf.setFillColor(200, 230, 200);
        pdf.rect(x, dy, dayW, headerDateH, 'F');
      }
      pdf.setDrawColor(200, 200, 200);
      pdf.rect(x, dy, dayW, headerDateH, 'S');
      pdf.setFont('helvetica', isToday ? 'bold' : 'normal');
      pdf.setFontSize(5);
      pdf.setTextColor(isToday ? 20 : 60, isToday ? 100 : 60, isToday ? 20 : 60);
      pdf.text(String(dt.getDate()), x + dayW / 2, dy + 3.5, { align: 'center' });
      if (dayW >= 6) {
        const wd = dt.toLocaleDateString('fr-FR', { weekday: 'narrow' });
        pdf.setFontSize(4);
        pdf.setTextColor(120, 120, 120);
        pdf.text(wd, x + dayW / 2, dy + 6, { align: 'center' });
      }
    });

    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.3);
    pdf.rect(margin, oy, colLeft + gridW, headerH, 'S');
    pdf.setTextColor(0, 0, 0);

    pageRows.forEach((row, ri) => {
      const ry = startY + ri * rowH;
      const isOdd = ri % 2 === 1;

      pdf.setFillColor(isOdd ? 248 : 255, isOdd ? 248 : 255, isOdd ? 252 : 255);
      pdf.rect(margin, ry, colLeft + gridW, rowH, 'F');
      pdf.setDrawColor(220, 220, 220);
      pdf.rect(margin, ry, colLeft + gridW, rowH, 'S');
      pdf.rect(margin + colLeft, ry, gridW, rowH, 'S');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(6.5);
      pdf.setTextColor(30, 30, 30);
      pdf.text(row.nom || '', margin + 3, ry + rowH / 2 + 1.5, { maxWidth: colLeft - 6 });

      const rowItems = items.filter((it) => it.rowId === row.id);
      rowItems.forEach((item) => {
        const startIdx = dayIdxInPdf.get(item.start);
        if (startIdx == null) return;
        const itemEnd = getEndDate(item, ferieSet);
        let endIdx = dayIdxInPdf.get(itemEnd);
        if (endIdx == null) {
          endIdx = rangeDays.length - 1;
        }
        if (endIdx < startIdx) return;

        const ix = ox + startIdx * dayW;
        const iw = (endIdx - startIdx + 1) * dayW - 1;
        const iy = ry + 1.5;
        const ih = rowH - 3;

        const rgb = hexToRgb(item.color || '#2563eb');
        pdf.setFillColor(rgb[0], rgb[1], rgb[2]);
        pdf.roundedRect(ix, iy, Math.max(iw, 2), ih, 1, 1, 'F');

        if (iw > 10) {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(5.5);
          pdf.setTextColor(255, 255, 255);
          const txt = item.nom || '';
          const maxChars = Math.floor(iw / 2);
          const truncated = txt.length > maxChars ? txt.substring(0, maxChars - 1) + '.' : txt;
          pdf.text(truncated, ix + 1.5, iy + ih / 2 + 1.5, { maxWidth: iw - 3 });
          pdf.setTextColor(0, 0, 0);
        }
      });

      if (ri === pageRows.length - 1) {
        rangeDays.forEach((d, i) => {
          const x = ox + i * dayW;
          pdf.setDrawColor(210, 210, 210);
          pdf.line(x, ry + rowH, x, ry + rowH);
        });
      }
    });

    if (pageIndex === totalPages - 1) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(5);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`Page ${pageIndex + 1}/${totalPages}`, pageW - margin, pageH - 3, { align: 'right' });
      pdf.setTextColor(0, 0, 0);
    }
  }

  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  if (rows.length === 0) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.text(planName || 'Planning', margin, margin + 10);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text('Aucune tâche dans cette plage de dates.', margin, margin + 20);
    pdf.save(`${planName || 'planning'}_${rangeStart}_${rangeEnd}.pdf`);
    return pdf;
  }

  for (let pi = 0; pi < totalPages; pi++) {
    if (pi > 0) pdf.addPage();
    const start = pi * rowsOnPage;
    const end = Math.min(start + rowsOnPage, rows.length);
    drawGrid(pdf, rows.slice(start, end), pi);
  }

  pdf.save(`${planName || 'planning'}_${rangeStart}_${rangeEnd}.pdf`);
  return pdf;
}
