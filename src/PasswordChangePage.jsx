import { useState } from 'react';

export default function PasswordChangePage({ onSubmit }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password.length < 4) { setError('Mot de passe trop court (min 4 caractères).'); return; }
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return; }
    setLoading(true);
    try {
      await onSubmit(password);
    } catch {
      setError('Erreur lors du changement de mot de passe.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-root">
      <style>{`
        .login-root { all: initial; display: flex; height: 100vh; font-family: 'DM Sans', sans-serif; color: #142033; background: #fff; }
        .pw-change-panel { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 48px; }
        .pw-change-inner { width: 100%; max-width: 400px; }
        .pw-change-inner h2 { font-size: 24px; margin-bottom: 8px; }
        .pw-change-inner p { color: #64748b; margin-bottom: 24px; font-size: 14px; }
        .field { margin-bottom: 18px; }
        .field label { display: block; font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 6px; }
        .field input { width: 100%; padding: 12px 16px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 15px; font-family: inherit; outline: none; }
        .field input:focus { border-color: #16a34a; box-shadow: 0 0 0 4px rgba(22,163,74,0.08); }
        .error { padding: 10px 14px; border-radius: 8px; background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; font-size: 13px; margin-top: 16px; }
        .submit-btn { width: 100%; margin-top: 20px; padding: 14px 24px; border: none; border-radius: 10px; background: #16a34a; color: #fff; font-size: 15px; font-weight: 600; cursor: pointer; }
        .submit-btn:disabled { opacity: 0.7; pointer-events: none; }
      `}</style>
      <div className="pw-change-panel">
        <div className="pw-change-inner">
          <h2>Changer votre mot de passe</h2>
          <p>Ceci est votre première connexion. Veuillez choisir un mot de passe définitif.</p>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="pw">Nouveau mot de passe</label>
              <input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="Minimum 4 caractères" />
            </div>
            <div className="field">
              <label htmlFor="confirm">Confirmer le mot de passe</label>
              <input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" placeholder="Retaper le mot de passe" />
            </div>
            {error && <div className="error">{error}</div>}
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Changement…' : 'Changer le mot de passe'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
