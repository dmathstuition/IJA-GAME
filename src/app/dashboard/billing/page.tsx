import { createClient } from '@/lib/supabase/server';
import { canHostLive } from '@/lib/billing';
import { AdminShell, adminCard, adminPrimary } from '@/components/AdminShell';

const LABEL: Record<string, string> = { trialing: 'Free trial', active: 'Active', past_due: 'Payment overdue', canceled: 'Canceled', incomplete: 'Not activated' };

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ success?: string; cancelled?: string; error?: string }> }) {
  const { success, cancelled, error } = await searchParams;
  const supabase = await createClient();
  const { data: org } = await supabase.from('organizations').select('name, plan, subscription_status, paid_until, trial_ends_at').maybeSingle();
  const status = org?.subscription_status ?? 'incomplete';
  const paidUntil = (org as { paid_until?: string | null } | null)?.paid_until ?? null;
  const live = canHostLive(status, paidUntil);
  const fmt = (d?: string | null) => (d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : null);

  return (
    <AdminShell active="Billing" title="Billing" subtitle={org?.name ?? undefined}>
      {success && (
        <div style={{ marginBottom: 16, padding: '13px 18px', borderRadius: 12, background: 'rgba(37,211,102,.12)', border: '1px solid rgba(37,211,102,.4)', color: '#4ade80', fontSize: 14, fontWeight: 600 }}>✓ Payment received — your school is activated. Thank you!</div>
      )}
      {cancelled && (
        <div style={{ marginBottom: 16, padding: '13px 18px', borderRadius: 12, background: 'rgba(255,214,0,.1)', border: '1px solid rgba(255,214,0,.35)', color: '#fbbf24', fontSize: 14, fontWeight: 600 }}>Checkout cancelled — no payment was taken.</div>
      )}
      {error && (
        <div style={{ marginBottom: 16, padding: '13px 18px', borderRadius: 12, background: 'rgba(255,45,85,.1)', border: '1px solid rgba(255,45,85,.35)', color: '#ff6b8a', fontSize: 14, fontWeight: 600 }}>Payment problem: {error}</div>
      )}

      <div style={{ ...adminCard, maxWidth: 620 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: '#8b8296', textTransform: 'uppercase', letterSpacing: 1 }}>Current status</div>
            <div style={{ fontSize: 24, fontWeight: 900, marginTop: 4 }}>{LABEL[status] ?? status}</div>
            {status === 'active' && paidUntil && <div style={{ fontSize: 13, color: '#8b8296', marginTop: 2 }}>Active until {fmt(paidUntil)}</div>}
            {status === 'trialing' && org?.trial_ends_at && <div style={{ fontSize: 13, color: '#8b8296', marginTop: 2 }}>Trial ends {fmt(org.trial_ends_at)}</div>}
          </div>
          <span style={{ padding: '6px 14px', borderRadius: 999, fontSize: 12.5, fontWeight: 800, background: live ? 'rgba(37,211,102,.15)' : 'rgba(255,45,85,.15)', color: live ? '#4ade80' : '#ff6b8a' }}>{live ? 'Live hosting enabled' : 'Hosting locked'}</span>
        </div>
        <div style={{ marginTop: 22 }}>
          <a href="/pricing" style={adminPrimary}>{status === 'active' ? 'Renew or upgrade →' : 'Activate with PayPal →'}</a>
        </div>
      </div>

      <p style={{ marginTop: 18, fontSize: 13.5, color: '#8b8296', lineHeight: 1.6, maxWidth: 620 }}>
        Editing questions and branding is always available. A one-time PayPal payment (or an active trial) unlocks <b style={{ color: '#c9c2d6' }}>live</b> game hosting — there is no recurring subscription and no card is stored.
      </p>
    </AdminShell>
  );
}
