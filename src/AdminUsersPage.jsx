import { useState } from 'react';

export default function AdminUsersPage({ users, onSaveUsers, onAddUser, onRemoveUser, onResetUserPassword }) {
  const [form, setForm] = useState({ email: '', nom: '', role: 'lecture' });
  const [editingId, setEditingId] = useState(null);
  const [createdInfo, setCreatedInfo] = useState(null);
  const [resetInfo, setResetInfo] = useState(null);

  function resetForm() {
    setForm({ email: '', nom: '', role: 'lecture' });
    setEditingId(null);
    setCreatedInfo(null);
    setResetInfo(null);
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
    } else {
      try {
        await onAddUser(form.email.trim().toLowerCase(), form.nom, form.role);
        setCreatedInfo({ email: form.email.trim().toLowerCase() });
        setForm({ email: '', nom: '', role: 'lecture' });
      } catch (err) {
        alert(err?.message || 'Erreur lors de l\'envoi de l\'invitation. Vérifiez que l\'email n\'existe pas déjà.');
      }
    }
  }

  function editUser(user) {
    setForm({
      email: user.email,
      nom: user.nom,
      role: user.role,
    });
    setEditingId(user.id);
  }

  function removeUser(id) {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    onRemoveUser(id);
  }

  async function handleResetPassword(user) {
    if (!window.confirm(`Envoyer un email de réinitialisation de mot de passe à ${user.email} ?`)) return;
    try {
      await onResetUserPassword(user.email);
      setResetInfo({ email: user.email });
    } catch (err) {
      alert(err?.message || 'Erreur lors de l\'envoi du lien de réinitialisation.');
    }
  }

  return (
    <section className="admin-page">
      <div className="admin-heading">
        <div>
          <span>Administration</span>
          <h1>Utilisateurs</h1>
        </div>
        <p>Gérez les accès des utilisateurs.</p>
      </div>

      {createdInfo && (
        <div className="admin-created-info">
          <strong>Invitation envoyée !</strong>
          <p>Email : {createdInfo.email}</p>
          <p className="admin-created-hint">L'utilisateur recevra un email d'invitation et choisira lui-même son mot de passe.</p>
          <button onClick={() => setCreatedInfo(null)}>OK</button>
        </div>
      )}

      {resetInfo && (
        <div className="admin-created-info">
          <strong>Lien de réinitialisation envoyé !</strong>
          <p>Email : {resetInfo.email}</p>
          <p className="admin-created-hint">L'utilisateur recevra un email pour choisir un nouveau mot de passe.</p>
          <button onClick={() => setResetInfo(null)}>OK</button>
        </div>
      )}

      <form className="admin-form" onSubmit={handleSubmit}>
        <input
          value={form.nom}
          aria-label="Nom"
          onChange={(e) => setForm({ ...form, nom: e.target.value })}
          placeholder="Nom"
        />
        <input
          type="email"
          value={form.email}
          aria-label="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="email@entreprise.fr"
        />
        <div className="admin-form-row">
          <select
            value={form.role}
            aria-label="Rôle"
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="lecture">Lecture seule</option>
            <option value="planning">Planning (modification)</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit">
            {editingId ? 'Modifier' : 'Inviter'}
          </button>
          {editingId && (
            <button type="button" className="cancel-edit" onClick={resetForm}>
              Annuler
            </button>
          )}
        </div>
      </form>

      <div className="admin-table">
        {users.map((user) => (
          <div className="admin-row" key={user.id}>
            <div>
              <strong>{user.nom}</strong>
              <span>{user.email}</span>
              <small className={user.invited ? 'invite-pending' : 'invite-active'}>
                {user.invited ? 'Invitation en attente' : 'Compte actif'}
              </small>
            </div>
            <span>{user.role === 'admin' ? 'Admin' : user.role}</span>
            <div className="admin-row-actions">
              <button className="edit-btn" onClick={() => editUser(user)}>Modifier</button>
              {user.invited ? (
                <button className="reset-btn" onClick={() => handleResetPassword(user)}>Renvoyer l'invitation</button>
              ) : (
                <button className="reset-btn" onClick={() => handleResetPassword(user)}>Mot de passe</button>
              )}
              <button className="delete-btn" onClick={() => removeUser(user.id)}>Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
