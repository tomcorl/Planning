import { useState } from 'react';
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
  vendeurs, setVendeurs,
  typesChantier, setTypesChantier,
  contextMenu, setContextMenu,
  clipboard, setClipboard,
  chantiers, conges,
  canEdit,
  saveModal, closeModal, deleteSelectedItem,
  pasteClipboard, addCustomFerie, nextLocalId, commit,
}) {
  const [infoFeedback, setInfoFeedback] = useState('');
  const pickInfo = (f) => ({
    client_nom: f.client_nom || '',
    client_adresse: f.client_adresse || '',
    client_telephone: f.client_telephone || '',
    numero_chantier: f.numero_chantier || '',
    vendeurId: Number(f.vendeurId) || 0,
    typeChantierId: Number(f.typeChantierId) || 0,
    montant_devis: Number(f.montant_devis) || 0,
  });
  const handleCopyInfo = () => {
    localStorage.setItem('infoChantierClipboard', JSON.stringify(pickInfo(form)));
    setInfoFeedback('Copié ✓');
    setTimeout(() => setInfoFeedback(''), 1500);
  };
  const handlePasteInfo = () => {
    const raw = localStorage.getItem('infoChantierClipboard');
    if (!raw) { setInfoFeedback('Rien à coller'); setTimeout(() => setInfoFeedback(''), 1500); return; }
    try {
      setForm({ ...form, ...pickInfo(JSON.parse(raw)) });
      setInfoFeedback('Collé ✓');
      setTimeout(() => setInfoFeedback(''), 1500);
    } catch { setInfoFeedback('Erreur'); setTimeout(() => setInfoFeedback(''), 1500); }
  };
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
                      </select>
                    )}
                    {modal.type === 'conge' && (
                      <label className="toggle-switch">
                        <input type="checkbox" checked={form.allEquipes || false} onChange={(e) => {
                          if (e.target.checked) {
                            const team = teams.find(t => t.id === Number(form.equipe));
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
                  <div className="chantier-info-actions">
                    <button type="button" className="info-action-btn" onClick={handleCopyInfo}>Copier les infos</button>
                    <button type="button" className="info-action-btn" onClick={handlePasteInfo}>Coller les infos</button>
                    {infoFeedback && <span className="info-feedback">{infoFeedback}</span>}
                  </div>
                  <div className="modal-field">
                    <label>Nom du client</label>
                    <input value={form.client_nom || ''} aria-label="Nom du client" onChange={(e) => setForm({ ...form, client_nom: e.target.value })} placeholder="" />
                  </div>
                  <div className="modal-field">
                    <label>Adresse</label>
                    <input value={form.client_adresse || ''} aria-label="Adresse" onChange={(e) => setForm({ ...form, client_adresse: e.target.value })} placeholder="" />
                  </div>
                  <div className="modal-field">
                    <label>Téléphone</label>
                    <input type="tel" value={form.client_telephone || ''} aria-label="Téléphone" onChange={(e) => setForm({ ...form, client_telephone: e.target.value })} placeholder="" />
                  </div>
                  <div className="modal-field">
                    <label>Numéro de chantier</label>
                    <input value={form.numero_chantier || ''} aria-label="Numéro de chantier" onChange={(e) => setForm({ ...form, numero_chantier: e.target.value })} placeholder="" />
                  </div>
                  <div className="modal-field">
                    <label>Vendeur</label>
                    <div className="conducteur-list">
                      {vendeurs.map((v) => (
                        <button key={v.id} type="button" className={`conducteur-choice ${Number(form.vendeurId) === v.id ? 'active-conducteur' : ''}`} onClick={() => setForm({ ...form, vendeurId: v.id })}>
                          <span style={{ background: v.color }} /> {v.nom}
                        </button>
                      ))}
                      {vendeurs.length === 0 && <span style={{ fontSize: 12, color: 'var(--muted)' }}>Aucun vendeur — ajoutez-en dans l'onglet Conducteur</span>}
                    </div>
                  </div>
                  <div className="modal-field">
                    <label>Type de chantier</label>
                    <div className="conducteur-list">
                      {typesChantier.map((t) => (
                        <button key={t.id} type="button" className={`conducteur-choice ${Number(form.typeChantierId) === t.id ? 'active-conducteur' : ''}`} onClick={() => setForm({ ...form, typeChantierId: t.id })}>
                          <span style={{ background: t.color }} /> {t.nom}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="modal-field">
                    <label>Montant CA (€)</label>
                    <input type="number" min="0" step="100" value={form.montant_devis || ''} aria-label="Montant CA" onChange={(e) => setForm({ ...form, montant_devis: e.target.value })} placeholder="" />
                  </div>
                  <div className="modal-field">
                    <label>Palette</label>
                    <div className="personal-color-picker modern small">
                      {chantierColors.map((c) => {
                        const isCustom = !CHANTIER_COLORS.includes(c);
                        return (
                          <div key={c} className="personal-color-wrap">
                            <button type="button" className={`personal-color-swatch${form.color === c ? ' selected' : ''}`} style={{ background: c }} onClick={() => setForm({ ...form, color: c })} title={c}>
                              {form.color === c && <span className="personal-color-check">✓</span>}
                            </button>
                            {isCustom && (
                              <button type="button" className="personal-color-remove" onClick={(e) => {
                                e.stopPropagation();
                                const next = chantierColors.filter((x) => x !== c);
                                setChantierColors(next.length > 0 ? next : [...CHANTIER_COLORS]);
                                if (form.color === c) setForm({ ...form, color: next[0] || CHANTIER_COLORS[0] });
                              }} title="Supprimer">×</button>
                            )}
                          </div>
                        );
                      })}
                      <label className="personal-color-swatch personal-color-add" title="Nouvelle couleur">
                        <input type="color" value={form.color.startsWith('#') && /^#[0-9a-fA-F]{6}$/.test(form.color) ? form.color : '#2563eb'} onChange={(e) => setForm({ ...form, color: e.target.value })} style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }} />
                        <span className="personal-color-add-icon">+</span>
                      </label>
                    </div>
                    <div className="personal-color-custom small">
                      <label className="personal-color-custom-label">
                        <input type="color" value={form.color.startsWith('#') && /^#[0-9a-fA-F]{6}$/.test(form.color) ? form.color : '#2563eb'} onChange={(e) => setForm({ ...form, color: e.target.value })} />
                        <span>Personnalisée</span>
                      </label>
                      <span className="personal-color-hex">{form.color}</span>
                      <button type="button" className="personal-color-add-btn" onClick={() => { if (!chantierColors.includes(form.color)) setChantierColors((prev) => [...prev, form.color]); }} disabled={chantierColors.includes(form.color)} title={chantierColors.includes(form.color) ? 'Déjà dans la palette' : 'Ajouter à la palette'}>Ajouter</button>
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
                </>
              )}
              {modal.type === 'conducteur' && (
                <>
                  <h3 style={{ margin: '14px 0 8px', fontSize: 14, fontWeight: 800 }}>Conducteurs</h3>
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

                  <h3 style={{ margin: '18px 0 8px', fontSize: 14, fontWeight: 800 }}>Vendeurs</h3>
                  <div className="conducteurs-editor">
                    {vendeurs.map((v, i) => (
                      <div className="conducteur-edit-row" key={v.id}>
                        <div className="color-picker-wrap">
                          <input type="color" aria-label="Couleur du vendeur" value={v.color} onChange={(e) => setVendeurs((prev) => prev.map((x, idx) => idx === i ? { ...x, color: e.target.value } : x))} />
                          <span className="color-swatch" style={{ background: v.color }} />
                        </div>
                        <input value={v.nom} aria-label="Nom du vendeur" onChange={(e) => setVendeurs((prev) => prev.map((x, idx) => idx === i ? { ...x, nom: e.target.value } : x))} />
                        <button className="delete-conducteur" title="Supprimer ce vendeur" onClick={() => { if (window.confirm(`Supprimer ${v.nom} ?`)) setVendeurs((prev) => prev.filter((_, idx) => idx !== i)); }}>×</button>
                      </div>
                    ))}
                    <button className="add-conducteur-btn" onClick={() => setVendeurs((prev) => [
                      ...prev,
                      { id: nextLocalId(), nom: `Vendeur ${prev.length + 1}`, color: '#2563eb' },
                    ])}>+ Ajouter un vendeur</button>
                  </div>

                  <h3 style={{ margin: '18px 0 8px', fontSize: 14, fontWeight: 800 }}>Types de chantier</h3>
                  <div className="conducteurs-editor">
                    {typesChantier.map((t, i) => (
                      <div className="conducteur-edit-row" key={t.id}>
                        <div className="color-picker-wrap">
                          <input type="color" aria-label="Couleur du type" value={t.color} onChange={(e) => setTypesChantier((prev) => prev.map((x, idx) => idx === i ? { ...x, color: e.target.value } : x))} />
                          <span className="color-swatch" style={{ background: t.color }} />
                        </div>
                        <input value={t.nom} aria-label="Nom du type" onChange={(e) => setTypesChantier((prev) => prev.map((x, idx) => idx === i ? { ...x, nom: e.target.value } : x))} />
                        <button className="delete-conducteur" title="Supprimer ce type" onClick={() => { if (window.confirm(`Supprimer ${t.nom} ?`)) setTypesChantier((prev) => prev.filter((_, idx) => idx !== i)); }}>×</button>
                      </div>
                    ))}
                    <button className="add-conducteur-btn" onClick={() => setTypesChantier((prev) => [
                      ...prev,
                      { id: nextLocalId(), nom: `Type ${prev.length + 1}`, color: '#2563eb' },
                    ])}>+ Ajouter un type</button>
                  </div>
                </>
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
