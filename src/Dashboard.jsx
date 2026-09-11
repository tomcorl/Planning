import { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

function getExerciceForDate(d) {
  const date = d instanceof Date ? d : new Date(d);
  const year = date.getFullYear();
  const sept1 = new Date(year, 8, 1); // 1 sept (month 8)
  if (date >= sept1) {
    return { start: new Date(year, 8, 1), end: new Date(year + 1, 7, 31), label: `${year}/${year + 1}` };
  } else {
    return { start: new Date(year - 1, 8, 1), end: new Date(year, 7, 31), label: `${year - 1}/${year}` };
  }
}

function formatDateInput(d) {
  const date = d instanceof Date ? d : new Date(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function Dashboard({ chantiers, vendeurs, conducteurs, typesChantier, onClose }) {
  const defaultEx = useMemo(() => getExerciceForDate(new Date()), []);
  const [start, setStart] = useState(() => formatDateInput(defaultEx.start));
  const [end, setEnd] = useState(() => formatDateInput(defaultEx.end));

  const vendeurMap = useMemo(() => new Map(vendeurs.map(v => [v.id, v.nom])), [vendeurs]);
  const conducteurMap = useMemo(() => new Map(conducteurs.map(c => [c.id, c.nom])), [conducteurs]);
  const typeMap = useMemo(() => new Map(typesChantier.map(t => [t.id, t.nom])), [typesChantier]);

  const filtered = useMemo(() => {
    const s = start || '1900-01-01';
    const e = end || '2100-12-31';
    return chantiers.filter(c => c.start >= s && c.start <= e);
  }, [chantiers, start, end]);

  const totalCA = useMemo(() => filtered.reduce((sum, c) => sum + (Number(c.montant_devis) || 0), 0), [filtered]);

  const byVendeur = useMemo(() => {
    const map = new Map();
    for (const c of filtered) {
      const key = c.vendeurId || 0;
      const nom = vendeurMap.get(key) || (key === 0 ? 'Non assigné' : `#${key}`);
      map.set(nom, (map.get(nom) || 0) + (Number(c.montant_devis) || 0));
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filtered, vendeurMap]);

  const byConducteur = useMemo(() => {
    const map = new Map();
    for (const c of filtered) {
      const key = c.conducteurId || 0;
      const nom = conducteurMap.get(key) || (key === 0 ? 'Non assigné' : `#${key}`);
      map.set(nom, (map.get(nom) || 0) + (Number(c.montant_devis) || 0));
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filtered, conducteurMap]);

  const byType = useMemo(() => {
    const map = new Map();
    for (const c of filtered) {
      const key = c.typeChantierId || 0;
      const nom = typeMap.get(key) || (key === 0 ? 'Non assigné' : `#${key}`);
      map.set(nom, (map.get(nom) || 0) + (Number(c.montant_devis) || 0));
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filtered, typeMap]);

  const setExercice = () => {
    const ex = getExerciceForDate(new Date());
    setStart(formatDateInput(ex.start));
    setEnd(formatDateInput(ex.end));
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg)', zIndex: 9999, overflow: 'auto', padding: 24 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900 }}>Dashboard CA</h1>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', cursor: 'pointer' }}>Fermer</button>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'end', flexWrap: 'wrap', marginBottom: 20, padding: 16, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, fontWeight: 700 }}>
            Début
            <input type="date" value={start} onChange={(e) => setStart(e.target.value)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface-2)' }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, fontWeight: 700 }}>
            Fin
            <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface-2)' }} />
          </label>
          <button onClick={setExercice} style={{ padding: '8px 16px', borderRadius: 8, background: 'var(--green)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Exercice en cours (1 sept → 31 août)</button>
          <div style={{ marginLeft: 'auto', fontSize: 14, color: 'var(--muted)' }}>{filtered.length} chantier(s) dans la période</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 20 }}>
          <div style={{ padding: 20, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 16, boxShadow: '0 4px 12px var(--shadow)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CA total</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--green)', marginTop: 8 }}>{totalCA.toLocaleString('fr-FR')} €</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16, marginBottom: 20 }}>
          <div style={{ padding: 16, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 16 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 800 }}>CA par vendeur</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byVendeur}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line-soft)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => `${Number(v).toLocaleString('fr-FR')} €`} />
                <Bar dataKey="value" fill="#16a34a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ padding: 16, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 16 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 800 }}>CA par conducteur</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byConducteur}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line-soft)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => `${Number(v).toLocaleString('fr-FR')} €`} />
                <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ padding: 16, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 16 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 800 }}>CA par type de chantier</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byType}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line-soft)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => `${Number(v).toLocaleString('fr-FR')} €`} />
                <Bar dataKey="value" fill="#eab308" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', fontWeight: 800 }}>Détail des chantiers</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px', borderBottom: '1px solid var(--line)' }}>N°</th>
                  <th style={{ padding: '10px 12px', borderBottom: '1px solid var(--line)' }}>Nom</th>
                  <th style={{ padding: '10px 12px', borderBottom: '1px solid var(--line)' }}>Client</th>
                  <th style={{ padding: '10px 12px', borderBottom: '1px solid var(--line)' }}>Vendeur</th>
                  <th style={{ padding: '10px 12px', borderBottom: '1px solid var(--line)' }}>Type</th>
                  <th style={{ padding: '10px 12px', borderBottom: '1px solid var(--line)' }}>Conducteur</th>
                  <th style={{ padding: '10px 12px', borderBottom: '1px solid var(--line)', textAlign: 'right' }}>CA</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: 20, textAlign: 'center', color: 'var(--muted)' }}>Aucun chantier dans cette période</td></tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                      <td style={{ padding: '8px 12px' }}>{c.numero_chantier || '-'}</td>
                      <td style={{ padding: '8px 12px', fontWeight: 600 }}>{c.nom}</td>
                      <td style={{ padding: '8px 12px' }}>{c.client_nom || '-'}</td>
                      <td style={{ padding: '8px 12px' }}>{vendeurMap.get(c.vendeurId) || '-'}</td>
                      <td style={{ padding: '8px 12px' }}>{typeMap.get(c.typeChantierId) || '-'}</td>
                      <td style={{ padding: '8px 12px' }}>{conducteurMap.get(c.conducteurId) || '-'}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700 }}>{(Number(c.montant_devis) || 0).toLocaleString('fr-FR')} €</td>
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
