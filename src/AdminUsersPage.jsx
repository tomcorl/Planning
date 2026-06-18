import { useState } from 'react';

export default function AdminUsersPage({ users, onSaveUsers, onAddUser, onRemoveUser }) {
  const [form, setForm] = useState({ email: '', nom: '', password: '1234', role: 'planning' });
  const [editingId, setEditingId] = useState(null);

  function resetForm() {
    setForm({ email: '', nom: '', password: '1234', role: 'planning' });
    setEditingId(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email.trim() || !form.nom.trim()) return;

    if (editingId) {
      onSaveUsers(
        users.map((user) =>
          user.id === editingId
            ? { ...form, email: form.email.trim().toLowerCase(), id: editingId, password: user.password || '' }
            : user
        )
      );
    } else {
      try {
        await onAddUser(form.email.trim().toLowerCase(), form.password, form.nom, form.role);
      } catch {
        alert('Erreur lors de la création. Vérifiez que l\'email n\'existe pas déjà.');
      }
    }
    resetForm();
  }

  function editUser(user) {
    setForm({
      email: user.email,
      nom: user.nom,
      password: '',
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

      <form className="admin-form" onSubmit={handleSubmit}>
        <input
          value={form.nom}
          onChange={(e) => setForm({ ...form, nom: e.target.value })}
          placeholder="Nom"
        />
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="email@entreprise.fr"
        />
        {!editingId && (
          <input
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Mot de passe"
          />
        )}
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="admin">Admin</option>
          <option value="planning">Planning</option>
          <option value="lecture">Lecture seule</option>
        </select>
        <button type="submit">
          {editingId ? 'Modifier utilisateur' : 'Ajouter utilisateur'}
        </button>
        {editingId && (
          <button type="button" className="cancel-edit" onClick={resetForm}>
            Annuler
          </button>
        )}
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
