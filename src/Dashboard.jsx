import { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
  PieChart, Pie, Legend,
} from 'recharts';

const CHART_COLORS = {
  vendeur: '#16a34a',
  conducteur: '#2563eb',
  type: '#eab308',
  equipe: '#8b5cf6',
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

// Fin estimée = start + (duree - 1) jours ouvrés (lun-ven, sans les fériés).
// Approximation suffisante pour dire si un chantier est actif sur la période.
function chantierEndDate(c) {
  if (!c.start) return '2100-12-31';
  const dur = Math.max(1, Number(c.duree) || 1);
  const [y, m, d] = String(c.start).split(' ')[0].split('-').map(Number);
  if (!y || !m || !d) return String(c.start).split(' ')[0];
  const date = new Date(y, m - 1, d);
  let counted = 1;
  let guard = 0;
  while (counted < dur && guard < 1200) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) counted += 1;
    guard += 1;
  }
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

function groupCA(list, getKey, getNom) {
  const map = new Map();
  for (const c of list) {
    const key = getKey(c);
    const nom = getNom(key);
    const entry = map.get(nom) || { name: nom, value: 0, count: 0 };
    entry.value += Number(c.montant_devis) || 0;
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
              formatter={(v, _name, props) => [`${euro(v)} (${props?.payload?.count ?? 0} chantier(s))`, 'CA']}
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

export default function Dashboard({ chantiers, vendeurs, conducteurs, typesChantier, equipes, onClose }) {
  const defaultEx = useMemo(() => getExerciceForDate(new Date()), []);
  const [start, setStart] = useState(() => formatDateInput(defaultEx.start));
  const [end, setEnd] = useState(() => formatDateInput(defaultEx.end));
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

  const filtered = useMemo(() => {
    const s = start || '1900-01-01';
    const e = end || '2100-12-31';
    return (chantiers || []).filter((c) => {
      const cs = String(c.start || '').split(' ')[0];
      if (!cs) return false;
      // chevauchement : compte aussi les chantiers déjà commencés avant le début
      // mais encore en cours dessus (fin estimée >= début période)
      const ce = chantierEndDate(c);
      if (cs > e || ce < s) return false;
      if (filterVendeur !== 'all' && String(c.vendeurId ?? 0) !== String(filterVendeur)) return false;
      if (filterConducteur !== 'all' && String(c.conducteurId ?? 0) !== String(filterConducteur)) return false;
      if (filterType !== 'all' && String(c.typeChantierId ?? 0) !== String(filterType)) return false;
      if (filterEquipe !== 'all' && String(c.equipe ?? 0) !== String(filterEquipe)) return false;
      return true;
    });
  }, [chantiers, start, end, filterVendeur, filterConducteur, filterType, filterEquipe]);

  const startedBefore = useMemo(() => {
    const s = start || '1900-01-01';
    return filtered.filter((c) => String(c.start || '').split(' ')[0] < s).length;
  }, [filtered, start]);

  const totalCA = useMemo(
    () => filtered.reduce((sum, c) => sum + (Number(c.montant_devis) || 0), 0),
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

  // Part de chaque type (en % du nombre de chantiers, ex : 40 % Fosse, 20 % STEP)
  const typeShare = useMemo(() => {
    const total = filtered.length || 1;
    const counts = new Map();
    for (const c of filtered) {
      const k = c.typeChantierId || 0;
      const nom = typeMap.get(k) || (k === 0 ? 'Non assigné' : `#${k}`);
      const entry = counts.get(nom) || { name: nom, count: 0, value: 0, color: typeColor.get(k) };
      entry.count += 1;
      entry.value += Number(c.montant_devis) || 0;
      counts.set(nom, entry);
    }
    return Array.from(counts.values())
      .map((e, i) => ({ ...e, percent: Math.round((e.count / total) * 100), fill: e.color || PIE_FALLBACK[i % PIE_FALLBACK.length] }))
      .sort((a, b) => b.count - a.count);
  }, [filtered, typeMap, typeColor]);

  const sortedTable = useMemo(
    () => [...filtered].sort((a, b) => (Number(b.montant_devis) || 0) - (Number(a.montant_devis) || 0)),
    [filtered]
  );

  function resetExercice() {
    const ex = getExerciceForDate(new Date());
    setStart(formatDateInput(ex.start));
    setEnd(formatDateInput(ex.end));
    setFilterVendeur('all');
    setFilterConducteur('all');
    setFilterType('all');
    setFilterEquipe('all');
  }

  function clearFilters() {
    setFilterVendeur('all');
    setFilterConducteur('all');
    setFilterType('all');
    setFilterEquipe('all');
  }

  const hasActiveFilters = filterVendeur !== 'all' || filterConducteur !== 'all' || filterType !== 'all' || filterEquipe !== 'all';

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
          <div className="dashboard-filters-title">Filtres</div>
          <label>
            <span>Début</span>
            <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </label>
          <label>
            <span>Fin</span>
            <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          </label>
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
          <label>
            <span>Équipe</span>
            <select value={filterEquipe} onChange={(e) => setFilterEquipe(e.target.value)}>
              <option value="all">Toutes les équipes</option>
              {(equipes || []).map((e) => (
                <option key={e.id} value={e.id}>{e.nom}</option>
              ))}
            </select>
          </label>
          <div className="dashboard-filters-actions">
            {hasActiveFilters && (
              <button type="button" className="dashboard-btn ghost" onClick={clearFilters}>Réinitialiser</button>
            )}
            <button type="button" className="dashboard-btn primary" onClick={resetExercice}>Exercice 1 sept → 31 août</button>
          </div>
        </div>

        <div className="dashboard-kpis">
          <div className="dashboard-kpi kpi-hero">
            <div className="kpi-top"><span className="kpi-ico kpi-green-bg">€</span><span>CA total</span></div>
            <strong className="kpi-green">{euro(totalCA)}</strong>
            <small>{filtered.length} chantier(s) · {startedBefore} en cours au début</small>
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
                    formatter={(v, _name, props) => [`${euro(v)} (${props?.payload?.count ?? 0} chantier(s))`, 'CA']}
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
              <span className="dashboard-pill">% chantiers</span>
            </div>
            {typeShare.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={typeShare}
                    dataKey="count"
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
              <div className="dashboard-empty">Aucun chantier sur cette période.</div>
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
                  <th className="num">CA total</th>
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
                  <th>Client</th>
                  <th>Vendeur</th>
                  <th>Type</th>
                  <th>Conducteur</th>
                  <th>Équipe</th>
                  <th className="num">CA</th>
                </tr>
              </thead>
              <tbody>
                {sortedTable.length === 0 ? (
                  <tr><td colSpan={9} className="dashboard-table-empty">Aucun chantier actif sur cette période — élargis les dates ou réinitialise les filtres.</td></tr>
                ) : (
                  sortedTable.map((c) => (
                    <tr key={c.id}>
                      <td className="mono">{c.numero_chantier || '-'}</td>
                      <td><strong>{c.nom}</strong></td>
                      <td>{frDate(String(c.start || '').split(' ')[0])}</td>
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
        </div>
      </div>
    </div>
  );
}
