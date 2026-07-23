import { useEffect, useState } from 'react';

export default function LoginPage({
  loginForm,
  loginError,
  onChange,
  onSubmit,
  loggingIn,
}) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <div className="login-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Serif+Display:ital@0;1&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        .login-root {
          all: initial;
          display: flex;
          height: 100vh;
          font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #142033;
          background: #fff;
          overflow: hidden;
        }

        /* ── LEFT PANEL (image side) ── */
        .login-image {
          position: relative;
          flex: 0.4;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 48px 56px;
          overflow: hidden;
          background:
            linear-gradient(135deg, #1a2e1a 0%, #2d4a2d 25%, #4a6b3a 50%, #5a7a4a 75%, #3d5a30 100%);
        }

        .login-image::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 80px,
              rgba(255,255,255,0.03) 80px,
              rgba(255,255,255,0.03) 81px
            ),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 80px,
              rgba(255,255,255,0.03) 80px,
              rgba(255,255,255,0.03) 81px
            );
        }

        .login-image::after {
          content: '';
          position: absolute;
          inset: 0;
          background:
            linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%),
            linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.06) 55%, transparent 70%);
          background-size: 100% 100%, 200% 100%;
          animation: shimmer 6s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes shimmer {
          0%, 100% { background-position: 100% 100%, 200% 0; }
          50% { background-position: 100% 100%, -50% 0; }
        }

        /* Aerial field shapes */
        .field-shapes {
          position: absolute;
          inset: 0;
          overflow: hidden;
          opacity: 0.15;
        }

        .field-shapes span {
          position: absolute;
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 2px;
        }

        .image-content {
          position: relative;
          z-index: 2;
          max-width: 520px;
        }

        .image-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px 6px 10px;
          border-radius: 20px;
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.08);
          font-size: 12px;
          font-weight: 500;
          color: rgba(255,255,255,0.8);
          letter-spacing: 0.3px;
          text-transform: uppercase;
          margin-bottom: 20px;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.6s cubic-bezier(0.23, 1, 0.32, 1), transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
          transition-delay: 0.2s;
        }

        .image-badge.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .image-badge svg {
          width: 14px;
          height: 14px;
        }

        .image-title {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: 42px;
          font-weight: 400;
          line-height: 1.1;
          color: #fff;
          margin-bottom: 12px;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s cubic-bezier(0.23, 1, 0.32, 1), transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
          transition-delay: 0.35s;
        }

        .image-title.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .image-title em {
          font-style: italic;
          color: #8bc48a;
        }

        .photo-placeholder {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 40% at 30% 20%, rgba(139,196,138,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 70% 60%, rgba(255,200,100,0.04) 0%, transparent 50%),
            radial-gradient(ellipse 80% 50% at 50% 80%, rgba(60,90,50,0.2) 0%, transparent 60%);
          pointer-events: none;
        }

        .has-photo .photo-placeholder {
          background: url('/chantier.jpg') center / cover no-repeat;
        }

        /* ── RIGHT PANEL (form side) ── */
        .login-form-panel {
          flex: 1.6;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 48px 56px;
          background: #fff;
          position: relative;
        }

        .form-inner {
          width: 100%;
          max-width: 380px;
          margin: 0 auto;
        }

        .form-logo {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 40px;
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.5s cubic-bezier(0.23, 1, 0.32, 1), transform 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .form-logo.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .form-logo-box {
          width: 32px;
          height: 32px;
          background: #16a34a;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 700;
          font-size: 14px;
          flex-shrink: 0;
        }

        .form-logo-text {
          font-weight: 700;
          font-size: 18px;
          letter-spacing: -0.3px;
          color: #142033;
        }

        .form-header {
          margin-bottom: 32px;
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.5s cubic-bezier(0.23, 1, 0.32, 1), transform 0.5s cubic-bezier(0.23, 1, 0.32, 1);
          transition-delay: 0.1s;
        }

        .form-header.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .form-header .label {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #16a34a;
          margin-bottom: 6px;
        }

        .form-header h2 {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: 26px;
          font-weight: 400;
          color: #142033;
          margin: 0;
        }

        /* ── Form ── */
        .login-form {
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.5s cubic-bezier(0.23, 1, 0.32, 1), transform 0.5s cubic-bezier(0.23, 1, 0.32, 1);
          transition-delay: 0.35s;
        }

        .login-form.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .field {
          margin-bottom: 18px;
        }

        .field:last-of-type {
          margin-bottom: 0;
        }

        .field label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          margin-bottom: 6px;
        }

        .field input {
          width: 100%;
          padding: 12px 16px;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          background: #fcfcfc;
          color: #142033;
          font-size: 15px;
          font-family: inherit;
          outline: none;
          transition: border-color 180ms cubic-bezier(0.23, 1, 0.32, 1), box-shadow 180ms cubic-bezier(0.23, 1, 0.32, 1);
        }

        .field input:focus {
          border-color: #16a34a;
          box-shadow: 0 0 0 4px rgba(22,163,74,0.08);
        }

        .field input::placeholder {
          color: #cbd5e1;
        }

        .login-error {
          padding: 10px 14px;
          border-radius: 8px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #991b1b;
          font-size: 13px;
          margin-top: 16px;
        }

        .submit-btn {
          width: 100%;
          margin-top: 20px;
          padding: 14px 24px;
          border: none;
          border-radius: 10px;
          background: #16a34a;
          color: #fff;
          font-size: 15px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: transform 160ms cubic-bezier(0.23, 1, 0.32, 1), box-shadow 200ms ease-out;
        }

        .submit-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%);
          pointer-events: none;
        }

        .submit-btn:hover {
          box-shadow: 0 6px 24px rgba(22,163,74,0.25);
        }

        .submit-btn:active {
          transform: scale(0.97);
        }

        .submit-btn.loading,
        .submit-btn:disabled {
          opacity: 0.7;
          pointer-events: none;
        }

        /* Shimmer hover effect */
        .submit-btn::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
          transition: left 0.5s;
        }

        .submit-btn:hover::after {
          left: 100%;
        }

        @media (max-width: 900px) {
          .login-root { flex-direction: column; }
          .login-image { display: none; }
          .login-form-panel { flex: none; padding: 32px 24px; }
          .form-inner { max-width: 100%; }
        }
        @media (min-width: 901px) and (max-width: 1100px) {
          .login-image { flex: 0.3; }
          .login-form-panel { flex: 1; }
        }
      `}</style>

      {/* ── LEFT: Image side ── */}
      <div className="login-image">
        <div className="photo-placeholder" />
        <div className="field-shapes">
          <span style={{top:'15%',left:'10%',width:'35%',height:'28%',borderRadius:'4px'}} />
          <span style={{top:'10%',right:'15%',width:'25%',height:'20%',borderRadius:'4px'}} />
          <span style={{bottom:'35%',left:'20%',width:'40%',height:'22%',borderRadius:'4px'}} />
          <span style={{bottom:'25%',right:'10%',width:'30%',height:'18%',borderRadius:'4px'}} />
        </div>
        <div className="image-content">
          <div className={`image-badge ${loaded ? 'visible' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
            Bâtiment
          </div>
          <h1 className={`image-title ${loaded ? 'visible' : ''}`}>
            PlanPro<br/>
            <em>planifiez</em> vos chantiers
          </h1>
        </div>
      </div>

      {/* ── RIGHT: Form side ── */}
      <div className="login-form-panel">
        <div className="form-inner">

          <div className={`form-logo ${loaded ? 'visible' : ''}`}>
            <div className="form-logo-box">PP</div>
            <span className="form-logo-text">PlanPro</span>
          </div>

          <div className={`form-header ${loaded ? 'visible' : ''}`}>
            <div className="label">Connexion</div>
            <h2>Accéder à votre espace</h2>
          </div>

          <form className={`login-form ${loaded ? 'visible' : ''}`} onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={loginForm.email}
                onChange={(e) => onChange({ ...loginForm, email: e.target.value })}
                autoComplete="username"
              />
            </div>
            <div className="field">
              <label htmlFor="password">Mot de passe</label>
              <input
                id="password"
                type="password"
                value={loginForm.password}
                onChange={(e) => onChange({ ...loginForm, password: e.target.value })}
                autoComplete="current-password"
              />
            </div>
            {loginError && <div className="login-error">{loginError}</div>}
            <button type="submit" className="submit-btn" disabled={loggingIn}>
              {loggingIn ? 'Connexion\u2026' : 'Se connecter'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
