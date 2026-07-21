import { useEffect, useMemo, useRef, useState, useDeferredValue, lazy, Suspense } from 'react';
import './App.css';

const AdminUsersPage = lazy(() => import('./AdminUsersPage.jsx'));
const Modals = lazy(() => import('./Modals.jsx'));
const LoginPage = lazy(() => import('./LoginPage.jsx'));
const PasswordChangePage = lazy(() => import('./PasswordChangePage.jsx'));
import PlanningGrid from './PlanningGrid.jsx';
import { supabase } from './lib/supabase.js';
import * as api from './lib/api.js';

const CELL_WIDTH = 26;
const MIN_VISIBLE_DAYS = 65;

const CHANTIER_COLORS = [
  '#2563eb', // bleu foncé
  '#93c5fd', // bleu clair
  '#eab308', // jaune
  '#15803d', // vert foncé
  '#6b7280', // gris
  '#f97316', // orange
  '#7dd3fc', // bleu très clair
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

const DEFAULT_TEAMS_COUNT = 12;

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
  const [loggingIn, setLoggingIn] = useState(false);
  const [activePage, setActivePage] = useState('planning');
  const [users, setUsers] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const isAdmin = session?.role === 'admin';
  const canEdit = session?.role !== 'lecture';

  const [theme, setTheme] = useState(() => {
    try { return JSON.parse(localStorage.getItem('theme')) || 'light'; } catch { return 'light'; }
  });
  const cellWidth = CELL_WIDTH;
  const [calendarStart, setCalendarStart] = useState(() => addDays(new Date(), -60));
  const [calendarLength, setCalendarLength] = useState(200);
  const [jumpDate, setJumpDate] = useState(today);

  const [companies, setCompanies] = useState([]);
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
  const dragThrottle = useRef(null);
  const selectionThrottle = useRef(null);
  const scrollThrottleRef = useRef(null);
  const expandRightRef = useRef(null);
  const expandLeftRef = useRef(null);
  const localStorageThrottleRef = useRef(null);
  const gridCallbacksRef = useRef({});
  const resizeRef = useRef(null);
  const lastXRef = useRef(0);
  const [clipboard, setClipboard] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const lastCellRef = useRef(null);

  const [modal, setModal] = useState({
    open: false,
    mode: 'creation',
    type: 'chantier',
  });
  const [form, setForm] = useState(null);

  const [chantierColors, setChantierColors] = useState([...CHANTIER_COLORS]);
  const [conducteurColors, setConducteurColors] = useState([...CONDUCTEUR_COLORS]);
  const [colorManager, setColorManager] = useState(null);

  const allDays = useMemo(
    () => generateDays(calendarStart, calendarLength),
    [calendarStart, calendarLength]
  );

  const holidays = useMemo(() => {
    const years = new Set(allDays.map((d) => toDate(d.date).getFullYear()));
    const base = Array.from(years).flatMap((year) => getFrenchHolidays(year));
    return [...base, ...customFeries];
  }, [allDays, customFeries]);

  const ferieSetCacheRef = useRef(null);
  const ferieSet = useMemo(() => {
    const key = holidays.map(h => h.date).sort().join('|');
    if (ferieSetCacheRef.current?.key === key) return ferieSetCacheRef.current.set;
    const set = new Set(holidays.map(h => h.date));
    ferieSetCacheRef.current = { key, set };
    return set;
  }, [holidays]);

  const congeBlockedSet = useMemo(() => {
    const set = new Set();
    for (const c of conges) {
      const end = addWorkingDays(c.start, c.duree, c.equipe || 0, { countConges: true });
      let cur = c.start;
      let safety = 0;
      while (sameOrBefore(cur, end) && safety < 1200) {
        if (c.allEquipes) {
          const compId = c.companyId || teams[c.equipe]?.companyId;
          for (let t = 0; t < teams.length; t++) {
            if (teams[t].companyId === compId) {
              set.add(`${t}-${cur}`);
            }
          }
        } else {
          set.add(`${c.equipe}-${cur}`);
        }
        cur = formatDate(addDays(toDate(cur), 1));
        safety++;
      }
    }
    return set;
  }, [conges, teams, ferieSet]);

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

  const gridRows = useMemo(() => {
    const rows = [];
    for (let c = 0; c < companies.length; c++) {
      const comp = companies[c];
      rows.push({ type: 'company-header', name: comp.nom, id: `ch-${comp.id}` });
      const companyTeams = teams
        .map((t, i) => ({ ...t, index: i }))
        .filter((t) => t.companyId === comp.id);
      companyTeams.forEach((t, idx) => {
        rows.push({ type: 'team', teamIndex: t.index, name: t.nom, numInCompany: idx + 1 });
      });
      const baseOffset = teams.length + c * 3;
      rows.push({ type: 'pending', id: `p-${c}-0`, equipeIndex: baseOffset });
      rows.push({ type: 'pending', id: `p-${c}-1`, equipeIndex: baseOffset + 1 });
      rows.push({ type: 'pending', id: `p-${c}-2`, equipeIndex: baseOffset + 2 });
      rows.push({ type: 'separator', id: `s-${c}` });
    }
    return rows;
  }, [teams, companies]);
  useEffect(
    () => document.documentElement.setAttribute('data-theme', theme),
    [theme]
  );

  // ── Supabase Auth + Data Loading ──
  const loadedRef = useRef(false);
  const localIdRef = useRef(0);

  function nextLocalId() {
    localIdRef.current -= 1;
    return localIdRef.current;
  }

  // Persist UI preferences to localStorage (client-side only)
  useEffect(() => localStorage.setItem('theme', JSON.stringify(theme)), [theme]);

  // Restore scroll position or jump to today after data loads
  useEffect(() => {
    if (!loadedRef.current || dataLoading) return;
    const el = scrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      const saved = (() => { try { return JSON.parse(localStorage.getItem('scrollPos')); } catch { return null; } })();
      if (saved) {
        const max = Math.max(0, el.scrollWidth - el.clientWidth);
        el.scrollLeft = Math.min(max, saved.left || 0);
        el.scrollTop = Math.min(Math.max(0, saved.top || 0), el.scrollHeight - el.clientHeight);
      } else {
        goToday();
      }
    });
  }, [dataLoading]);

  // Debounced persistence to Supabase (runs 800ms after data settles)
  useEffect(() => {
    if (!loadedRef.current || !session || !companies.length) return;
    const timer = setTimeout(async () => {
      try {
        const result = await api.saveAllPlanningData({
          chantiers,
          conges: conges.map(c => ({ ...c, company_id: c.companyId || (teams[c.equipe]?.companyId) })),
          equipes: teams,
          conducteurs,
          customFeries,
          chantierColors,
          conducteurColors,
        });
        // Update conducteur IDs from DB response (new rows get real IDs)
        if (result?.conducteurs) {
          const nomToId = new Map(result.conducteurs.map(r => [r.nom, r.id]));
          setConducteurs(prev => {
            let changed = false;
            const updated = prev.map(c => {
              const dbId = nomToId.get(c.nom);
              if (dbId && c.id !== dbId) {
                changed = true;
                return { ...c, id: dbId };
              }
              return c;
            });
            return changed ? updated : prev;
          });
        }
      } catch (e) {
        console.error('saveAllPlanningData failed', e);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [chantiers, conges, teams, conducteurs, customFeries, chantierColors, conducteurColors, session, companies]);

  async function loadAllCompanyData() {
    setDataLoading(true);
    try {
      const allData = await api.loadPlanningData();
      setCompanies(allData.companies);

      if (allData.equipes.length > 0) {
        setTeams(allData.equipes);
      } else {
        const defaultTeams = [];
        for (const comp of allData.companies) {
          for (let i = 0; i < DEFAULT_TEAMS_COUNT; i++) {
            defaultTeams.push({ nom: `Équipe ${i + 1}`, companyId: comp.id });
          }
        }
        setTeams(defaultTeams);
        for (const comp of allData.companies) {
          const names = defaultTeams.filter((t) => t.companyId === comp.id).map((t) => t.nom);
          await api.upsertEquipes(names, comp.id);
        }
      }

      setConducteurs(allData.conducteurs);
      setChantiers(allData.chantiers);
      setConges(allData.conges);
      setCustomFeries(allData.customFeries);

      if (allData.companies.length > 0) {
        const first = allData.companies[0];
        if (first.chantier_colors?.length) setChantierColors(first.chantier_colors);
        if (first.conducteur_colors?.length) setConducteurColors(first.conducteur_colors);
      }

      setHistory({ past: [], future: [] });
      setSelection(null);
      setSelectedItem(null);
      setTimeout(reflowTeams, 0);
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
      id: user.id,
      email: user.email,
      nom: profile?.nom || user.email?.split('@')[0] || '',
      role: profile?.role || 'planning',
      mustChangePassword: !!profile?.must_change_password,
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
      await loadAllCompanyData();
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
    setLoggingIn(true);

    try {
      await api.login(loginForm.email.trim(), loginForm.password);
      setLoginForm((f) => ({ ...f, password: '' }));
      // Auth listener handles the rest (session + data loading)
    } catch {
      setLoginError('Email ou mot de passe incorrect.');
    } finally {
      setLoggingIn(false);
    }
  }

  async function saveUsers(nextUsers) {
    const prevUsers = users;
    setUsers(nextUsers);
    if (!session) return;
    for (const updated of nextUsers) {
      const prev = prevUsers.find((u) => u.id === updated.id);
      if (prev && (prev.nom !== updated.nom || prev.role !== updated.role)) {
        try {
          await api.updateUserProfile(updated.id, { nom: updated.nom, role: updated.role });
          if (updated.id === session.id) {
            setSession((cur) => ({ ...cur, nom: updated.nom, role: updated.role }));
            await supabase.auth.updateUser({ data: { nom: updated.nom, role: updated.role } }).catch(() => {});
          }
        } catch (err) {
          console.error('Failed to update user:', err);
        }
      }
    }
  }

  async function addUser(email, password, nom, role) {
    try {
      const newUser = await api.createUser(email, password, nom, role, companies.map(c => c.id));
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

  async function handlePasswordChange(newPassword) {
    await api.updatePassword(newPassword);
    setSession((cur) => ({ ...cur, mustChangePassword: false }));
  }

  async function logout() {
    await api.logout();
    setSession(null);
    setActivePage('planning');
    setLoginForm({ email: '', password: '' });
    setLoginError('');
  }

  const chantiersRef = useRef(chantiers);
  const congesRef = useRef(conges);
  const teamsRef = useRef(teams);
  const conducteursRef = useRef(conducteurs);
  const customFeriesRef = useRef(customFeries);

  useEffect(() => {
    chantiersRef.current = chantiers;
    congesRef.current = conges;
    teamsRef.current = teams;
    conducteursRef.current = conducteurs;
    customFeriesRef.current = customFeries;
    keyRef.current = { selectedItem, modalOpen: modal.open, clipboard, canEdit };
  });

  function snapshot() {
    return { chantiers: chantiersRef.current, conges: congesRef.current, teams: teamsRef.current, conducteurs: conducteursRef.current, customFeries: customFeriesRef.current };
  }

  function restore(s) {
    const current = snapshot();
    if (current.chantiers !== s.chantiers) setChantiers(s.chantiers);
    if (current.conges !== s.conges) setConges(s.conges);
    if (current.teams !== s.teams) setTeams(s.teams);
    if (current.conducteurs !== s.conducteurs) setConducteurs(s.conducteurs);
    if (current.customFeries !== s.customFeries) setCustomFeries(s.customFeries);
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

  const keyRef = useRef({ selectedItem: null, modalOpen: false, clipboard: null, canEdit: false });

  useEffect(() => {
    function onKeyDown(e) {
      const key = e.key || '';
      const z = key.toLowerCase() === 'z';
      const y = key.toLowerCase() === 'y';

      if ((e.ctrlKey || e.metaKey) && z && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      if ((e.ctrlKey || e.metaKey) && (y || (z && e.shiftKey))) {
        e.preventDefault();
        redo();
      }

      const { selectedItem: sel, modalOpen, clipboard: clip, canEdit: ce } = keyRef.current;

      if ((key === 'Delete' || key === 'Backspace') && sel && !modalOpen && ce) {
        e.preventDefault();
        deleteSelectedItem();
      }

      if ((e.ctrlKey || e.metaKey) && key.toLowerCase() === 'c' && sel && !modalOpen) {
        e.preventDefault();
        const item = sel.type === 'chantier'
          ? chantiers.find((c) => c.id === sel.id)
          : conges.find((c) => c.id === sel.id);
        if (item) setClipboard({ ...item, sourceType: sel.type });
      }

      if ((e.ctrlKey || e.metaKey) && key.toLowerCase() === 'v' && clip && !modalOpen && ce) {
        e.preventDefault();
        pasteClipboard();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

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
    return ferieSet.has(date);
  }

  function isAugustClosure(dateStr) {
    const d = toDate(dateStr);
    if (d.getMonth() !== 7) return false; // August = month 7 (0-indexed)
    return d.getDate() <= 21;
  }

  function addWorkingDays(start, workingDays, equipe, options = {}) {
    const { force_aout = false, countConges = false } = options;
    let date = start;
    let count = 0;
    let safety = 0;

    while (count < Number(workingDays) && safety < 1200) {
      const blocked = countConges
        ? isWeekend(date) || isFerie(date)
        : isBlockedDay(equipe, date, { force_aout });

      if (!blocked) count += 1;
      if (count >= Number(workingDays)) break;

      date = formatDate(addDays(toDate(date), 1));
      safety += 1;
    }

    return date;
  }

  function isCongeForTeam(equipe, date) {
    return congeBlockedSet.has(`${equipe}-${date}`);
  }

  function isBlockedDay(equipe, date, options = {}) {
    const { force_aout = false, ignoreConges = false } = options;
    const blockWeekend = isWeekend(date);
    const blockFerie = isFerie(date);
    const blockConge = ignoreConges ? false : isCongeForTeam(equipe, date);
    const blockAout = !force_aout && isAugustClosure(date);

    return blockWeekend || blockFerie || blockConge || blockAout;
  }

  function nextWorkingDay(date, equipe, force_aout = false) {
    let d = date;
    let safety = 0;

    while (isBlockedDay(equipe, d, { force_aout }) && safety < 366) {
      d = formatDate(addDays(toDate(d), 1));
      safety += 1;
    }

    return d;
  }

  function getEndDateForChantier(c) {
    return addWorkingDays(c.start, c.duree, c.equipe, { force_aout: c.force_aout });
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
      const blockedFerie = isFerie(d.date);
      const blockedAout = !chantier.force_aout && isAugustClosure(d.date);
      const blockedConge = isCongeForTeam(chantier.equipe, d.date);

      if (blockedFerie || blockedAout || blockedConge) {
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

  function updateTeam(index, value) {
    commit(() => {
      setTeams((prev) => prev.map((t, i) => (i === index ? { ...t, nom: value } : t)));
    });
  }

  function addTeamToCompany(companyId) {
    const numInCompany = teams.filter((t) => t.companyId === companyId).length + 1;
    const name = `Équipe ${numInCompany}`;
    commit(() => {
      setTeams((prev) => [...prev, { nom: name, companyId }]);
    });
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
    lastCellRef.current = { equipe, date };
    setSelection({ equipe, startDate: date, endDate: date });
  }

  function updateSelection(equipe, date) {
    if (selectionThrottle.current) return;
    selectionThrottle.current = requestAnimationFrame(() => {
      setSelection((prev) => {
        if (!prev || prev.equipe !== equipe) return prev;
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
      company_id: teams[selection.equipe]?.companyId || companies[0]?.id,
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
      force_aout: false,
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
    const full = chantiers.find((c) => c.id === chantier.id) || chantier;
    setSelectedItem({ type: 'chantier', id: full.id });
    setForm({ ...full });
    setModal({ open: true, mode: 'modification', type: 'chantier' });
  }

  function openEditConge(conge) {
    if (!conge) return;
    const full = conges.find((c) => c.id === conge.id) || conge;
    setSelectedItem({ type: 'conge', id: full.id });
    setForm({ ...full });
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
          company_id: form.company_id || teams[Number(form.equipe)]?.companyId || companies[0]?.id,
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
          force_aout: !!form.force_aout,
        };

        setChantiers((prev) =>
          applyInsertion(prev, item, item.equipe, item.start, true)
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
          companyId: form.allEquipes ? form.companyId : undefined,
        };

        setConges((prev) =>
          modal.mode === 'modification'
            ? prev.map((c) => (c.id === item.id ? item : c))
            : [...prev, item]
        );
      }
    });

    closeModal();
    setTimeout(reflowTeams, 0);
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

    // include items that overlap with the moved item (end on or after targetStart)
    const affected = next
      .filter(
        (c) =>
          c.id !== moved.id &&
          c.equipe === targetEquipe &&
          sameOrAfter(getEndDateForChantier(c), targetStart)
      )
      .sort((a, b) => toDate(a.start) - toDate(b.start));

    const movedEarlier = toDate(targetStart) < toDate(movedItem.start);
    const changed = new Map();

    affected.forEach((c) => {
      if (!movedEarlier && toDate(c.start) >= toDate(cursor)) return;
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

  function reflowTeams() {
    setChantiers((prev) => {
      const teamsSet = [...new Set(prev.map((c) => c.equipe))];
      let changed = false;
      const result = [...prev];

      // Reverse pass FIRST (right-to-left): push items left when overlapping next
      // Handles left-extensions & cascading left pushes
      let stable = false;
      while (!stable) {
        stable = true;
        for (const equipe of teamsSet) {
          const teamIds = result
            .filter((c) => c.equipe === equipe)
            .sort((a, b) => toDate(a.start) - toDate(b.start) || (a.id || 0) - (b.id || 0))
            .map((c) => c.id);
          for (let i = teamIds.length - 1; i > 0; i--) {
            const prev = result.find((c) => c.id === teamIds[i - 1]);
            const next = result.find((c) => c.id === teamIds[i]);
            if (!prev || !next) continue;
            if (toDate(getEndDateForChantier(prev)) >= toDate(next.start)) {
              const newPrevEnd = formatDate(addDays(toDate(next.start), -1));
              const newPrevDuree = countWorkingDays(prev.start, newPrevEnd, equipe, prev.force_aout);
              if (newPrevDuree >= 1) {
                const idx = result.findIndex((c) => c.id === prev.id);
                if (idx >= 0) {
                  result[idx] = { ...prev, duree: newPrevDuree };
                  changed = true;
                  stable = false;
                }
              }
            }
          }
        }
      }

      // Forward pass (left-to-right): make items contiguous (fill gaps + fix overlaps)
      for (const equipe of teamsSet) {
        const teamItems = result
          .filter((c) => c.equipe === equipe)
          .sort((a, b) => toDate(a.start) - toDate(b.start) || (a.id || 0) - (b.id || 0));
        let cursor = null;
        for (const item of teamItems) {
          if (cursor) {
            const nextAvailable = nextWorkingDay(
              formatDate(addDays(toDate(cursor), 1)),
              equipe,
              item.force_aout
            );
            if (toDate(nextAvailable) !== toDate(item.start)) {
              const idx = result.findIndex((c) => c.id === item.id);
              if (idx >= 0) {
                result[idx] = { ...item, start: nextAvailable };
                changed = true;
              }
              cursor = getEndDateForChantier({ ...item, start: nextAvailable });
            } else {
              cursor = getEndDateForChantier(item);
            }
          } else {
            cursor = getEndDateForChantier(item);
          }
        }
      }

      return changed ? result : prev;
    });
  }

  useEffect(() => {
    if (!loadedRef.current || !session) return;
    const timer = setTimeout(reflowTeams, 200);
    return () => clearTimeout(timer);
  }, [customFeries, conges, session]);

  function onDragStart(e, id, type) {
    e.dataTransfer.setData('itemId', String(id));
    e.dataTransfer.setData('itemType', type || 'chantier');
    e.dataTransfer.effectAllowed = 'move';
  }

  function onDrop(e, equipe, date) {
    e.preventDefault();
    e.stopPropagation();
    setDragPreview(null);
    const id = Number(e.dataTransfer.getData('itemId'));
    const type = e.dataTransfer.getData('itemType') || 'chantier';
    if (type === 'conge') {
      const item = conges.find((c) => c.id === id);
      if (!item) return;
      commit(() => {
        setConges((prev) =>
          prev.map((c) => c.id === id ? { ...c, equipe, start: date } : c)
        );
      });
      return;
    }
    const item = chantiers.find((c) => c.id === id);
    if (!item) return;
    const start = nextWorkingDay(date, equipe, item.force_aout);
    commit(() => {
      setChantiers((prev) => applyInsertion(prev, item, equipe, start));
    });
    setTimeout(reflowTeams, 0);
  }

  function startResize(e, chantier, side) {
    e.preventDefault();
    e.stopPropagation();

    const ch = chantier.start !== undefined ? chantier : chantiers.find(c => c.id === chantier.id);
    if (!ch) return;

    resizeRef.current = {
      id: ch.id,
      side,
      startX: e.clientX,
      delta: 0,
      originalStart: ch.start,
      originalDuree: ch.duree,
      originalEquipe: ch.equipe,
      originalForceAout: ch.force_aout,
    };

    setResize({
      id: ch.id,
      side,
      delta: 0,
    });
  }
  function countWorkingDays(start, end, equipe, force_aout = false) {
    let count = 0;
    let current = start;
    let safety = 0;

    while (sameOrBefore(current, end) && safety < 1200) {
      if (!isBlockedDay(equipe, current, { force_aout })) {
        count += 1;
      }

      current = formatDate(addDays(toDate(current), 1));
      safety += 1;
    }

    return count;
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
        const delta = Math.round((lastXRef.current - r.startX) / cellWidth);

        let previewStart, previewEnd;
        if (delta !== 0) {
          if (r.side === 'right') {
            const oldEnd = getEndDateForChantier({ start: r.originalStart, duree: r.originalDuree, equipe: r.originalEquipe, force_aout: r.originalForceAout });
            const newEndCal = formatDate(addDays(toDate(oldEnd), delta));
            const newDuree = Math.max(1, countWorkingDays(r.originalStart, newEndCal, r.originalEquipe, r.originalForceAout));
            previewStart = r.originalStart;
            previewEnd = getEndDateForChantier({ start: r.originalStart, duree: newDuree, equipe: r.originalEquipe, force_aout: r.originalForceAout });
          } else {
            const originalEnd = addWorkingDays(r.originalStart, r.originalDuree, r.originalEquipe, { force_aout: r.originalForceAout });
            const rawNewStart = formatDate(addDays(toDate(r.originalStart), delta));
            previewStart = nextWorkingDay(rawNewStart, r.originalEquipe, r.originalForceAout);
            previewEnd = originalEnd;
          }
        }
        setResize((prev) => prev ? { ...prev, delta, previewStart, previewEnd, previewEquipe: r.originalEquipe } : prev);
      });
    }

    function onMouseUp(e) {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      const r2 = resizeRef.current;
      if (!r2) { setResize(null); resizeRef.current = null; return; }
      const delta = Math.round((e.clientX - r2.startX) / cellWidth);
      const { id, side, originalStart, originalDuree, originalEquipe, originalForceAout } = r2;
      if (delta !== 0) {
        setChantiers((prev) => {
          if (side === 'right') {
            const baseInfo = { equipe: originalEquipe, force_aout: originalForceAout };
            const oldEnd = getEndDateForChantier({ start: originalStart, duree: originalDuree, ...baseInfo });
            const newEndCal = formatDate(addDays(toDate(oldEnd), delta));
            const newDuree = Math.max(1, countWorkingDays(originalStart, newEndCal, originalEquipe, originalForceAout));
            let next = prev.map((c) =>
              c.id === id
                ? { ...c, start: originalStart, duree: newDuree }
                : c
            );
            const updatedEnd = getEndDateForChantier({ start: originalStart, duree: newDuree, ...baseInfo });
            let cursor = formatDate(addDays(toDate(updatedEnd), 1));
            cursor = nextWorkingDay(cursor, originalEquipe, originalForceAout);
            const changed = new Map();
            const sorted = next
              .filter((c) => c.id !== id && c.equipe === originalEquipe && toDate(c.start) > toDate(originalStart))
              .sort((a, b) => toDate(a.start) - toDate(b.start));
            for (const c of sorted) {
              if (toDate(c.start) >= toDate(cursor)) break;
              const newStart = nextWorkingDay(cursor, originalEquipe, originalForceAout);
              changed.set(c.id, { ...c, start: newStart });
              cursor = formatDate(addDays(toDate(getEndDateForChantier({ ...c, start: newStart })), 1));
              cursor = nextWorkingDay(cursor, originalEquipe, originalForceAout);
            }
            return next.map((c) => changed.get(c.id) || c);
          }
          return (() => {
            let next = prev.map((c) => {
              if (c.id !== id) return c;
              const originalEnd = addWorkingDays(originalStart, originalDuree, originalEquipe, { force_aout: originalForceAout });
              const rawNewStart = formatDate(addDays(toDate(originalStart), delta));
              const newStart = nextWorkingDay(rawNewStart, originalEquipe, originalForceAout);
              const newDuree = countWorkingDays(newStart, originalEnd, originalEquipe, originalForceAout);
              if (newDuree < 1 || (newStart === originalStart && newDuree === originalDuree)) return c;
              return { ...c, start: newStart, duree: newDuree };
            });

            const resized = next.find(c => c.id === id);
            if (resized && toDate(resized.start) < toDate(originalStart)) {
              const prevItems = next
                .filter(c => c.id !== id && c.equipe === originalEquipe && toDate(c.start) < toDate(originalStart))
                .sort((a, b) => toDate(b.start) - toDate(a.start));
              if (prevItems.length > 0) {
                const prev = prevItems[0];
                if (toDate(getEndDateForChantier(prev)) >= toDate(resized.start)) {
                  const newPrevEnd = formatDate(addDays(toDate(resized.start), -1));
                  const newPrevDuree = countWorkingDays(prev.start, newPrevEnd, originalEquipe, prev.force_aout);
                  if (newPrevDuree >= 1) {
                    next = next.map(c => c.id === prev.id ? { ...prev, duree: newPrevDuree } : c);
                  }
                }
              }
            }

            return next;
          })();
        });
      }
      commit(() => {});
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
  }, [resize, cellWidth]);

  function handleScroll(e) {
    const el = e.currentTarget;
    const raf = scrollThrottleRef.current;
    if (raf) cancelAnimationFrame(raf);
    scrollThrottleRef.current = requestAnimationFrame(() => {
      scrollThrottleRef.current = null;

      // Throttle localStorage writes to max 1/s (synchronous IO is slow)
      if (!localStorageThrottleRef.current) {
        localStorageThrottleRef.current = setTimeout(() => {
          localStorageThrottleRef.current = null;
          try {
            localStorage.setItem('scrollPos', JSON.stringify({ left: el.scrollLeft, top: el.scrollTop }));
          } catch { }
        }, 1000);
      }

      // Right-edge expansion: debounced, only fires 250ms after scroll settles
      if (el.scrollLeft + el.clientWidth > el.scrollWidth - 900) {
        if (!expandRightRef.current) {
          expandRightRef.current = setTimeout(() => {
            expandRightRef.current = null;
            setCalendarLength((prev) => prev + 30);
          }, 250);
        }
      } else if (expandRightRef.current) {
        clearTimeout(expandRightRef.current);
        expandRightRef.current = null;
      }

      // Left-edge expansion: debounced, only fires 250ms after scroll settles
      if (el.scrollLeft < 200) {
        if (!expandLeftRef.current) {
          expandLeftRef.current = setTimeout(() => {
            expandLeftRef.current = null;
            setCalendarStart((prev) => addDays(prev, -30));
            setCalendarLength((prev) => prev + 30);
            setTimeout(() => {
              if (scrollRef.current) scrollRef.current.scrollLeft += 30 * CELL_WIDTH;
            }, 0);
          }, 250);
        }
      } else if (expandLeftRef.current) {
        clearTimeout(expandLeftRef.current);
        expandLeftRef.current = null;
      }
    });
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
        { id: nextLocalId(), nom: ferieForm.nom, date: ferieForm.date, companyId: companies[0]?.id },
      ]);
    });

    setFerieForm({ nom: '', date: today });
  }

  function deleteSelectedItem() {
    const ref = keyRef.current;
    if (!ref.selectedItem || !ref.canEdit) return;
    const wasChantier = ref.selectedItem.type === 'chantier';
    commit(() => {
      if (wasChantier) {
        setChantiers((prev) => prev.filter((c) => c.id !== ref.selectedItem.id));
      }
      if (ref.selectedItem.type === 'conge') {
        setConges((prev) => prev.filter((c) => c.id !== ref.selectedItem.id));
      }
    });
    if (ref.modalOpen) closeModal();
    setSelectedItem(null);
    if (wasChantier) setTimeout(reflowTeams, 0);
  }

  function pasteClipboard(targetEquipe, targetDate) {
    const clip = keyRef.current.clipboard;
    if (!clip || !canEdit) return;
    const cell = lastCellRef.current;
    const equipe = targetEquipe ?? cell?.equipe ?? clip.equipe ?? 0;
    const date = targetDate ?? cell?.date;
    commit(() => {
      if (clip.sourceType === 'chantier') {
        const newItem = {
          ...clip,
          id: nextLocalId(),
          equipe,
          start: date ? nextWorkingDay(date, equipe) : nextWorkingDay(today, equipe),
        };
        setChantiers((prev) => applyInsertion(prev, newItem, equipe, newItem.start, true));
        setSelectedItem({ type: 'chantier', id: newItem.id });
      }
      if (clip.sourceType === 'conge') {
        const newItem = {
          ...clip,
          id: nextLocalId(),
          start: date || today,
        };
        setConges((prev) => [...prev, newItem]);
        setSelectedItem({ type: 'conge', id: newItem.id });
      }
    });
    if (clip.sourceType === 'chantier') setTimeout(reflowTeams, 0);
  }

  function handleContextMenu(e, type, id, equipe, date) {
    e.preventDefault();
    e.stopPropagation();
    if (id != null) setSelectedItem({ type, id });
    setContextMenu({ x: e.clientX, y: e.clientY, type, id, equipe, date });
  }

  // Close context menu on click anywhere
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

  const deferredChantiers = useDeferredValue(chantiers);
  const deferredConges = useDeferredValue(conges);
  const deferredVisibleDays = useDeferredValue(visibleDays);

  const congeSegmentsMap = useMemo(() => {
    const map = new Map();
    for (const c of conges) {
      const start = dayIndex(c.start);
      if (start === -1) continue;
      const endDate = addWorkingDays(c.start, c.duree, c.equipe || 0, { countConges: true });
      const end = dayIndex(endDate);
      if (end === -1) continue;
      const seg = { start, end: Math.max(start, end) };
      const eqs = c.allEquipes
        ? teams.map((_, t) => t).filter(t => teams[t].companyId === (c.companyId || teams[c.equipe]?.companyId))
        : [c.equipe];
      for (const eq of eqs) {
        for (let d = seg.start; d <= seg.end; d++) {
          const key = `${eq}-${d}`;
          if (!map.has(key)) map.set(key, []);
          map.get(key).push({ conge: c, seg });
        }
      }
    }
    return map;
  }, [conges, visibleDays, teams]);

  const chantiersParCelluleCacheRef = useRef(null);

  const chantiersParCellule = useMemo(() => {
    const cache = chantiersParCelluleCacheRef.current;
    const depsKey = `${deferredConges.length}|${holidays.size}|${deferredVisibleDays[0]?.date}-${deferredVisibleDays[deferredVisibleDays.length-1]?.date}`;

    if (cache && cache.depsKey === depsKey) {
      const newByTeam = {};
      deferredChantiers.forEach(c => {
        if (!newByTeam[c.equipe]) newByTeam[c.equipe] = [];
        newByTeam[c.equipe].push(c.id);
      });
      const allTeams = new Set([...Object.keys(cache.byTeam || {}).map(Number), ...Object.keys(newByTeam).map(Number)]);
      const changedTeams = new Set();
      allTeams.forEach(t => {
        const old = (cache.byTeam[t] || []).sort((a, b) => a - b).join(',');
        const nw = (newByTeam[t] || []).sort((a, b) => a - b).join(',');
        if (old !== nw) changedTeams.add(t);
      });

      if (changedTeams.size > 0 && changedTeams.size <= allTeams.size * 0.75) {
        const map = new Map(cache.map);
        for (const key of cache.map.keys()) {
          const team = Number(key.split('-')[0]);
          if (changedTeams.has(team)) map.delete(key);
        }
        const byEquipe = {};
        deferredChantiers.filter(c => changedTeams.has(c.equipe)).forEach((chantier) => {
          const segments = splitChantier(chantier).filter(Boolean);
          const segLens = segments.map(s => s.end - s.start + 1);
          const maxSegLen = segLens.length ? Math.max(...segLens) : 0;
          segments.forEach((seg, si) => {
            if (!byEquipe[chantier.equipe]) byEquipe[chantier.equipe] = [];
            byEquipe[chantier.equipe].push({ chantier, seg, segIndex: si, segCount: segments.length, longestLen: maxSegLen });
          });
        });
        Object.values(byEquipe).forEach((items) => {
          items.sort((a, b) => a.seg.start - b.seg.start);
          let lastEnd = -1;
          items.forEach(({ chantier, seg, segIndex, segCount, longestLen }) => {
            if (seg.start <= lastEnd) return;
            for (let d = seg.start; d <= seg.end; d++) {
              const key = `${chantier.equipe}-${d}`;
              if (!map.has(key)) map.set(key, []);
              map.get(key).push({ chantier, seg, i: 0, stack: 0, segIndex, segCount, longestLen });
            }
            lastEnd = seg.end;
          });
        });
        chantiersParCelluleCacheRef.current = { depsKey, map, byTeam: newByTeam };
        return map;
      }
    }

    const map = new Map();
    const byEquipe = {};

    deferredChantiers.forEach((chantier) => {
      const segments = splitChantier(chantier).filter(Boolean);
      const segLens = segments.map(s => s.end - s.start + 1);
      const maxSegLen = segLens.length ? Math.max(...segLens) : 0;
      segments.forEach((seg, si) => {
        if (!byEquipe[chantier.equipe]) byEquipe[chantier.equipe] = [];
        byEquipe[chantier.equipe].push({ chantier, seg, segIndex: si, segCount: segments.length, longestLen: maxSegLen });
      });
    });

    Object.values(byEquipe).forEach((items) => {
      items.sort((a, b) => a.seg.start - b.seg.start);
      let lastEnd = -1;
      items.forEach(({ chantier, seg, segIndex, segCount, longestLen }) => {
        if (seg.start <= lastEnd) return;
        for (let d = seg.start; d <= seg.end; d++) {
          const key = `${chantier.equipe}-${d}`;
          if (!map.has(key)) map.set(key, []);
          map.get(key).push({ chantier, seg, i: 0, stack: 0, segIndex, segCount, longestLen });
        }
        lastEnd = seg.end;
      });
    });

    const byTeam = {};
    deferredChantiers.forEach(c => {
      if (!byTeam[c.equipe]) byTeam[c.equipe] = [];
      byTeam[c.equipe].push(c.id);
    });
    chantiersParCelluleCacheRef.current = { depsKey, map, byTeam };
    return map;
  }, [deferredChantiers, conges, holidays, deferredVisibleDays]);

  const modalEndDate = useMemo(() => {
    if (!form || modal.type === 'conducteur') return '';
    if (modal.type === 'chantier') {
      return addWorkingDays(form.start, Number(form.duree || 1), Number(form.equipe || 0), { force_aout: form.force_aout });
    }
    return addWorkingDays(form.start, Number(form.duree || 1), Number(form.equipe || 0), { countConges: true });
  }, [form?.start, form?.duree, form?.equipe, form?.force_aout, modal.type]);

  gridCallbacksRef.current = {
    addTeamToCompany,
    updateTeam,
    deleteTeam,
    startSelection,
    updateSelection,
    setDragPreview,
    onDrop,
    setSelectedItem,
    openEditChantier,
    handleContextMenu,
    onDragStart,
    startResize,
    openEditConge,
    addWorkingDays,
    handleScroll,
  };

  if (dataLoading && session) {
    return <div className="loading-screen"><div className="loading-spinner"/><p>Chargement...</p></div>;
  }

  if (session?.mustChangePassword) {
    return (
      <Suspense fallback={<div className="loading-screen"><div className="loading-spinner" /></div>}>
        <PasswordChangePage onSubmit={handlePasswordChange} />
      </Suspense>
    );
  }

  if (!session) {
    return (
      <Suspense fallback={<div className="loading-screen"><div className="loading-spinner" /></div>}>
        <LoginPage
          loginError={loginError}
          loginForm={loginForm}
          loggingIn={loggingIn}
          onChange={setLoginForm}
          onSubmit={handleLogin}
        />
      </Suspense>
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
          <span>{companies.length > 0 ? `${companies[0].nom} + ${companies.length - 1}` : 'Planning'}</span>
        </div>

        {activePage === 'planning' && (
          <div className="date-nav">
            <input type="date" aria-label="Aller à une date" value={jumpDate} onChange={(e) => jumpToDate(e.target.value)} />
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

          {activePage === 'planning' && canEdit && (
            <button className="primary-action" onClick={quickAdd}>
              + Chantier
            </button>
          )}

          {activePage === 'planning' && canEdit && (
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

      <main>
      <Suspense fallback={null}>
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
      <PlanningGrid
        gridRows={gridRows}
        visibleDays={visibleDays}
        weekGroups={weekGroups}
        monthGroups={monthGroups}
        chantiersParCellule={chantiersParCellule}
        conges={conges}
        congeSegments={congeSegmentsMap}
        conducteurs={conducteurs}
        selectedItem={selectedItem}
        dragPreview={dragPreview}
        selection={selection}
        cellWidth={cellWidth}
        canEdit={canEdit}
        resize={resize}
        today={today}
        companies={companies}
        teams={teams}
        ferieSet={ferieSet}
        callbacksRef={gridCallbacksRef}
        dragThrottle={dragThrottle}
        scrollRef={scrollRef}
      />

        <Modals
          modal={modal} setModal={setModal}
          form={form} setForm={setForm}
          modalEndDate={modalEndDate}
          companies={companies} teams={teams}
          chantierColors={chantierColors} setChantierColors={setChantierColors}
          conducteurColors={conducteurColors} setConducteurColors={setConducteurColors}
          setColorManager={setColorManager} colorManager={colorManager}
          holidayModalOpen={holidayModalOpen} setHolidayModalOpen={setHolidayModalOpen}
          ferieForm={ferieForm} setFerieForm={setFerieForm}
          customFeries={customFeries} setCustomFeries={setCustomFeries}
          conducteurs={conducteurs} setConducteurs={setConducteurs}
          contextMenu={contextMenu} setContextMenu={setContextMenu}
          clipboard={clipboard} setClipboard={setClipboard}
          chantiers={chantiers} conges={conges}
          canEdit={canEdit}
          saveModal={saveModal} closeModal={closeModal}
          deleteSelectedItem={deleteSelectedItem}
          pasteClipboard={pasteClipboard}
          addCustomFerie={addCustomFerie}
          nextLocalId={nextLocalId}
          commit={commit}
        />
        </>
      )}
      </Suspense>
      </main>
      <footer className="app-footer">Créé par Tom Corlay</footer>
    </div>
  );
}
