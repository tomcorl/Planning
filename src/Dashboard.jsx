import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
  PieChart, Pie, Legend, AreaChart, Area,
} from 'recharts';

const CHART_COLORS = {
  vendeur: '#16a34a',
  conducteur: '#2563eb',
  type: '#eab308',
  equipe: '#7c3aed',
  curve: '#16a34a',
};

const PIE_FALLBACK = ['#16a34a', '#2563eb', '#eab308', '#7c3aed', '#f97316', '#06b6d4', '#ec4899', '#6b7280'];

function getExerciceForDate(d) {
  const date = d instanceof Date ? d : new Date(d);
  const year = date.getFullYear();
  const sept1 = new Date(year, 8, 1);
  if (date >= sept1) {
    return { start: new Date(year, 8, 1), end: new Date(year + 1, 7, 31), label: `${year} → ${year + 1}` };
  }
  return { start: new Date(year - 1, 8, 1), end: new Date(year, 7, 31), label: `${year - 1} → ${year}` };
}

function formatDateInput(d) {
  const date = d instanceof Date ? d : new Date(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function euro(v) {
  return `${Number(v || 0).toLocaleString('fr-FR')} €`;
}

function frDate(iso) {
  if (!iso) return '-';
  const [y, m, d] = String(iso).split(' ')[0].split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function parseISO(s) {
  const [y, m, d] = String(s || '').split(' ')[0].split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function isoOf(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function workingDaysInRange(a, b) {
  const d1 = parseISO(a);
  const d2 = parseISO(b);
  if (!d1 || !d2 || d1 > d2) return 0;
  let n = 0;
  const d = new Date(d1);
  let guard = 0;
  while (d <= d2 && guard < 1500) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) n += 1;
    d.setDate(d.getDate() + 1);
    guard += 1;
  }
  return n;
}

function chantierEndDate(c) {
  if (!c.start) return '2100-12-31';
  const dur = Math.max(1, Number(c.duree) || 1);
  const d0 = parseISO(c.start);
  if (!d0) return String(c.start).split(' ')[0];
  const date = new Date(d0);
  let counted = 1;
  let guard = 0;
  while (counted < dur && guard < 1200) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) counted += 1;
    guard += 1;
  }
  return isoOf(date);
}

function realizedCA(c, s, e) {
  const montant = Number(c.montant_devis) || 0;
  if (!montant) return 0;
  const cs = String(c.start || '').split(' ')[0];
  if (!cs) return 0;
  const ce = chantierEndDate(c);
  const total = workingDaysInRange(cs, ce);
  if (!total) return montant;
  const inside = workingDaysInRange(cs > s ? cs : s, ce < e ? ce : e);
  return (montant * inside) / total;
}

function monthBuckets(s, e) {
  const [y1, m1] = s.split('-').map(Number);
  const [y2, m2] = e.split('-').map(Number);
  if (!y1 || !m1 || !y2 || !m2) return [];
  const arr = [];
  let y = y1;
  let m = m1;
  let guard = 0;
  while ((y < y2 || (y === y2 && m <= m2)) && guard < 36) {
    const key = `${y}-${String(m).padStart(2, '0')}`;
    const label = `${new Date(y, m - 1, 1).toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '')} ${String(y).slice(2)}`;
    const first = `${key}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const last = `${key}-${String(lastDay).padStart(2, '0')}`;
    arr.push({ key, label, first, last });
    m += 1;
    if (m > 12) { m = 1; y += 1; }
    guard += 1;
  }
  return arr;
}

function groupCA(list, getKey, getNom) {
  const map = new Map();
  for (const c of list) {
    const key = getKey(c);
    if (key == null) continue;
    const nom = getNom(key);
    if (!nom) continue;
    const entry = map.get(nom) || { name: nom, value: 0, count: 0 };
    entry.value += c._real || 0;
    entry.count += 1;
    map.set(nom, entry);
  }
  return Array.from(map.values()).sort((a, b) => b.value - a.value);
}

function Kpi({ icon, label, value, sub, accent }) {
  return (
    <div className={`dash-kpi ${accent ? `dash-kpi--${accent}` : ''}`}>
      <div className="dash-kpi-head">
        <span className={`dash-kpi-icon dash-kpi-icon--${accent || 'green'}`}>{icon}</span>
        <span className="dash-kpi-label">{label}</span>
      </div>
      <div className="dash-kpi-value">{value}</div>
      <div className="dash-kpi-sub">{sub}</div>
    </div>
  );
}

function ChartCard({ icon, title, countLabel, data, color, emptyText }) {
  const hasData = data.length > 0 && data.some((d) => d.value > 0);
  return (
    <div className="dash-card">
      <div className="dash-card-head">
        <div className="dash-card-title">
          <span className="dash-card-icon" style={{ background: `${color}14`, color, borderColor: `${color}28` }}>{icon}</span>
          <h3>{title}</h3>
        </div>
        <span className="dash-pill">{countLabel}</span>
      </div>
      {hasData ? (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 36 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--dash-line)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7a6e' }} interval={0} angle={-18} textAnchor="end" height={56} tickLine={false} axisLine={{ stroke: 'var(--dash-line)' }} />
            <YAxis tick={{ fontSize: 11, fill: '#6b7a6e' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={46} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: 'rgba(22,163,74,0.06)' }}
              formatter={(v) => [euro(v), 'CA']}
              contentStyle={{ borderRadius: 12, border: '1px solid var(--dash-line)', boxShadow: '0 12px 28px rgba(16,30,18,0.12)', fontSize: 13 }}
            />
            <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={26} background={{ fill: 'var(--dash-surface-2)', radius: 8 }} animationDuration={800} animationEasing="ease-out">
              {data.map((entry, idx) => (
                <Cell key={`${entry.name}-${idx}`} fill={color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="dash-empty">{emptyText}</div>
      )}
    </div>
  );
}

export default function Dashboard({ chantiers, vendeurs, conducteurs, typesChantier, equipes, companies, onClose }) {
  const defaultEx = useMemo(() => getExerciceForDate(new Date()), []);
  const [start, setStart] = useState(() => formatDateInput(defaultEx.start));
  const [end, setEnd] = useState(() => formatDateInput(defaultEx.end));
  const [filterEntreprise, setFilterEntreprise] = useState('all');
  const [filterVendeur, setFilterVendeur] = useState('all');
  const [filterConducteur, setFilterConducteur] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterEquipe, setFilterEquipe] = useState('all');

  const defaultEntrepriseApplied = useRef(false);
  useEffect(() => {
    if (defaultEntrepriseApplied.current || !companies || !companies.length) return;
    defaultEntrepriseApplied.current = true;
    const noree = companies.find((c) => c.id === 'noree' || /norée|noree/i.test(c.nom || ''));
    if (noree) setFilterEntreprise(String(noree.id));
  }, [companies]);

  const vendeurMap = useMemo(() => new Map((vendeurs || []).map((v) => [v.id, v.nom])), [vendeurs]);
  const vendeurColor = useMemo(() => new Map((vendeurs || []).map((v) => [v.id, v.color])), [vendeurs]);
  const conducteurMap = useMemo(() => new Map((conducteurs || []).map((c) => [c.id, c.nom])), [conducteurs]);
  const conducteurColor = useMemo(() => new Map((conducteurs || []).map((c) => [c.id, c.color])), [conducteurs]);
  const typeMap = useMemo(() => new Map((typesChantier || []).map((t) => [t.id, t.nom])), [typesChantier]);
  const typeColor = useMemo(() => new Map((typesChantier || []).map((t) => [t.id, t.color])), [typesChantier]);
  const equipeMap = useMemo(() => new Map((equipes || []).map((e) => [e.id, e.nom])), [equipes]);
  const companyMap = useMemo(() => new Map((companies || []).map((c) => [c.id, c.nom || c.id])), [companies]);
  const teamCompany = useMemo(() => new Map((equipes || []).map((e) => [e.id, e.companyId])), [equipes]);

  const equipeOptions = useMemo(() => {
    if (filterEntreprise === 'all') return equipes || [];
    return (equipes || []).filter((e) => String(e.companyId) === String(filterEntreprise));
  }, [equipes, filterEntreprise]);

  function companyOf(c) {
    return c.company_id || teamCompany.get(c.equipe) || '';
  }

  const filtered = useMemo(() => {
    const s = start || '1900-01-01';
    const e = end || '2100-12-31';
    return (chantiers || [])
      .filter((c) => {
        const cs = String(c.start || '').split(' ')[0];
        if (!cs) return false;
        const ce = chantierEndDate(c);
        if (cs > e || ce < s) return false;
        if (filterEntreprise !== 'all' && String(companyOf(c)) !== String(filterEntreprise)) return false;
        if (filterVendeur !== 'all' && String(c.vendeurId ?? 0) !== String(filterVendeur)) return false;
        if (filterConducteur !== 'all' && String(c.conducteurId ?? 0) !== String(filterConducteur)) return false;
        if (filterType !== 'all' && String(c.typeChantierId ?? 0) !== String(filterType)) return false;
        if (filterEquipe !== 'all' && String(c.equipe ?? 0) !== String(filterEquipe)) return false;
        return true;
      })
      .map((c) => ({ ...c, _real: realizedCA(c, s, e) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chantiers, start, end, filterEntreprise, filterVendeur, filterConducteur, filterType, filterEquipe, teamCompany]);

  const startedBefore = useMemo(() => {
    const s = start || '1900-01-01';
    return filtered.filter((c) => String(c.start || '').split(' ')[0] < s).length;
  }, [filtered, start]);

  const totalCA = useMemo(() => filtered.reduce((sum, c) => sum + (c._real || 0), 0), [filtered]);
  const avgCA = filtered.length ? Math.round(totalCA / filtered.length) : 0;

  const byVendeur = useMemo(
    () => groupCA(filtered, (c) => c.vendeurId || 0, (k) => vendeurMap.get(k) || (k === 0 ? 'Non assigné' : `#${k}`)),
    [filtered, vendeurMap]
  );
  const byConducteur = useMemo(
    () => groupCA(filtered, (c) => c.conducteurId || 0, (k) => conducteurMap.get(k) || (k === 0 ? 'Non assigné' : `#${k}`)),
    [filtered, conducteurMap]
  );
  const byType = useMemo(
    () => groupCA(filtered, (c) => c.typeChantierId || 0, (k) => typeMap.get(k) || (k === 0 ? 'Non assigné' : `#${k}`)),
    [filtered, typeMap]
  );
  // Équipes: scope strict. Hors scope (orphelin ou autre entreprise) = exclu du breakdown
  // pour ne jamais afficher "Autre entreprise" / "#id" comme une équipe.
  const byEquipe = useMemo(() => {
    if (filterEntreprise === 'all') {
      return groupCA(
        filtered,
        (c) => {
          const id = Number(c.equipe ?? 0);
          if (!id || !equipeMap.has(id)) return null;
          return id;
        },
        (k) => equipeMap.get(k) || null
      );
    }
    return groupCA(
      filtered,
      (c) => {
        const id = Number(c.equipe ?? 0);
        if (!id || !equipeMap.has(id)) return null;
        if (String(teamCompany.get(id) ?? '') !== String(filterEntreprise)) return null;
        return id;
      },
      (k) => equipeMap.get(k) || null
    );
  }, [filtered, equipeMap, teamCompany, filterEntreprise]);

  const byCompany = useMemo(
    () => groupCA(filtered, (c) => companyOf(c) || '?', (k) => companyMap.get(k) || (k === '?' ? 'Non assigné' : String(k))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filtered, companyMap, teamCompany]
  );

  const monthly = useMemo(() => {
    const s = start || '1900-01-01';
    const e = end || '2100-12-31';
    const buckets = monthBuckets(s, e).map((b) => ({ ...b, value: 0 }));
    if (!buckets.length) return buckets;
    const idx = new Map(buckets.map((b, i) => [b.key, i]));
    for (const c of filtered) {
      const montant = Number(c.montant_devis) || 0;
      if (!montant) continue;
      const cs = String(c.start || '').split(' ')[0];
      const ce = chantierEndDate(c);
      const total = workingDaysInRange(cs, ce);
      if (!total) continue;
      const from = cs > s ? cs : s;
      const to = ce < e ? ce : e;
      const d0 = parseISO(from);
      const d1 = parseISO(to);
      if (!d0 || !d1) continue;
      const d = new Date(d0);
      let guard = 0;
      while (d <= d1 && guard < 1500) {
        const day = d.getDay();
        if (day !== 0 && day !== 6) {
          const key = isoOf(d).slice(0, 7);
          const i = idx.get(key);
          if (i != null) buckets[i].value += montant / total;
        }
        d.setDate(d.getDate() + 1);
        guard += 1;
      }
    }
    return buckets.map((b) => ({ ...b, value: Math.round(b.value) }));
  }, [filtered, start, end]);

  const monthlyHasData = monthly.some((b) => b.value > 0);

  const typeShare = useMemo(() => {
    const total = totalCA || 1;
    const counts = new Map();
    for (const c of filtered) {
      const k = c.typeChantierId || 0;
      const nom = typeMap.get(k) || (k === 0 ? 'Non assigné' : `#${k}`);
      const entry = counts.get(nom) || { name: nom, count: 0, value: 0, color: typeColor.get(k) };
      entry.count += 1;
      entry.value += c._real || 0;
      counts.set(nom, entry);
    }
    return Array.from(counts.values())
      .map((e, i) => ({ ...e, percent: totalCA ? Math.round((e.value / total) * 100) : 0, fill: e.color || PIE_FALLBACK[i % PIE_FALLBACK.length] }))
      .filter((e) => e.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [filtered, typeMap, typeColor, totalCA]);

  const sortedTable = useMemo(
    () => [...filtered].sort((a, b) => (Number(b.montant_devis) || 0) - (Number(a.montant_devis) || 0)),
    [filtered]
  );

  function resetExercice() {
    const ex = getExerciceForDate(new Date());
    setStart(formatDateInput(ex.start));
    setEnd(formatDateInput(ex.end));
    setFilterEntreprise('all');
    setFilterVendeur('all');
    setFilterConducteur('all');
    setFilterType('all');
    setFilterEquipe('all');
  }

  function clearFilters() {
    setFilterEntreprise('all');
    setFilterVendeur('all');
    setFilterConducteur('all');
    setFilterType('all');
    setFilterEquipe('all');
  }

  function pickEntreprise(v) {
    setFilterEntreprise(v);
    setFilterEquipe('all');
  }

  const hasActiveFilters = filterEntreprise !== 'all' || filterVendeur !== 'all' || filterConducteur !== 'all' || filterType !== 'all' || filterEquipe !== 'all';
  const activeChips = [];
  if (filterEntreprise !== 'all') activeChips.push({ k: 'Entreprise', v: companyMap.get(filterEntreprise) || filterEntreprise, clear: () => pickEntreprise('all') });
  if (filterEquipe !== 'all') activeChips.push({ k: 'Équipe', v: equipeMap.get(Number(filterEquipe)) || `#${filterEquipe}`, clear: () => setFilterEquipe('all') });
  if (filterVendeur !== 'all') activeChips.push({ k: 'Vendeur', v: vendeurMap.get(Number(filterVendeur)) || filterVendeur, clear: () => setFilterVendeur('all') });
  if (filterConducteur !== 'all') activeChips.push({ k: 'Conducteur', v: conducteurMap.get(Number(filterConducteur)) || filterConducteur, clear: () => setFilterConducteur('all') });
  if (filterType !== 'all') activeChips.push({ k: 'Type', v: typeMap.get(Number(filterType)) || filterType, clear: () => setFilterType('all') });

  const exLabel = `${getExerciceForDate(new Date()).start.getFullYear()} → ${getExerciceForDate(new Date()).end.getFullYear()}`;

  return (
    <div className="dash">
      <div className="dash-wrap">
        {/* TOP */}
        <div className="dash-top">
          <div className="dash-top-left">
            <div className="dash-eyebrow"><span className="dash-eyebrow-dot" /> Pilotage · Exercice {exLabel}</div>
            <h1 className="dash-title">Dashboard</h1>
            <p className="dash-subtitle">
              <strong>{filtered.length}</strong> chantier{filtered.length !== 1 ? 's' : ''} actif{filtered.length !== 1 ? 's' : ''} sur la période
              {startedBefore > 0 && <span className="dash-sub-muted"> · dont {startedBefore} déjà en cours au {frDate(start)}</span>}
              <span className="dash-sub-muted"> · CA proratisé aux jours ouvrés</span>
            </p>
          </div>
          <div className="dash-top-actions">
            <span className="dash-live"><span className="dash-live-dot" /> temps réel</span>
            <button type="button" className="dash-close" onClick={onClose}>✕ Fermer</button>
          </div>
        </div>

        {/* FILTERS */}
        <div className="dash-filters">
          <div className="dash-filters-grid">
            <div className="dash-fcol">
              <div className="dash-fcol-head"><span className="dash-fcol-icon">◷</span> Période</div>
              <div className="dash-fcol-fields">
                <label className="dash-field">
                  <span>Début</span>
                  <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
                </label>
                <label className="dash-field">
                  <span>Fin</span>
                  <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
                </label>
              </div>
              <button type="button" className="dash-link" onClick={resetExercice}>↺ Exercice 1 sept → 31 août</button>
            </div>

            <div className="dash-fcol">
              <div className="dash-fcol-head"><span className="dash-fcol-icon">▦</span> Structure</div>
              <div className="dash-fcol-fields">
                <label className="dash-field">
                  <span>Entreprise</span>
                  <select value={filterEntreprise} onChange={(e) => pickEntreprise(e.target.value)}>
                    <option value="all">Toutes les entreprises</option>
                    {(companies || []).map((c) => (
                      <option key={c.id} value={c.id}>{c.nom || c.id}</option>
                    ))}
                  </select>
                </label>
                <label className="dash-field">
                  <span>Équipe</span>
                  <select value={filterEquipe} onChange={(e) => setFilterEquipe(e.target.value)}>
                    <option value="all">Toutes les équipes</option>
                    {equipeOptions.map((e) => (
                      <option key={e.id} value={e.id}>{e.nom}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="dash-fcol">
              <div className="dash-fcol-head"><span className="dash-fcol-icon">◐</span> Acteurs</div>
              <div className="dash-fcol-fields dash-fcol-fields--3">
                <label className="dash-field">
                  <span>Vendeur</span>
                  <select value={filterVendeur} onChange={(e) => setFilterVendeur(e.target.value)}>
                    <option value="all">Tous</option>
                    {(vendeurs || []).map((v) => (
                      <option key={v.id} value={v.id}>{v.nom}</option>
                    ))}
                  </select>
                </label>
                <label className="dash-field">
                  <span>Conducteur</span>
                  <select value={filterConducteur} onChange={(e) => setFilterConducteur(e.target.value)}>
                    <option value="all">Tous</option>
                    {(conducteurs || []).map((c) => (
                      <option key={c.id} value={c.id}>{c.nom}</option>
                    ))}
                  </select>
                </label>
                <label className="dash-field">
                  <span>Type</span>
                  <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                    <option value="all">Tous</option>
                    {(typesChantier || []).map((t) => (
                      <option key={t.id} value={t.id}>{t.nom}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </div>
          {hasActiveFilters && (
            <div className="dash-chips">
              <div className="dash-chips-left">
                {activeChips.map((c) => (
                  <span key={c.k} className="dash-chip">{c.k} : <strong>{c.v}</strong> <button type="button" onClick={c.clear}>×</button></span>
                ))}
              </div>
              <button type="button" className="dash-chip-clear" onClick={clearFilters}>Effacer les filtres</button>
            </div>
          )}
        </div>

        {/* KPIs */}
        <div className="dash-kpis">
          <Kpi icon="€" label="CA réalisé" value={euro(totalCA)} sub={`${filtered.length} chantier(s) · prorata jours ouvrés`} accent="hero" />
          <Kpi icon="▭" label="Chantiers actifs" value={String(filtered.length)} sub={`sur ${(chantiers || []).length} au total`} accent="neutral" />
          <Kpi icon="⌀" label="CA moyen / chantier" value={euro(avgCA)} sub={`${frDate(start)} → ${frDate(end)}`} accent="neutral" />
        </div>

        {/* EVOLUTION */}
        <div className="dash-section"><span>Évolution</span></div>
        <div className="dash-card dash-card--curve">
          <div className="dash-card-head">
            <div className="dash-card-title">
              <span className="dash-card-icon" style={{ background: '#16a34a14', color: '#16a34a', borderColor: '#16a34a20' }}>↗</span>
              <h3>CA réalisé par mois</h3>
              <span className="dash-card-hint">prorata jours ouvrés</span>
            </div>
            <span className="dash-pill dash-pill--soft">{monthly.length} mois</span>
          </div>
          {monthlyHasData ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthly} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="caFill2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.curve} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={CHART_COLORS.curve} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--dash-line)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7a6e' }} interval="preserveStartEnd" minTickGap={24} tickLine={false} axisLine={{ stroke: 'var(--dash-line)' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7a6e' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={52} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(v) => [euro(v), 'CA réalisé']}
                  labelFormatter={(_, payload) => {
                    const b = payload && payload[0] && payload[0].payload;
                    return b ? `Mois de ${b.label}` : '';
                  }}
                  contentStyle={{ borderRadius: 12, border: '1px solid var(--dash-line)', boxShadow: '0 12px 28px rgba(16,30,18,0.12)', fontSize: 13 }}
                />
                <Area type="monotone" dataKey="value" stroke={CHART_COLORS.curve} strokeWidth={2.4} fill="url(#caFill2)" dot={{ r: 2.5, strokeWidth: 0, fill: CHART_COLORS.curve }} activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }} animationDuration={1100} animationEasing="ease-out" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="dash-empty">Aucun CA sur cette période.</div>
          )}
        </div>

        <div className="dash-card">
          <div className="dash-card-head">
            <div className="dash-card-title">
              <span className="dash-card-icon" style={{ background: '#0ea5e914', color: '#0ea5e9', borderColor: '#0ea5e920' }}>◇</span>
              <h3>CA par entreprise</h3>
            </div>
            <span className="dash-pill">{byCompany.length} entreprise(s)</span>
          </div>
          <div className="dash-table-scroll">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Entreprise</th>
                  <th className="num">Chantiers</th>
                  <th className="num">CA réalisé</th>
                  <th className="num">% du total</th>
                  <th>Part</th>
                </tr>
              </thead>
              <tbody>
                {byCompany.length === 0 ? (
                  <tr><td colSpan={5} className="dash-table-empty">Aucune entreprise active sur cette période.</td></tr>
                ) : (
                  byCompany.map((e) => {
                    const pct = totalCA ? Math.round((e.value / totalCA) * 100) : 0;
                    return (
                      <tr key={e.name}>
                        <td><strong>{e.name}</strong></td>
                        <td className="num">{e.count}</td>
                        <td className="num"><strong>{euro(e.value)}</strong></td>
                        <td className="num">{pct} %</td>
                        <td><div className="dash-pct"><div className="dash-pct-fill" style={{ width: `${pct}%` }} /></div></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dash-section"><span>Analyses</span></div>

        <div className="dash-grid dash-grid--3">
          <ChartCard icon="◎" title="CA par vendeur" countLabel={`${byVendeur.length} vendeur(s)`} data={byVendeur} color={CHART_COLORS.vendeur} emptyText="Aucune donnée vendeur sur cette période." />
          <ChartCard icon="⬡" title="CA par conducteur" countLabel={`${byConducteur.length} conducteur(s)`} data={byConducteur} color={CHART_COLORS.conducteur} emptyText="Aucune donnée conducteur sur cette période." />
          <ChartCard icon="⬢" title="CA par type" countLabel={`${byType.length} type(s)`} data={byType} color={CHART_COLORS.type} emptyText="Aucune donnée par type sur cette période." />
        </div>

        <div className="dash-grid dash-grid--2">
          <div className="dash-card">
            <div className="dash-card-head">
              <div className="dash-card-title">
                <span className="dash-card-icon" style={{ background: '#7c3aed14', color: '#7c3aed', borderColor: '#7c3aed20' }}>▤</span>
                <h3>CA par équipe</h3>
              </div>
              <span className="dash-pill">{byEquipe.length} équipe(s)</span>
            </div>
            {byEquipe.length > 0 && byEquipe.some((d) => d.value > 0 || d.count > 0) ? (
              <ResponsiveContainer width="100%" height={Math.max(260, byEquipe.length * 42)}>
                <BarChart data={byEquipe} layout="vertical" margin={{ top: 5, right: 16, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--dash-line)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7a6e' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#1a2e1a' }} width={118} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(124,58,237,0.06)' }}
                    formatter={(v, _name, props) => [`${euro(v)} (${props?.payload?.count ?? 0} chantier(s))`, 'CA réalisé']}
                    contentStyle={{ borderRadius: 12, border: '1px solid var(--dash-line)', boxShadow: '0 12px 28px rgba(16,30,18,0.12)' }}
                  />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={18} background={{ fill: 'var(--dash-surface-2)', radius: 8 }} animationDuration={800} animationEasing="ease-out">
                    {byEquipe.map((entry, idx) => (
                      <Cell key={`${entry.name}-${idx}`} fill={CHART_COLORS.equipe} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="dash-empty">Aucune donnée par équipe sur cette période.</div>
            )}
          </div>

          <div className="dash-card">
            <div className="dash-card-head">
              <div className="dash-card-title">
                <span className="dash-card-icon dash-card-icon--orange">◍</span>
                <h3>Part des types vendus</h3>
              </div>
              <span className="dash-pill">% du CA</span>
            </div>
            {typeShare.length > 0 && totalCA > 0 ? (
              <div className="dash-donut-wrap">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={typeShare}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={70}
                      outerRadius={105}
                      paddingAngle={3}
                      cornerRadius={6}
                      labelLine={false}
                      label={false}
                      animationBegin={200}
                      animationDuration={1000}
                      animationEasing="ease-out"
                    >
                      {typeShare.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} stroke="rgba(255,255,255,0.7)" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(_v, _name, props) => [
                        `${props?.payload?.percent ?? 0} % · ${props?.payload?.count ?? 0} chantier(s) · ${euro(props?.payload?.value)}`,
                        props?.payload?.name ?? '',
                      ]}
                      contentStyle={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.6)', boxShadow: '0 12px 28px rgba(16,30,18,0.14)', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="dash-donut-center">
                  <strong>{totalCA ? `${Math.round((typeShare[0]?.value || 0) / totalCA * 100)} %` : '0 %'}</strong>
                  <span>Type principal : {typeShare[0]?.name || '-'}</span>
                </div>
              </div>
            ) : (
              <div className="dash-empty">Aucun CA sur cette période.</div>
            )}
            {typeShare.length > 0 && (
              <div className="dash-legend">
                {typeShare.map((t) => (
                  <div key={t.name} className="dash-legend-item">
                    <span className="dash-legend-dot" style={{ background: t.fill }} />
                    <span className="dash-legend-name">{t.name}</span>
                    <span className="dash-legend-value">{t.percent} %</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="dash-section"><span>Détail</span></div>

        <div className="dash-card">
          <div className="dash-card-head">
            <div className="dash-card-title">
              <span className="dash-card-icon" style={{ background: '#16a34a14', color: '#16a34a', borderColor: '#16a34a20' }}>≡</span>
              <h3>CA et chantiers par équipe</h3>
            </div>
            <span className="dash-pill">{byEquipe.length} équipe(s)</span>
          </div>
          <div className="dash-table-scroll">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Équipe</th>
                  <th className="num">Chantiers</th>
                  <th className="num">CA réalisé</th>
                  <th className="num">CA moyen</th>
                </tr>
              </thead>
              <tbody>
                {byEquipe.length === 0 ? (
                  <tr><td colSpan={4} className="dash-table-empty">Aucune équipe active sur cette période.</td></tr>
                ) : (
                  byEquipe.map((e) => (
                    <tr key={e.name}>
                      <td><strong>{e.name}</strong></td>
                      <td className="num">{e.count}</td>
                      <td className="num"><strong>{euro(e.value)}</strong></td>
                      <td className="num">{euro(e.count ? Math.round(e.value / e.count) : 0)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-head">
            <div className="dash-card-title">
              <span className="dash-card-icon" style={{ background: '#1a2e1a0d', color: '#1a2e1a', borderColor: '#1a2e1a14' }}>☰</span>
              <h3>Détail des chantiers</h3>
            </div>
            <span className="dash-pill">{sortedTable.length} ligne(s)</span>
          </div>
          <div className="dash-table-scroll dash-table-scroll--tall">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Chantier</th>
                  <th>Début</th>
                  <th>Entreprise</th>
                  <th>Client</th>
                  <th>Vendeur</th>
                  <th>Type</th>
                  <th>Conducteur</th>
                  <th>Équipe</th>
                  <th className="num">CA contrat</th>
                </tr>
              </thead>
              <tbody>
                {sortedTable.length === 0 ? (
                  <tr><td colSpan={10} className="dash-table-empty">Aucun chantier actif sur cette période — élargis les dates ou réinitialise les filtres.</td></tr>
                ) : (
                  sortedTable.map((c) => (
                    <tr key={c.id}>
                      <td className="mono">{c.numero_chantier || '-'}</td>
                      <td><strong>{c.nom}</strong></td>
                      <td>{frDate(String(c.start || '').split(' ')[0])}</td>
                      <td>{companyMap.get(companyOf(c)) || <span className="muted">-</span>}</td>
                      <td>{c.client_nom || <span className="muted">-</span>}</td>
                      <td>
                        {vendeurMap.get(c.vendeurId)
                          ? <span className="dash-tag" style={{ background: `${vendeurColor.get(c.vendeurId) || '#16a34a'}14`, borderColor: `${vendeurColor.get(c.vendeurId) || '#16a34a'}30`, color: vendeurColor.get(c.vendeurId) || '#16a34a' }}>{vendeurMap.get(c.vendeurId)}</span>
                          : <span className="muted">-</span>}
                      </td>
                      <td>
                        {typeMap.get(c.typeChantierId)
                          ? <span className="dash-tag" style={{ background: `${typeColor.get(c.typeChantierId) || '#eab308'}14`, borderColor: `${typeColor.get(c.typeChantierId) || '#eab308'}30`, color: typeColor.get(c.typeChantierId) || '#eab308' }}>{typeMap.get(c.typeChantierId)}</span>
                          : <span className="muted">-</span>}
                      </td>
                      <td>
                        {conducteurMap.get(c.conducteurId)
                          ? <span className="dash-tag" style={{ background: `${conducteurColor.get(c.conducteurId) || '#2563eb'}14`, borderColor: `${conducteurColor.get(c.conducteurId) || '#2563eb'}30`, color: conducteurColor.get(c.conducteurId) || '#2563eb' }}>{conducteurMap.get(c.conducteurId)}</span>
                          : <span className="muted">-</span>}
                      </td>
                      <td>{equipeMap.get(Number(c.equipe)) ?? equipeMap.get(c.equipe) ?? <span className="muted">-</span>}</td>
                      <td className="num"><strong>{euro(c.montant_devis)}</strong></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="dash-footnote">Montants contractuels par chantier — les totaux du haut sont proratisés aux jours ouvrés sur la période.</div>
        </div>
      </div>
    </div>
  );
}
