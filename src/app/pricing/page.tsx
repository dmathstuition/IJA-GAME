import { PLANS } from '@/lib/billing';

// Public pricing page. Each plan posts to the checkout route; the route requires
// sign-in, so signed-out visitors are bounced to /login first.
export default function PricingPage() {
  return (
    <main style={{ minHeight: '100vh', padding: '64px 20px', background: 'linear-gradient(160deg,var(--bg-from),var(--bg-to))', color: 'var(--text)', fontFamily: 'system-ui' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ color: 'var(--accent)', letterSpacing: 3, fontWeight: 800, fontSize: 12 }}>PRICING</p>
        <h1 style={{ fontSize: 'clamp(30px,5vw,48px)', color: 'var(--accent)', margin: '8px 0 6px' }}>Plans for every school</h1>
        <p style={{ color: 'var(--text-dim)', marginBottom: 40 }}>Every plan starts with a 14-day free trial. Cancel anytime.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16, textAlign: 'left' }}>
          {PLANS.map((plan) => (
            <div key={plan.id} style={{ border: `1px solid ${plan.featured ? 'var(--accent)' : 'rgba(255,255,255,.14)'}`, borderRadius: 16, padding: 24, background: plan.featured ? 'rgba(255,214,0,.06)' : 'rgba(0,0,0,.25)' }}>
              <div style={{ fontFamily: 'ui-monospace', color: 'var(--accent)', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase' }}>{plan.name}</div>
              <div style={{ fontSize: 34, fontWeight: 900, margin: '6px 0' }}>{plan.price}<span style={{ fontSize: 13, color: 'var(--text-dim)', fontWeight: 500 }}>{plan.cadence}</span></div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '14px 0', display: 'grid', gap: 8 }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ fontSize: 14, color: 'var(--text-dim)' }}>+ {f}</li>
                ))}
              </ul>
              <form action="/api/stripe/checkout" method="post">
                <input type="hidden" name="plan" value={plan.id} />
                <button style={{ width: '100%', padding: '12px', borderRadius: 10, border: 'none', background: plan.featured ? 'var(--accent)' : 'var(--primary)', color: plan.featured ? '#1a0006' : '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>
                  Choose {plan.name}
                </button>
              </form>
            </div>
          ))}

          <div style={{ border: '1px dashed rgba(255,255,255,.2)', borderRadius: 16, padding: 24, background: 'rgba(0,0,0,.2)' }}>
            <div style={{ fontFamily: 'ui-monospace', color: 'var(--accent)', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase' }}>District</div>
            <div style={{ fontSize: 34, fontWeight: 900, margin: '6px 0' }}>Custom</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '14px 0', display: 'grid', gap: 8 }}>
              <li style={{ fontSize: 14, color: 'var(--text-dim)' }}>+ Multiple schools</li>
              <li style={{ fontSize: 14, color: 'var(--text-dim)' }}>+ Unlimited players</li>
              <li style={{ fontSize: 14, color: 'var(--text-dim)' }}>+ Priority support</li>
            </ul>
            <a href="mailto:hello@quizarena.app" style={{ display: 'block', textAlign: 'center', padding: '12px', borderRadius: 10, background: 'transparent', border: '1px solid rgba(255,255,255,.2)', color: 'var(--text)', fontWeight: 800, fontSize: 15, textDecoration: 'none' }}>Contact us</a>
          </div>
        </div>
      </div>
    </main>
  );
}
