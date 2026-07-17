import { useState } from 'react';

export default function AdminUsersPage({ users, onSaveUsers, onAddUser, onRemoveUser }) {
  const [form, setForm] = useState({ email: '', nom: '', role: 'lecture' });
  const [editingId, setEditingId] = useState(null);
  const [createdInfo, setCreatedInfo] = useState(null);

  function resetForm() {
    setForm({ email: '', nom: '', role: 'lecture' });
    setEditingId(null);
    setCreatedInfo(null);
  }

  function randomPassword() {
    return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6).toUpperCase();
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
      const pwd = randomPassword();
      try {
        await onAddUser(form.email.trim().toLowerCase(), pwd, form.nom, form.role);
        setCreatedInfo({ email: form.email.trim().toLowerCase(), password: pwd });
        setForm({ email: '', nom: '', role: 'lecture' });
      } catch {
        alert('Erreur lors de la création. Vérifiez que l\'email n\'existe pas déjà.');
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
          <strong>Compte créé !</strong>
          <p>Email : {createdInfo.email}</p>
          <p>Mot de passe temporaire : <code>{createdInfo.password}</code></p>
          <p className="admin-created-hint">L'utilisateur devra changer son mot de passe à la première connexion.</p>
          <button onClick={() => setCreatedInfo(null)}>OK</button>
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
            {editingId ? 'Modifier' : 'Ajouter'}
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
            </div>
            <span>{user.role === 'admin' ? 'Admin' : user.role}</span>
            <div className="admin-row-actions">
              <button className="edit-btn" onClick={() => editUser(user)}>Modifier</button>
              <button className="delete-btn" onClick={() => removeUser(user.id)}>Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
