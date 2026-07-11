// Organiser dashboard — reads the signed-in org via RLS.
import { createClient } from '@/lib/supabase/server';
import { AdminShell, adminCard } from '@/components/AdminShell';
import { StartSessionButton } from './StartSessionButton';

const STATUS_LABEL: Record<string, string> = { trialing: 'Free trial', active: 'Active', past_due: 'Payment overdue', canceled: 'Canceled', incomplete: 'Incomplete' };

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: org } = await supabase.from('organizations').select('name, slug, subscription_status').maybeSingle();
  const { data: sessions } = await supabase
    .from('game_sessions')
    .select('id, join_code, mode, state')
    .is('ended_at', null)
    .order('created_at', { ascending: false })
    .limit(10);

  const modeIcon: Record<string, string> = { standard: '📝', team: '⚔️', speed: '⚡', oral: '🎤' };

  return (
    <AdminShell active="Sessions" title={org?.name ?? 'Dashboard'} subtitle={org ? `${org.slug}.quizarena.app · ${STATUS_LABEL[org.subscription_status] ?? org.subscription_status}` : 'Finish onboarding to continue.'}>
      {/* Hero: start a game */}
      <div style={{ ...adminCard, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: 24, background: 'linear-gradient(120deg, rgba(255,122,26,.12), rgba(255,45,85,.08))', borderColor: 'rgba(255,122,26,.25)' }}>
        <div>
          <div style={{ fontSize: 19, fontWeight: 800 }}>Ready to compete?</div>
          <div style={{ color: '#a49db3', fontSize: 14, marginTop: 2 }}>Launch a live game, or pick a mode from a question bank.</div>
        </div>
        <StartSessionButton />
      </div>

      <h2 style={{ fontSize: 14, color: '#8b8296', letterSpacing: 1, textTransform: 'uppercase', fontWeight: 800, margin: '0 0 12px' }}>Live sessions</h2>
      {(!sessions || sessions.length === 0) && (
        <div style={{ ...adminCard, color: '#8b8296', fontSize: 14, textAlign: 'center', padding: '30px 20px' }}>No live sessions yet — start one above or from a question bank.</div>
      )}
      <div style={{ display: 'grid', gap: 10 }}>
        {sessions?.map((s) => (
          <div key={s.id} style={{ ...adminCard, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 22 }}>{modeIcon[s.mode] ?? '📝'}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'ui-monospace,monospace', letterSpacing: 3, fontSize: 20, fontWeight: 800 }}>{s.join_code}</div>
              <div style={{ fontSize: 12, color: '#8b8296', textTransform: 'capitalize' }}>{s.mode} · {s.state}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, fontSize: 13, fontWeight: 700 }}>
              <a href={`/host/${s.id}`} style={{ color: '#fff', background: 'rgba(255,255,255,.08)', padding: '8px 14px', borderRadius: 9, textDecoration: 'none' }}>Control</a>
              <a href={`/display/${s.join_code}`} style={{ color: '#a49db3', padding: '8px 12px', borderRadius: 9, textDecoration: 'none' }}>Display</a>
              <a href={`/play/${s.join_code}`} style={{ color: '#a49db3', padding: '8px 12px', borderRadius: 9, textDecoration: 'none' }}>Play</a>
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 14, color: '#8b8296', letterSpacing: 1, textTransform: 'uppercase', fontWeight: 800, margin: '30px 0 12px' }}>Manage</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
        {[
          ['📚', 'Question banks', '/dashboard/questions', 'Build & import questions'],
          ['🎨', 'Branding', '/dashboard/branding', 'Theme & animation'],
          ['💳', 'Billing', '/dashboard/billing', 'Plan & payment'],
        ].map(([icon, label, href, desc]) => (
          <a key={href} href={href} style={{ ...adminCard, textDecoration: 'none', color: 'inherit', transition: 'border-color .15s' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>{label}</div>
            <div style={{ color: '#8b8296', fontSize: 13, marginTop: 2 }}>{desc}</div>
          </a>
        ))}
      </div>
    </AdminShell>
  );
}
