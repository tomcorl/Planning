import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { jsPDF } from 'jspdf';
import { supabase } from './lib/supabase.js';
import {
  loadPersonalPlans,
  createPersonalPlan,
  deletePersonalPlan,
  renamePersonalPlan,
  savePersonalPlan,
} from './lib/api.js';
import PersonalPlanningGrid from './PersonalPlanningGrid.jsx';
import { addWorkingDays, getWorkingDaysBetween } from './lib/personalPlanningUtils.js';

const CELL_W = 26;
const PERSONAL_COLORS = [
  '#2563eb', '#93c5fd', '#eab308', '#15803d', '#6b7280',
  '#f97316', '#7dd3fc', '#a78bfa', '#f472b6', '#34d399',
  '#ef4444', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981',
  '#ec4899', '#6366f1', '#14b8a6',
];

let nextTempId = -1;

function toDate(value) {
  if (value instanceof Date) return value;
  if (!value || typeof value !== 'string') return new Date(NaN);
  const [y, m, d] = value.split('-').map(Number);
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

function isWeekend(dateStr) {
  const d = toDate(dateStr);
  return d.getDay() === 0 || d.getDay() === 6;
}

function getIsoWeek(dateStr) {
  const date = toDate(dateStr);
  const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  return Math.ceil(((tmp - yearStart) / 86400000 + 1) / 7);
}

function generateDays(start, count) {
  return Array.from({ length: count }, (_, i) => {
    const date = addDays(start, i);
    const dt = toDate(date);
    const monthShort = dt.toLocaleDateString('fr-FR', { month: 'short' });
    const yearStr = String(dt.getFullYear()).slice(-2);
    return {
      date,
      dayNumber: dt.getDate(),
      weekday: dt.toLocaleDateString('fr-FR', { weekday: 'short' }),
      weekend: isWeekend(date),
      week: getIsoWeek(date),
      monthKey: `${dt.getFullYear()}-${dt.getMonth()}`,
      monthLabel: monthShort.charAt(0).toUpperCase() + monthShort.slice(1).replace('.', '') + '-' + yearStr,
    };
  });
}

function getEndDate(item) {
  return addWorkingDays(item.start, item.duree - 1);
}

function applyPersonalInsertion(list, movedItem, targetRowId, targetStart) {
  let next = list.map((it) =>
    it.id === movedItem.id
      ? { ...it, rowId: targetRowId, start: targetStart }
      : it
  );

  const moved = next.find((it) => it.id === movedItem.id);
  if (!moved) return next;
  const movedEnd = getEndDate(moved);

  let cursor = addWorkingDays(movedEnd, 1);
  const affected = next
    .filter(
      (it) =>
        it.id !== moved.id &&
        it.rowId === targetRowId &&
        getEndDate(it) >= targetStart
    )
    .sort((a, b) => (a.start < b.start ? -1 : 1));

  const movedEarlier = targetStart < movedItem.start;
  const changed = new Map();

  affected.forEach((it) => {
    if (!movedEarlier && it.start >= cursor) return;
    changed.set(it.id, { ...it, start: cursor });
    cursor = addWorkingDays(getEndDate({ ...it, start: cursor }), 1);
  });

  next = next.map((it) => changed.get(it.id) || it);
  return next;
}

export default function PersonalPlanning({ user }) {
  const scrollRef = useRef(null);
  const today = useMemo(() => formatDate(new Date()), []);

  const [plans, setPlans] = useState([]);
  const [activePlanId, setActivePlanId] = useState(null);
  const [rows, setRows] = useState([]);
  const [items, setItems] = useState([]);
  const [planName, setPlanName] = useState('');
  const [loading, setLoading] = useState(true);
  const [contextMenu, setContextMenu] = useState(null);
  const [renameInput, setRenameInput] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [calendarStart, setCalendarStart] = useState(() => addDays(today, -140));
  const [calendarLength, setCalendarLength] = useState(500);

  const [selection, setSelection] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modal, setModal] = useState({ open: false, mode: 'creation' });
  const [form, setForm] = useState(null);
  const [resize, setResize] = useState(null);
  const [pdfModal, setPdfModal] = useState(false);
  const [pdfStart, setPdfStart] = useState(() => addDays(today, -30));
  const [pdfEnd, setPdfEnd] = useState(() => addDays(today, 60));

  const saveTimerRef = useRef(null);
  const resizeRef = useRef(null);
  const lastXRef = useRef(null);
  const initialScrolled = useRef(false);
  const selectionThrottle = useRef(null);
  const expandRightRef = useRef(null);
  const expandLeftRef = useRef(null);
  const expandCooldownRef = useRef(null);
  const scrollThrottleRef = useRef(null);

  const activePlan = plans.find((p) => p.id === activePlanId);

  const allDays = useMemo(
    () => generateDays(calendarStart, calendarLength),
    [calendarStart, calendarLength]
  );

  const visibleDays = useMemo(() => allDays.filter((d) => !d.weekend), [allDays]);

  const monthGroups = useMemo(() => {
    const groups = [];
    visibleDays.forEach((day) => {
      const last = groups[groups.length - 1];
      if (!last || last.monthKey !== day.monthKey) {
        groups.push({ monthLabel: day.monthLabel, monthKey: day.monthKey, count: 1 });
      } else {
        last.count += 1;
      }
    });
    return groups;
  }, [visibleDays]);

  const weekGroups = useMemo(() => {
    const groups = [];
    visibleDays.forEach((day) => {
      const last = groups[groups.length - 1];
      if (!last || last.week !== day.week) {
        groups.push({ week: day.week, count: 1 });
      } else {
        last.count += 1;
      }
    });
    return groups;
  }, [visibleDays]);

  const dayIdxMap = useMemo(() => {
    const m = new Map();
    visibleDays.forEach((d, i) => m.set(d.date, i));
    return m;
  }, [visibleDays]);

  function dayIndex(date) {
    return dayIdxMap.get(date) ?? -1;
  }

  function visibleDateByIndex(index) {
    if (!visibleDays.length) return today;
    if (index < 0) return visibleDays[0].date;
    if (index >= visibleDays.length) return visibleDays[visibleDays.length - 1].date;
    return visibleDays[index].date;
  }

  function nextLocalId() {
    nextTempId -= 1;
    return nextTempId;
  }

  function splitItem(item) {
    const startIdx = dayIndex(item.start);
    if (startIdx === -1) return [];
    const endDate = getEndDate(item);
    const endIdx = dayIndex(endDate);
    if (endIdx === -1) {
      return [{ start: startIdx, end: visibleDays.length - 1 }];
    }
    return [{ start: startIdx, end: endIdx }];
  }

  const itemsParCellule = useMemo(() => {
    const map = new Map();
    for (const item of items) {
      const segments = splitItem(item);
      for (const seg of segments) {
        for (let d = seg.start; d <= seg.end; d++) {
          const key = `${item.rowId}-${d}`;
          if (!map.has(key)) map.set(key, []);
          map.get(key).push({ item, seg, segIndex: 0, segCount: 1, longestLen: seg.end - seg.start + 1 });
        }
      }
    }
    return map;
  }, [items, visibleDays]);

  const gridRows = useMemo(() => {
    return rows.map((r) => ({ id: r.id, nom: r.nom, ordre: r.ordre || 0 }));
  }, [rows]);

  const gridCallbacksRef = useRef({});

  gridCallbacksRef.current = {
    startSelection,
    updateSelection,
    setSelectedItem,
    openEditItem,
    handleContextMenu,
    onDragStart,
    onDrop,
    startResize,
    renameRow: handleRenameRow,
    deleteRow: handleDeleteRow,
    handleAddRow,
    handleScroll,
  };

  const ferieSet = useMemo(() => new Set(), []);

  const loadPlans = useCallback(async () => {
    if (!user?.id) return [];
    try {
      const data = await loadPersonalPlans(user.id);
      setPlans(data);
      return data;
    } catch (e) {
      console.error('loadPlans', e);
      return [];
    }
  }, [user?.id]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await loadPlans();
      if (data.length > 0 && !activePlanId) {
        setActivePlanId(data[0].id);
      }
      setLoading(false);
    })();
  }, [user?.id]);

  useEffect(() => {
    if (!activePlan) return;
    setRows(activePlan.rows || []);
    setItems(activePlan.items || []);
    setPlanName(activePlan.nom || '');
    initialScrolled.current = false;
  }, [activePlan]);

  useEffect(() => {
    if (!scrollRef.current || initialScrolled.current) return;
    const idx = dayIdxMap.get(today);
    if (idx != null) {
      initialScrolled.current = true;
      scrollRef.current.scrollLeft = Math.max(0, idx * CELL_W - 500);
    }
  }, [dayIdxMap, today]);

  function doSave(newRows, newItems) {
    if (!activePlanId) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        await savePersonalPlan(activePlanId, newRows, newItems);
      } catch (e) {
        console.error('auto-save failed', e);
      }
    }, 800);
  }

  async function handleCreatePlan() {
    const name = prompt('Nom du planning :', 'Nouveau planning');
    if (!name) return;
    const start = prompt('Date de début (AAAA-MM-JJ) :', today);
    if (!start || !/^\d{4}-\d{2}-\d{2}$/.test(start)) return;
    try {
      const plan = await createPersonalPlan(user.id, name, start);
      const data = await loadPlans();
      setPlans(data);
      const found = data.find((p) => p.id === plan.id);
      if (found) setActivePlanId(found.id);
    } catch (e) {
      console.error('create plan', e);
    }
  }

  async function handleDeletePlan(planId) {
    if (!confirm('Supprimer ce planning et toutes ses tâches ?')) return;
    try {
      await deletePersonalPlan(planId);
      const data = await loadPlans();
      setPlans(data);
      if (activePlanId === planId) {
        if (data.length > 0) setActivePlanId(data[0].id);
        else { setActivePlanId(null); setRows([]); setItems([]); }
      }
    } catch (e) {
      console.error('delete plan', e);
    }
  }

  async function handleRenamePlan() {
    if (!renameInput || !activePlanId) return;
    try {
      await renamePersonalPlan(activePlanId, renameInput);
      setPlans((prev) => prev.map((p) => p.id === activePlanId ? { ...p, nom: renameInput } : p));
      setPlanName(renameInput);
      setRenameInput(null);
    } catch (e) {
      console.error('rename plan', e);
    }
  }

  function handleAddRow() {
    const newRows = [...rows, { id: nextLocalId(), nom: `Tâche ${rows.length + 1}`, ordre: rows.length }];
    setRows(newRows);
    doSave(newRows, items);
  }

  function handleDeleteRow(rowId) {
    if (!confirm('Supprimer cette tâche et tous ses blocs ?')) return;
    const newRows = rows.filter((r) => r.id !== rowId);
    const newItems = items.filter((it) => it.rowId !== rowId);
    setRows(newRows);
    setItems(newItems);
    doSave(newRows, newItems);
  }

  function handleRenameRow(rowId, nom) {
    const newRows = rows.map((r) => r.id === rowId ? { ...r, nom } : r);
    setRows(newRows);
    doSave(newRows, items);
  }

  function openCreateItem(rowId, startDate, duree) {
    setForm({
      id: null,
      rowId,
      start: startDate,
      duree: duree || 5,
      nom: '',
      color: PERSONAL_COLORS[Math.floor(Math.random() * PERSONAL_COLORS.length)],
      note: '',
    });
    setModal({ open: true, mode: 'creation' });
  }

  function openEditItem(itemOrId) {
    const id = typeof itemOrId === 'object' ? itemOrId.id : itemOrId;
    const item = items.find((it) => it.id === id);
    if (!item) return;
    setForm({ ...item });
    setModal({ open: true, mode: 'modification' });
    setSelectedItem({ type: 'item', id: item.id });
  }

  function saveModal() {
    if (!form?.nom?.trim()) {
      alert('Il faut donner un nom.');
      return;
    }
    if (modal.mode === 'creation') {
      const newItem = {
        id: nextLocalId(),
        rowId: form.rowId,
        start: form.start,
        duree: Number(form.duree) || 5,
        nom: form.nom,
        color: form.color || PERSONAL_COLORS[0],
        note: form.note || '',
      };
      const newItems = [...items, newItem];
      const cleaned = applyPersonalInsertion(newItems, newItem, newItem.rowId, newItem.start);
      setItems(cleaned);
      doSave(rows, cleaned);
    } else {
      const newItems = items.map((it) => it.id === form.id ? { ...it, ...form, duree: Number(form.duree) || 5 } : it);
      setItems(newItems);
      doSave(rows, newItems);
    }
    setModal({ open: false, mode: 'creation' });
    setForm(null);
  }

  function closeModal() {
    setModal({ open: false, mode: 'creation' });
    setForm(null);
    setSelection(null);
  }

  function deleteSelectedItem() {
    if (!selectedItem || selectedItem.type !== 'item') return;
    const newItems = items.filter((it) => it.id !== selectedItem.id);
    setItems(newItems);
    doSave(rows, newItems);
    setSelectedItem(null);
  }

  function startSelection(e, rowId, date) {
    if (e.button !== 0) return;
    if (resize || modal.open) return;
    setSelection({ rowId, startDate: date, endDate: date });
  }

  function updateSelection(rowId, date) {
    if (selectionThrottle.current) return;
    selectionThrottle.current = requestAnimationFrame(() => {
      setSelection((prev) => {
        if (!prev || prev.rowId !== rowId) return prev;
        return { ...prev, endDate: date };
      });
      selectionThrottle.current = null;
    });
  }

  function endSelection() {
    if (!selection || resize || modal.open) return;
    const startIdx = dayIndex(selection.startDate);
    const endIdx = dayIndex(selection.endDate);
    const a = Math.min(startIdx, endIdx);
    const b = Math.max(startIdx, endIdx);
    if (a === b) { setSelection(null); return; }

    const start = visibleDateByIndex(a);
    const duree = b - a + 1;
    openCreateItem(selection.rowId, start, duree);
    setSelection(null);
  }

  function onDragStart(e, itemId) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(itemId));
  }

  function onDrop(e, rowId, date) {
    e.preventDefault();
    e.stopPropagation();
    const id = Number(e.dataTransfer.getData('text/plain'));
    const item = items.find((it) => it.id === id);
    if (!item) return;
    const dayOffset = dayIndex(date) - dayIndex(item.start);
    if (dayOffset === 0 && rowId === item.rowId) return;
    const newStart = addWorkingDays(item.start, dayOffset);
    const movedItem = { ...item, rowId, start: newStart };
    const newItems = applyPersonalInsertion(items, movedItem, rowId, newStart);
    setItems(newItems);
    doSave(rows, newItems);
  }

  function startResize(e, item, side) {
    e.preventDefault();
    e.stopPropagation();

    resizeRef.current = {
      id: item.id,
      side,
      startX: e.clientX,
      delta: 0,
      originalStart: item.start,
      originalDuree: item.duree,
      originalRowId: item.rowId,
    };

    setResize({
      id: item.id,
      side,
      delta: 0,
    });
  }

  useEffect(() => {
    if (!resize) return;
    const r = resizeRef.current;
    if (!r) return;
    let rafId = null;

    function onMouseMove(e) {
      if (rafId) return;
      lastXRef.current = e.clientX;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const delta = Math.round((lastXRef.current - r.startX) / CELL_W);

        let previewStart, previewEnd;
        if (delta !== 0) {
          if (r.side === 'right') {
            previewStart = r.originalStart;
            previewEnd = addWorkingDays(getEndDate({ start: r.originalStart, duree: r.originalDuree }), delta);
          } else {
            const rawNewStart = addWorkingDays(r.originalStart, delta);
            const origEnd = getEndDate({ start: r.originalStart, duree: r.originalDuree });
            const newStartIdx = dayIndex(rawNewStart);
            const endIdx = dayIndex(origEnd);
            if (newStartIdx >= 0 && endIdx >= 0 && newStartIdx < endIdx) {
              previewStart = rawNewStart;
              previewEnd = origEnd;
            } else if (endIdx >= 1) {
              previewStart = visibleDateByIndex(endIdx - 1);
              previewEnd = origEnd;
            }
          }
        }
        setResize((prev) => prev ? { ...prev, delta, previewStart, previewEnd, previewRowId: r.originalRowId } : prev);
      });
    }

    function onMouseUp(e) {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      const r2 = resizeRef.current;
      if (!r2) { setResize(null); resizeRef.current = null; return; }
      const delta = Math.round((e.clientX - r2.startX) / CELL_W);
      const { id, side, originalStart, originalDuree, originalRowId } = r2;

      if (delta !== 0) {
        if (side === 'right') {
          const origEnd = getEndDate({ start: originalStart, duree: originalDuree });
          const newEnd = addWorkingDays(origEnd, delta);
          const newDuree = getWorkingDaysBetween(originalStart, newEnd);
          if (newDuree >= 1) {
            const movedItem = { id, rowId: originalRowId, start: originalStart, duree: newDuree, nom: '', color: '' };
            setItems((prev) => {
              const updated = prev.map((it) => it.id === id ? { ...it, duree: newDuree } : it);
              return applyPersonalInsertion(updated, { ...updated.find(it => it.id === id) }, originalRowId, originalStart);
            });
          }
        } else {
          const origEnd = getEndDate({ start: originalStart, duree: originalDuree });
          const rawNewStart = addWorkingDays(originalStart, delta);
          const newStartIdx = dayIndex(rawNewStart);
          const endIdx = dayIndex(origEnd);
          if (newStartIdx >= 0 && endIdx >= 0 && newStartIdx < endIdx) {
            const newDuree = endIdx - newStartIdx + 1;
            setItems((prev) => {
              const updated = prev.map((it) =>
                it.id === id ? { ...it, start: rawNewStart, duree: newDuree } : it
              );
              return applyPersonalInsertion(updated, { id, rowId: originalRowId, start: rawNewStart, duree: newDuree, nom: '', color: '' }, originalRowId, rawNewStart);
            });
          }
        }
        doSave(rows, items);
      }

      setResize(null);
      resizeRef.current = null;
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [resize, visibleDays]);

  function handleScroll(e) {
    const el = e.currentTarget;
    if (scrollThrottleRef.current) cancelAnimationFrame(scrollThrottleRef.current);
    scrollThrottleRef.current = requestAnimationFrame(() => {
      scrollThrottleRef.current = null;
      if (el.scrollLeft + el.clientWidth > el.scrollWidth - 900) {
        if (!expandRightRef.current && !expandCooldownRef.current) {
          expandRightRef.current = setTimeout(() => {
            expandRightRef.current = null;
            expandCooldownRef.current = setTimeout(() => { expandCooldownRef.current = null; }, 2000);
            setCalendarLength((prev) => prev + 100);
          }, 250);
        }
      } else if (expandRightRef.current) {
        clearTimeout(expandRightRef.current);
        expandRightRef.current = null;
      }
      if (el.scrollLeft < 200) {
        if (!expandLeftRef.current && !expandCooldownRef.current) {
          expandLeftRef.current = setTimeout(() => {
            expandLeftRef.current = null;
            expandCooldownRef.current = setTimeout(() => { expandCooldownRef.current = null; }, 2000);
            setCalendarStart((prev) => addDays(prev, -30));
            setCalendarLength((prev) => prev + 30);
            setTimeout(() => {
              if (scrollRef.current) scrollRef.current.scrollLeft += 30 * CELL_W;
            }, 0);
          }, 250);
        }
      } else if (expandLeftRef.current) {
        clearTimeout(expandLeftRef.current);
        expandLeftRef.current = null;
      }
    });
  }

  function handleContextMenu(e, type, id, rowId, date) {
    if (type === 'item') {
      const item = items.find((it) => it.id === id);
      if (item) setContextMenu({ x: e.clientX, y: e.clientY, type: 'item', item });
    } else if (type === 'cell') {
      const row = rows.find((r) => r.id === rowId);
      if (row) setContextMenu({ x: e.clientX, y: e.clientY, type: 'row', row });
    }
  }

  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    window.addEventListener('click', close);
    window.addEventListener('scroll', close, true);
    return () => {
      window.removeEventListener('click', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [contextMenu]);

  useEffect(() => {
    function onKeyDown(e) {
      const key = e.key || '';
      if ((key === 'Delete' || key === 'Backspace') && !e.target.closest('input, textarea')) {
        if (selectedItem && !modal.open) {
          deleteSelectedItem();
        }
      }
      if (key === 'Escape') {
        if (modal.open) closeModal();
        if (pdfModal) setPdfModal(false);
        setSelectedItem(null);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedItem, modal.open, items, pdfModal]);



  async function handleExportPdf() {
    const rangeStart = pdfStart;
    const rangeEnd = pdfEnd;
    if (!rangeStart || !rangeEnd || rangeStart > rangeEnd) {
      alert('Plage de dates invalide.');
      return;
    }

    const rangeDays = [];
    let cursor = rangeStart;
    while (cursor <= rangeEnd) {
      if (!isWeekend(cursor)) rangeDays.push(cursor);
      cursor = addDays(cursor, 1);
    }
    if (rangeDays.length === 0) {
      alert('Aucun jour ouvré dans cette plage.');
      return;
    }

    setPdfModal(false);

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
    const totalPages = Math.max(1, Math.ceil(gridRows.length / rowsOnPage || 1));

    function hexToRgb(hex) {
      const h = hex.replace('#', '');
      return [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)];
    }

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
          const itemEnd = getEndDate(item);
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

    if (gridRows.length === 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text(planName || 'Planning', margin, margin + 10);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text('Aucune tâche dans cette plage de dates.', margin, margin + 20);
      pdf.save(`${planName || 'planning'}_${rangeStart}_${rangeEnd}.pdf`);
      return;
    }

    for (let pi = 0; pi < totalPages; pi++) {
      if (pi > 0) pdf.addPage();
      const start = pi * rowsOnPage;
      const end = Math.min(start + rowsOnPage, gridRows.length);
      drawGrid(pdf, gridRows.slice(start, end), pi);
    }

    pdf.save(`${planName || 'planning'}_${rangeStart}_${rangeEnd}.pdf`);
  }

  if (loading) {
    return <div className="loading-screen"><div className="loading-spinner" /><p>Chargement...</p></div>;
  }

  return (
    <div className="personal-planning-wrap" onMouseUp={endSelection}>
      <div className="personal-header">
        <div className="personal-plan-selector" style={{ position: 'relative' }}>
          <button className="personal-plan-btn" onClick={() => setDropdownOpen((v) => !v)}>
            {activePlan ? activePlan.nom : 'Choisir un planning'}
            <span style={{ fontSize: 10, marginLeft: 6 }}>▼</span>
          </button>
          {dropdownOpen && (
            <div className="personal-dropdown">
              {plans.map((p) => (
                <div
                  key={p.id}
                  className={`personal-dropdown-item ${p.id === activePlanId ? 'active' : ''}`}
                  onClick={() => { setActivePlanId(p.id); setDropdownOpen(false); }}
                >
                  <span className="personal-dropdown-name">{p.nom}</span>
                  <button className="personal-dropdown-delete" onClick={(e) => { e.stopPropagation(); handleDeletePlan(p.id); }}>×</button>
                </div>
              ))}
              {plans.length === 0 && <div className="personal-dropdown-empty">Aucun planning</div>}
            </div>
          )}
        </div>

        <button className="personal-add-btn" onClick={handleCreatePlan}>+ Nouveau</button>

        {activePlan && (
          <>
            <button className="today-btn" onClick={() => {
              const idx = dayIndex(today);
              if (scrollRef.current && idx >= 0) scrollRef.current.scrollLeft = Math.max(0, idx * CELL_W - 500);
            }}>Aujourd'hui</button>
            <button className="personal-pdf-btn" onClick={() => setPdfModal(true)}>PDF</button>
            <span className="personal-plan-name" onDoubleClick={() => setRenameInput(planName)}>
              {renameInput != null ? (
                <input
                  autoFocus
                  value={renameInput}
                  onChange={(e) => setRenameInput(e.target.value)}
                  onBlur={handleRenamePlan}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleRenamePlan(); if (e.key === 'Escape') setRenameInput(null); }}
                  className="personal-rename-input"
                />
              ) : planName}
            </span>
          </>
        )}
      </div>

      {!activePlan ? (
        <div className="personal-empty">
          <p>Aucun planning sélectionné.</p>
          <button className="personal-add-btn" onClick={handleCreatePlan}>Créer un planning</button>
        </div>
      ) : (
        <div>
          <PersonalPlanningGrid
            gridRows={gridRows}
            visibleDays={visibleDays}
            weekGroups={weekGroups}
            monthGroups={monthGroups}
            itemsParCellule={itemsParCellule}
            selectedItem={selectedItem}
            selection={selection}
            cellWidth={CELL_W}
            canEdit={true}
            resize={resize}
            today={today}
            ferieSet={ferieSet}
            callbacksRef={gridCallbacksRef}
            scrollRef={scrollRef}
          />
        </div>
      )}

      {/* Context menu */}
      {contextMenu && createPortal(
        <div className="personal-context" style={{ left: contextMenu.x, top: contextMenu.y }}>
          {contextMenu.type === 'item' && (
            <>
              <div onClick={() => {
                const newNom = prompt('Nom du bloc:', contextMenu.item.nom || '');
                if (newNom != null) {
                  const newItems = items.map((it) => it.id === contextMenu.item.id ? { ...it, nom: newNom } : it);
                  setItems(newItems);
                  doSave(rows, newItems);
                }
                setContextMenu(null);
              }}>Renommer</div>
              <div onClick={() => {
                setForm({ ...contextMenu.item });
                setModal({ open: true, mode: 'modification' });
                setSelectedItem({ type: 'item', id: contextMenu.item.id });
                setContextMenu(null);
              }}>Modifier</div>
              <div className="danger" onClick={() => {
                const newItems = items.filter((it) => it.id !== contextMenu.item.id);
                setItems(newItems);
                doSave(rows, newItems);
                setContextMenu(null);
              }}>Supprimer</div>
            </>
          )}
          {contextMenu.type === 'row' && (
            <>
              <div onClick={() => {
                const newNom = prompt('Nom de la tâche:', contextMenu.row.nom);
                if (newNom) handleRenameRow(contextMenu.row.id, newNom);
                setContextMenu(null);
              }}>Renommer</div>
              <div className="danger" onClick={() => { handleDeleteRow(contextMenu.row.id); setContextMenu(null); }}>Supprimer la tâche</div>
            </>
          )}
        </div>,
        document.body
      )}

      {/* Modal création/modification */}
      {modal.open && form && createPortal(
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 99998, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            background: 'var(--surface)',
            borderRadius: 14,
            padding: '24px 28px',
            minWidth: 340,
            maxWidth: 420,
            boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
            border: '1px solid var(--line)',
          }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
              {modal.mode === 'creation' ? 'Nouveau bloc' : 'Modifier le bloc'}
            </h3>

            <label style={{ display: 'block', marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Nom</span>
              <input
                autoFocus
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') saveModal(); }}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', fontSize: 14, boxSizing: 'border-box' }}
                placeholder="Nom du bloc"
              />
            </label>

            <label style={{ display: 'block', marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Durée (jours)</span>
              <input
                type="number"
                min="1"
                value={form.duree}
                onChange={(e) => setForm({ ...form, duree: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', fontSize: 14, boxSizing: 'border-box' }}
              />
            </label>

            <label style={{ display: 'block', marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Note</span>
              <textarea
                value={form.note || ''}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                rows={3}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', fontSize: 14, boxSizing: 'border-box', resize: 'vertical' }}
                placeholder="Note ou commentaire..."
              />
            </label>

            <label style={{ display: 'block', marginBottom: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Couleur</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {PERSONAL_COLORS.map((c) => (
                  <div
                    key={c}
                    onClick={() => setForm({ ...form, color: c })}
                    style={{
                      width: 28, height: 28, borderRadius: 6, background: c, cursor: 'pointer',
                      border: form.color === c ? '3px solid var(--text)' : '3px solid transparent',
                    }}
                  />
                ))}
              </div>
            </label>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={closeModal} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', cursor: 'pointer', fontSize: 14 }}>
                Annuler
              </button>
              <button onClick={saveModal} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--green)', background: 'var(--green)', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                {modal.mode === 'creation' ? 'Créer' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal PDF */}
      {pdfModal && createPortal(
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 99998, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            background: 'var(--surface)',
            borderRadius: 14,
            padding: '24px 28px',
            minWidth: 340,
            maxWidth: 420,
            boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
            border: '1px solid var(--line)',
          }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
              Exporter en PDF
            </h3>

            <label style={{ display: 'block', marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Date de début</span>
              <input
                type="date"
                value={pdfStart}
                onChange={(e) => setPdfStart(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', fontSize: 14, boxSizing: 'border-box' }}
              />
            </label>

            <label style={{ display: 'block', marginBottom: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Date de fin</span>
              <input
                type="date"
                value={pdfEnd}
                onChange={(e) => setPdfEnd(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', fontSize: 14, boxSizing: 'border-box' }}
              />
            </label>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setPdfModal(false)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', cursor: 'pointer', fontSize: 14 }}>
                Annuler
              </button>
              <button onClick={handleExportPdf} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--green)', background: 'var(--green)', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                Générer le PDF
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
