// Organiser dashboard — reads the signed-in org via RLS.
import { createClient } from '@/lib/supabase/server';
import { AdminShell, adminCard } from '@/components/AdminShell';
import { canHostLive } from '@/lib/billing';
import { Lock, Library, Play, Smartphone, FileText, Swords, Zap, Mic, Palette, CreditCard, History } from 'lucide-react';
import { StartSessionButton } from './StartSessionButton';
import { SessionActions } from './SessionActions';

const STATUS_LABEL: Record<string, string> = { trialing: 'Free trial', active: 'Active', past_due: 'Payment overdue', canceled: 'Canceled', incomplete: 'Not activated' };

const MODE_ICON: Record<string, React.ReactNode> = {
  standard: <FileText size={22} color="#60a5fa" />,
  team: <Swords size={22} color="#e21b3c" />,
  speed: <Zap size={22} color="#f97316" />,
  oral: <Mic size={22} color="#8b5cf6" />,
};

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: org } = await supabase.from('organizations').select('id, name, slug, subscription_status, paid_until, trial_ends_at').maybeSingle();
  const o = org as { paid_until?: string | null; trial_ends_at?: string | null } | null;
  const live = canHostLive(org?.subscription_status, o?.paid_until, o?.trial_ends_at);
  // Scope explicitly to this school: the public-read policy (which lets
  // players join by code) would otherwise leak other orgs' live sessions
  // into this list — rows the organiser can see but never delete.
  const { data: sessions } = org
    ? await supabase
        .from('game_sessions')
        .select('id, join_code, mode, state')
        .eq('org_id', org.id)
        .is('ended_at', null)
        .order('created_at', { ascending: false })
        .limit(10)
    : { data: [] };

  return (
    <AdminShell active="Sessions" title={org?.name ?? 'Dashboard'} subtitle={org ? `${org.slug}.qizora.com · ${STATUS_LABEL[org.subscription_status] ?? org.subscription_status}` : 'Finish onboarding to continue.'}>
      {!live && (
        <a href="/dashboard/billing" style={{ ...adminCard, display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit', marginBottom: 16, borderColor: 'rgba(255,214,0,.35)', background: 'rgba(255,214,0,.07)' }}>
          <Lock size={18} color="#fbbf24" />
          <span><b style={{ color: '#fbbf24' }}>Live hosting is locked.</b> <span style={{ color: '#c9c2d6', fontSize: 14 }}>Activate your school with a one-time PayPal payment to run live games. Building questions & branding stays free →</span></span>
        </a>
      )}

      {/* Hero: start a game */}
      <div style={{ ...adminCard, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: 24, background: 'linear-gradient(120deg, rgba(255,122,26,.12), rgba(255,45,85,.08))', borderColor: 'rgba(255,122,26,.25)' }}>
        <div>
          <div style={{ fontSize: 19, fontWeight: 800 }}>Ready to compete?</div>
          <div style={{ color: '#a49db3', fontSize: 14, marginTop: 2 }}>Launch a live game, or pick a mode from a question bank.</div>
        </div>
        <StartSessionButton />
      </div>

      {/* How it works — a clear 3-step path for new organisers */}
      <h2 style={{ fontSize: 14, color: '#8b8296', letterSpacing: 1, textTransform: 'uppercase', fontWeight: 800, margin: '0 0 12px' }}>How it works</h2>
      <div className="qz-stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 12, marginBottom: 26 }}>
        {[
          ['1', <Library key="i" size={22} color="#60a5fa" />, 'Build your questions', 'Create a question bank, or import JSON straight into a live game from the Organiser Tools.', '/dashboard/questions'],
          ['2', <Play key="i" size={22} color="#4ade80" />, 'Start a game', 'Launch a mode (Standard, Team, Speed or Oral) and put the join code on the projector.', null],
          ['3', <Smartphone key="i" size={22} color="#f97316" />, 'Players join & you host', 'Students open your link, type the code, and you drive the whole game live from any device.', null],
        ].map(([n, icon, title, desc, href]) => {
          const inner = (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ width: 26, height: 26, borderRadius: 999, background: 'linear-gradient(135deg,#FF6A00,#ff2d55)', color: '#fff', fontWeight: 900, fontSize: 14, display: 'grid', placeItems: 'center' }}>{n as string}</span>
                {icon}
              </div>
              <div style={{ fontWeight: 800, fontSize: 15.5 }}>{title as string}</div>
              <div style={{ color: '#8b8296', fontSize: 13, marginTop: 3, lineHeight: 1.5 }}>{desc as string}</div>
            </>
          );
          return href ? (
            <a key={n as string} href={href as string} className="qz-lift" style={{ ...adminCard, textDecoration: 'none', color: 'inherit' }}>{inner}</a>
          ) : (
            <div key={n as string} style={adminCard}>{inner}</div>
          );
        })}
      </div>

      <h2 style={{ fontSize: 14, color: '#8b8296', letterSpacing: 1, textTransform: 'uppercase', fontWeight: 800, margin: '0 0 12px' }}>Live sessions</h2>
      {(!sessions || sessions.length === 0) && (
        <div style={{ ...adminCard, color: '#8b8296', fontSize: 14, textAlign: 'center', padding: '30px 20px' }}>No live sessions yet — start one above or from a question bank.</div>
      )}
      <div style={{ display: 'grid', gap: 10 }}>
        {sessions?.map((s) => (
          <div key={s.id} className="qz-lift" style={{ ...adminCard, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            {MODE_ICON[s.mode] ?? MODE_ICON.standard}
            <div style={{ flex: 1, minWidth: 140 }}>
              <div style={{ fontFamily: 'ui-monospace,monospace', letterSpacing: 3, fontSize: 20, fontWeight: 800 }}>{s.join_code}</div>
              <div style={{ fontSize: 12, color: '#8b8296', textTransform: 'capitalize' }}>{s.mode} · {s.state}</div>
            </div>
            <SessionActions sessionId={s.id} joinCode={s.join_code} />
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 14, color: '#8b8296', letterSpacing: 1, textTransform: 'uppercase', fontWeight: 800, margin: '30px 0 12px' }}>Manage</h2>
      <div className="qz-stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
        {[
          [<Library key="i" size={24} color="#60a5fa" />, 'Question banks', '/dashboard/questions', 'Build & import questions'],
          [<History key="i" size={24} color="#fbbf24" />, 'Past games', '/dashboard/history', 'Results & CSV export'],
          [<Palette key="i" size={24} color="#8b5cf6" />, 'Branding', '/dashboard/branding', 'Theme & animation'],
          [<CreditCard key="i" size={24} color="#4ade80" />, 'Billing', '/dashboard/billing', 'Plan & payment'],
        ].map(([icon, label, href, desc]) => (
          <a key={href as string} href={href as string} className="qz-lift" style={{ ...adminCard, textDecoration: 'none', color: 'inherit' }}>
            <div style={{ marginBottom: 8 }}>{icon}</div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>{label as string}</div>
            <div style={{ color: '#8b8296', fontSize: 13, marginTop: 2 }}>{desc as string}</div>
          </a>
        ))}
      </div>
    </AdminShell>
  );
}
