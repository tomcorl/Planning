import { useState, useEffect, useRef } from 'react';

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, inView];
}

export default function LandingPage({ onLogin, onSelectPlan }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const prices = [
    {
      name: 'Starter',
      price: '49€',
      detail: '/mois',
      points: ['1 entreprise', 'Planning visuel complet', 'Équipes et congés', 'Support email'],
    },
    {
      name: 'Pro',
      price: '99€',
      detail: '/mois',
      featured: true,
      points: ['Multi-entreprises', 'Gestion des utilisateurs', 'Vues avancées + filtres', 'Support prioritaire'],
    },
    {
      name: 'Entreprise',
      price: 'Sur mesure',
      detail: 'devis personnalisé',
      points: ['Rôles et permissions avancés', 'Exports et API', 'Backend dédié', 'Accompagnement'],
    },
  ];

  return (
    <main className="landing">
      <header className="landing-header">
        <div className="landing-header-inner">
          <div className="landing-logo">
            <div className="logo-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </div>
            <span>PlanPro</span>
          </div>
          <button className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? '✕' : '☰'}
          </button>
          <nav className={menuOpen ? 'open' : ''}>
            <a href="#features" onClick={() => setMenuOpen(false)}>Fonctionnalités</a>
            <a href="#pricing" onClick={() => setMenuOpen(false)}>Tarifs</a>
            <button className="nav-cta" onClick={onLogin}>Connexion</button>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-inner">
          <div className="hero-left">
            <div className="hero-badge">Planning opérationnel</div>
            <h1>Planifiez vos chantiers <br/>sans <span className="hero-highlight">perdre de temps</span></h1>
            <p>Un tableau de bord visuel pour suivre vos équipes, conducteurs et chantiers au quotidien. Multi-entreprise, simple et rapide.</p>
            <div className="hero-buttons">
              <button className="btn-primary" onClick={onLogin}>Essayer gratuitement</button>
              <a href="#pricing" className="btn-outline">Voir les offres</a>
            </div>
            <div className="hero-trust">
              <span className="trust-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Sans engagement
              </span>
              <span className="trust-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Données locales
              </span>
              <span className="trust-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Démo immédiate
              </span>
            </div>
          </div>
          <div className="hero-right">
            <div className="hero-window">
              <div className="window-dots">
                <span className="dot red" /><span className="dot yellow" /><span className="dot green" />
              </div>
              <div className="window-content">
                <div className="window-bar">
                  <div className="window-bar-label">Équipe 1</div>
                  <div className="window-bar-track">
                    <div className="window-fill" style={{ width: '75%', background: '#93c5fd' }} />
                  </div>
                </div>
                <div className="window-bar">
                  <div className="window-bar-label">Équipe 2</div>
                  <div className="window-bar-track">
                    <div className="window-fill" style={{ width: '55%', background: '#86efac', marginLeft: '15%' }} />
                  </div>
                </div>
                <div className="window-bar">
                  <div className="window-bar-label">Équipe 3</div>
                  <div className="window-bar-track">
                    <div className="window-fill" style={{ width: '65%', background: '#fde68a', marginLeft: '8%' }} />
                  </div>
                </div>
                <div className="window-bar">
                  <div className="window-bar-label">Équipe 4</div>
                  <div className="window-bar-track">
                    <div className="window-fill" style={{ width: '40%', background: '#fca5a5', marginLeft: '30%' }} />
                  </div>
                </div>
                <div className="window-footer">
                  <span><strong>8</strong> chantiers</span>
                  <span><strong>3</strong> conducteurs</span>
                  <span><strong>4</strong> équipes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features" id="features">
        <div className="features-inner">
          <div className="section-label">Fonctionnalités</div>
          <h2 className="section-title">Tout ce qu&apos;il faut pour piloter vos chantiers</h2>
          <div className="features-grid">
            <FeatureCard
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
                </svg>
              }
              title="Timeline interactive"
              desc="Créez et déplacez vos chantiers par glisser-déposer. Ajustez les durées avec les poignées de redimensionnement. Vue jour, semaine, mois ou année."
              color="#3b82f6"
            />
            <FeatureCard
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              }
              title="Multi-sociétés"
              desc="Gérez plusieurs entreprises indépendantes depuis un seul compte. Chaque société conserve ses propres équipes, chantiers et conducteurs."
              color="#22c55e"
            />
              <FeatureCard
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              }
              title="Filtres avancés"
              desc="Filtrez le planning par équipe, conducteur, couleur ou statut (en cours/terminé). Basculez l'affichage des week-ends et jours fériés."
              color="#ef4444"
            />
            <FeatureCard
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                </svg>
              }
              title="Gestion des congés"
              desc="Définissez des congés par équipe et des jours fériés personnalisés. Le planning les prend automatiquement en compte dans le calcul des dates."
              color="#f59e0b"
            />
            <FeatureCard
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              }
              title="Conducteurs & affectations"
              desc="Assignez un conducteur et une couleur à chaque chantier. La barre conducteur s'affiche sous chaque bloc pour un repérage immédiat."
              color="#8b5cf6"
            />
            <FeatureCard
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="18" y1="8" x2="23" y2="8"/><line x1="20.5" y1="5.5" x2="20.5" y2="10.5"/>
                </svg>
              }
              title="Administration"
              desc="Créez et gérez les utilisateurs avec leurs rôles (admin, planning, lecture). Contrôlez les accès aux entreprises depuis le panneau admin."
              color="#06b6d4"
            />
          </div>
        </div>
      </section>

      <section className="pricing" id="pricing">
        <div className="pricing-inner">
          <div className="section-label">Tarifs</div>
          <h2 className="section-title">Une offre adaptée à votre structure</h2>
          <div className="pricing-cards">
            {prices.map((plan) => (
              <article
                className={`pricing-item ${plan.featured ? 'featured' : ''}`}
                key={plan.name}
              >
                <div className="pricing-item-header">
                  <h3>{plan.name}</h3>
                  <div className="pricing-item-price">
                    <strong>{plan.price}</strong>
                    <span>{plan.detail}</span>
                  </div>
                </div>
                <ul>
                  {plan.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                <button onClick={() => onSelectPlan(plan.name)}>
                  {plan.name === 'Entreprise' ? 'Nous contacter' : `Choisir ${plan.name}`}
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-strip">
        <div className="cta-strip-inner">
          <h2>Prêt à simplifier votre planning ?</h2>
          <p>Accédez à la démo immédiatement, sans création de compte.</p>
          <button className="btn-primary btn-lg" onClick={onLogin}>Démarrer la démo</button>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="landing-logo">
            <div className="logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </div>
            <span>PlanPro</span>
          </div>
          <p className="footer-text">Planning chantier — Application de pilotage pour entreprises de travaux.</p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, desc, color }) {
  const [ref, inView] = useInView(0.1);
  return (
    <article className={`feature-item ${inView ? 'show' : ''}`} ref={ref}>
      <div className="feature-item-icon" style={{ background: `${color}1a`, color }}>
        {icon}
      </div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </article>
  );
}
