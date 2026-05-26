export default function LoginPage({
  loginForm,
  loginError,
  onBack,
  onChange,
  onSubmit,
}) {
  return (
    <main className="login-page">
      <button className="back-link" onClick={onBack}>
        ← Retour
      </button>
      <section className="login-panel">
        <div className="login-left">
          <div className="login-left-content">
            <div className="login-logo">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              <span>PlanPro</span>
            </div>
            <h1>Connectez-vous</h1>
            <p>Accédez à vos plannings, équipes et conducteurs.</p>
            <div className="login-demo-info">
              <strong>Compte de démonstration</strong>
              <span>admin@demo.fr / 1234</span>
              <span style={{fontSize:'0.85em', opacity:0.7}}>planning@demo.fr / 1234</span>
            </div>
          </div>
        </div>
        <form className="login-right" onSubmit={onSubmit}>
          <div className="login-form-header">
            <span>Connexion</span>
            <h2>Espace planning</h2>
          </div>
          <label>Email</label>
          <input
            type="email"
            value={loginForm.email}
            onChange={(e) => onChange({ ...loginForm, email: e.target.value })}
            autoComplete="username"
          />
          <label>Mot de passe</label>
          <input
            type="password"
            value={loginForm.password}
            onChange={(e) => onChange({ ...loginForm, password: e.target.value })}
            autoComplete="current-password"
            placeholder="1234 pour tester"
          />
          {loginError && <div className="login-error">{loginError}</div>}
          <button type="submit">Se connecter</button>
        </form>
      </section>
    </main>
  );
}
