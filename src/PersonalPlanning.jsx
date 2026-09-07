import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  loadPersonalPlans,
  createPersonalPlan,
  deletePersonalPlan,
  renamePersonalPlan,
  savePersonalPlan,
} from './lib/api.js';
import PersonalPlanningGrid from './PersonalPlanningGrid.jsx';
import { addWorkingDays, getWorkingDaysBetween, generateFrenchHolidays, isWorkingDay } from './lib/personalPlanningUtils.js';
import { generatePdf } from './lib/pdfExport.js';

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

function getEndDate(item, ferieSet) {
  return addWorkingDays(item.start, item.duree - 1, ferieSet);
}

function applyPersonalInsertion(list, movedItem, targetRowId, targetStart, ferieSet) {
  let next = list.map((it) =>
    it.id === movedItem.id
      ? { ...it, rowId: targetRowId, start: targetStart }
      : it
  );

  const moved = next.find((it) => it.id === movedItem.id);
  if (!moved) return next;
  const movedEnd = getEndDate(moved, ferieSet);

  let cursor = addWorkingDays(movedEnd, 1, ferieSet);
  const affected = next
    .filter(
      (it) =>
        it.id !== moved.id &&
        it.rowId === targetRowId &&
        getEndDate(it, ferieSet) >= targetStart
    )
    .sort((a, b) => (a.start < b.start ? -1 : 1));

  const movedEarlier = targetStart < movedItem.start;
  const changed = new Map();

  affected.forEach((it) => {
    if (!movedEarlier && it.start >= cursor) return;
    changed.set(it.id, { ...it, start: cursor });
    cursor = addWorkingDays(getEndDate({ ...it, start: cursor }, ferieSet), 1, ferieSet);
  });

  next = next.map((it) => changed.get(it.id) || it);
  return next;
}

function nextWorkingDay(date, ferieSet) {
  let cur = date;
  while (!isWorkingDay(cur, ferieSet)) {
    const d = toDate(cur);
    d.setDate(d.getDate() + 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    cur = `${y}-${m}-${day}`;
  }
  return cur;
}

function cascadeGanttOnModify(originalItems, newItems, modifiedId, ferieSet) {
  const sorted = [...originalItems].sort((a, b) => {
    if (a.start !== b.start) return a.start.localeCompare(b.start);
    return a.id - b.id;
  });
  const idx = sorted.findIndex(it => it.id === modifiedId);
  if (idx === -1) {
    const allSorted = [...newItems].sort((a, b) => {
      if (a.start !== b.start) return a.start.localeCompare(b.start);
      return a.id - b.id;
    });
    const newIdx = allSorted.findIndex(it => it.id === modifiedId);
    if (newIdx === -1) return newItems;
    const result = allSorted.map(it => ({ ...it }));
    result[newIdx].start = nextWorkingDay(result[newIdx].start, ferieSet);
    for (let i = newIdx + 1; i < result.length; i++) {
      const prev = result[i - 1];
      const prevEnd = addWorkingDays(prev.start, prev.duree - 1, ferieSet);
      result[i].start = addWorkingDays(prevEnd, 1, ferieSet);
    }
    return result;
  }
  const oldStart = toDate(sorted[idx].start);
  const newItem = newItems.find(it => it.id === modifiedId);
  if (!newItem) return newItems;
  const oldItem = sorted[idx];
  const newStart = toDate(newItem.start);
  const deltaDays = Math.round((newStart - oldStart) / 86400000);
  const isResize = newItem.duree !== oldItem.duree;
  if (deltaDays === 0 && !isResize) return newItems;
  const result = newItems.map(it => ({ ...it }));
  const m = result.find(it => it.id === modifiedId);
  if (m) m.start = nextWorkingDay(m.start, ferieSet);
  // si c'est un resize (duree changée) on fait une vraie cascade Gantt, sinon simple décalage
  if (isResize) {
    const allSortedAfter = [...result].sort((a, b) => {
      if (a.start !== b.start) return a.start.localeCompare(b.start);
      return a.id - b.id;
    });
    const modIdx = allSortedAfter.findIndex(it => it.id === modifiedId);
    for (let i = modIdx + 1; i < allSortedAfter.length; i++) {
      const prev = allSortedAfter[i - 1];
      const prevEnd = addWorkingDays(prev.start, prev.duree - 1, ferieSet);
      const expectedStart = addWorkingDays(prevEnd, 1, ferieSet);
      const cur = allSortedAfter[i];
      const rIdx = result.findIndex(it => it.id === cur.id);
      if (rIdx !== -1 && result[rIdx].start !== expectedStart) {
        result[rIdx].start = expectedStart;
      }
    }
  } else {
    for (let i = idx + 1; i < sorted.length; i++) {
      const ref = sorted[i];
      const rIdx = result.findIndex(it => it.id === ref.id);
      if (rIdx === -1) continue;
      const d = toDate(ref.start);
      d.setDate(d.getDate() + deltaDays);
      const y = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      result[rIdx].start = nextWorkingDay(`${y}-${mo}-${dd}`, ferieSet);
    }
  }
  return result;
}

function cascadeGanttOnDelete(allItems, deletedId, ferieSet) {
  const deleted = allItems.find(it => it.id === deletedId);
  if (!deleted) return allItems.filter(it => it.id !== deletedId);
  const sorted = [...allItems].sort((a, b) => {
    if (a.start !== b.start) return a.start.localeCompare(b.start);
    return a.id - b.id;
  });
  const idx = sorted.findIndex(it => it.id === deletedId);
  if (idx === -1) return allItems.filter(it => it.id !== deletedId);
  const remaining = sorted.filter(it => it.id !== deletedId);
  if (remaining.length <= 1) return remaining;
  const result = remaining.map(it => ({ ...it }));
  for (let i = idx; i < result.length; i++) {
    const prev = result[i - 1];
    const prevEnd = addWorkingDays(prev.start, prev.duree - 1, ferieSet);
    result[i].start = nextWorkingDay(addWorkingDays(prevEnd, 1, ferieSet), ferieSet);
  }
  return result;
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
  const [ganttMode, setGanttMode] = useState(false);

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

  const thisYear = new Date().getFullYear();
  const ferieSet = useMemo(() => {
    const s = generateFrenchHolidays(thisYear);
    for (const h of generateFrenchHolidays(thisYear + 1)) s.add(h);
    return s;
  }, []);

  function dayIndex(date) {
    return dayIdxMap.get(date) ?? -1;
  }

  function visibleDateByIndex(index) {
    if (!visibleDays.length) return today;
    if (index < 0) return visibleDays[0].date;
    if (index >= visibleDays.length) return visibleDays[visibleDays.length - 1].date;
    return visibleDays[index].date;
  }

  function overlaps(itemA, itemB) {
    if (!itemA?.start || !itemB?.start || itemA.rowId !== itemB.rowId) return false;
    const endA = getEndDate(itemA, ferieSet);
    const endB = getEndDate(itemB, ferieSet);
    return itemA.start <= endB && itemB.start <= endA;
  }

  function hasOverlap(checkItem, excludeId) {
    if (!checkItem?.start) return false;
    return items.some((it) => it.id !== excludeId && overlaps(checkItem, it));
  }

  function nextLocalId() {
    nextTempId -= 1;
    return nextTempId;
  }

  function splitItem(item) {
    if (!item || !item.start || !item.rowId || !(item.duree > 0)) {
      console.error('splitItem: item invalide ignoré', item);
      return [];
    }
    const startIdx = dayIndex(item.start);
    if (startIdx === -1) return [];
    const endDate = getEndDate(item, ferieSet);
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
    const initialRows = activePlan.rows && activePlan.rows.length > 0
      ? activePlan.rows
      : Array.from({ length: 5 }, (_, i) => ({ id: nextLocalId(), nom: `Tâche ${i + 1}`, ordre: i }));
    setRows(initialRows);
    setItems(activePlan.items || []);
    setPlanName(activePlan.nom || '');
    initialScrolled.current = false;
    // si on a créé des lignes placeholder, on les sauvegarde
    if (!activePlan.rows || activePlan.rows.length === 0) {
      doSave(initialRows, activePlan.items || []);
    }
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
      if (!ganttMode) {
        if (hasOverlap(newItem)) {
          alert('Impossible : chevauchement avec un bloc existant sur la même ligne.');
          return;
        }
        const newItems = [...items, newItem];
        setItems(newItems);
        doSave(rows, newItems);
      } else {
        const newItems = [...items, newItem];
        const cleaned = cascadeGanttOnModify(items, newItems, newItem.id, ferieSet);
        setItems(cleaned);
        doSave(rows, cleaned);
      }
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
    const filtered = items.filter((it) => it.id !== selectedItem.id);
    const newItems = ganttMode ? cascadeGanttOnDelete(filtered, selectedItem.id, ferieSet) : filtered;
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

    const start = nextWorkingDay(visibleDateByIndex(a), ferieSet);
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
    const newStart = addWorkingDays(item.start, dayOffset, ferieSet);
    const movedItem = { ...item, rowId, start: newStart };
    if (!ganttMode) {
      if (hasOverlap(movedItem, item.id)) return;
      const newItems = items.map((it) => it.id === item.id ? movedItem : it);
      setItems(newItems);
      doSave(rows, newItems);
    } else {
      const applied = items.map((it) => it.id === item.id ? movedItem : it);
      const newItems = cascadeGanttOnModify(items, applied, item.id, ferieSet);
      setItems(newItems);
      doSave(rows, newItems);
    }
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
            previewEnd = addWorkingDays(getEndDate({ start: r.originalStart, duree: r.originalDuree }, ferieSet), delta, ferieSet);
          } else {
            const rawNewStart = addWorkingDays(r.originalStart, delta, ferieSet);
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
          const origEnd = getEndDate({ start: originalStart, duree: originalDuree }, ferieSet);
          const newEnd = addWorkingDays(origEnd, delta, ferieSet);
          const newDuree = getWorkingDaysBetween(originalStart, newEnd, ferieSet);
          if (newDuree >= 1) {
            if (!ganttMode) {
              const resized = { id, rowId: originalRowId, start: originalStart, duree: newDuree };
              if (hasOverlap(resized, id)) return;
              setItems((prev) => prev.map((it) => it.id === id ? { ...it, duree: newDuree } : it));
            } else {
              setItems((prev) => {
                const updated = prev.map((it) => it.id === id ? { ...it, duree: newDuree } : it);
                return cascadeGanttOnModify(prev, updated, id, ferieSet);
              });
            }
          }
        } else {
          const origEnd = getEndDate({ start: originalStart, duree: originalDuree }, ferieSet);
          const rawNewStart = addWorkingDays(originalStart, delta, ferieSet);
          const newDuree = getWorkingDaysBetween(rawNewStart, origEnd, ferieSet);
          if (newDuree >= 1) {
            if (!ganttMode) {
              const resized = { id, rowId: originalRowId, start: rawNewStart, duree: newDuree };
              if (hasOverlap(resized, id)) return;
              setItems((prev) => prev.map((it) =>
                it.id === id ? { ...it, start: rawNewStart, duree: newDuree } : it
              ));
            } else {
              setItems((prev) => {
                const updated = prev.map((it) =>
                  it.id === id ? { ...it, start: rawNewStart, duree: newDuree } : it
                );
                return cascadeGanttOnModify(prev, updated, id, ferieSet);
              });
            }
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



  function handleExportPdf() {
    const result = generatePdf({
      planName,
      rangeStart: pdfStart,
      rangeEnd: pdfEnd,
      rows: gridRows,
      items,
      today,
      ferieSet,
    });
    if (!result) {
      alert('Plage de dates invalide.');
      return;
    }
    setPdfModal(false);
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

        <div className="personal-header-sep" />

        {activePlan && (
          <>
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
            <div className="personal-header-spacer" />
            <button className="today-btn" onClick={() => {
              const idx = dayIndex(today);
              if (scrollRef.current && idx >= 0) scrollRef.current.scrollLeft = Math.max(0, idx * CELL_W - 500);
            }}>Aujourd'hui</button>
            <button className="personal-pdf-btn" onClick={() => setPdfModal(true)}>PDF</button>
            <button
              className={`gantt-toggle ${ganttMode ? 'active' : ''}`}
              onClick={() => setGanttMode((v) => !v)}
              title={ganttMode ? 'Mode Gantt : cascade globale activée' : 'Mode libre : indépendant'}
            >
              {ganttMode ? '🔗 Mode Gantt' : '🔗 Mode Libre'}
            </button>
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
                const filtered = items.filter((it) => it.id !== contextMenu.item.id);
                const newItems = ganttMode ? cascadeGanttOnDelete(filtered, contextMenu.item.id, ferieSet) : filtered;
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
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 99998, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
          <div className="personal-modal">
            <div className="personal-modal-head">
              <h3>{modal.mode === 'creation' ? 'Nouveau bloc' : 'Modifier le bloc'}</h3>
              <button className="personal-modal-close" onClick={closeModal} aria-label="Fermer">×</button>
            </div>

            <label className="personal-modal-field">
              <span>Nom</span>
              <input
                autoFocus
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') saveModal(); }}
                placeholder="Nom du bloc"
              />
            </label>

            <label className="personal-modal-field">
              <span>Durée (jours)</span>
              <input
                type="number"
                min="1"
                value={form.duree}
                onChange={(e) => setForm({ ...form, duree: e.target.value })}
              />
            </label>

            <label className="personal-modal-field">
              <span>Note</span>
              <textarea
                value={form.note || ''}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                rows={3}
                placeholder="Note ou commentaire..."
              />
            </label>

            <label className="personal-modal-field">
              <span>Couleur</span>
              <div className="personal-color-picker">
                {PERSONAL_COLORS.map((c) => (
                  <div
                    key={c}
                    className={`personal-color-swatch${form.color === c ? ' selected' : ''}`}
                    onClick={() => setForm({ ...form, color: c })}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </label>

            <div className="personal-modal-foot">
              <button className="personal-modal-btn ghost" onClick={closeModal}>Annuler</button>
              <button className="personal-modal-btn primary" onClick={saveModal}>
                {modal.mode === 'creation' ? 'Créer' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal PDF */}
      {pdfModal && createPortal(
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 99998, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
          <div className="personal-modal">
            <div className="personal-modal-head">
              <h3>Exporter en PDF</h3>
              <button className="personal-modal-close" onClick={() => setPdfModal(false)} aria-label="Fermer">×</button>
            </div>

            <label className="personal-modal-field">
              <span>Date de début</span>
              <input
                type="date"
                value={pdfStart}
                onChange={(e) => setPdfStart(e.target.value)}
              />
            </label>

            <label className="personal-modal-field">
              <span>Date de fin</span>
              <input
                type="date"
                value={pdfEnd}
                onChange={(e) => setPdfEnd(e.target.value)}
              />
            </label>

            <div className="personal-modal-foot">
              <button className="personal-modal-btn ghost" onClick={() => setPdfModal(false)}>Annuler</button>
              <button className="personal-modal-btn primary" onClick={handleExportPdf}>Générer le PDF</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
