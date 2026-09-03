const CHANTIER_COLORS = [
  '#2563eb',
  '#93c5fd',
  '#eab308',
  '#15803d',
  '#6b7280',
  '#f97316',
  '#7dd3fc',
];

function formatDevisDisplay(value) {
  if (value == null || value === '') return '';
  let s = String(value).replace(/\s/g, '');
  let v = s.replace(/[^0-9.,]/g, '');
  const firstSep = v.search(/[.,]/);
  let intPart, decPart, sep;
  if (firstSep === -1) {
    intPart = v;
    decPart = '';
    sep = '';
  } else {
    intPart = v.slice(0, firstSep);
    decPart = v.slice(firstSep + 1).replace(/[.,]/g, '');
    sep = v[firstSep];
  }
  if (intPart) intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return sep ? intPart + sep + decPart : intPart;
}

export default function Modals({
  modal, setModal,
  form, setForm,
  modalEndDate,
  companies, teams,
  categories,
  chantierColors, setChantierColors,
  setColorManager, colorManager,
  holidayModalOpen, setHolidayModalOpen,
  ferieForm, setFerieForm,
  customFeries, setCustomFeries,
  contextMenu, setContextMenu,
  clipboard, setClipboard,
  chantiers, conges,
  canEdit,
  saveModal, closeModal, deleteSelectedItem,
  pasteClipboard, addCustomFerie, commit,
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
                  setChantierColors((prev) => [...prev, colorManager.color]);
                } else {
                  setChantierColors((prev) => prev.map((c, i) => i === colorManager.index ? colorManager.color : c));
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
        <div className="modal-bg" onMouseDown={closeModal}>
          <div className="modal modal--pro" onMouseDown={(e) => e.stopPropagation()}>
            {/* Header pro */}
            <div className="modal-pro-header">
              <div className="modal-pro-title">
                <div className="modal-pro-icon">
                  {modal.type === 'chantier' ? '🏗️' : '🏝️'}
                </div>
                <div>
                  <h2>{modal.mode === 'modification' ? (modal.type === 'chantier' ? 'Modifier le chantier' : 'Modifier le congé') : (modal.type === 'chantier' ? 'Nouveau chantier' : 'Nouveau congé')}</h2>
                  <p className="modal-pro-subtitle">{modal.type === 'chantier' ? 'Planifiez l’intervention et son budget' : 'Définissez la période d’absence'}</p>
                </div>
              </div>
              <button className="modal-header-close" onClick={closeModal} aria-label="Fermer">×</button>
            </div>

            <div className="modal-pro-tabs">
              <button className={modal.type === 'chantier' ? 'active' : ''} onClick={() => setModal({ ...modal, type: 'chantier' })}>
                <span>🏗️</span> Chantier
              </button>
              <button className={modal.type === 'conge' ? 'active' : ''} onClick={() => setModal({ ...modal, type: 'conge' })}>
                <span>🏖️</span> Congé
              </button>
            </div>

            <div className="modal-body modal-body--pro">
              {/* ── SECTION : Planning (commun) ── */}
              <section className="modal-section modal-section--accent">
                <div className="modal-section-head">
                  <span className="modal-section-icon">📅</span>
                  <h3>Planification</h3>
                  <span className="modal-section-desc">Durée en jours ouvrés</span>
                </div>
                <div className="modal-grid-3">
                  <div className="modal-field">
                    <label>Durée</label>
                    <div className="input-with-suffix">
                      <input type="number" min="1" aria-label="Durée" value={form.duree} onChange={(e) => setForm({ ...form, duree: e.target.value })} />
                      <span className="input-suffix">j</span>
                    </div>
                    <small>jours travaillés</small>
                  </div>
                  <div className="modal-field">
                    <label>Date de début</label>
                    <input type="date" aria-label="Date de début" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
                  </div>
                  <div className="modal-field">
                    <label>Date de fin</label>
                    <input type="date" aria-label="Date de fin" value={modalEndDate} readOnly className="input-readonly" />
                    <small>calculée automatiquement</small>
                  </div>
                </div>
              </section>

              {/* ── SECTION : Informations (commun) ── */}
              <section className="modal-section modal-section--accent">
                <div className="modal-section-head">
                  <span className="modal-section-icon">{modal.type === 'chantier' ? '📝' : '🏝️'}</span>
                  <h3>{modal.type === 'chantier' ? 'Informations chantier' : 'Informations congé'}</h3>
                </div>
                <div className="modal-field">
                  <label>{modal.type === 'chantier' ? 'Nom du chantier' : 'Nom du congé'} <span className="field-required">*</span></label>
                  <input
                    value={form.nom}
                    aria-label={modal.type === 'chantier' ? 'Nom du chantier' : 'Nom du congé'}
                    placeholder={modal.type === 'chantier' ? 'Ex : Charpente maison Martin' : 'Ex : Congé annuel'}
                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    className="input-large"
                  />
                </div>

                <div className="modal-grid-2">
                  <div className="modal-field">
                    <label>Équipe</label>
                    {form.allEquipes ? (
                      <select aria-label="Équipe" value={form.companyId || companies[0]?.id || ''} onChange={(e) => {
                        const compId = e.target.value;
                        const firstId = teams.find(t => t.companyId === compId)?.id;
                        setForm({ ...form, companyId: compId, equipe: firstId ?? form.equipe });
                      }}>
                        {companies.map((comp) => (
                          <option key={comp.id} value={comp.id}>{comp.nom}</option>
                        ))}
                      </select>
                    ) : (
                      <select aria-label="Équipe" value={form.equipe} onChange={(e) => setForm({ ...form, equipe: e.target.value })}>
                        {companies.map((comp) => {
                          const compTeams = teams.filter((t) => t.companyId === comp.id);
                          if (compTeams.length === 0) return null;
                          return (
                            <optgroup key={comp.id} label={comp.nom}>
                              {compTeams.map((t) => (
                                <option key={t.id} value={t.id}>{t.nom}</option>
                              ))}
                            </optgroup>
                          );
                        })}
                        {(categories || []).length > 0 && (
                          <optgroup label="Zones">
                            {categories.map((cat) => (
                              <option key={cat.equipe} value={cat.equipe}>{cat.nom}</option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                    )}
                  </div>
                  {modal.type === 'chantier' && (
                    <div className="modal-field">
                      <label>Détail chantier</label>
                      <input value={form.detail || ''} aria-label="Détail chantier" placeholder="Ex : Maison 120m², lot A" onChange={(e) => setForm({ ...form, detail: e.target.value })} />
                    </div>
                  )}
                </div>

                {modal.type === 'conge' && (
                  <label className="toggle-switch toggle-card">
                    <input type="checkbox" checked={form.allEquipes || false} onChange={(e) => {
                      if (e.target.checked) {
                        const team = teams.find(t => t.id === Number(form.equipe));
                        setForm({ ...form, allEquipes: true, companyId: team?.companyId || companies[0]?.id || '' });
                      } else {
                        setForm({ ...form, allEquipes: false, companyId: undefined });
                      }
                    }} />
                    <span className="toggle-track" />
                    <span>
                      <span className="toggle-label">Toutes les équipes</span>
                      <span className="toggle-desc">Congé simultané pour l’entreprise</span>
                    </span>
                  </label>
                )}
                {modal.type === 'chantier' && (
                  <label className="toggle-switch toggle-discreet">
                    <input type="checkbox" checked={form.force_aout || false} onChange={(e) => setForm({ ...form, force_aout: e.target.checked })} />
                    <span className="toggle-track toggle-track--sm" />
                    <span className="toggle-label toggle-label--sm">Traverser août</span>
                  </label>
                )}
              </section>

              {modal.type === 'chantier' && (
                <>
                  {/* ── SECTION : Apparence ── */}
                  <section className="modal-section modal-section--accent">
                    <div className="modal-section-head">
                      <span className="modal-section-icon">🎨</span>
                      <h3>Apparence</h3>
                    </div>
                    <div className="modal-field">
                      <label>Couleur du chantier</label>
                      <div className="color-grid editable-colors">
                        {chantierColors.map((c, ci) => (
                          <div key={ci} className="color-dot-wrapper">
                            <button className={`color-dot ${form.color === c ? 'selected-color' : ''}`} style={{ background: c }} onClick={() => setForm({ ...form, color: c })} aria-label={`Couleur ${c}`} />
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
                  </section>

                  {/* ── SECTION : Budget ── */}
                  <section className="modal-section modal-section--accent">
                    <div className="modal-section-head">
                      <span className="modal-section-icon">💶</span>
                      <h3>Budget</h3>
                    </div>
                    <div className="modal-field">
                      <label>Montant du devis</label>
                      <div className="input-with-suffix input-with-suffix--money">
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder="0,00"
                          aria-label="Montant du devis"
                          value={formatDevisDisplay(form.montantDevis)}
                          onChange={(e) => setForm({ ...form, montantDevis: formatDevisDisplay(e.target.value) })}
                        />
                        <span className="input-suffix input-suffix--euro">€ HT</span>
                      </div>
                    </div>
                  </section>

                  {/* ── SECTION : Attributs & Suivi ── */}
                  <section className="modal-section modal-section--accent">
                    <div className="modal-section-head">
                      <span className="modal-section-icon">🏷️</span>
                      <h3>Attributs & suivi</h3>
                    </div>
                    <div className="modal-field">
                      <label>Icônes du chantier</label>
                      <div className="icon-toggle-grid">
                        <button type="button" className={`icon-toggle ${form.permis ? 'active' : ''}`} onClick={() => setForm({ ...form, permis: !form.permis })}>
                          <span className="icon-toggle-emoji">📄</span><span>Permis</span>
                        </button>
                        <button type="button" className={`icon-toggle ${form.financement ? 'active' : ''}`} onClick={() => setForm({ ...form, financement: !form.financement })}>
                          <span className="icon-toggle-emoji">💶</span><span>Financement</span>
                        </button>
                        <button type="button" className={`icon-toggle ${form.danger ? 'active' : ''}`} onClick={() => setForm({ ...form, danger: !form.danger })}>
                          <span className="icon-toggle-emoji">⚠️</span><span>Danger</span>
                        </button>
                        <button type="button" className={`icon-toggle ${form.reunion ? 'active' : ''}`} onClick={() => setForm({ ...form, reunion: !form.reunion })}>
                          <span className="icon-toggle-emoji">👥</span><span>Réunion</span>
                        </button>
                      </div>
                    </div>
                    <div className="modal-field">
                      <button type="button" className={`facture-toggle ${form.facture ? 'active' : ''}`} onClick={() => setForm({ ...form, facture: !form.facture })}>
                        <span className="facture-toggle-emoji">€</span>
                        <span>{form.facture ? 'Chantier facturé' : 'Marquer comme facturé'}</span>
                      </button>
                    </div>
                  </section>

                  {/* ── SECTION : Notes ── */}
                  <section className="modal-section modal-section--accent">
                    <div className="modal-section-head">
                      <span className="modal-section-icon">🗒️</span>
                      <h3>Notes</h3>
                    </div>
                    <div className="modal-field">
                      <textarea
                        aria-label="Notes"
                        placeholder="Informations complémentaires, accès, contacts, contraintes..."
                        value={form.note || ''}
                        onChange={(e) => setForm({ ...form, note: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </section>
                </>
              )}
            </div>

            <div className="modal-footer modal-footer--pro">
              {modal.mode === 'modification' && canEdit && (
                <button className="modal-btn-danger" onClick={deleteSelectedItem}>Supprimer</button>
              )}
              <div className="modal-footer-actions">
                <button className="modal-btn-cancel" onClick={closeModal}>Annuler</button>
                <button className="modal-btn-primary" onClick={saveModal} disabled={!canEdit}>
                  {modal.mode === 'modification' ? 'Enregistrer' : 'Créer le chantier'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
