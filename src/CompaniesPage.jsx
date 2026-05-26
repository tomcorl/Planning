import { useState } from 'react';

export default function CompaniesPage({
  activeCompanyId,
  companies,
  onSaveCompanies,
  onSwitchCompany,
}) {
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
            <button onClick={() => onSwitchCompany(company.id)}>
              Ouvrir cette entreprise
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
