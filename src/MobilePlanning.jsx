import { useMemo } from 'react';
import './MobilePlanning.css';
import { CATEGORIES as DEFAULT_CATEGORIES } from './lib/categories.js';

function fmt(d) {
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}

function parseDate(s) {
  return new Date(s + 'T12:00:00');
}

export default function MobilePlanning({
  chantiers, conges, teams, companies,
  categories,
  canEdit, session,
  onEditChantier, onEditConge, onAddChantier,
  onDeleteChantier, onDeleteConge,
  getEndDateForChantier, addWorkingDays,
}) {
  const catList = categories || DEFAULT_CATEGORIES;
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
            items.push({
              type: 'chantier', data: c, sortKey: c.start,
              endDate,
            });
          }

          for (const c of conges) {
            if (c.equipe !== team.id && !(c.allEquipes && c.companyId === comp.id)) continue;
            const endObj = new Date(parseDate(c.start));
            endObj.setDate(endObj.getDate() + (c.duree || 1) - 1);
            const end = endObj.toISOString().slice(0, 10);
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
  }, [chantiers, conges, teams, companies, getEndDateForChantier, addWorkingDays]);

  const categorySections = useMemo(() => {
    return catList.map(cat => {
      const items = chantiers
        .filter(c => c.equipe === cat.equipe)
        .map(c => ({ type: 'chantier', data: c, sortKey: c.start, endDate: getEndDateForChantier(c) }))
        .sort((a, b) => a.sortKey.localeCompare(b.sortKey));
      return { cat, items };
    });
  }, [chantiers, catList, getEndDateForChantier]);

  function handleDelete(e, id) {
    e.stopPropagation();
    if (!window.confirm('Supprimer cet élément ?')) return;
    const item = [...chantiers, ...conges].find(x => x.id === id);
    if (!item) return;
    if ('allEquipes' in item) onDeleteConge(id);
    else onDeleteChantier(id);
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
            <div className="mp-team-header" style={{ borderLeft: `4px solid ${team.color || '#7dd3fc'}` }}>{team.nom}</div>

            {items.map(item => {
              const isChantier = item.type === 'chantier';
              const c = item.data;

              if (isChantier) {
                const hasBadges = c.permis || c.financement || c.danger || c.reunion || c.facture;
                return (
                  <div
                    key={`ch-${c.id}`}
                    className={`mp-card mp-card-chantier ${c.facture ? 'mp-card-facture' : ''}`}
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
                      {hasBadges && (
                        <div className="mp-card-badges">
                          {c.permis && <span title="Permis de construire">📄</span>}
                          {c.financement && <span title="Financement">💶</span>}
                          {c.danger && <span title="Danger">⚠️</span>}
                          {c.reunion && <span title="Réunion">👥</span>}
                          {c.facture && <span className="mp-card-facture-badge" title="Facturé">€</span>}
                        </div>
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

      {categorySections.some(({ items }) => items.length > 0) && (
        <div className="mp-category-section">
          {categorySections.map(({ cat, items }) =>
            items.length > 0 && (
              <div key={cat.equipe} className="mp-team-section">
                <div className="mp-category-header">{cat.nom}</div>
                {items.map((item) => {
                  const c = item.data;
                  const hasBadges = c.permis || c.financement || c.danger || c.reunion || c.facture;
                  return (
                    <div
                      key={`ch-${c.id}`}
                      className={`mp-card mp-card-chantier ${c.facture ? 'mp-card-facture' : ''}`}
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
                        {hasBadges && (
                          <div className="mp-card-badges">
                            {c.permis && <span title="Permis de construire">📄</span>}
                            {c.financement && <span title="Financement">💶</span>}
                            {c.danger && <span title="Danger">⚠️</span>}
                            {c.reunion && <span title="Réunion">👥</span>}
                            {c.facture && <span className="mp-card-facture-badge" title="Facturé">€</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      )}

      {sections.length === 0 && categorySections.every(({ items }) => items.length === 0) && (
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
