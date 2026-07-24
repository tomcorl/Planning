import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from './lib/supabase.js';
import {
  loadPersonalPlans,
  createPersonalPlan,
  deletePersonalPlan,
  renamePersonalPlan,
  savePersonalPlan,
} from './lib/api.js';

const CELL_W = 26;
const ROW_H = 52;
const PERSONAL_COLORS = [
  '#2563eb', '#93c5fd', '#eab308', '#15803d', '#6b7280',
  '#f97316', '#7dd3fc', '#a78bfa', '#f472b6', '#34d399',
];

let nextTempId = -1;

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

function formatDate(d) {
  return d.toISOString().split('T')[0];
}

function isWeekend(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const dow = d.getDay();
  return dow === 0 || dow === 6;
}

function getIsoWeek(dateStr) {
  const date = new Date(dateStr + 'T12:00:00');
  const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  return Math.ceil(((tmp - yearStart) / 86400000 + 1) / 7);
}

function generateDays(start, count) {
  return Array.from({ length: count }, (_, i) => {
    const d = addDays(start, i);
    const date = d;
    const dt = new Date(date + 'T12:00:00');
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

  const saveTimerRef = useRef(null);
  const dragRef = useRef(null);
  const initialScrolled = useRef(false);
  const selectionThrottle = useRef(null);
  const expandRightRef = useRef(null);
  const expandLeftRef = useRef(null);
  const expandCooldownRef = useRef(null);
  const scrollThrottleRef = useRef(null);
  const lastCellRef = useRef(null);

  const activePlan = plans.find((p) => p.id === activePlanId);

  const allDays = useMemo(
    () => generateDays(calendarStart, calendarLength),
    [calendarStart, calendarLength]
  );

  const visibleDays = useMemo(() => allDays, [allDays]);

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

  const weekBoundarySet = useMemo(() => {
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

  const gridTemplateColumns = useMemo(
    () => `260px repeat(${visibleDays.length}, ${CELL_W}px)`,
    [visibleDays.length]
  );

  const dateGridH = 38;

  const rowByIdMap = useMemo(() => new Map(rows.map(r => [r.id, r])), [rows]);

  const itemsByRowDate = useMemo(() => {
    const m = new Map();
    for (const it of items) {
      const key = `${it.rowId}-${it.start}`;
      if (!m.has(key)) m.set(key, []);
      m.get(key).push(it);
    }
    return m;
  }, [items]);

  function dayIndex(date) {
    return dayIdxMap.get(date) ?? -1;
  }

  function visibleDateByIndex(index) {
    if (!visibleDays.length) return today;
    if (index < 0) return visibleDays[0].date;
    if (index >= visibleDays.length) return visibleDays[visibleDays.length - 1].date;
    return visibleDays[index].date;
  }

  const headerHeight = 28 + 30 + dateGridH;

  function dayKey(date) {
    return date;
  }

  function nextLocalId() {
    nextTempId -= 1;
    return nextTempId;
  }

  function getItemEndDate(item) {
    const d = new Date(item.start + 'T00:00:00');
    d.setDate(d.getDate() + item.duree - 1);
    return formatDate(d);
  }

  function splitItem(item) {
    const startIdx = dayIndex(item.start);
    if (startIdx === -1) return [];
    const endStr = getItemEndDate(item);
    const endIdx = dayIndex(endStr);
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
          map.get(key).push({ item, seg });
        }
      }
    }
    return map;
  }, [items, visibleDays]);

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
    });
    setModal({ open: true, mode: 'creation' });
  }

  function openEditItem(item) {
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
      };
      const newItems = [...items, newItem];
      setItems(newItems);
      doSave(rows, newItems);
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
    lastCellRef.current = { rowId, date };
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
    if (!selection || modal.open) return;
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

  function isSelected(rowId, date) {
    if (!selection || selection.rowId !== rowId) return false;
    const idx = dayIndex(date);
    const a = dayIndex(selection.startDate);
    const b = dayIndex(selection.endDate);
    return idx >= Math.min(a, b) && idx <= Math.max(a, b);
  }

  function onDragStart(e, itemId) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(itemId));
    const item = items.find((it) => it.id === itemId);
    if (!item) return;
    dragRef.current = {
      id: itemId,
      origRowId: item.rowId,
      origStart: item.start,
      origDuree: item.duree,
    };
  }

  function onDrop(e, rowId, date) {
    e.preventDefault();
    e.stopPropagation();
    const drag = dragRef.current;
    if (!drag) return;
    const dayOffset = dayIndex(date) - dayIndex(drag.origStart);
    const newItems = items.map((it) => {
      if (it.id !== drag.id) return it;
      return {
        ...it,
        rowId,
        start: addDays(it.start, dayOffset),
      };
    });
    setItems(newItems);
    doSave(rows, newItems);
    dragRef.current = null;
  }

  function handleGridEvent(e) {
    const type = e.type;
    const cell = e.target.closest('[data-eq]');
    const bloc = e.target.closest('[data-item]');

    if (bloc) {
      const id = Number(bloc.dataset.item);
      if (type === 'mousedown') {
        e.stopPropagation();
        setSelectedItem({ type: 'item', id });
        return;
      }
      if (type === 'dblclick') {
        const item = items.find((it) => it.id === id);
        if (item) openEditItem(item);
        return;
      }
      if (type === 'contextmenu') {
        e.preventDefault();
        const item = items.find((it) => it.id === id);
        if (item) setContextMenu({ x: e.clientX, y: e.clientY, type: 'item', item });
        return;
      }
    }

    if (!cell) return;
    const rowId = Number(cell.dataset.eq);
    const date = cell.dataset.da;

    if (type === 'contextmenu') {
      e.preventDefault();
      const row = rows.find((r) => r.id === rowId);
      if (row) setContextMenu({ x: e.clientX, y: e.clientY, type: 'row', row });
      return;
    }
    if (type === 'mousedown') {
      startSelection(e, rowId, date);
      return;
    }
    if (type === 'mouseover') {
      updateSelection(rowId, date);
      return;
    }
    if (type === 'dblclick') {
      openCreateItem(rowId, date, 5);
      return;
    }
    if (type === 'dragover') {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      return;
    }
    if (type === 'drop') {
      onDrop(e, rowId, date);
      return;
    }
  }

  function goToday() {
    const idx = dayIndex(today);
    const el = scrollRef.current;
    if (el && idx >= 0) el.scrollLeft = Math.max(0, idx * CELL_W - 500);
  }

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
      if (key === 'Delete' || key === 'Backspace') {
        if (selectedItem && !modal.open) {
          deleteSelectedItem();
        }
      }
      if (key === 'Escape') {
        if (modal.open) closeModal();
        setSelectedItem(null);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedItem, modal.open, items]);

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
            <button className="today-btn" onClick={goToday}>Aujourd'hui</button>
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
        <div className="planning-container">
          <div className="planning-scroll" ref={scrollRef} onScroll={handleScroll}>
            <div className="planning-header">
              <div className="grid month-grid" style={{ gridTemplateColumns }}>
                <div className="corner month-corner" />
                {monthGroups.map((g) => (
                  <div className="month-cell month-even" key={g.monthKey} style={{ gridColumn: `span ${g.count}` }}>
                    {g.monthLabel}
                  </div>
                ))}
              </div>

              <div className="grid week-grid" style={{ gridTemplateColumns }}>
                <div className="corner week-corner"><strong>Tâches</strong></div>
                {weekGroups.map((g, i) => (
                  <div className="week-cell" key={i} style={{ gridColumn: `span ${g.count}` }}>
                    S{g.week}
                  </div>
                ))}
              </div>

              <div className="grid date-grid" style={{ gridTemplateColumns, gridAutoRows: dateGridH }}>
                <div className="corner date-corner" />
                {visibleDays.map((d) => (
                  <div
                    key={d.date}
                    className={`date-cell${weekBoundarySet.has(d.date) ? ' week-boundary' : ''}${d.weekend ? ' weekend' : ''}${d.date === today ? ' today' : ''}`}
                  >
                    {d.weekend ? null : <span>{d.weekday}</span>}
                    <strong>{d.dayNumber}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="main-grid"
              onMouseDown={handleGridEvent}
              onMouseOver={handleGridEvent}
              onDragStart={handleGridEvent}
              onDragOver={handleGridEvent}
              onDrop={handleGridEvent}
              onDragEnd={() => { dragRef.current = null; }}
              onDoubleClick={handleGridEvent}
              onContextMenu={handleGridEvent}
            >
              {rows.map((row) => (
                <div className="grid-row" key={row.id} style={{ height: ROW_H }}>
                  <div className="team-cell">
                    <input
                      key={`name-${row.id}`}
                      defaultValue={row.nom}
                      aria-label="Nom de la tâche"
                      onBlur={(e) => handleRenameRow(row.id, e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                      style={{ fontSize: 13 }}
                    />
                    <button
                      className="delete-team"
                      onClick={(e) => { e.stopPropagation(); handleDeleteRow(row.id); }}
                    >×</button>
                  </div>
                  <div className="grid-row-body" style={{ '--cell-w': `${CELL_W}px` }}>
                    {visibleDays.map((day, dayIdx) => {
                      const cellItems = itemsParCellule.get(`${row.id}-${dayIdx}`) || [];
                      const baseClassName = `cell${weekBoundarySet.has(day.date) ? ' week-boundary' : ''}${day.weekend ? ' weekend' : ''}${day.date === today ? ' today' : ''}`;
                      const sel = isSelected(row.id, day.date);

                      return (
                        <div
                          key={`${row.id}-${day.date}`}
                          className={baseClassName + (sel ? ' selected' : '')}
                          data-eq={row.id}
                          data-da={day.date}
                        >
                          {cellItems.filter(({ seg }) => dayIdx === seg.start && dayIdx <= seg.end).map(({ item, seg }) => {
                            const segLen = seg.end - seg.start + 1;
                            const width = segLen * CELL_W - 8;
                            return (
                              <div
                                key={item.id}
                                className={`bloc chantier${selectedItem?.type === 'item' && selectedItem.id === item.id ? ' active-item' : ''}`}
                                data-item={item.id}
                                draggable
                                onDragStart={(e) => { e.stopPropagation(); onDragStart(e, item.id); }}
                                style={{
                                  width,
                                  top: 8,
                                  height: 36,
                                  background: item.color,
                                  zIndex: 2,
                                }}
                                title={`${item.nom} (${item.duree}j)`}
                              >
                                <div className="chantier-content">
                                  <div className="chantier-title-row">
                                    <strong>{item.nom}</strong>
                                  </div>
                                  <small>{item.duree} j</small>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="grid-row" style={{ height: 40 }}>
                <div
                  className="team-cell"
                  onClick={handleAddRow}
                  style={{ cursor: 'pointer', fontSize: 13, fontWeight: 500, color: 'var(--green)', width: 260 }}
                >
                  + Ajouter une tâche
                </div>
                <div className="grid-row-body" style={{ '--cell-w': `${CELL_W}px` }} />
              </div>
            </div>
          </div>
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
                const newColor = prompt('Couleur (hex):', contextMenu.item.color);
                if (newColor) {
                  const newItems = items.map((it) => it.id === contextMenu.item.id ? { ...it, color: newColor } : it);
                  setItems(newItems);
                  doSave(rows, newItems);
                }
                setContextMenu(null);
              }}>Couleur</div>
              <div onClick={() => {
                const newDuree = prompt('Durée (jours):', contextMenu.item.duree);
                if (newDuree && !isNaN(Number(newDuree)) && Number(newDuree) > 0) {
                  const newItems = items.map((it) => it.id === contextMenu.item.id ? { ...it, duree: Number(newDuree) } : it);
                  setItems(newItems);
                  doSave(rows, newItems);
                }
                setContextMenu(null);
              }}>Durée</div>
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

      {/* Modal */}
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
    </div>
  );
}
