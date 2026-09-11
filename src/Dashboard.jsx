import { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';

const CHART_COLORS = {
  vendeur: '#16a34a',
  conducteur: '#2563eb',
  type: '#eab308',
};

function getExerciceForDate(d) {
  const date = d instanceof Date ? d : new Date(d);
  const year = date.getFullYear();
  const sept1 = new Date(year, 8, 1);
  if (date >= sept1) {
    return { start: new Date(year, 8, 1), end: new Date(year + 1, 7, 31) };
  }
  return { start: new Date(year - 1, 8, 1), end: new Date(year, 7, 31) };
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

function groupCA(list, getKey, getNom) {
  const map = new Map();
  for (const c of list) {
    const key = getKey(c);
    const nom = getNom(key);
    map.set(nom, (map.get(nom) || 0) + (Number(c.montant_devis) || 0));
  }
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function ChartCard({ title, countLabel, data, color, emptyText }) {
  const hasData = data.length > 0 && data.some((d) => d.value > 0);
  return (
    <div className="dashboard-card">
      <div className="dashboard-card-head">
        <h3>{title}</h3>
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
              formatter={(v) => [euro(v), 'CA']}
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

export default function Dashboard({ chantiers, vendeurs, conducteurs, typesChantier, onClose }) {
  const defaultEx = useMemo(() => getExerciceForDate(new Date()), []);
  const [start, setStart] = useState(() => formatDateInput(defaultEx.start));
  const [end, setEnd] = useState(() => formatDateInput(defaultEx.end));
  const [filterVendeur, setFilterVendeur] = useState('all');
  const [filterConducteur, setFilterConducteur] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const vendeurMap = useMemo(() => new Map((vendeurs || []).map((v) => [v.id, v.nom])), [vendeurs]);
  const conducteurMap = useMemo(() => new Map((conducteurs || []).map((c) => [c.id, c.nom])), [conducteurs]);
  const typeMap = useMemo(() => new Map((typesChantier || []).map((t) => [t.id, t.nom])), [typesChantier]);

  const filtered = useMemo(() => {
    const s = start || '1900-01-01';
    const e = end || '2100-12-31';
    return (chantiers || []).filter((c) => {
      if ((c.start || '') < s || (c.start || '') > e) return false;
      if (filterVendeur !== 'all' && String(c.vendeurId ?? 0) !== String(filterVendeur)) return false;
      if (filterConducteur !== 'all' && String(c.conducteurId ?? 0) !== String(filterConducteur)) return false;
      if (filterType !== 'all' && String(c.typeChantierId ?? 0) !== String(filterType)) return false;
      return true;
    });
  }, [chantiers, start, end, filterVendeur, filterConducteur, filterType]);

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
  }

  function clearFilters() {
    setFilterVendeur('all');
    setFilterConducteur('all');
    setFilterType('all');
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-inner">
        <div className="dashboard-topbar">
          <div>
            <h1>Dashboard</h1>
            <p>Chiffre d'affaires par période, vendeur, conducteur et type de chantier.</p>
          </div>
          <button type="button" className="dashboard-close" onClick={onClose}>× Fermer</button>
        </div>

        <div className="dashboard-filters">
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
          <div className="dashboard-filters-actions">
            <button type="button" className="dashboard-btn ghost" onClick={clearFilters}>Réinitialiser</button>
            <button type="button" className="dashboard-btn primary" onClick={resetExercice}>Exercice 1 sept → 31 août</button>
          </div>
        </div>

        <div className="dashboard-kpis">
          <div className="dashboard-kpi">
            <span>CA total</span>
            <strong className="kpi-green">{euro(totalCA)}</strong>
            <small>{filtered.length} chantier(s)</small>
          </div>
          <div className="dashboard-kpi">
            <span>CA moyen / chantier</span>
            <strong>{euro(avgCA)}</strong>
            <small>Période {start} → {end}</small>
          </div>
          <div className="dashboard-kpi">
            <span>Chantiers filtrés</span>
            <strong>{filtered.length}</strong>
            <small>sur {(chantiers || []).length} au total</small>
          </div>
        </div>

        <div className="dashboard-charts">
          <ChartCard
            title="CA par vendeur"
            countLabel={`${byVendeur.length} vendeur(s)`}
            data={byVendeur}
            color={CHART_COLORS.vendeur}
            emptyText="Aucune donnée vendeur sur cette période."
          />
          <ChartCard
            title="CA par conducteur"
            countLabel={`${byConducteur.length} conducteur(s)`}
            data={byConducteur}
            color={CHART_COLORS.conducteur}
            emptyText="Aucune donnée conducteur sur cette période."
          />
          <ChartCard
            title="CA par type de chantier"
            countLabel={`${byType.length} type(s)`}
            data={byType}
            color={CHART_COLORS.type}
            emptyText="Aucune donnée par type sur cette période."
          />
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
                  <th>Client</th>
                  <th>Vendeur</th>
                  <th>Type</th>
                  <th>Conducteur</th>
                  <th className="num">CA</th>
                </tr>
              </thead>
              <tbody>
                {sortedTable.length === 0 ? (
                  <tr><td colSpan={7} className="dashboard-table-empty">Aucun chantier dans cette période</td></tr>
                ) : (
                  sortedTable.map((c) => (
                    <tr key={c.id}>
                      <td className="mono">{c.numero_chantier || '-'}</td>
                      <td><strong>{c.nom}</strong></td>
                      <td>{c.client_nom || <span className="muted">-</span>}</td>
                      <td>{vendeurMap.get(c.vendeurId) || <span className="muted">-</span>}</td>
                      <td>{typeMap.get(c.typeChantierId) || <span className="muted">-</span>}</td>
                      <td>{conducteurMap.get(c.conducteurId) || <span className="muted">-</span>}</td>
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
