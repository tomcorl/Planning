import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

function formatEuro(n) {
  if (!n) return '0 €';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}
function formatEuroShort(n) {
  if (n >= 100000) return Math.round(n/1000) + ' k€';
  if (n >= 1000) return (n/1000).toFixed(1).replace('.', ',') + ' k€';
  return n + ' €';
}

function addDaysStr(dateStr, days) {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0,10);
}

export default function CAModal({ chantiers, teams, today, getEndDateForChantier, onClose }) {
  // range par défaut : aujourd'hui -> +4 mois ou max end
  const maxEnd = useMemo(() => {
    let m = today;
    for (const c of chantiers) {
      try {
        const e = getEndDateForChantier(c);
        if (e > m) m = e;
      } catch {}
    }
    return m;
  }, [chantiers, getEndDateForChantier, today]);

  const defaultTo = useMemo(() => {
    const d = addDaysStr(today, 120);
    return d > maxEnd ? maxEnd : d;
  }, [today, maxEnd]);

  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(defaultTo);

  const filtered = useMemo(() => {
    return chantiers.filter(c => {
      const end = getEndDateForChantier(c);
      if (end < today) return false; // pas terminé à aujourd'hui
      // chevauche la période choisie
      if (end < from) return false;
      if (c.start > to) return false;
      return true;
    });
  }, [chantiers, getEndDateForChantier, today, from, to]);

  const kpis = useMemo(() => {
    const total = filtered.reduce((s,c)=> s + Number(c.montantDevis||0), 0);
    const nb = filtered.length;
    return { total, nb };
  }, [filtered]);

  // agrégation par mois (basé sur start)
  const byMonth = useMemo(() => {
    const map = new Map();
    for (const c of filtered) {
      const m = c.start.slice(0,7); // YYYY-MM
      const cur = map.get(m) || { month: m, ca: 0, nb: 0 };
      cur.ca += Number(c.montantDevis||0);
      cur.nb += 1;
      map.set(m, cur);
    }
    const arr = [...map.values()].sort((a,b)=>a.month.localeCompare(b.month));
    // format label
    return arr.map(r => {
      const [y,m] = r.month.split('-');
      const d = new Date(Number(y), Number(m)-1, 1);
      const label = d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }).replace('.', '');
      return { ...r, label };
    });
  }, [filtered]);

  // cumul
  const cumul = useMemo(() => {
    let c = 0;
    return byMonth.map(r => { c += r.ca; return { ...r, cumul: c }; });
  }, [byMonth]);

  // par équipe
  const byTeam = useMemo(() => {
    const map = new Map();
    for (const c of filtered) {
      const t = teams.find(x=>x.id===c.equipe);
      const name = t ? t.nom : `Équipe ${c.equipe}`;
      const cur = map.get(name) || { name, ca: 0, nb: 0 };
      cur.ca += Number(c.montantDevis||0);
      cur.nb += 1;
      map.set(name, cur);
    }
    return [...map.values()].sort((a,b)=>b.ca-a.ca).slice(0,6);
  }, [filtered, teams]);

  const presets = [
    { label: '30j', get: () => [today, addDaysStr(today,30)] },
    { label: '3 mois', get: () => [today, addDaysStr(today,90)] },
    { label: '6 mois', get: () => [today, addDaysStr(today,180)] },
    { label: 'Tout futur', get: () => [today, maxEnd] },
  ];

  return (
    <div className="modal-bg" onMouseDown={onClose}>
      <div className="modal modal--ca" onMouseDown={e=>e.stopPropagation()}>
        <div className="ca-header">
          <div className="ca-header-left">
            <div className="ca-header-icon">📊</div>
            <div>
              <h2>CA estimé — après aujourd’hui</h2>
              <p>{filtered.length} chantier{filtered.length!==1?'s':''} non terminé{filtered.length!==1?'s':''} • {formatEuro(kpis.total)} HT</p>
            </div>
          </div>
          <button className="modal-header-close" onClick={onClose} aria-label="Fermer">×</button>
        </div>

        <div className="ca-filters">
          <div className="ca-date-group">
            <label>Du <input type="date" value={from} onChange={e=>setFrom(e.target.value)} /></label>
            <span className="ca-sep">→</span>
            <label>Au <input type="date" value={to} onChange={e=>setTo(e.target.value)} /></label>
          </div>
          <div className="ca-presets">
            {presets.map(p=>(
              <button key={p.label} className="ca-preset" onClick={()=>{const [a,b]=p.get(); setFrom(a); setTo(b);}}>{p.label}</button>
            ))}
          </div>
        </div>

        <div className="ca-scroll">
        <div className="ca-kpis ca-kpis--2">
          <div className="ca-kpi ca-kpi--primary">
            <span className="ca-kpi-label">CA estimé (somme devis)</span>
            <strong className="ca-kpi-value">{formatEuro(kpis.total)}</strong>
            <small>addition des montants sur la période</small>
          </div>
          <div className="ca-kpi">
            <span className="ca-kpi-label">Chantiers concernés</span>
            <strong className="ca-kpi-value">{kpis.nb}</strong>
            <small>non terminés au {new Date(today+'T12:00:00').toLocaleDateString('fr-FR')}</small>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="ca-empty">
            <span>📭</span>
            <p>Aucun chantier dans cette période</p>
            <small>Élargis les dates ou vérifie les montants de devis</small>
          </div>
        ) : (
          <div className="ca-charts">
            <div className="ca-chart-card">
              <h3>CA par mois (début chantier)</h3>
              <div style={{height:220}}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--line-soft)" />
                    <XAxis dataKey="label" tick={{fontSize:11}} stroke="var(--muted)" />
                    <YAxis tickFormatter={formatEuroShort} tick={{fontSize:11}} stroke="var(--muted)" width={70} />
                    <Tooltip formatter={(v)=>formatEuro(v)} contentStyle={{borderRadius:10, border:'1px solid var(--line)'}} />
                    <Bar dataKey="ca" fill="#16a34a" radius={[8,8,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="ca-chart-card">
              <h3>Cumul CA</h3>
              <div style={{height:220}}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cumul}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--line-soft)" />
                    <XAxis dataKey="label" tick={{fontSize:11}} stroke="var(--muted)" />
                    <YAxis tickFormatter={formatEuroShort} tick={{fontSize:11}} stroke="var(--muted)" width={70} />
                    <Tooltip formatter={(v)=>formatEuro(v)} contentStyle={{borderRadius:10}} />
                    <Area type="monotone" dataKey="cumul" stroke="#16a34a" fill="rgba(22,163,74,0.15)" strokeWidth={2.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {byTeam.length > 0 && (
          <div className="ca-team-chart">
            <h3>Répartition par équipe</h3>
            <div style={{height:180}}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byTeam} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--line-soft)" />
                  <XAxis type="number" tickFormatter={formatEuroShort} tick={{fontSize:11}} stroke="var(--muted)" />
                  <YAxis type="category" dataKey="name" tick={{fontSize:11}} stroke="var(--muted)" width={90} />
                  <Tooltip formatter={(v)=>formatEuro(v)} />
                  <Bar dataKey="ca" fill="#2563eb" radius={[0,8,8,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="ca-table-wrap">
          <h3>Détail ({filtered.length})</h3>
          <div className="ca-table">
            <div className="ca-table-head">
              <span>Chantier</span><span>Équipe</span><span>Début</span><span>Fin</span><span>Montant</span>
            </div>
            {[...filtered].sort((a,b)=>a.start.localeCompare(b.start)).slice(0,50).map(c=>{
              const team = teams.find(t=>t.id===c.equipe)?.nom || `Éq ${c.equipe}`;
              const end = getEndDateForChantier(c);
              const montant = Number(c.montantDevis||0);
              return (
                <div key={c.id} className="ca-table-row">
                  <span className="ca-ellipsis" title={c.nom}>{c.nom}</span>
                  <span>{team}</span>
                  <span>{new Date(c.start+'T12:00:00').toLocaleDateString('fr-FR')}</span>
                  <span>{new Date(end+'T12:00:00').toLocaleDateString('fr-FR')}</span>
                  <span className={montant? 'ca-montant':'ca-montant ca-montant--zero'}>{montant? formatEuro(montant): '—'}</span>
                </div>
              );
            })}
          </div>
          {filtered.length>50 && <small className="ca-more">+ {filtered.length-50} autres — affine les dates</small>}
        </div>
        </div>

        <div className="modal-footer modal-footer--pro">
          <small style={{color:'var(--muted)'}}>Somme des devis — chantiers non terminés au {new Date(today+'T12:00:00').toLocaleDateString('fr-FR')}</small>
          <button className="modal-btn-cancel" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}
