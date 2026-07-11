import { createClient } from '@/lib/supabase/server';
import { canHostLive } from '@/lib/billing';
import { AdminShell, adminCard, adminPrimary } from '@/components/AdminShell';

const LABEL: Record<string, string> = { trialing: 'Free trial', active: 'Active', past_due: 'Payment overdue', canceled: 'Canceled', incomplete: 'Incomplete' };

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ success?: string }> }) {
  const { success } = await searchParams;
  const supabase = await createClient();
  const { data: org } = await supabase.from('organizations').select('name, plan, subscription_status, stripe_customer_id').maybeSingle();
  const status = org?.subscription_status ?? 'incomplete';
  const live = canHostLive(status);

  return (
    <AdminShell active="Billing" title="Billing" subtitle={org?.name ?? undefined}>
      {success && (
        <div style={{ marginBottom: 16, padding: '13px 18px', borderRadius: 12, background: 'rgba(37,211,102,.12)', border: '1px solid rgba(37,211,102,.4)', color: '#4ade80', fontSize: 14, fontWeight: 600 }}>✓ Subscription updated. Thank you!</div>
      )}
      <div style={{ ...adminCard, maxWidth: 620 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: '#8b8296', textTransform: 'uppercase', letterSpacing: 1 }}>Current plan</div>
            <div style={{ fontSize: 24, fontWeight: 900, marginTop: 4 }}>{LABEL[status] ?? status}</div>
          </div>
          <span style={{ padding: '6px 14px', borderRadius: 999, fontSize: 12.5, fontWeight: 800, background: live ? 'rgba(37,211,102,.15)' : 'rgba(255,45,85,.15)', color: live ? '#4ade80' : '#ff6b8a' }}>{live ? 'Live hosting enabled' : 'Hosting locked'}</span>
        </div>
        <div style={{ marginTop: 22 }}>
          {org?.stripe_customer_id ? (
            <form action="/api/stripe/portal" method="post"><button style={{ ...adminPrimary, border: 'none' }}>Manage subscription</button></form>
          ) : (
            <a href="/pricing" style={adminPrimary}>Choose a plan →</a>
          )}
        </div>
      </div>
      <p style={{ marginTop: 18, fontSize: 13.5, color: '#8b8296', lineHeight: 1.6, maxWidth: 620 }}>
        Editing questions and branding is always available. An active plan (or trial) is required to run a <b style={{ color: '#c9c2d6' }}>live</b> game.
      </p>
    </AdminShell>
  );
}
