// Organiser dashboard home — server component, reads the signed-in org via RLS.
// Stub for P1: real auth + subscription gate + nav land here next.
import { createClient } from '@/lib/supabase/server';

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not signed in yet? P1 adds the redirect to /login.
  const { data: org } = user
    ? await supabase.from('organizations').select('name, slug, subscription_status').single()
    : { data: null };

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: 40, fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Dashboard</h1>
      <p style={{ color: '#888' }}>
        {org ? `${org.name} · ${org.subscription_status}` : 'Sign in to manage your school.'}
      </p>

      <nav style={{ display: 'grid', gap: 10, marginTop: 28 }}>
        {[
          ['Questions', '/dashboard/questions', 'Import JSON, build sections & banks'],
          ['Branding', '/dashboard/branding', 'Palette, logo & animated background'],
          ['Sessions', '/dashboard/sessions', 'Start & manage live competitions'],
          ['Billing', '/dashboard/billing', 'Plan, invoices & payment method'],
        ].map(([label, href, desc]) => (
          <a
            key={href}
            href={href}
            style={{
              border: '1px solid #2a2f3e',
              borderRadius: 12,
              padding: '16px 18px',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <strong>{label}</strong>
            <div style={{ color: '#888', fontSize: 14 }}>{desc}</div>
          </a>
        ))}
      </nav>
    </main>
  );
}
