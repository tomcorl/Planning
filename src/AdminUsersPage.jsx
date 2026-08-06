import { useMemo, useState } from 'react';

const ROLE_LABELS = { admin: 'Admin', planning: 'Planning', lecture: 'Lecture seule' };

export default function AdminUsersPage({ users, onSaveUsers, onAddUser, onRemoveUser, onResetUserPassword }) {
  const [form, setForm] = useState({ email: '', nom: '', role: 'lecture' });
  const [editingId, setEditingId] = useState(null);
  const [notice, setNotice] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) => u.nom?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    );
  }, [users, search]);

  const pendingCount = users.filter((u) => u.invited).length;

  function resetForm() {
    setForm({ email: '', nom: '', role: 'lecture' });
    setEditingId(null);
  }

  function notify(kind, message) {
    setNotice({ kind, message });
    window.clearTimeout(notify._t);
    notify._t = window.setTimeout(() => setNotice(null), 5000);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email.trim() || !form.nom.trim()) return;

    if (editingId) {
      onSaveUsers(
        users.map((user) =>
          user.id === editingId
            ? { ...form, email: form.email.trim().toLowerCase(), id: editingId }
            : user
        )
      );
      resetForm();
      notify('success', 'Utilisateur modifié.');
    } else {
      try {
        await onAddUser(form.email.trim().toLowerCase(), form.nom, form.role);
        notify('success', `Invitation envoyée à ${form.nom.trim()}.`);
        setForm({ email: '', nom: '', role: 'lecture' });
      } catch (err) {
        notify('error', err?.message || 'Erreur lors de l\'envoi de l\'invitation. Vérifiez que l\'email n\'existe pas déjà.');
      }
    }
  }

  function editUser(user) {
    setForm({ email: user.email, nom: user.nom, role: user.role });
    setEditingId(user.id);
    setSearch('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function removeUser(id) {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    onRemoveUser(id);
  }

  async function handleResetPassword(user) {
    if (!window.confirm(`Envoyer un email de réinitialisation de mot de passe à ${user.email} ?`)) return;
    try {
      await onResetUserPassword(user.email);
      notify('success', `Email envoyé à ${user.email}.`);
    } catch (err) {
      notify('error', err?.message || 'Erreur lors de l\'envoi du lien de réinitialisation.');
    }
  }

  return (
    <section className="admin-page">
      <div className="admin-heading">
        <div className="admin-heading-left">
          <span className="admin-eyebrow">Administration</span>
          <h1>Utilisateurs</h1>
        </div>
        <p>Gérez les accès de vos collaborateurs.</p>
      </div>

      {notice && (
        <div className={`admin-notice admin-notice-${notice.kind}`} onClick={() => setNotice(null)}>
          {notice.kind === 'success' ? '✓' : '⚠'} {notice.message}
        </div>
      )}

      <div className="admin-stats">
        <div className="admin-stat">
          <strong>{users.length}</strong>
          <span>Utilisateurs</span>
        </div>
        <div className="admin-stat">
          <strong>{pendingCount}</strong>
          <span>Invitations en attente</span>
        </div>
        <div className="admin-stat">
          <strong>{users.filter((u) => u.role === 'admin').length}</strong>
          <span>Administrateurs</span>
        </div>
      </div>

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="admin-form-head">
          <h2>{editingId ? 'Modifier l\'utilisateur' : 'Inviter un collaborateur'}</h2>
          <p>{editingId ? 'Mettez à jour les informations de ce compte.' : 'Un email d\'invitation sera envoyé automatiquement.'}</p>
        </div>
        <div className="admin-form-fields">
          <label>
            <span>Nom</span>
            <input
              value={form.nom}
              aria-label="Nom"
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              placeholder="Ex : Jean Dupont"
            />
          </label>
          <label>
            <span>Email</span>
            <input
              type="email"
              value={form.email}
              aria-label="Email"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="email@entreprise.fr"
            />
          </label>
          <label>
            <span>Rôle</span>
            <select
              value={form.role}
              aria-label="Rôle"
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="lecture">Lecture seule</option>
              <option value="planning">Planning (modification)</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <div className="admin-form-actions">
            <button type="submit" className="admin-submit">
              {editingId ? 'Enregistrer' : 'Inviter'}
            </button>
            {editingId && (
              <button type="button" className="admin-cancel" onClick={resetForm}>
                Annuler
              </button>
            )}
          </div>
        </div>
      </form>

      <div className="admin-list-head">
        <span className="admin-list-count">{filtered.length} utilisateur{filtered.length > 1 ? 's' : ''}</span>
        <div className="admin-search">
          <span className="admin-search-icon">⌕</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un nom ou un email…"
            aria-label="Rechercher un utilisateur"
          />
          {search && (
            <button type="button" className="admin-search-clear" onClick={() => setSearch('')}>×</button>
          )}
        </div>
      </div>

      <div className="admin-table">
        {filtered.length === 0 && (
          <div className="admin-empty">
            {users.length === 0
              ? 'Aucun utilisateur pour le moment.'
              : 'Aucun résultat pour cette recherche.'}
          </div>
        )}
        {filtered.map((user) => {
          const initials = (user.nom || user.email || '?')
            .split(/\s+/)
            .map((p) => p[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
          return (
            <div className={`admin-row${editingId === user.id ? ' admin-row-editing' : ''}`} key={user.id}>
              <div className="admin-user">
                <div className={`admin-avatar admin-avatar-${user.role}`}>{initials}</div>
                <div className="admin-user-info">
                  <strong>{user.nom}</strong>
                  <span>{user.email}</span>
                </div>
              </div>
              <span className={`admin-badge admin-badge-${user.role}`}>{ROLE_LABELS[user.role] || user.role}</span>
              <span className={`admin-status ${user.invited ? 'is-pending' : 'is-active'}`}>
                <span className="admin-status-dot" />
                {user.invited ? 'Invitation en attente' : 'Compte actif'}
              </span>
              <div className="admin-row-actions">
                <button className="admin-action" title="Modifier" onClick={() => editUser(user)}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                  <span>Modifier</span>
                </button>
                <button className="admin-action admin-action-blue" title={user.invited ? 'Renvoyer l\'invitation' : 'Envoyer un lien de réinitialisation'} onClick={() => handleResetPassword(user)}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg>
                  <span>{user.invited ? 'Renvoyer l\'invitation' : 'Mot de passe'}</span>
                </button>
                <button className="admin-action admin-action-red" title="Supprimer" onClick={() => removeUser(user.id)}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  <span>Supprimer</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
