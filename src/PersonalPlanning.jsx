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

function generateDays(startStr, count) {
  const result = [];
  for (let i = 0; i < count; i++) {
    const date = addDays(startStr, i);
    const dt = new Date(date + 'T00:00:00');
    const dow = dt.getDay();
    result.push({
      date,
      dayNumber: dt.getDate(),
      weekday: dt.toLocaleDateString('fr-FR', { weekday: 'short' }),
      monthShort: dt.toLocaleDateString('fr-FR', { month: 'short' }),
      monthKey: `${dt.getFullYear()}-${dt.getMonth()}`,
      monthLabel: dt.toLocaleDateString('fr-FR', { month: 'short' }) + ' ' + String(dt.getFullYear()).slice(-2),
      weekend: dow === 0 || dow === 6,
      week: weekNumber(date),
    });
  }
  return result;
}

export default function PersonalPlanning({ user }) {
  const scrollRef = useRef(null);
  const today = useMemo(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }, []);

  const [plans, setPlans] = useState([]);
  const [activePlanId, setActivePlanId] = useState(null);
  const [rows, setRows] = useState([]);
  const [items, setItems] = useState([]);
  const [planName, setPlanName] = useState('');
  const [loading, setLoading] = useState(true);
  const [contextMenu, setContextMenu] = useState(null);
  const [renameInput, setRenameInput] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const saveTimerRef = useRef(null);
  const dragRef = useRef(null);
  const initialScrolled = useRef(false);

  const activePlan = plans.find((p) => p.id === activePlanId);

  const calendarStart = useMemo(() => addDays(today, -140), [today]);
  const [calendarLength, setCalendarLength] = useState(400);

  const allDays = useMemo(
    () => generateDays(calendarStart, calendarLength),
    [calendarStart, calendarLength]
  );

  const visibleDays = useMemo(() => {
    if (!activePlan) return [];
    return allDays;
  }, [allDays, activePlan]);

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
    () => `${ROW_LABEL_W}px repeat(${visibleDays.length}, ${CELL_W}px)`,
    [visibleDays.length]
  );

  const itemsByRowAndDate = useMemo(() => {
    const m = new Map();
    for (const it of items) {
      const key = `${it.rowId}-${it.start}`;
      if (!m.has(key)) m.set(key, []);
      m.get(key).push(it);
    }
    return m;
  }, [items]);

  const headerHeight = 28 + 30 + 38;

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
      scrollRef.current.scrollLeft = Math.max(0, idx * CELL_W - 400);
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

  function handleDrop(e, targetRowId, targetDate) {
    e.preventDefault();
    e.stopPropagation();
    const drag = dragRef.current;
    if (!drag) return;
    const dayOffset = diffDays(targetDate, drag.origStart);
    const newItems = items.map((it) => {
      if (it.id !== drag.id) return it;
      return {
        ...it,
        rowId: targetRowId,
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
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, type: 'item', item });
  }

  function handleRowContextMenu(e, row) {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, type: 'row', row });
  }

  useEffect(() => {
    if (!contextMenu) return;
    function close() { setContextMenu(null); }
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [contextMenu]);

  if (loading) {
    return <div className="loading-screen"><div className="loading-spinner" /><p>Chargement...</p></div>;
  }

  return (
    <div className="planning-container">
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
                  <button
                    className="personal-dropdown-delete"
                    onClick={(e) => { e.stopPropagation(); handleDeletePlan(p.id); }}
                  >×</button>
                </div>
              ))}
              {plans.length === 0 && <div className="personal-dropdown-empty">Aucun planning</div>}
            </div>
          )}
        </div>

        <button className="personal-add-btn" onClick={handleCreatePlan}>+ Nouveau</button>

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
          </>
        )}
      </div>

      {!activePlan ? (
        <div className="personal-empty">
          <p>Aucun planning sélectionné.</p>
          <button className="personal-add-btn" onClick={handleCreatePlan}>Créer un planning</button>
        </div>
      ) : (
        <div className="planning-scroll" ref={scrollRef}>
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

            <div className="grid date-grid" style={{ gridTemplateColumns }}>
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

          <div className="main-grid">
            {rows.map((row) => (
              <div className="grid-row" key={row.id} style={{ height: 52 }}>
                <div
                  className="team-cell"
                  onContextMenu={(e) => handleRowContextMenu(e, row)}
                  style={{ cursor: 'context-menu' }}
                >
                  <input
                    key={`name-${row.id}`}
                    defaultValue={row.nom}
                    aria-label="Nom de la tâche"
                    onBlur={(e) => handleRenameRow(row.id, e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                  />
                </div>
                <div
                  className="grid-row-body"
                  style={{ '--cell-w': `${CELL_W}px` }}
                  onDragOver={handleDragOver}
                  onDrop={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left + scrollRef.current.scrollLeft - ROW_LABEL_W;
                    const dayIdx = Math.floor(x / CELL_W);
                    const date = visibleDays[Math.max(0, Math.min(dayIdx, visibleDays.length - 1))]?.date;
                    if (date) handleDrop(e, row.id, date);
                  }}
                  onDoubleClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left + scrollRef.current.scrollLeft - ROW_LABEL_W;
                    const dayIdx = Math.floor(x / CELL_W);
                    const date = visibleDays[Math.max(0, Math.min(dayIdx, visibleDays.length - 1))]?.date;
                    if (date) handleAddItem(row.id, date);
                  }}
                >
                  {visibleDays.map((day) => {
                    const isStart = items.some((it) => it.rowId === row.id && it.start === day.date);
                    return (
                      <div
                        key={day.date}
                        className={`cell${weekBoundarySet.has(day.date) ? ' week-boundary' : ''}${day.weekend ? ' weekend' : ''}${day.date === today ? ' today' : ''}`}
                        data-eq={row.id}
                        data-da={day.date}
                      >
                        {isStart && items.filter((it) => it.rowId === row.id && it.start === day.date).map((item) => {
                          const width = item.duree * CELL_W - 8;
                          return (
                            <div
                              key={item.id}
                              className="bloc chantier"
                              draggable
                              onDragStart={(e) => handleDragStart(e, item.id)}
                              onContextMenu={(e) => handleItemContextMenu(e, item)}
                              style={{
                                width,
                                top: 8,
                                height: 36,
                                background: item.color,
                              }}
                              title={`${item.nom || 'Bloc'} (${item.duree}j)`}
                            >
                              <div className="chantier-content">
                                <div className="chantier-title-row">
                                  <strong>{item.nom || `${item.duree}j`}</strong>
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
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500, color: 'var(--green)' }}
              >
                + Ajouter une tâche
              </div>
              <div className="grid-row-body" style={{ '--cell-w': `${CELL_W}px` }} />
            </div>
          </div>
        </div>
      )}

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
                if (newDuree && !isNaN(Number(newDuree)) && Number(newDuree) > 0) {
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
                if (newNom) handleRenameRow(contextMenu.row.id, newNom);
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
