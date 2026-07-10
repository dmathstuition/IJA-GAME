// Organiser dashboard — reads the signed-in org via RLS.
import { createClient } from '@/lib/supabase/server';
import { StartSessionButton } from './StartSessionButton';

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: org } = await supabase
    .from('organizations')
    .select('name, slug, subscription_status')
    .maybeSingle();

  const { data: sessions } = await supabase
    .from('game_sessions')
    .select('id, join_code, mode, state')
    .is('ended_at', null)
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: 40, fontFamily: 'system-ui', color: '#e8eef5' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 28, marginBottom: 4 }}>{org?.name ?? 'Dashboard'}</h1>
          <p style={{ color: '#8a93a0', fontSize: 14 }}>
            {org ? `${org.slug} · plan: ${org.subscription_status}` : 'Finish onboarding to continue.'}
          </p>
        </div>
        <form action="/auth/signout" method="post">
          <button style={{ background: 'transparent', border: '1px solid #333', color: '#aaa', padding: '8px 14px', borderRadius: 8, cursor: 'pointer' }}>Sign out</button>
        </form>
      </div>

      <div style={{ margin: '24px 0' }}>
        <StartSessionButton />
      </div>

      <h2 style={{ fontSize: 16, color: '#8a93a0', margin: '8px 0 12px' }}>Live sessions</h2>
      {(!sessions || sessions.length === 0) && <p style={{ color: '#8a93a0', fontSize: 14 }}>No live sessions. Start one above.</p>}
      <div style={{ display: 'grid', gap: 8 }}>
        {sessions?.map((s) => (
          <div key={s.id} style={{ border: '1px solid #2a2f3e', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <b style={{ fontFamily: 'ui-monospace', letterSpacing: 2, fontSize: 18 }}>{s.join_code}</b>
            <span style={{ fontSize: 12, color: '#8a93a0' }}>{s.mode} · {s.state}</span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, fontSize: 13 }}>
              <a href={`/host/${s.id}`} style={{ color: '#60a5fa' }}>Control</a>
              <a href={`/display/${s.join_code}`} style={{ color: '#60a5fa' }}>Display</a>
              <a href={`/play/${s.join_code}`} style={{ color: '#60a5fa' }}>Play</a>
            </div>
          </div>
        ))}
      </div>

      <nav style={{ display: 'grid', gap: 8, marginTop: 32 }}>
        {[
          ['Questions', '/dashboard/questions', 'Build reusable question banks & launch games'],
          ['Billing', '/dashboard/billing', 'Plan, trial status & payment'],
        ].map(([label, href, desc]) => (
          <a key={href} href={href} style={{ border: '1px solid #2a2f3e', borderRadius: 12, padding: '14px 16px', textDecoration: 'none', color: 'inherit' }}>
            <strong>{label}</strong>
            <div style={{ color: '#8a93a0', fontSize: 13 }}>{desc}</div>
          </a>
        ))}
        <div style={{ border: '1px dashed #2a2f3e', borderRadius: 12, padding: '14px 16px', opacity: 0.7 }}>
          <strong>Branding</strong>
          <div style={{ color: '#8a93a0', fontSize: 13 }}>Palette & animated background — next phase</div>
        </div>
      </nav>
    </main>
  );
}
