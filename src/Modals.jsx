const CHANTIER_COLORS = [
  '#2563eb',
  '#93c5fd',
  '#eab308',
  '#15803d',
  '#6b7280',
  '#f97316',
  '#7dd3fc',
];
const CONDUCTEUR_COLORS = [
  '#2563eb', '#16a34a', '#dc2626', '#9333ea',
  '#ea580c', '#0891b2', '#ca8a04', '#be123c',
];

export default function Modals({
  modal, setModal,
  form, setForm,
  modalEndDate,
  companies, teams,
  chantierColors, setChantierColors,
  conducteurColors, setConducteurColors,
  setColorManager, colorManager,
  holidayModalOpen, setHolidayModalOpen,
  ferieForm, setFerieForm,
  customFeries, setCustomFeries,
  conducteurs, setConducteurs,
  contextMenu, setContextMenu,
  clipboard, setClipboard,
  chantiers, conges,
  canEdit,
  saveModal, closeModal, deleteSelectedItem,
  pasteClipboard, addCustomFerie, nextLocalId, commit,
}) {
  return (
    <>
      {contextMenu && (
        <div className="context-menu" style={{ left: contextMenu.x, top: contextMenu.y }}>
          {contextMenu.type !== 'cell' && (
            <button onClick={() => {
              const item = contextMenu.type === 'chantier'
                ? chantiers.find((c) => c.id === contextMenu.id)
                : conges.find((c) => c.id === contextMenu.id);
              if (item) setClipboard({ ...item, sourceType: contextMenu.type });
              setContextMenu(null);
            }}>
              Copier
            </button>
          )}
          {clipboard && canEdit && (
            <button onClick={() => {
              pasteClipboard(contextMenu.equipe, contextMenu.date);
              setContextMenu(null);
            }}>
              Coller
            </button>
          )}
          {canEdit && contextMenu.type !== 'cell' && (
            <button onClick={() => {
              deleteSelectedItem();
              setContextMenu(null);
            }}>
              Supprimer
            </button>
          )}
        </div>
      )}

      {colorManager && (
        <div className="modal-bg modal-bg-top" onMouseDown={() => setColorManager(null)}>
          <div className="modal color-manager-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{colorManager.index === -1 ? 'Ajouter une couleur' : 'Modifier la couleur'}</h2>
              <button className="modal-header-close" onClick={() => setColorManager(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="color-manager-preview">
                <div className="color-manager-swatch" style={{ background: colorManager.color }} />
                <input
                  type="color"
                  aria-label="Couleur"
                  value={colorManager.color}
                  onChange={(e) => setColorManager({ ...colorManager, color: e.target.value })}
                />
              </div>
              <input
                type="text"
                value={colorManager.color}
                className="color-manager-hex"
                aria-label="Code hexadécimal"
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setColorManager({ ...colorManager, color: v });
                }}
              />
            </div>
            <div className="modal-footer">
              <button className="modal-btn-primary" onClick={() => {
                if (colorManager.index === -1) {
                  const setter = colorManager.type === 'chantier' ? setChantierColors : setConducteurColors;
                  setter((prev) => [...prev, colorManager.color]);
                } else {
                  const setter = colorManager.type === 'chantier' ? setChantierColors : setConducteurColors;
                  setter((prev) => prev.map((c, i) => i === colorManager.index ? colorManager.color : c));
                }
                setColorManager(null);
              }}>{colorManager.index === -1 ? 'Ajouter' : 'Valider'}</button>
              <button className="modal-btn-cancel" onClick={() => setColorManager(null)}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {holidayModalOpen && (
        <div className="modal-bg" onMouseDown={() => setHolidayModalOpen(false)}>
          <div className="modal holiday-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Jours fériés</h2>
              <button className="modal-header-close" onClick={() => setHolidayModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="holiday-add-row">
                <input
                  value={ferieForm.date}
                  type="date"
                  aria-label="Date du jour férié"
                  onChange={(e) => setFerieForm({ ...ferieForm, date: e.target.value })}
                />
                <input
                  value={ferieForm.nom}
                  aria-label="Nom du jour férié"
                  onChange={(e) => setFerieForm({ ...ferieForm, nom: e.target.value })}
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
                      <button className="modal-btn-danger" onClick={() => commit(() => setCustomFeries((prev) => prev.filter((x) => !(x.nom === f.nom && x.date === f.date))))}>Supprimer</button>
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
              <h2>{modal.mode === 'modification' ? 'Modifier' : 'Nouvel élément'}</h2>
              <div className="modal-tabs">
                <button className={modal.type === 'chantier' ? 'active' : ''} onClick={() => setModal({ ...modal, type: 'chantier' })}>Chantier</button>
                <button className={modal.type === 'conge' ? 'active' : ''} onClick={() => setModal({ ...modal, type: 'conge' })}>Congé</button>
                <button className={modal.type === 'conducteur' ? 'active' : ''} onClick={() => setModal({ ...modal, type: 'conducteur' })}>Conducteur</button>
              </div>
            </div>
            <div className="modal-body">
              {modal.type !== 'conducteur' && (
                <>
                  <div className="modal-date-group">
                    <div className="modal-field">
                      <label>Durée</label>
                      <input type="number" min="1" aria-label="Durée" value={form.duree} onChange={(e) => setForm({ ...form, duree: e.target.value })} />
                      <small>jours travaillés</small>
                    </div>
                    <div className="modal-field">
                      <label>Date de début</label>
                      <input type="date" aria-label="Date de début" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
                    </div>
                    <div className="modal-field">
                      <label>Date de fin</label>
                      <input type="date" aria-label="Date de fin" value={modalEndDate} readOnly />
                      <small>calculée</small>
                    </div>
                  </div>
                  <div className="modal-field">
                    <label>{modal.type === 'chantier' ? 'Nom du chantier' : 'Nom du congé'}</label>
                    <input value={form.nom} aria-label={modal.type === 'chantier' ? 'Nom du chantier' : 'Nom du congé'} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
                  </div>
                  <div className="modal-field">
                    <label>Équipe</label>
                    {form.allEquipes ? (
                      <select aria-label="Équipe" value={form.companyId || companies[0]?.id || ''} onChange={(e) => {
                        const compId = e.target.value;
                        const firstIdx = teams.findIndex(t => t.companyId === compId);
                        setForm({ ...form, companyId: compId, equipe: firstIdx >= 0 ? firstIdx : form.equipe });
                      }}>
                        {companies.map((comp) => (
                          <option key={comp.id} value={comp.id}>{comp.nom}</option>
                        ))}
                      </select>
                    ) : (
                      <select aria-label="Équipe" value={form.equipe} onChange={(e) => setForm({ ...form, equipe: e.target.value })}>
                        {companies.map((comp) => {
                          const compTeams = teams.map((t, i) => ({ ...t, index: i })).filter((t) => t.companyId === comp.id);
                          if (compTeams.length === 0) return null;
                          return (
                            <optgroup key={comp.id} label={comp.nom}>
                              {compTeams.map((t) => (
                                <option key={t.index} value={t.index}>{t.nom}</option>
                              ))}
                            </optgroup>
                          );
                        })}
                      </select>
                    )}
                    {modal.type === 'conge' && (
                      <label className="toggle-switch">
                        <input type="checkbox" checked={form.allEquipes || false} onChange={(e) => {
                          if (e.target.checked) {
                            const team = teams[form.equipe];
                            setForm({ ...form, allEquipes: true, companyId: team?.companyId || companies[0]?.id || '' });
                          } else {
                            setForm({ ...form, allEquipes: false, companyId: undefined });
                          }
                        }} />
                        <span className="toggle-track" />
                        <span className="toggle-label">Toutes les équipes (congé simultané)</span>
                      </label>
                    )}
                    {modal.type === 'chantier' && (
                      <label className="toggle-switch">
                        <input type="checkbox" checked={form.force_aout || false} onChange={(e) => setForm({ ...form, force_aout: e.target.checked })} />
                        <span className="toggle-track" />
                        <span className="toggle-label">Traverser août (chantier visible en août)</span>
                      </label>
                    )}
                  </div>
                </>
              )}
              {modal.type === 'chantier' && (
                <>
                  <div className="modal-field">
                    <label>Couleur du chantier</label>
                    <div className="color-grid editable-colors">
                      {chantierColors.map((c, ci) => (
                        <div key={ci} className="color-dot-wrapper">
                          <button className={`color-dot ${form.color === c ? 'selected-color' : ''}`} style={{ background: c }} onClick={() => setForm({ ...form, color: c })} />
                          <button className="color-dot-edit" onClick={() => setColorManager({ type: 'chantier', index: ci, color: c })} title="Modifier">✎</button>
                          <button className="color-dot-delete" onClick={() => {
                            const next = chantierColors.filter((_, i) => i !== ci);
                            setChantierColors(next.length > 0 ? next : [...CHANTIER_COLORS]);
                            if (form.color === c) setForm({ ...form, color: next[0] || CHANTIER_COLORS[0] });
                          }} title="Supprimer">×</button>
                        </div>
                      ))}
                      <button className="color-dot color-add" title="Ajouter une couleur" onClick={() => setColorManager({ type: 'chantier', index: -1, color: '#2563eb' })}>+</button>
                    </div>
                  </div>
                  <div className="modal-field">
                    <label>Conducteur</label>
                    <div className="conducteur-list">
                      {conducteurs.map((c) => (
                        <button key={c.id} className={`conducteur-choice ${Number(form.conducteurId) === c.id ? 'active-conducteur' : ''}`} onClick={() => setForm({ ...form, conducteurId: c.id })}>
                          <span style={{ background: c.color }} /> {c.nom}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="modal-field">
                    <label>Détail chantier</label>
                    <input value={form.detail || ''} aria-label="Détail chantier" onChange={(e) => setForm({ ...form, detail: e.target.value })} />
                  </div>
                  <div className="modal-field">
                    <label>Notes</label>
                    <textarea aria-label="Notes" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
                  </div>
                </>
              )}
              {modal.type === 'conducteur' && (
                <div className="conducteurs-editor">
                  {conducteurs.map((c, i) => (
                    <div className="conducteur-edit-row" key={c.id}>
                      <div className="color-picker-wrap">
                        <input type="color" aria-label="Couleur du conducteur" value={c.color} onChange={(e) => setConducteurs((prev) => prev.map((x, idx) => idx === i ? { ...x, color: e.target.value } : x))} />
                        <span className="color-swatch" style={{ background: c.color }} />
                      </div>
                      <input value={c.nom} aria-label="Nom du conducteur" onChange={(e) => setConducteurs((prev) => prev.map((x, idx) => idx === i ? { ...x, nom: e.target.value } : x))} />
                      <button className="delete-conducteur" title="Supprimer ce conducteur" onClick={() => { if (window.confirm(`Supprimer ${c.nom} ?`)) setConducteurs((prev) => prev.filter((_, idx) => idx !== i)); }}>×</button>
                    </div>
                  ))}
                  <button className="add-conducteur-btn" onClick={() => setConducteurs((prev) => [
                    ...prev,
                    {
                      id: nextLocalId(),
                      nom: `Conducteur ${prev.length + 1}`,
                      color: conducteurColors[prev.length % conducteurColors.length] || conducteurColors[0] || '#2563eb',
                    },
                  ])}>+ Ajouter un conducteur</button>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {modal.mode === 'modification' && modal.type !== 'conducteur' && canEdit && (
                <button className="modal-btn-danger" onClick={deleteSelectedItem}>Supprimer</button>
              )}
              {modal.type !== 'conducteur' ? (
                <button className="modal-btn-primary" onClick={saveModal} disabled={!canEdit}>
                  {modal.mode === 'modification' ? 'Modifier' : 'Créer'}
                </button>
              ) : (
                <button className="modal-btn-primary" onClick={closeModal}>OK</button>
              )}
              <button className="modal-btn-cancel" onClick={closeModal}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
