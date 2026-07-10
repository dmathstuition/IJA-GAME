import { createClient } from '@/lib/supabase/server';
import { canHostLive } from '@/lib/billing';

const LABEL: Record<string, string> = {
  trialing: 'Free trial',
  active: 'Active',
  past_due: 'Payment overdue',
  canceled: 'Canceled',
  incomplete: 'Incomplete',
};

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ success?: string }> }) {
  const { success } = await searchParams;
  const supabase = await createClient();
  const { data: org } = await supabase
    .from('organizations')
    .select('name, plan, subscription_status, trial_ends_at, stripe_customer_id')
    .maybeSingle();

  const status = org?.subscription_status ?? 'incomplete';
  const live = canHostLive(status);

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: 40, fontFamily: 'system-ui', color: '#e8eef5' }}>
      <a href="/dashboard" style={{ color: '#8a93a0', fontSize: 13, textDecoration: 'none' }}>← Dashboard</a>
      <h1 style={{ fontSize: 26, margin: '10px 0 4px' }}>Billing</h1>
      <p style={{ color: '#8a93a0', fontSize: 14 }}>{org?.name}</p>

      {success && (
        <div style={{ margin: '16px 0', padding: '12px 16px', borderRadius: 10, background: 'rgba(34,197,94,.12)', border: '1px solid rgba(34,197,94,.4)', color: '#4ade80', fontSize: 14 }}>
          ✓ Subscription updated. Thank you!
        </div>
      )}

      <div style={{ marginTop: 20, border: '1px solid #2a2f3e', borderRadius: 14, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, color: '#8a93a0', textTransform: 'uppercase', letterSpacing: 1 }}>Current status</div>
            <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{LABEL[status] ?? status}</div>
          </div>
          <span style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: live ? 'rgba(34,197,94,.15)' : 'rgba(239,68,68,.15)', color: live ? '#4ade80' : '#f87171' }}>
            {live ? 'Live hosting enabled' : 'Hosting locked'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          {org?.stripe_customer_id ? (
            <form action="/api/stripe/portal" method="post">
              <button style={{ padding: '11px 18px', borderRadius: 10, border: 'none', background: 'var(--primary,#cc0022)', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Manage subscription</button>
            </form>
          ) : (
            <a href="/pricing" style={{ padding: '11px 18px', borderRadius: 10, background: 'var(--primary,#cc0022)', color: '#fff', fontWeight: 800, textDecoration: 'none' }}>Choose a plan</a>
          )}
        </div>
      </div>

      <p style={{ marginTop: 18, fontSize: 13, color: '#8a93a0', lineHeight: 1.6 }}>
        Editing questions and branding is always available. An active plan (or trial) is required to
        run a <b>live</b> game.
      </p>
    </main>
  );
}
