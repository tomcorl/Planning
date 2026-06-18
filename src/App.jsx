import React, { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import AdminUsersPage from './AdminUsersPage.jsx';

import LoginPage from './LoginPage.jsx';
import PaymentPage from './PaymentPage.jsx';
import { supabase } from './lib/supabase.js';
import * as api from './lib/api.js';

const INITIAL_CELL_WIDTH = 52;
const MIN_CELL_WIDTH = 26;
const MAX_CELL_WIDTH = 78;

const CHANTIER_COLORS = [
  '#b7c6d8',
  '#c7f9c7',
  '#fff68f',
  '#35c759',
  '#f4a261',
  '#ffafcc',
  '#bdb2ff',
  '#fca5a5',
  '#93c5fd',
  '#fde68a',
  '#86efac',
  '#d8b4fe',
];

const CONDUCTEUR_COLORS = [
  '#2563eb',
  '#16a34a',
  '#dc2626',
  '#9333ea',
  '#ea580c',
  '#0891b2',
  '#ca8a04',
  '#be123c',
];

const DEFAULT_TEAMS = Array.from({ length: 16 }, (_, i) => `Équipe ${i + 1}`);

function toDate(value) {
  if (value instanceof Date) return value;
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
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isWeekend(dateStr) {
  const day = toDate(dateStr).getDay();
  return day === 0 || day === 6;
}

function getIsoWeek(dateStr) {
  const date = toDate(dateStr);
  const tmp = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  return Math.ceil(((tmp - yearStart) / 86400000 + 1) / 7);
}

function getFrenchHolidays(year) {
  return [
    { date: `${year}-01-01`, nom: 'Jour de l’an' },
    { date: `${year}-05-01`, nom: 'Fête du Travail' },
    { date: `${year}-05-08`, nom: 'Victoire 1945' },
    { date: `${year}-07-14`, nom: 'Fête nationale' },
    { date: `${year}-08-15`, nom: 'Assomption' },
    { date: `${year}-11-01`, nom: 'Toussaint' },
    { date: `${year}-11-11`, nom: 'Armistice' },
    { date: `${year}-12-25`, nom: 'Noël' },
  ];
}

function generateDays(start, count) {
  return Array.from({ length: count }, (_, i) => {
    const d = addDays(start, i);
    const date = formatDate(d);

    const monthShort = d.toLocaleDateString('fr-FR', { month: 'short' });
    const yearStr = String(d.getFullYear()).slice(-2);
    return {
      date,
      dayNumber: d.getDate(),
      month: monthShort,
      monthLabel: monthShort.charAt(0).toUpperCase() + monthShort.slice(1).replace('.', '') + '-' + yearStr,
      monthKey: `${d.getFullYear()}-${d.getMonth()}`,
      weekday: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
      weekend: isWeekend(date),
      week: getIsoWeek(date),
    };
  });
}

function sameOrAfter(a, b) {
  return toDate(a).getTime() >= toDate(b).getTime();
}

function sameOrBefore(a, b) {
  return toDate(a).getTime() <= toDate(b).getTime();
}

export default function App() {
  const scrollRef = useRef(null);
  const today = formatDate(new Date());
  const [session, setSession] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [authScreen, setAuthScreen] = useState('login');
  const [selectedPlan, setSelectedPlan] = useState('Pro');
  const [activePage, setActivePage] = useState('planning');
  const [users, setUsers] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const isAdmin = session?.role === 'admin';

  const [theme, setTheme] = useState(() => {
    try { return JSON.parse(localStorage.getItem('theme')) || 'light'; } catch { return 'light'; }
  });
  const [cellWidth, setCellWidth] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cellWidth')) || INITIAL_CELL_WIDTH; } catch { return INITIAL_CELL_WIDTH; }
  });
  const [calendarStart, setCalendarStart] = useState(() => addDays(new Date(), -30));
  const [calendarLength, setCalendarLength] = useState(40);
  const [jumpDate, setJumpDate] = useState(today);

  const [teams, setTeams] = useState([]);
  const [conducteurs, setConducteurs] = useState([]);
  const [customFeries, setCustomFeries] = useState([]);
  const [ferieForm, setFerieForm] = useState({ nom: '', date: today });
  const [chantiers, setChantiers] = useState([]);
  const [conges, setConges] = useState([]);

  const [, setHistory] = useState({ past: [], future: [] });
  const [selection, setSelection] = useState(null);
  const [resize, setResize] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dragPreview, setDragPreview] = useState(null);

  const [modal, setModal] = useState({
    open: false,
    mode: 'creation',
    type: 'chantier',
  });
  const [form, setForm] = useState(null);

  const allDays = useMemo(
    () => generateDays(calendarStart, calendarLength),
    [calendarStart, calendarLength]
  );

  const holidays = useMemo(() => {
    const years = new Set(allDays.map((d) => toDate(d.date).getFullYear()));
    const base = Array.from(years).flatMap((year) => getFrenchHolidays(year));
    return [...base, ...customFeries];
  }, [allDays, customFeries]);

  const visibleDays = useMemo(() => {
    return allDays.filter((d) => !d.weekend);
  }, [allDays]);

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
  const [holidayModalOpen, setHolidayModalOpen] = useState(false);
  useEffect(
    () => document.documentElement.setAttribute('data-theme', theme),
    [theme]
  );

  // Restore or jump to today after data loads
  // ── Supabase Auth + Data Loading ──
  const loadedRef = useRef(false);
  const localIdRef = useRef(0);

  function nextLocalId() {
    localIdRef.current -= 1;
    return localIdRef.current;
  }

  // Persist UI preferences to localStorage (client-side only)
  useEffect(() => localStorage.setItem('theme', JSON.stringify(theme)), [theme]);
  useEffect(() => localStorage.setItem('cellWidth', JSON.stringify(cellWidth)), [cellWidth]);

  // Restore scroll position or jump to today after data loads
  useEffect(() => {
    if (!loadedRef.current || dataLoading) return;
    const el = scrollRef.current;
    if (!el) return;
    const saved = (() => { try { return JSON.parse(localStorage.getItem('scrollPos')); } catch { return null; } })();
    if (saved) {
      el.scrollLeft = saved.left || 0;
      el.scrollTop = saved.top || 0;
    } else {
      goToday();
    }
  }, [dataLoading]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = (e) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      setCellWidth((prev) => {
        const delta = e.deltaY > 0 ? -4 : 4;
        return Math.min(MAX_CELL_WIDTH, Math.max(MIN_CELL_WIDTH, prev + delta));
      });
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  // Debounced persistence to Supabase (runs 800ms after data settles)
  useEffect(() => {
    if (!loadedRef.current || !session) return;
    const timer = setTimeout(() => {
      api.upsertChantiers(chantiers).catch(console.error);
      api.upsertConges(conges).catch(console.error);
    }, 800);
    return () => clearTimeout(timer);
  }, [chantiers, conges, session]);

  useEffect(() => {
    if (!loadedRef.current || !session) return;
    const timer = setTimeout(() => {
      api.upsertEquipes(teams).catch(console.error);
      api.upsertConducteurs(conducteurs).catch(console.error);
      api.upsertCustomFeries(customFeries).catch(console.error);
    }, 800);
    return () => clearTimeout(timer);
  }, [teams, conducteurs, customFeries, session]);

  async function loadCompanyData() {
    setDataLoading(true);
    try {
      const data = await api.loadCompanyData();
      setTeams(data.equipes.length > 0 ? data.equipes : DEFAULT_TEAMS);
      if (data.equipes.length === 0) {
        await api.upsertEquipes(DEFAULT_TEAMS);
      }
      setConducteurs(data.conducteurs.length > 0 ? data.conducteurs : []);
      setChantiers(data.chantiers);
      setConges(data.conges);
      setCustomFeries(data.customFeries);
      setHistory({ past: [], future: [] });
      setSelection(null);
      setSelectedItem(null);
    } catch (e) {
      console.error('Failed to load company data:', e);
      throw e;
    } finally {
      setDataLoading(false);
    }
  }

  async function buildSessionMeta(user) {
    let profile = null;
    const r1 = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (!r1.error) profile = r1.data;
    const meta = {
      email: user.email,
      nom: profile?.nom || user.email?.split('@')[0] || '',
      role: profile?.role || 'planning',
    };
    if (profile?.role && profile.role !== user.user_metadata?.role) {
      await supabase.auth.updateUser({ data: { role: profile.role, nom: profile.nom } }).catch(() => {});
    }
    return meta;
  }

  async function loadAllData() {
    setDataLoading(true);
    try {
      const enrichedUsers = await api.fetchUsers();
      setUsers(enrichedUsers);
      await loadCompanyData();
      loadedRef.current = true;
    } catch (e) {
      console.error('Failed to load initial data:', e);
      setUsers([]);
    } finally {
      setDataLoading(false);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      if (s) {
        try {
          const meta = await buildSessionMeta(s.user);
          setSession(meta);
          loadAllData();
        } catch (e) {
          console.error('Session restore failed:', e);
          setDataLoading(false);
        }
      } else {
        setDataLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'SIGNED_IN' && s) {
        buildSessionMeta(s.user).then((meta) => {
          setSession(meta);
          loadAllData();
        }).catch((e) => {
          console.error('Auth state change error:', e);
          setDataLoading(false);
        });
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUsers([]);
        setTeams([]);
        setConducteurs([]);
        setChantiers([]);
        setConges([]);
        setCustomFeries([]);
        setDataLoading(false);
      }
    });

    return () => listener?.subscription?.unsubscribe();
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError('');

    try {
      await api.login(loginForm.email.trim(), loginForm.password);
      setLoginForm((f) => ({ ...f, password: '' }));
      // Auth listener handles the rest (session + data loading)
    } catch {
      setLoginError('Email ou mot de passe incorrect.');
    }
  }

  async function saveUsers(nextUsers) {
    setUsers(nextUsers);
    if (!session) return;
    const currentUser = nextUsers.find((u) => u.email === session.email);
    if (currentUser) {
      try {
        await api.updateUserProfile(currentUser.id, {
          nom: currentUser.nom,
          role: currentUser.role,
        });
        setSession((cur) => ({
          ...cur,
          nom: currentUser.nom,
          role: currentUser.role,
        }));
        await supabase.auth.updateUser({
          data: {
            nom: currentUser.nom,
            role: currentUser.role,
          },
        });
      } catch (err) {
        console.error('Failed to update user:', err);
      }
    }
  }

  async function addUser(email, password, nom, role) {
    try {
      const newUser = await api.createUser(email, password, nom, role);
      setUsers((prev) => [...prev, newUser]);
      return newUser;
    } catch (err) {
      console.error('Failed to create user:', err);
      throw err;
    }
  }

  async function removeUser(userId) {
    try {
      await api.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  }

  async function logout() {
    await api.logout();
    setSession(null);
    setAuthScreen('login');
    setActivePage('planning');
    setLoginForm({ email: '', password: '' });
    setLoginError('');
  }

  function snapshot() {
    return { chantiers, conges, teams, conducteurs, customFeries };
  }

  function restore(s) {
    setChantiers(s.chantiers);
    setConges(s.conges);
    setTeams(s.teams);
    setConducteurs(s.conducteurs);
    setCustomFeries(s.customFeries);
  }

  function commit(action) {
    setHistory((h) => ({
      past: [...h.past.slice(-30), snapshot()],
      future: [],
    }));
    action();
  }

  function undo() {
    setHistory((h) => {
      if (!h.past.length) return h;
      const previous = h.past[h.past.length - 1];
      const current = snapshot();
      restore(previous);
      return { past: h.past.slice(0, -1), future: [current, ...h.future] };
    });
  }

  function redo() {
    setHistory((h) => {
      if (!h.future.length) return h;
      const next = h.future[0];
      const current = snapshot();
      restore(next);
      return { past: [...h.past, current], future: h.future.slice(1) };
    });
  }

  useEffect(() => {
    function onKeyDown(e) {
      const z = e.key.toLowerCase() === 'z';
      const y = e.key.toLowerCase() === 'y';

      if ((e.ctrlKey || e.metaKey) && z && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      if ((e.ctrlKey || e.metaKey) && (y || (z && e.shiftKey))) {
        e.preventDefault();
        redo();
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedItem && !modal.open) {
        e.preventDefault();
        deleteSelectedItem();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  function dayIndex(date) {
    return visibleDays.findIndex((d) => d.date === date);
  }

  function visibleDateByIndex(index) {
    if (!visibleDays.length) return today;
    if (index < 0) return visibleDays[0].date;
    if (index >= visibleDays.length)
      return visibleDays[visibleDays.length - 1].date;
    return visibleDays[index].date;
  }

  function isFerie(date) {
    return holidays.some((h) => h.date === date);
  }

  function addWorkingDays(start, workingDays, equipe, options = {}) {
    let date = start;
    let count = 0;
    let safety = 0;

    while (count < Number(workingDays) && safety < 1200) {
      const blocked = options.countConges
        ? isWeekend(date) || isFerie(date)
        : isBlockedDay(equipe, date);

      if (!blocked) count += 1;
      if (count >= Number(workingDays)) break;

      date = formatDate(addDays(toDate(date), 1));
      safety += 1;
    }

    return date;
  }

  function isCongeForTeam(equipe, date) {
    return conges.some((c) => {
      if (c.equipe !== equipe && !c.allEquipes) return false;

      const realEnd = addWorkingDays(c.start, c.duree, c.equipe || 0, {
        countConges: true,
      });

      return sameOrAfter(date, c.start) && sameOrBefore(date, realEnd);
    });
  }

  function isBlockedDay(equipe, date, options = {}) {
    const blockWeekend = isWeekend(date);
    const blockFerie = isFerie(date);
    const blockConge = options.ignoreConges
      ? false
      : isCongeForTeam(equipe, date);

    return blockWeekend || blockFerie || blockConge;
  }

  function nextWorkingDay(date, equipe) {
    let d = date;
    let safety = 0;

    while (isBlockedDay(equipe, d) && safety < 366) {
      d = formatDate(addDays(toDate(d), 1));
      safety += 1;
    }

    return d;
  }

  function getEndDateForChantier(c) {
    return addWorkingDays(c.start, c.duree, c.equipe);
  }

  function getConducteur(id) {
    return conducteurs.find((c) => c.id === Number(id));
  }

  function splitChantier(chantier) {
    const endDate = getEndDateForChantier(chantier);
    const days = visibleDays
      .map((d, i) => ({ ...d, i }))
      .filter(
        (d) =>
          sameOrAfter(d.date, chantier.start) && sameOrBefore(d.date, endDate)
      );

    if (days.length === 0) return [];

    const segments = [];
    let segStart = null;

    for (const d of days) {
      if (isBlockedDay(chantier.equipe, d.date)) {
        if (segStart !== null) {
          segments.push({ start: segStart, end: d.i - 1 });
          segStart = null;
        }
      } else {
        if (segStart === null) segStart = d.i;
      }
    }

    if (segStart !== null) {
      segments.push({ start: segStart, end: days[days.length - 1].i });
    }

    return segments;
  }

  function getCongeSegment(conge) {
    const start = dayIndex(conge.start);
    if (start === -1) return null;

    const endDate = addWorkingDays(conge.start, conge.duree, conge.equipe || 0, {
      countConges: true,
    });
    const end = dayIndex(endDate);

    return { start, end: Math.max(start, end) };
  }

  function updateTeam(index, value) {
    commit(() => {
      setTeams((prev) => prev.map((t, i) => (i === index ? value : t)));
    });
  }

  function addTeam() {
    commit(() => setTeams((prev) => [...prev, `Équipe ${prev.length + 1}`]));
  }

  function deleteTeam(index) {
    if (
      !window.confirm(
        'Supprimer cette équipe ? Les chantiers et congés de cette ligne seront aussi supprimés.'
      )
    )
      return;

    commit(() => {
      setTeams((prev) => prev.filter((_, i) => i !== index));

      setChantiers((prev) =>
        prev
          .filter((c) => c.equipe !== index)
          .map((c) => (c.equipe > index ? { ...c, equipe: c.equipe - 1 } : c))
      );

      setConges((prev) =>
        prev
          .filter((c) => c.equipe !== index)
          .map((c) => (c.equipe > index ? { ...c, equipe: c.equipe - 1 } : c))
      );
    });
  }

  function startSelection(e, equipe, date) {
    if (e.button !== 0) return;
    if (resize || modal.open) return;

    setSelection({ equipe, startDate: date, endDate: date });
  }

  function updateSelection(equipe, date) {
    if (!selection || selection.equipe !== equipe) return;

    setSelection({ ...selection, endDate: date });
  }

  function endSelection() {
    if (!selection || resize || modal.open) return;

    const startIdx = dayIndex(selection.startDate);
    const endIdx = dayIndex(selection.endDate);

    const a = Math.min(startIdx, endIdx);
    const b = Math.max(startIdx, endIdx);

    if (a === b) {
      setSelection(null);
      return;
    }

    const start = visibleDateByIndex(a);
    const selectedRange = visibleDays.slice(a, b + 1);
    const workingCount =
      selectedRange.filter((d) => !isBlockedDay(selection.equipe, d.date))
        .length || 1;

    setForm({
      id: null,
      equipe: selection.equipe,
      start: nextWorkingDay(start, selection.equipe),
      duree: workingCount,
      nom: '',
      conducteurId: conducteurs[0]?.id || null,
      color: CHANTIER_COLORS[1],
      detail: '',
      note: '',
      termine: false,
      linked: false,
    });

    setModal({ open: true, mode: 'creation', type: 'chantier' });
  }

  function isSelected(equipe, date) {
    if (!selection || selection.equipe !== equipe) return false;

    const current = dayIndex(date);
    const a = dayIndex(selection.startDate);
    const b = dayIndex(selection.endDate);

    return current >= Math.min(a, b) && current <= Math.max(a, b);
  }

  function openEditChantier(chantier) {
    if (!chantier) return;

    setSelectedItem({ type: 'chantier', id: chantier.id });
    setForm({ ...chantier });
    setModal({ open: true, mode: 'modification', type: 'chantier' });
  }

  function openEditConge(conge) {
    if (!conge) return;

    setSelectedItem({ type: 'conge', id: conge.id });
    setForm({ ...conge });
    setModal({ open: true, mode: 'modification', type: 'conge' });
  }

  function closeModal() {
    setModal({ open: false, mode: 'creation', type: 'chantier' });
    setForm(null);
    setSelection(null);
  }

  function saveModal() {
    if (!form?.nom?.trim() && modal.type !== 'conducteur') {
      alert('Il faut donner un nom.');
      return;
    }

    commit(() => {
      if (modal.type === 'chantier') {
        const item = {
          id: form.id || nextLocalId(),
          equipe: Number(form.equipe),
          start: nextWorkingDay(form.start, Number(form.equipe)),
          duree: Number(form.duree),
          nom: form.nom,
          conducteurId: Number(form.conducteurId),
          color: form.color,
          note: form.note || '',
          detail: form.detail || '',
          termine: !!form.termine,
          linked: !!form.linked,
        };

        setChantiers((prev) =>
          modal.mode === 'modification'
            ? prev.map((c) => (c.id === item.id ? item : c))
            : applyInsertion(prev, item, item.equipe, item.start, true)
        );
      }

      if (modal.type === 'conge') {
        const item = {
          id: form.id || nextLocalId(),
          equipe: Number(form.equipe),
          start: form.start,
          duree: Number(form.duree),
          nom: form.nom,
          allEquipes: !!form.allEquipes,
        };

        setConges((prev) =>
          modal.mode === 'modification'
            ? prev.map((c) => (c.id === item.id ? item : c))
            : [...prev, item]
        );
      }
    });

    closeModal();
  }

  function applyInsertion(
    list,
    movedItem,
    targetEquipe,
    targetStart,
    includeSelf = false
  ) {
    let next = includeSelf
      ? list
          .filter((c) => c.id !== movedItem.id)
          .concat({ ...movedItem, equipe: targetEquipe, start: targetStart })
      : list.map((c) =>
          c.id === movedItem.id
            ? { ...c, equipe: targetEquipe, start: targetStart }
            : c
        );

    const moved = next.find((c) => c.id === movedItem.id);
    const movedEnd = getEndDateForChantier(moved);

    let cursor = formatDate(addDays(toDate(movedEnd), 1));
    cursor = nextWorkingDay(cursor, targetEquipe);

    const affected = next
      .filter(
        (c) =>
          c.id !== moved.id &&
          c.equipe === targetEquipe &&
          sameOrAfter(c.start, targetStart)
      )
      .sort((a, b) => toDate(a.start) - toDate(b.start));

    const changed = new Map();

    affected.forEach((c) => {
      const newStart = nextWorkingDay(cursor, targetEquipe);
      changed.set(c.id, { ...c, start: newStart });

      cursor = formatDate(
        addDays(toDate(getEndDateForChantier({ ...c, start: newStart })), 1)
      );
      cursor = nextWorkingDay(cursor, targetEquipe);
    });

    next = next.map((c) => changed.get(c.id) || c);
    return next;
  }

  function onDragStart(e, id) {
    e.dataTransfer.setData('chantierId', String(id));
    e.dataTransfer.effectAllowed = 'move';
  }

  function onDrop(e, equipe, date) {
    e.preventDefault();

    const id = Number(e.dataTransfer.getData('chantierId'));
    const item = chantiers.find((c) => c.id === id);
    if (!item) return;

    const start = nextWorkingDay(date, equipe);

    commit(() => {
      setChantiers((prev) => applyInsertion(prev, item, equipe, start));
    });
  }

  function startResize(e, chantier, side) {
    e.preventDefault();
    e.stopPropagation();

    setResize({
      id: chantier.id,
      side,
      startX: e.clientX,
      originalStart: chantier.start,
      originalDuree: chantier.duree,
      originalEquipe: chantier.equipe,
    });
  }
  function countWorkingDays(start, end, equipe) {
    let count = 0;
    let current = start;
    let safety = 0;

    while (sameOrBefore(current, end) && safety < 1200) {
      if (!isBlockedDay(equipe, current)) {
        count += 1;
      }

      current = formatDate(addDays(toDate(current), 1));
      safety += 1;
    }

    return count;
  }
  useEffect(() => {
    if (!resize) return;

    function onMouseMove(e) {
      const delta = Math.round((e.clientX - resize.startX) / cellWidth);

      setChantiers((prev) => {
        if (resize.side === 'right') {
          const newDuree = Math.max(1, resize.originalDuree + delta);

          let next = prev.map((c) =>
            c.id === resize.id
              ? { ...c, start: resize.originalStart, duree: newDuree }
              : c
          );

          const updated = next.find((c) => c.id === resize.id);
          const updatedEnd = getEndDateForChantier(updated);

          let cursor = formatDate(addDays(toDate(updatedEnd), 1));
          cursor = nextWorkingDay(cursor, resize.originalEquipe);

          const changed = new Map();

          const sorted = next
            .filter(
              (c) =>
                c.id !== resize.id &&
                c.equipe === resize.originalEquipe &&
                toDate(c.start) > toDate(resize.originalStart)
            )
            .sort((a, b) => toDate(a.start) - toDate(b.start));

          for (const c of sorted) {
            if (toDate(c.start) >= toDate(cursor)) break;

            const newStart = nextWorkingDay(cursor, resize.originalEquipe);
            changed.set(c.id, { ...c, start: newStart });
            cursor = formatDate(
              addDays(
                toDate(getEndDateForChantier({ ...c, start: newStart })),
                1
              )
            );
            cursor = nextWorkingDay(cursor, resize.originalEquipe);
          }

          return next.map((c) => changed.get(c.id) || c);
        }

        return prev.map((c) => {
          if (c.id !== resize.id) return c;

          if (resize.side === 'left') {
            const originalEnd = addWorkingDays(
              resize.originalStart,
              resize.originalDuree,
              resize.originalEquipe
            );

            const rawNewStart = formatDate(
              addDays(toDate(resize.originalStart), delta)
            );

            const newStart = nextWorkingDay(rawNewStart, resize.originalEquipe);

            const newDuree = countWorkingDays(
              newStart,
              originalEnd,
              resize.originalEquipe
            );

            if (newDuree < 1) return c;

            return {
              ...c,
              start: newStart,
              duree: newDuree,
            };
          }

          return c;
        })
      });
    }

    function onMouseUp() {
      commit(() => {});
      setResize(null);
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [resize, cellWidth]);

  function handleScroll(e) {
    const el = e.currentTarget;

    try {
      localStorage.setItem('scrollPos', JSON.stringify({ left: el.scrollLeft, top: el.scrollTop }));
    } catch { }

    if (el.scrollLeft + el.clientWidth > el.scrollWidth - 900) {
      setCalendarLength((prev) => prev + 15);
    }

    if (el.scrollLeft < 200) {
      setCalendarStart((prev) => addDays(prev, -30));
      setCalendarLength((prev) => prev + 15);

      setTimeout(() => {
        el.scrollLeft += 30 * cellWidth;
      }, 0);
    }
  }

  function goToday() {
    const idx = dayIndex(today);
    const el = scrollRef.current;
    if (el && idx >= 0) {
      el.scrollLeft = Math.max(0, idx * cellWidth - 500);
    }
    setJumpDate(today);
  }

  function jumpToDate(date) {
    const idx = dayIndex(date);
    const el = scrollRef.current;
    if (idx < 0) {
      setCalendarStart(addDays(toDate(date), -30));
      setCalendarLength(120);
      setTimeout(() => {
        const el2 = scrollRef.current;
        if (el2) el2.scrollLeft = 30 * cellWidth;
      }, 0);
    } else if (el) {
      el.scrollLeft = Math.max(0, idx * cellWidth - 500);
    }
    setJumpDate(date);
  }

  function quickAdd() {
    setForm({
      id: null,
      equipe: 0,
      start: nextWorkingDay(today, 0),
      duree: 3,
      nom: '',
      conducteurId: conducteurs[0]?.id || null,
      color: CHANTIER_COLORS[1],
      detail: '',
      note: '',
      termine: false,
      linked: false,
    });

    setModal({ open: true, mode: 'creation', type: 'chantier' });

  }

  function addCustomFerie() {
    if (!ferieForm.nom.trim() || !ferieForm.date) return;

    commit(() => {
      setCustomFeries((prev) => [
        ...prev,
        { id: nextLocalId(), nom: ferieForm.nom, date: ferieForm.date },
      ]);
    });

    setFerieForm({ nom: '', date: today });
  }

  function deleteSelectedItem() {
    if (!selectedItem) return;
    commit(() => {
      if (selectedItem.type === 'chantier') {
        setChantiers((prev) => prev.filter((c) => c.id !== selectedItem.id));
      }
      if (selectedItem.type === 'conge') {
        setConges((prev) => prev.filter((c) => c.id !== selectedItem.id));
      }
    });
    if (modal.open) closeModal();
    setSelectedItem(null);
  }

  const chantiersParCellule = useMemo(() => {
    const map = new Map();
    const byEquipe = {};

    chantiers.forEach((chantier) => {
      const segments = splitChantier(chantier);
      segments.forEach((seg) => {
        if (!seg) return;
        if (!byEquipe[chantier.equipe]) byEquipe[chantier.equipe] = [];
        byEquipe[chantier.equipe].push({ chantier, seg });
      });
    });

    Object.values(byEquipe).forEach((items) => {
      items.sort((a, b) => a.seg.start - b.seg.start);
      const rows = [];
      items.forEach(({ chantier, seg }) => {
        let placed = false;
        for (let r = 0; r < rows.length; r++) {
          const lastInRow = rows[r][rows[r].length - 1];
          if (seg.start > lastInRow.seg.end) {
            rows[r].push({ chantier, seg, stack: r });
            placed = true;
            break;
          }
        }
        if (!placed) {
          rows.push([{ chantier, seg, stack: rows.length }]);
        }
      });
      rows.forEach((row) => {
        row.forEach(({ chantier, seg, stack }) => {
          const key = `${chantier.equipe}-${seg.start}`;
          if (!map.has(key)) map.set(key, []);
          map.get(key).push({ chantier, seg, i: 0, stack });
        });
      });
    });

    return map;
  }, [chantiers, conges, holidays, visibleDays]);

  const gridTemplateColumns = `260px repeat(${visibleDays.length}, ${cellWidth}px)`;

  function handleSelectPlan(planName) {
    setSelectedPlan(planName);
    setAuthScreen('payment');
  }

  function handlePaymentComplete() {
    setAuthScreen('login');
  }

  if (dataLoading && session) {
    return <div className="loading-screen"><div className="loading-spinner"/><p>Chargement...</p></div>;
  }

  if (!session) {
    if (authScreen === 'payment') {
      return (
        <PaymentPage
          planName={selectedPlan}
          onBack={() => setAuthScreen('login')}
          onComplete={handlePaymentComplete}
        />
      );
    }

    return (
      <LoginPage
        loginError={loginError}
        loginForm={loginForm}
        onBack={() => setAuthScreen('login')}
        onChange={setLoginForm}
        onSubmit={handleLogin}
      />
    );
  }

  return (
    <div
      className="app"
      onMouseUp={endSelection}
    >
      <div className="topbar">
          <div className="title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          Planning
          <span>Noree Construction</span>
        </div>

        {activePage === 'planning' && (
          <div className="date-nav">
            <input type="date" value={jumpDate} onChange={(e) => jumpToDate(e.target.value)} />
            <button className="today-btn" onClick={goToday}>Aujourd'hui</button>
          </div>
        )}

        <div className="top-actions">
          <div className="workspace-nav">
            <button
              className={activePage === 'planning' ? 'active-nav' : ''}
              onClick={() => setActivePage('planning')}
            >
              Planning
            </button>
            {isAdmin && (
              <button
                className={activePage === 'users' ? 'active-nav' : ''}
                onClick={() => setActivePage('users')}
              >
                Utilisateurs
              </button>
            )}
          </div>

          {activePage === 'planning' && (
            <button className="primary-action" onClick={quickAdd}>
              + Chantier
            </button>
          )}

          {activePage === 'planning' && (
            <button onClick={() => setHolidayModalOpen(true)}>
              Jours fériés
            </button>
          )}

          <button
            className="theme-toggle"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <button onClick={() => { if (window.confirm('Se déconnecter ?')) logout(); }}>Déconnexion</button>
        </div>
      </div>

      {activePage === 'users' && isAdmin && (
        <AdminUsersPage
          onSaveUsers={saveUsers}
          onAddUser={addUser}
          onRemoveUser={removeUser}
          users={users}
        />
      )}

      {activePage === 'planning' && (
        <>
      <div className="planning-container">
      <div className="planning-scroll" ref={scrollRef} onScroll={handleScroll}>
        <div className="planning-header">
        <div className="grid month-grid" style={{ gridTemplateColumns }}>
          <div className="corner month-corner"></div>
          {monthGroups.map((g, i) => (
            <div
              className={`month-cell ${i % 2 === 0 ? 'month-even' : 'month-odd'}`}
              key={g.monthKey}
              style={{ gridColumn: `span ${g.count}` }}
            >
              {g.monthLabel}
            </div>
          ))}
        </div>

        <div className="grid week-grid" style={{ gridTemplateColumns }}>
            <div className="corner week-corner">
            <strong>Équipes</strong>
            <button onClick={addTeam}>+ Ajouter</button>
          </div>

          {weekGroups.map((g, i) => (
            <div
              className="week-cell"
              key={`${g.week}-${i}`}
              style={{ gridColumn: `span ${g.count}` }}
            >
              S{g.week}
            </div>
          ))}
        </div>

        <div className="grid date-grid" style={{ gridTemplateColumns, gridAutoRows: Math.round(28 + (cellWidth - 26) * (44 - 28) / 26) }}>
          <div className="corner date-corner"></div>
          {visibleDays.map((d) => (
            <div
              key={d.date}
              className={`date-cell ${d.weekend ? 'weekend' : ''} ${
                isFerie(d.date) ? 'ferie' : ''
              } ${d.date === today ? 'today' : ''}`}
              title={d.date}
            >
              {cellWidth >= 36 && <span>{d.weekday}</span>}
              <strong style={{ fontSize: Math.max(8, Math.min(12, 8 + (cellWidth - 26) * 4 / 26)) }}>{d.dayNumber}</strong>
            </div>
          ))}
        </div>
        </div>

        <div className="grid main-grid" style={{ gridTemplateColumns, gridAutoRows: Math.round(56 + (cellWidth - 26) * (78 - 56) / 26) }}>

          {teams.map((team, equipeIndex) => {
            return (
              <React.Fragment key={equipeIndex}>
                <div className={`team-cell ${equipeIndex % 2 ? 'odd' : ''}`}>
                  <div className="avatar" style={{ fontSize: Math.round(10 + (cellWidth - 26) * 4 / 26) }}>{equipeIndex + 1}</div>

                  <input
                    value={team}
                    onChange={(e) => updateTeam(equipeIndex, e.target.value)}
                    style={{ fontSize: Math.round(11 + (cellWidth - 26) * 3 / 26) }}
                  />

                  <button
                    className="delete-team"
                    onClick={() => deleteTeam(equipeIndex)}
                  >
                    ×
                  </button>
                </div>

                {visibleDays.map((day) => {
                  const segments =
                    chantiersParCellule.get(
                      `${equipeIndex}-${dayIndex(day.date)}`
                    ) || [];

                  const congeItems = conges
                    .filter((c) => c.equipe === equipeIndex || c.allEquipes)
                    .map((c) => ({ conge: c, seg: getCongeSegment(c) }))
                    .filter((x) => x.seg && x.seg.start === dayIndex(day.date));

                  return (
                    <div
                      key={`${equipeIndex}-${day.date}`}
                      className={`cell ${equipeIndex % 2 ? 'odd' : ''} ${
                        day.weekend ? 'weekend' : ''
                      } ${isFerie(day.date) ? 'ferie' : ''} ${
                        day.date === today ? 'today' : ''
                      } ${
                        isSelected(equipeIndex, day.date) ? 'selected' : ''
                      } ${
                        dragPreview?.equipe === equipeIndex &&
                        dragPreview?.date === day.date
                          ? 'drag-preview'
                          : ''
                      }`}
                      onMouseDown={(e) =>
                        startSelection(e, equipeIndex, day.date)
                      }
                      onMouseEnter={() =>
                        updateSelection(equipeIndex, day.date)
                      }
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragPreview({ equipe: equipeIndex, date: day.date });
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragPreview(null);
                        onDrop(e, equipeIndex, day.date);
                      }}
                    >
                      {segments.map(({ chantier, seg, i, stack }) => {
                        const conducteur = getConducteur(chantier.conducteurId);
                        const width = (seg.end - seg.start + 1) * cellWidth - 8;
                        const compact = segments.length > 1;
                        const blocH = Math.round(36 + (cellWidth - 26) * (54 - 36) / 26);
                        const blocT = Math.round(8 + (cellWidth - 26) * (11 - 8) / 26);
                        const height = compact
                          ? Math.max(15, Math.min(Math.round(20 + (cellWidth - 26) * (26 - 20) / 26), blocH / segments.length))
                          : blocH;
                        const top = compact ? Math.round(5 + (cellWidth - 26) * (7 - 5) / 26) + stack * (height + 2) : blocT;

                        return (
                          <div
                            key={`${chantier.id}-${i}`}
                            className={`bloc chantier ${
                              compact ? 'compact-bloc' : ''
                            } ${
                              chantier.termine ? 'termine' : ''
                            } ${
                              selectedItem?.type === 'chantier' &&
                              selectedItem.id === chantier.id
                                ? 'active-item'
                                : ''
                            }`}
                            draggable={!resize}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={() =>
                              setSelectedItem({
                                type: 'chantier',
                                id: chantier.id,
                              })
                            }
                            onDoubleClick={() => openEditChantier(chantier)}
                            onDragStart={(e) => onDragStart(e, chantier.id)}
                            style={{
                              width,
                              top,
                              height,
                              background: chantier.color,
                            }}
                            title={`${chantier.nom}${chantier.detail ? ` — ${chantier.detail}` : ''} (${chantier.duree}j)`}
                          >
                            <div
                              className="resize-handle left"
                              onMouseDown={(e) =>
                                startResize(e, chantier, 'left')
                              }
                            />

                            {chantier.note && cellWidth >= 34 && (
                              <div className="note-icon" onMouseEnter={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const tip = e.currentTarget.querySelector('.tooltip');
                                tip.style.top = (rect.top - 10) + 'px';
                                tip.style.left = (rect.right + 8) + 'px';
                                tip.style.display = 'block';
                              }} onMouseLeave={(e) => {
                                const tip = e.currentTarget.querySelector('.tooltip');
                                tip.style.display = 'none';
                              }}>
                                💬
                                <div className="tooltip">{chantier.note}</div>
                              </div>
                            )}

                            {chantier.linked && cellWidth >= 34 && (
                              <div className="link-icon">🔗</div>
                            )}

                            <div className="chantier-content">
                              <strong>{chantier.nom}</strong>
                              {chantier.detail && <em>{chantier.detail}</em>}
                              <small>{chantier.duree} j</small>
                            </div>

                            <div
                              className="conducteur-bar"
                              style={{
                                background: conducteur?.color || '#64748b',
                              }}
                            />

                            <div
                              className="resize-handle right"
                              onMouseDown={(e) =>
                                startResize(e, chantier, 'right')
                              }
                            />
                          </div>
                        );
                      })}

                      {congeItems.map(({ conge, seg }) => {
                        const cH = Math.round(36 + (cellWidth - 26) * (54 - 36) / 26);
                        const cT = Math.round(8 + (cellWidth - 26) * (11 - 8) / 26);
                        return (
                        <div
                          key={conge.id}
                          className={`bloc conge ${
                            conge.allEquipes ? 'conge-entreprise' : ''
                          } ${
                            selectedItem?.type === 'conge' &&
                            selectedItem.id === conge.id
                              ? 'active-item'
                              : ''
                          }`}
                          style={{
                            width: (seg.end - seg.start + 1) * cellWidth - 8,
                            height: cH,
                            top: cT,
                            fontSize: Math.max(9, Math.min(11, 9 + (cellWidth - 26) * 2 / 26)),
                            padding: `${Math.max(4, Math.round(6 + (cellWidth - 26) * 2 / 26))}px ${Math.max(4, Math.round(8 + (cellWidth - 26) * 2 / 26))}px`,
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={() =>
                            setSelectedItem({ type: 'conge', id: conge.id })
                          }
                          onDoubleClick={() => openEditConge(conge)}
                        >
                          {conge.nom}
                        </div>
                        );
                      })}
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>
      <div className="zoom-bar">
        <span className="zoom-label">{Math.round(cellWidth / 52 * 100)}%</span>
        <button className="zoom-btn" onClick={() => setCellWidth(prev => Math.max(MIN_CELL_WIDTH, prev - 4))}>−</button>
        <input type="range" className="zoom-slider" min={MIN_CELL_WIDTH} max={MAX_CELL_WIDTH} value={cellWidth} onChange={(e) => setCellWidth(Number(e.target.value))} />
        <button className="zoom-btn" onClick={() => setCellWidth(prev => Math.min(MAX_CELL_WIDTH, prev + 4))}>+</button>
      </div>
      </div>

      {holidayModalOpen && (
        <div
          className="modal-bg"
          onMouseDown={() => setHolidayModalOpen(false)}
        >
          <div
            className="modal holiday-modal"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Jours fériés</h2>
              <button className="modal-header-close" onClick={() => setHolidayModalOpen(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="holiday-add-row">
                <input
                  value={ferieForm.date}
                  type="date"
                  onChange={(e) =>
                    setFerieForm({ ...ferieForm, date: e.target.value })
                  }
                />
                <input
                  value={ferieForm.nom}
                  placeholder="Nom du jour férié"
                  onChange={(e) =>
                    setFerieForm({ ...ferieForm, nom: e.target.value })
                  }
                />
                <button className="modal-btn-primary" onClick={addCustomFerie}>Ajouter</button>
              </div>

              <h3>Jours personnalisés</h3>

              {customFeries.length === 0 ? (
                <div className="holiday-empty">
                  <span className="holiday-empty-icon">📅</span>
                  <span>Aucun jour férié personnalisé</span>
                </div>
              ) : (
                <div className="holiday-list">
                  {customFeries.map((f) => (
                    <div key={f.id} className="holiday-item">
                      <div className="holiday-item-info">
                        <strong>{f.nom}</strong>
                        <span>{new Date(f.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                      <button className="modal-btn-danger" onClick={() => commit(() => setCustomFeries((prev) => prev.filter((x) => x.id !== f.id)))}>Supprimer</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="modal-btn-cancel" onClick={() => setHolidayModalOpen(false)}>Fermer</button>
            </div>
          </div>
        </div>
      )}
      {modal.open && form && (
        <div className="modal-bg" onMouseDown={(e) => e.stopPropagation()}>
          <div className="modal">
            <div className="modal-header">
              <h2>
                {modal.mode === 'modification' ? 'Modifier' : 'Nouvel élément'}
              </h2>
              <div className="modal-tabs">
                <button
                  className={modal.type === 'chantier' ? 'active' : ''}
                  onClick={() => setModal({ ...modal, type: 'chantier' })}
                >
                  Chantier
                </button>
                <button
                  className={modal.type === 'conge' ? 'active' : ''}
                  onClick={() => setModal({ ...modal, type: 'conge' })}
                >
                  Congé
                </button>
                <button
                  className={modal.type === 'conducteur' ? 'active' : ''}
                  onClick={() => setModal({ ...modal, type: 'conducteur' })}
                >
                  Conducteur
                </button>
              </div>
            </div>

            <div className="modal-body">
              {modal.type !== 'conducteur' && (
                <>
                  <div className="modal-date-group">
                    <div className="modal-field">
                      <label>Durée</label>
                      <input
                        type="number"
                        min="1"
                        value={form.duree}
                        onChange={(e) =>
                          setForm({ ...form, duree: e.target.value })
                        }
                      />
                      <small>jours travaillés</small>
                    </div>
                    <div className="modal-field">
                      <label>Date de début</label>
                      <input
                        type="date"
                        value={form.start}
                        onChange={(e) =>
                          setForm({ ...form, start: e.target.value })
                        }
                      />
                    </div>
                    <div className="modal-field">
                      <label>Date de fin</label>
                      <input
                        type="date"
                        value={
                          modal.type === 'chantier'
                            ? addWorkingDays(
                                form.start,
                                Number(form.duree || 1),
                                Number(form.equipe || 0)
                              )
                            : addWorkingDays(
                                form.start,
                                Number(form.duree || 1),
                                Number(form.equipe || 0),
                                { countConges: true }
                              )
                        }
                        readOnly
                      />
                      <small>calculée</small>
                    </div>
                  </div>

                  <div className="modal-field">
                    <label>
                      {modal.type === 'chantier'
                        ? 'Nom du chantier'
                        : 'Nom du congé'}
                    </label>
                    <input
                      value={form.nom}
                      onChange={(e) => setForm({ ...form, nom: e.target.value })}
                      placeholder={
                        modal.type === 'chantier'
                          ? 'Ex : Kervouch'
                          : 'Ex : Congé d\'été'
                      }
                    />
                  </div>

                  <div className="modal-field">
                    <label>Équipe</label>
                    <select
                      value={form.equipe}
                      onChange={(e) => setForm({ ...form, equipe: e.target.value })}
                      disabled={form.allEquipes}
                    >
                      {teams.map((team, i) => (
                        <option key={i} value={i}>
                          {team}
                        </option>
                      ))}
                    </select>
                    {modal.type === 'conge' && (
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={form.allEquipes || false}
                          onChange={(e) => setForm({ ...form, allEquipes: e.target.checked })}
                        />
                        <span className="toggle-track" />
                        <span className="toggle-label">Toutes les équipes (congé simultané)</span>
                      </label>
                    )}
                  </div>
                </>
              )}

              {modal.type === 'chantier' && (
                <>
                  <div className="modal-field">
                    <label>Couleur du chantier</label>
                    <div className="color-grid">
                      {CHANTIER_COLORS.map((c) => (
                        <button
                          key={c}
                          className={`color-dot ${
                            form.color === c ? 'selected-color' : ''
                          }`}
                          style={{ background: c }}
                          onClick={() => setForm({ ...form, color: c })}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="modal-field">
                    <label>Conducteur</label>
                    <div className="conducteur-list">
                      {conducteurs.map((c) => (
                        <button
                          key={c.id}
                          className={`conducteur-choice ${
                            Number(form.conducteurId) === c.id
                              ? 'active-conducteur'
                              : ''
                          }`}
                          onClick={() => setForm({ ...form, conducteurId: c.id })}
                        >
                          <span style={{ background: c.color }} /> {c.nom}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="modal-field">
                    <label>Détail chantier</label>
                    <input
                      value={form.detail || ''}
                      onChange={(e) => setForm({ ...form, detail: e.target.value })}
                      placeholder="Ex : Ø25 HT6, stabulation, radier chauffant..."
                    />
                  </div>

                  <div className="modal-field">
                    <label>Notes</label>
                    <textarea
                      value={form.note}
                      onChange={(e) => setForm({ ...form, note: e.target.value })}
                      placeholder="Notes chantier..."
                    />
                  </div>
                </>
              )}

              {modal.type === 'conducteur' && (
                <div className="conducteurs-editor">
                  {conducteurs.map((c, i) => (
                    <div className="conducteur-edit-row" key={c.id}>
                      <input
                        value={c.nom}
                        onChange={(e) =>
                          setConducteurs((prev) =>
                            prev.map((x, idx) =>
                              idx === i ? { ...x, nom: e.target.value } : x
                            )
                          )
                        }
                      />
                      <div className="mini-color-grid">
                        {CONDUCTEUR_COLORS.map((color) => (
                          <button
                            key={color}
                            style={{ background: color }}
                            className={c.color === color ? 'selected-color' : ''}
                            onClick={() =>
                              setConducteurs((prev) =>
                                prev.map((x, idx) =>
                                  idx === i ? { ...x, color } : x
                                )
                              )
                            }
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                  <button className="add-conducteur-btn" onClick={() =>
                    setConducteurs((prev) => [
                      ...prev,
                      {
                        id: nextLocalId(),
                        nom: `Conducteur ${prev.length + 1}`,
                        color: CONDUCTEUR_COLORS[prev.length % CONDUCTEUR_COLORS.length],
                      },
                    ])
                  }>
                    + Ajouter un conducteur
                  </button>
                </div>
              )}
            </div>

            <div className="modal-footer">
              {modal.mode === 'modification' && modal.type !== 'conducteur' && (
                <button className="modal-btn-danger" onClick={deleteSelectedItem}>
                  Supprimer
                </button>
              )}
              {modal.type !== 'conducteur' && (
                <button className="modal-btn-primary" onClick={saveModal}>
                  {modal.mode === 'modification' ? 'Modifier' : 'Créer'}
                </button>
              )}
              <button className="modal-btn-cancel" onClick={closeModal}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
