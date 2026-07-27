import { useMemo } from 'react';
import './MobilePlanning.css';

function fmt(d) {
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}

function parseDate(s) {
  return new Date(s + 'T12:00:00');
}

export default function MobilePlanning({
  chantiers, conges, teams, conducteurs, companies,
  canEdit, session,
  onEditChantier, onEditConge, onAddChantier,
  onDeleteChantier, onDeleteConge,
  getEndDateForChantier, getConducteur, addWorkingDays,
}) {
  const sections = useMemo(() => {
    return companies.map(comp => {
      const compTeams = teams
        .filter(t => t.companyId === comp.id)
        .sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0))
        .map(team => {
          const items = [];

          for (const c of chantiers) {
            if (c.equipe !== team.id) continue;
            const endDate = getEndDateForChantier(c);
            const cond = getConducteur(c.conducteurId);
            items.push({
              type: 'chantier', data: c, sortKey: c.start,
              endDate, conducteur: cond,
            });
          }

          for (const c of conges) {
            if (c.equipe !== team.id && !(c.allEquipes && c.companyId === comp.id)) continue;
            const end = addWorkingDays(c.start, c.duree, c.equipe || 0, { countConges: true });
            items.push({
              type: 'conge', data: c, sortKey: c.start,
              endDate: end,
            });
          }

          items.sort((a, b) => a.sortKey.localeCompare(b.sortKey));

          return { team, items };
        })
        .filter(s => s.items.length > 0);

      return { company: comp, teams: compTeams };
    }).filter(s => s.teams.length > 0);
  }, [chantiers, conges, teams, companies, getEndDateForChantier, getConducteur, addWorkingDays]);

  function handleDelete(e, id) {
    e.stopPropagation();
    if (!window.confirm('Supprimer cet élément ?')) return;
    const item = [...chantiers, ...conges].find(x => x.id === id);
    if (!item) return;
    if ('conducteurId' in item) onDeleteChantier(id);
    else onDeleteConge(id);
  }

  return (
    <div className="mobile-planning">
      {companies.length > 0 && (
        <div className="mp-company-name">
          {companies[0].nom}
          {companies.length > 1 && <span className="mp-company-count"> +{companies.length - 1}</span>}
        </div>
      )}

      {sections.map(({ company, teams: secTeams }) =>
        secTeams.map(({ team, items }) => (
          <div key={team.id} className="mp-team-section">
            <div className="mp-team-header">{team.nom}</div>

            {items.map(item => {
              const isChantier = item.type === 'chantier';
              const c = item.data;

              if (isChantier) {
                return (
                  <div
                    key={`ch-${c.id}`}
                    className="mp-card mp-card-chantier"
                    onClick={() => onEditChantier(c)}
                  >
                    <div className="mp-card-color" style={{ background: c.color }} />
                    <div className="mp-card-body">
                      <div className="mp-card-title-row">
                        <span className="mp-card-title">{c.nom}</span>
                        {canEdit && (
                          <button className="mp-card-delete" onClick={(e) => handleDelete(e, c.id)}>×</button>
                        )}
                      </div>
                      <div className="mp-card-meta">
                        <span>{fmt(parseDate(c.start))} → {fmt(parseDate(item.endDate))}</span>
                        <span className="mp-card-duree">{c.duree}j</span>
                      </div>
                      {item.conducteur && (
                        <div className="mp-card-conducteur">{item.conducteur.nom}</div>
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={`cg-${c.id}`}
                  className="mp-card mp-card-conge"
                  onClick={() => onEditConge(c)}
                >
                  <div className="mp-card-color mp-card-color-conge" />
                  <div className="mp-card-body">
                    <div className="mp-card-title-row">
                      <span className="mp-card-title">{c.nom || 'Congé'}</span>
                      {canEdit && (
                        <button className="mp-card-delete" onClick={(e) => handleDelete(e, c.id)}>×</button>
                      )}
                    </div>
                    <div className="mp-card-meta">
                      <span>{fmt(parseDate(c.start))} → {fmt(parseDate(item.endDate))}</span>
                      <span className="mp-card-duree">{c.duree}j</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))
      )}

      {sections.length === 0 && (
        <div className="mp-empty">
          <p>Aucun chantier ni congé</p>
        </div>
      )}

      {canEdit && (
        <button className="mp-fab" onClick={onAddChantier} aria-label="Créer un chantier">
          +
        </button>
      )}
    </div>
  );
}
