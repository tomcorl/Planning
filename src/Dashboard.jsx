import { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
  PieChart, Pie, Legend, AreaChart, Area,
} from 'recharts';

const CHART_COLORS = {
  vendeur: '#16a34a',
  conducteur: '#2563eb',
  type: '#eab308',
  equipe: '#8b5cf6',
  curve: '#16a34a',
};

const PIE_FALLBACK = ['#16a34a', '#2563eb', '#eab308', '#8b5cf6', '#f97316', '#06b6d4', '#f472b6', '#6b7280'];

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

// Jours ouvrés (lun-ven) entre deux dates ISO incluses.
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

// Fin estimée = start + (duree - 1) jours ouvrés.
// Approximation suffisante pour dire si un chantier est actif sur la période.
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

// CA réalisé d'un chantier sur [s, e] : montant réparti au prorata des jours
// ouvrés (le plus juste quand un chantier chevauche les bornes de période).
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
    const nom = getNom(key);
    const entry = map.get(nom) || { name: nom, value: 0, count: 0 };
    entry.value += c._real || 0;
    entry.count += 1;
    map.set(nom, entry);
  }
  return Array.from(map.values()).sort((a, b) => b.value - a.value);
}

function ChartCard({ icon, title, countLabel, data, color, emptyText }) {
  const hasData = data.length > 0 && data.some((d) => d.value > 0);
  return (
    <div className="dashboard-card">
      <div className="dashboard-card-head">
        <h3><span className="dashboard-card-ico">{icon}</span>{title}</h3>
        <span className="dashboard-pill">{countLabel}</span>
      </div>
      {hasData ? (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--line-soft)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-18} textAnchor="end" height={60} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={52} />
            <Tooltip
              cursor={{ fill: 'rgba(0,0,0,0.04)' }}
              formatter={(v, _name, props) => [`${euro(v)} (${props?.payload?.count ?? 0} chantier(s))`, 'CA réalisé']}
              contentStyle={{ borderRadius: 10, border: '1px solid var(--line)' }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={32}>
              {data.map((entry, idx) => (
                <Cell key={`${entry.name}-${idx}`} fill={color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="dashboard-empty">{emptyText}</div>
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
        // chevauchement : compte aussi les chantiers déjà commencés avant le début
        // mais encore en cours dessus (fin estimée >= début période)
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

  const totalCA = useMemo(
    () => filtered.reduce((sum, c) => sum + (c._real || 0), 0),
    [filtered]
  );
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
  const byEquipe = useMemo(
    () => groupCA(filtered, (c) => c.equipe ?? 0, (k) => equipeMap.get(k) || (k === 0 ? 'Non assigné' : `#${k}`)),
    [filtered, equipeMap]
  );
  const byCompany = useMemo(
    () => groupCA(filtered, (c) => companyOf(c) || '?', (k) => companyMap.get(k) || (k === '?' ? 'Non assigné' : String(k))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filtered, companyMap, teamCompany]
  );

  // Courbe mensuelle du CA réalisé (prorata jours ouvrés).
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
      // jours ouvrés du chantier compris dans la période, ventilés par mois
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

  // Part de chaque type en % du CA réalisé (ex : 40 % Fosse, 20 % STEP).
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

  return (
    <div className="dashboard-page">
      <div className="dashboard-inner">
        <div className="dashboard-topbar">
          <div>
            <div className="dashboard-eyebrow">Pilotage</div>
            <h1>Dashboard</h1>
            <p>
              Exercice {getExerciceForDate(new Date()).start.getFullYear()} → {getExerciceForDate(new Date()).end.getFullYear()}
              {' '}· {filtered.length} chantier(s) actif(s) sur la période
              {startedBefore > 0 && `, dont ${startedBefore} déjà en cours au ${frDate(start)}`}
            </p>
          </div>
          <button type="button" className="dashboard-close" onClick={onClose}>× Fermer</button>
        </div>

        <div className="dashboard-filters">
          <div className="dashboard-filter-group">
            <div className="dashboard-group-title">Période</div>
            <label>
              <span>Début</span>
              <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </label>
            <label>
              <span>Fin</span>
              <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            </label>
            <button type="button" className="dashboard-btn primary dashboard-btn-inline" onClick={resetExercice}>Exercice 1 sept → 31 août</button>
          </div>
          <div className="dashboard-filter-group">
            <div className="dashboard-group-title">Structure</div>
            <label>
              <span>Entreprise</span>
              <select value={filterEntreprise} onChange={(e) => pickEntreprise(e.target.value)}>
                <option value="all">Toutes les entreprises</option>
                {(companies || []).map((c) => (
                  <option key={c.id} value={c.id}>{c.nom || c.id}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Équipe</span>
              <select value={filterEquipe} onChange={(e) => setFilterEquipe(e.target.value)}>
                <option value="all">Toutes les équipes</option>
                {equipeOptions.map((e) => (
                  <option key={e.id} value={e.id}>{e.nom}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="dashboard-filter-group">
            <div className="dashboard-group-title">Acteurs</div>
            <label>
              <span>Vendeur</span>
              <select value={filterVendeur} onChange={(e) => setFilterVendeur(e.target.value)}>
                <option value="all">Tous les vendeurs</option>
                {(vendeurs || []).map((v) => (
                  <option key={v.id} value={v.id}>{v.nom}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Conducteur</span>
              <select value={filterConducteur} onChange={(e) => setFilterConducteur(e.target.value)}>
                <option value="all">Tous les conducteurs</option>
                {(conducteurs || []).map((c) => (
                  <option key={c.id} value={c.id}>{c.nom}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Type de chantier</span>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="all">Tous les types</option>
                {(typesChantier || []).map((t) => (
                  <option key={t.id} value={t.id}>{t.nom}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="dashboard-filters-actions">
            {hasActiveFilters && (
              <button type="button" className="dashboard-btn ghost" onClick={clearFilters}>Réinitialiser</button>
            )}
          </div>
        </div>

        <div className="dashboard-kpis">
          <div className="dashboard-kpi kpi-hero">
            <div className="kpi-top"><span className="kpi-ico kpi-green-bg">€</span><span>CA réalisé</span></div>
            <strong className="kpi-green">{euro(totalCA)}</strong>
            <small>{filtered.length} chantier(s) · prorata jours ouvrés</small>
          </div>
          <div className="dashboard-kpi">
            <div className="kpi-top"><span className="kpi-ico kpi-blue-bg">🏗</span><span>Chantiers actifs</span></div>
            <strong>{filtered.length}</strong>
            <small>sur {(chantiers || []).length} au total</small>
          </div>
          <div className="dashboard-kpi">
            <div className="kpi-top"><span className="kpi-ico kpi-amber-bg">⌀</span><span>CA moyen / chantier</span></div>
            <strong>{euro(avgCA)}</strong>
            <small>Période {frDate(start)} → {frDate(end)}</small>
          </div>
        </div>

        <div className="dashboard-card dashboard-curve">
          <div className="dashboard-card-head">
            <h3><span className="dashboard-card-ico">📈</span>CA réalisé par mois</h3>
            <span className="dashboard-pill">prorata jours ouvrés</span>
          </div>
          {monthlyHasData ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthly} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="caFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.curve} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={CHART_COLORS.curve} stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line-soft)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} interval="preserveStartEnd" minTickGap={24} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={52} />
                <Tooltip
                  formatter={(v) => [euro(v), 'CA réalisé']}
                  labelFormatter={(_, payload) => {
                    const b = payload && payload[0] && payload[0].payload;
                    return b ? `Mois de ${b.label}` : '';
                  }}
                  contentStyle={{ borderRadius: 10, border: '1px solid var(--line)' }}
                />
                <Area type="monotone" dataKey="value" stroke={CHART_COLORS.curve} strokeWidth={2.5} fill="url(#caFill)" dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="dashboard-empty">Aucun CA sur cette période.</div>
          )}
        </div>

        <div className="dashboard-table-card">
          <div className="dashboard-card-head">
            <h3>CA par entreprise</h3>
            <span className="dashboard-pill">{byCompany.length} entreprise(s)</span>
          </div>
          <div className="dashboard-table-scroll">
            <table className="dashboard-table">
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
                  <tr><td colSpan={5} className="dashboard-table-empty">Aucune entreprise active sur cette période.</td></tr>
                ) : (
                  byCompany.map((e) => {
                    const pct = totalCA ? Math.round((e.value / totalCA) * 100) : 0;
                    return (
                      <tr key={e.name}>
                        <td><strong>{e.name}</strong></td>
                        <td className="num">{e.count}</td>
                        <td className="num"><strong>{euro(e.value)}</strong></td>
                        <td className="num">{pct} %</td>
                        <td>
                          <div className="pct-track">
                            <div className="pct-fill" style={{ width: `${pct}%` }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dashboard-charts">
          <ChartCard
            icon="🤝"
            title="CA par vendeur"
            countLabel={`${byVendeur.length} vendeur(s)`}
            data={byVendeur}
            color={CHART_COLORS.vendeur}
            emptyText="Aucune donnée vendeur sur cette période."
          />
          <ChartCard
            icon="👷"
            title="CA par conducteur"
            countLabel={`${byConducteur.length} conducteur(s)`}
            data={byConducteur}
            color={CHART_COLORS.conducteur}
            emptyText="Aucune donnée conducteur sur cette période."
          />
          <ChartCard
            icon="🏠"
            title="CA par type de chantier"
            countLabel={`${byType.length} type(s)`}
            data={byType}
            color={CHART_COLORS.type}
            emptyText="Aucune donnée par type sur cette période."
          />
        </div>

        <div className="dashboard-charts dashboard-charts-2">
          <div className="dashboard-card">
            <div className="dashboard-card-head">
              <h3><span className="dashboard-card-ico">🏗</span>CA par équipe</h3>
              <span className="dashboard-pill">{byEquipe.length} équipe(s)</span>
            </div>
            {byEquipe.length > 0 && byEquipe.some((d) => d.value > 0 || d.count > 0) ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={byEquipe} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--line-soft)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-18} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={52} />
                  <Tooltip
                    cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                    formatter={(v, _name, props) => [`${euro(v)} (${props?.payload?.count ?? 0} chantier(s))`, 'CA réalisé']}
                    contentStyle={{ borderRadius: 10, border: '1px solid var(--line)' }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={32}>
                    {byEquipe.map((entry, idx) => (
                      <Cell key={`${entry.name}-${idx}`} fill={CHART_COLORS.equipe} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="dashboard-empty">Aucune donnée par équipe sur cette période.</div>
            )}
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-head">
              <h3><span className="dashboard-card-ico">🥧</span>Part des types vendus</h3>
              <span className="dashboard-pill">% du CA</span>
            </div>
            {typeShare.length > 0 && totalCA > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={typeShare}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={2}
                    label={({ percent }) => (percent > 0.05 ? `${Math.round(percent * 100)} %` : '')}
                    labelLine={false}
                  >
                    {typeShare.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(_v, _name, props) => [
                      `${props?.payload?.count ?? 0} chantier(s) · ${props?.payload?.percent ?? 0} % · ${euro(props?.payload?.value)}`,
                      props?.payload?.name ?? '',
                    ]}
                    contentStyle={{ borderRadius: 10, border: '1px solid var(--line)' }}
                  />
                  <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="dashboard-empty">Aucun CA sur cette période.</div>
            )}
          </div>
        </div>

        <div className="dashboard-table-card">
          <div className="dashboard-card-head">
            <h3>CA et chantiers par équipe</h3>
            <span className="dashboard-pill">{byEquipe.length} équipe(s)</span>
          </div>
          <div className="dashboard-table-scroll">
            <table className="dashboard-table">
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
                  <tr><td colSpan={4} className="dashboard-table-empty">Aucune équipe active sur cette période.</td></tr>
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

        <div className="dashboard-table-card">
          <div className="dashboard-card-head">
            <h3>Détail des chantiers</h3>
            <span className="dashboard-pill">{sortedTable.length} ligne(s)</span>
          </div>
          <div className="dashboard-table-scroll">
            <table className="dashboard-table">
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
                  <tr><td colSpan={10} className="dashboard-table-empty">Aucun chantier actif sur cette période — élargis les dates ou réinitialise les filtres.</td></tr>
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
                          ? <span className="tag" style={{ background: `${vendeurColor.get(c.vendeurId) || '#16a34a'}22`, borderColor: vendeurColor.get(c.vendeurId) || '#16a34a', color: vendeurColor.get(c.vendeurId) || '#16a34a' }}>{vendeurMap.get(c.vendeurId)}</span>
                          : <span className="muted">-</span>}
                      </td>
                      <td>
                        {typeMap.get(c.typeChantierId)
                          ? <span className="tag" style={{ background: `${typeColor.get(c.typeChantierId) || '#eab308'}22`, borderColor: typeColor.get(c.typeChantierId) || '#eab308', color: typeColor.get(c.typeChantierId) || '#eab308' }}>{typeMap.get(c.typeChantierId)}</span>
                          : <span className="muted">-</span>}
                      </td>
                      <td>
                        {conducteurMap.get(c.conducteurId)
                          ? <span className="tag" style={{ background: `${conducteurColor.get(c.conducteurId) || '#2563eb'}22`, borderColor: conducteurColor.get(c.conducteurId) || '#2563eb', color: conducteurColor.get(c.conducteurId) || '#2563eb' }}>{conducteurMap.get(c.conducteurId)}</span>
                          : <span className="muted">-</span>}
                      </td>
                      <td>{equipeMap.get(c.equipe) || <span className="muted">-</span>}</td>
                      <td className="num"><strong>{euro(c.montant_devis)}</strong></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="dashboard-footnote">Montants contractuels par chantier — les totaux du haut sont proratisés aux jours ouvrés sur la période.</div>
        </div>
      </div>
    </div>
  );
}
