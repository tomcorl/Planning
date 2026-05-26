import { useState } from 'react';

const PLAN_DETAILS = {
  Starter: { price: '49€', detail: 'par mois' },
  Pro: { price: '99€', detail: 'par mois' },
  Entreprise: { price: 'Sur mesure', detail: 'devis personnalisé' },
};

export default function PaymentPage({ planName, onBack, onComplete }) {
  const plan = PLAN_DETAILS[planName] || PLAN_DETAILS.Pro;
  const [form, setForm] = useState({ company: '', email: '', card: '', expiry: '', cvc: '' });
  const [processing, setProcessing] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onComplete();
    }, 1500);
  }

  return (
    <main className="pay-page">
      <div className="pay-bg" />
      <button className="pay-back" onClick={onBack}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Retour
      </button>

      <div className="pay-layout">
        <div className="pay-left">
          <div className="pay-badge">{planName}</div>
          <h2 className="pay-title">Finalisez votre <br/>abonnement</h2>
          <div className="pay-price-block">
            <strong>{plan.price}</strong>
            <span>{plan.detail}</span>
          </div>
          <ul className="pay-features">
            <li>Accès immédiat à l&apos;application</li>
            <li>Données sauvegardées automatiquement</li>
            <li>Support technique inclus</li>
            <li>Paiement sécurisé (démo)</li>
          </ul>
          <div className="pay-guarantee">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Paiement fictif — aucune transaction réelle
          </div>
        </div>

        <div className="pay-right">
          <form onSubmit={handleSubmit}>
            <div className="pay-field">
              <label>Entreprise</label>
              <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Nom de votre entreprise" required />
            </div>
            <div className="pay-field">
              <label>Email professionnel</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="vous@entreprise.fr" required />
            </div>
            <div className="pay-field">
              <label>Numéro de carte</label>
              <input value={form.card} onChange={(e) => setForm({ ...form, card: e.target.value })} placeholder="4242 4242 4242 4242" required />
            </div>
            <div className="pay-row">
              <div className="pay-field">
                <label>Expiration</label>
                <input value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} placeholder="MM/AA" required />
              </div>
              <div className="pay-field">
                <label>CVC</label>
                <input value={form.cvc} onChange={(e) => setForm({ ...form, cvc: e.target.value })} placeholder="123" required />
              </div>
            </div>
            <button className="pay-btn" type="submit" disabled={processing}>
              {processing ? 'Traitement…' : `Payer ${plan.price}`}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
