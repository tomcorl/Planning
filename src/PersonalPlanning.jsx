import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { supabase } from './lib/supabase.js';
import {
  loadPersonalPlans,
  createPersonalPlan,
  deletePersonalPlan,
  renamePersonalPlan,
  savePersonalPlan,
} from './lib/api.js';

const CELL_W = 26;
const ROW_LABEL_W = 160;
const TODAY = new Date().toISOString().split('T')[0];

function dayKey(d) {
  return d;
}
function sameDay(a, b) {
  return a === b;
}
function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}
function diffDays(a, b) {
  const da = new Date(a + 'T00:00:00');
  const db = new Date(b + 'T00:00:00');
  return Math.round((da - db) / 86400000);
}
function formatDate(d) {
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
}
function weekNumber(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}

const PERSONAL_COLORS = [
  '#b7c6d8', '#c7f9c7', '#f9f9c7', '#f9c7c7', '#c7e6f9',
  '#e6c7f9', '#f9e6c7', '#c7f9f9', '#d8c7f9', '#f9c7e6',
];

let nextTempId = -1;

export default function PersonalPlanning({ user }) {
  const [plans, setPlans] = useState([]);
  const [activePlanId, setActivePlanId] = useState(null);
  const [rows, setRows] = useState([]);
  const [items, setItems] = useState([]);
  const [planName, setPlanName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [contextMenu, setContextMenu] = useState(null);
  const [renameInput, setRenameInput] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const scrollRef = useRef(null);
  const saveTimerRef = useRef(null);
  const dragRef = useRef(null);
  const initialScrolled = useRef(false);

  const activePlan = plans.find((p) => p.id === activePlanId);

  const today = useMemo(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }, []);

  const visibleDays = useMemo(() => {
    if (!startDate) return [];
    const days = [];
    const start = addDays(startDate, -14);
    for (let i = 0; i < 120; i++) {
      const date = addDays(start, i);
      const dt = new Date(date + 'T00:00:00');
      const dow = dt.getDay();
      days.push({
        date,
        weekday: dt.toLocaleDateString('fr-FR', { weekday: 'short' }),
        dayNumber: dt.getDate(),
        month: dt.getMonth(),
        weekend: dow === 0 || dow === 6,
        week: weekNumber(date),
      });
    }
    return days;
  }, [startDate]);

  const weekGroups = useMemo(() => {
    const groups = [];
    let current = null;
    for (const d of visibleDays) {
      if (!current || current.week !== d.week) {
        current = { week: d.week, count: 1 };
        groups.push(current);
      } else {
        current.count++;
      }
    }
    return groups;
  }, [visibleDays]);

  const monthGroups = useMemo(() => {
    const groups = [];
    let current = null;
    for (const d of visibleDays) {
      const key = `${d.date.slice(0, 7)}`;
      if (!current || current.key !== key) {
        current = { key, label: new Date(d.date + 'T00:00:00').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }), count: 1 };
        groups.push(current);
      } else {
        current.count++;
      }
    }
    return groups;
  }, [visibleDays]);

  const dayIdxMap = useMemo(() => {
    const m = new Map();
    visibleDays.forEach((d, i) => m.set(d.date, i));
    return m;
  }, [visibleDays]);

  const gridTemplateColumns = `${ROW_LABEL_W}px repeat(${visibleDays.length}, ${CELL_W}px)`;

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

  const loadPlans = useCallback(async () => {
    if (!user?.id) return;
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
        selectPlan(data[0]);
      }
      setLoading(false);
    })();
  }, [user?.id]);

  useEffect(() => {
    if (!activePlan) return;
    setRows(activePlan.rows || []);
    setItems(activePlan.items || []);
    setPlanName(activePlan.nom || '');
    setStartDate(activePlan.start_date || today);
  }, [activePlan]);

  useEffect(() => {
    if (!startDate || !scrollRef.current || initialScrolled.current) return;
    initialScrolled.current = true;
    const idx = dayIdxMap.get(today);
    if (idx != null) {
      scrollRef.current.scrollLeft = Math.max(0, idx * CELL_W - 400);
    }
  }, [startDate, today, dayIdxMap]);

  function selectPlan(plan) {
    setActivePlanId(plan.id);
    setDropdownOpen(false);
    initialScrolled.current = false;
  }

  async function handleCreatePlan() {
    const name = prompt('Nom du planning :', 'Nouveau planning');
    if (!name) return;
    const start = prompt('Date de début (AAAA-MM-JJ) :', today);
    if (!start) return;
    try {
      const plan = await createPersonalPlan(user.id, name, start);
      const data = await loadPlans();
      setPlans(data);
      selectPlan(data.find((p) => p.id === plan.id) || data[0]);
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
        if (data.length > 0) selectPlan(data[0]);
        else {
          setActivePlanId(null);
          setRows([]);
          setItems([]);
        }
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

  function handleAddRow() {
    const newRows = [...rows, { id: nextTempId--, nom: 'Nouvelle tâche', ordre: rows.length }];
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

  function handleAddItem(rowId, date) {
    const newItem = {
      id: nextTempId--,
      rowId,
      start: date,
      duree: 5,
      nom: '',
      color: PERSONAL_COLORS[Math.floor(Math.random() * PERSONAL_COLORS.length)],
    };
    const newItems = [...items, newItem];
    setItems(newItems);
    doSave(rows, newItems);
  }

  function handleDeleteItem(itemId) {
    const newItems = items.filter((it) => it.id !== itemId);
    setItems(newItems);
    doSave(rows, newItems);
  }

  function handleDragStart(e, itemId) {
    const item = items.find((it) => it.id === itemId);
    if (!item) return;
    dragRef.current = {
      id: itemId,
      origRowId: item.rowId,
      origStart: item.start,
      origDuree: item.duree,
    };
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(itemId));
  }

  function handleDrop(e, rowId, date) {
    e.preventDefault();
    e.stopPropagation();
    const drag = dragRef.current;
    if (!drag) return;
    const dayOffset = diffDays(date, drag.origStart);
    const newItems = items.map((it) => {
      if (it.id !== drag.id) return it;
      return {
        ...it,
        rowId: rowId,
        start: addDays(it.start, dayOffset),
      };
    });
    setItems(newItems);
    doSave(rows, newItems);
    dragRef.current = null;
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleItemContextMenu(e, item) {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      type: 'item',
      item,
    });
  }

  function handleRowContextMenu(e, row) {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      type: 'row',
      row,
    });
  }

  useEffect(() => {
    if (!contextMenu) return;
    function close() { setContextMenu(null); }
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [contextMenu]);

  function handleScrollToStart() {
    if (!scrollRef.current || visibleDays.length === 0) return;
    scrollRef.current.scrollLeft = 0;
  }

  if (loading) {
    return <div className="personal-loading">Chargement...</div>;
  }

  return (
    <div className="personal-planning">
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
                  onClick={() => selectPlan(p)}
                >
                  <span className="personal-dropdown-name">{p.nom}</span>
                  <button
                    className="personal-dropdown-delete"
                    onClick={(e) => { e.stopPropagation(); handleDeletePlan(p.id); }}
                  >
                    ×
                  </button>
                </div>
              ))}
              {plans.length === 0 && <div className="personal-dropdown-empty">Aucun planning</div>}
            </div>
          )}
        </div>

        <button className="personal-add-btn" onClick={handleCreatePlan}>+ Nouveau</button>

        {activePlan && (
          <>
            <button className="today-btn" onClick={handleScrollToStart}>Début</button>
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
              ) : (
                planName
              )}
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
        <div className="personal-scroll" ref={scrollRef}>
          {/* Month header */}
          <div className="personal-grid" style={{ gridTemplateColumns }}>
            <div className="personal-corner">
              <strong>Tâches</strong>
            </div>
            {monthGroups.map((g, i) => (
              <div key={i} className="personal-month-cell" style={{ gridColumn: `span ${g.count}` }}>
                {g.label}
              </div>
            ))}
          </div>

          {/* Week header */}
          <div className="personal-grid" style={{ gridTemplateColumns }}>
            <div className="personal-corner personal-week-corner" />
            {weekGroups.map((g, i) => (
              <div key={i} className="personal-week-cell" style={{ gridColumn: `span ${g.count}` }}>
                S{g.week}
              </div>
            ))}
          </div>

          {/* Date header */}
          <div className="personal-grid personal-date-grid" style={{ gridTemplateColumns }}>
            <div className="personal-corner" />
            {visibleDays.map((d) => (
              <div
                key={d.date}
                className={`personal-date-cell${weekBoundarySet.has(d.date) ? ' week-boundary' : ''}${d.weekend ? ' weekend' : ''}${d.date === today ? ' today' : ''}`}
              >
                <span className="personal-date-weekday">{d.weekday}</span>
                <strong>{d.dayNumber}</strong>
              </div>
            ))}
          </div>

          {/* Rows */}
          {rows.map((row) => (
            <div className="personal-row" key={row.id}>
              <div
                className="personal-row-label"
                onContextMenu={(e) => handleRowContextMenu(e, row)}
              >
                <span className="personal-row-name">{row.nom}</span>
              </div>
              <div
                className="personal-row-body"
                style={{ '--cell-w': `${CELL_W}px` }}
                onDragOver={handleDragOver}
                onDrop={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left + scrollRef.current.scrollLeft - ROW_LABEL_W;
                  const dayIdx = Math.floor(x / CELL_W);
                  const date = visibleDays[Math.max(0, Math.min(dayIdx, visibleDays.length - 1))]?.date;
                  if (date) handleDrop(e, row.id, date);
                }}
              >
                {visibleDays.map((d) => {
                  const cellItems = items.filter((it) => it.rowId === row.id && sameDay(it.start, d.date));
                  return (
                    <div
                      key={d.date}
                      className={`personal-cell${weekBoundarySet.has(d.date) ? ' week-boundary' : ''}${d.weekend ? ' weekend' : ''}${d.date === today ? ' today' : ''}`}
                      onDoubleClick={() => handleAddItem(row.id, d.date)}
                    >
                      {cellItems.map((item) => {
                        const segLen = item.duree;
                        const width = segLen * CELL_W - 4;
                        return (
                          <div
                            key={item.id}
                            className="personal-bloc"
                            draggable
                            onDragStart={(e) => handleDragStart(e, item.id)}
                            onContextMenu={(e) => handleItemContextMenu(e, item)}
                            style={{
                              width,
                              background: item.color,
                            }}
                            title={`${item.nom || 'Bloc'} (${item.duree}j)`}
                          >
                            <span className="personal-bloc-label">{item.nom || `${item.duree}j`}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Add row button */}
          <div className="personal-row">
            <div className="personal-row-label personal-add-row" onClick={handleAddRow}>
              + Ajouter une tâche
            </div>
            <div className="personal-row-body" style={{ '--cell-w': `${CELL_W}px` }} />
          </div>
        </div>
      )}

      {/* Context menu */}
      {contextMenu && (
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
                if (newDuree && !isNaN(Number(newDuree))) {
                  const newItems = items.map((it) => it.id === contextMenu.item.id ? { ...it, duree: Number(newDuree) } : it);
                  setItems(newItems);
                  doSave(rows, newItems);
                }
                setContextMenu(null);
              }}>Durée</div>
              <div className="danger" onClick={() => { handleDeleteItem(contextMenu.item.id); setContextMenu(null); }}>Supprimer</div>
            </>
          )}
          {contextMenu.type === 'row' && (
            <>
              <div onClick={() => {
                const newNom = prompt('Nom de la tâche:', contextMenu.row.nom);
                if (newNom) { handleRenameRow(contextMenu.row.id, newNom); }
                setContextMenu(null);
              }}>Renommer</div>
              <div className="danger" onClick={() => { handleDeleteRow(contextMenu.row.id); setContextMenu(null); }}>Supprimer la tâche</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
