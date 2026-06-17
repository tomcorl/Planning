import { useState } from 'react';
import { supabase } from './lib/supabase.js';

export default function CompaniesPage({
  activeCompanyId,
  companies,
  onSaveCompanies,
  onSwitchCompany,
}) {
  async function deleteCompany(id) {
    if (!window.confirm('Supprimer définitivement cette entreprise et toutes ses données ?')) return;
    await supabase.from('companies').delete().eq('id', id);
    onSaveCompanies(companies.filter((c) => c.id !== id));
  }
  const [form, setForm] = useState({ nom: '', secteur: 'BTP' });

  function addCompany(e) {
    e.preventDefault();
    if (!form.nom.trim()) return;

    const id = form.nom
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    onSaveCompanies([
      ...companies,
      {
        id: `${id || 'entreprise'}-${Date.now()}`,
        nom: form.nom.trim(),
        secteur: form.secteur,
        plan: 'Pro',
      },
    ]);
    setForm({ nom: '', secteur: 'BTP' });
  }

  function updateCompany(id, patch) {
    onSaveCompanies(
      companies.map((company) =>
        company.id === id ? { ...company, ...patch } : company
      )
    );
  }

  return (
    <section className="admin-page">
      <div className="admin-heading">
        <div>
          <span>Administration</span>
          <h1>Entreprises</h1>
        </div>
        <p>Gérez les sociétés qui utiliseront le planning.</p>
      </div>

      <form className="admin-form company-form" onSubmit={addCompany}>
        <input
          value={form.nom}
          onChange={(e) => setForm({ ...form, nom: e.target.value })}
          placeholder="Nom de l'entreprise"
        />
        <input
          value={form.secteur}
          onChange={(e) => setForm({ ...form, secteur: e.target.value })}
          placeholder="Secteur"
        />
        <button type="submit">Ajouter entreprise</button>
      </form>

      <div className="company-grid">
        {companies.map((company) => (
          <article
            className={`company-card ${
              company.id === activeCompanyId ? 'active-company-card' : ''
            }`}
            key={company.id}
          >
            <div>
              <span>{company.plan || 'Pro'}</span>
              <input
                value={company.nom}
                onChange={(e) =>
                  updateCompany(company.id, { nom: e.target.value })
                }
              />
            </div>
            <input
              value={company.secteur || ''}
              onChange={(e) =>
                updateCompany(company.id, { secteur: e.target.value })
              }
              placeholder="Secteur"
            />
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => onSwitchCompany(company.id)}>
                Ouvrir
              </button>
              <button className="delete-btn" onClick={() => deleteCompany(company.id)}>
                Supprimer
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
