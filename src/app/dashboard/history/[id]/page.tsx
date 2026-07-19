// Per-game report — full standings snapshot for one finished competition.
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminShell, adminCard } from '@/components/AdminShell';
import { FileText, Swords, Zap, Mic, Trophy, Users, HelpCircle, ArrowLeft } from 'lucide-react';
import { ExportButton } from './ExportButton';

const MODE_ICON: Record<string, React.ReactNode> = {
  standard: <FileText size={20} color="#60a5fa" />,
  team: <Swords size={20} color="#e21b3c" />,
  speed: <Zap size={20} color="#f97316" />,
  oral: <Mic size={20} color="#8b5cf6" />,
};
const MEDAL = ['#fbbf24', '#c0c0c0', '#cd7f32'];
const initial = (s: string) => (s?.[0] || '?').toUpperCase();

interface Standing { name: string; score: number; avatar?: string | null }
interface Result {
  id: string;
  join_code: string;
  mode: string;
  question_set_name: string | null;
  player_count: number;
  question_count: number;
  winner_name: string | null;
  winner_score: number | null;
  standings: Standing[];
  created_at: string;
}

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from('game_results').select('*').eq('id', id).maybeSingle();
  if (!data) notFound();
  const r = data as Result;
  const standings = Array.isArray(r.standings) ? r.standings : [];
  const fmt = new Date(r.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const stat = (icon: React.ReactNode, label: string, value: string | number) => (
    <div style={{ ...adminCard, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
      {icon}
      <div>
        <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: '#8b8296', marginTop: 3 }}>{label}</div>
      </div>
    </div>
  );

  return (
    <AdminShell active="History" title={`${r.mode[0].toUpperCase()}${r.mode.slice(1)} game`} subtitle={`${fmt}${r.question_set_name ? ` · ${r.question_set_name}` : ''}`}>
      <a href="/dashboard/history" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#a49db3', fontSize: 13.5, fontWeight: 700, textDecoration: 'none', marginBottom: 18 }}>
        <ArrowLeft size={15} /> All past games
      </a>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#8b8296', fontSize: 13.5 }}>
          <span style={{ display: 'grid', placeItems: 'center', width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,.05)' }}>{MODE_ICON[r.mode] ?? MODE_ICON.standard}</span>
          <span>Join code <b style={{ color: '#c9c2d6', fontFamily: 'ui-monospace,monospace', letterSpacing: 2 }}>{r.join_code}</b></span>
        </div>
        <ExportButton joinCode={r.join_code} standings={standings} />
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 24 }}>
        {stat(<Users size={22} color="#60a5fa" />, 'Players', r.player_count)}
        {stat(<HelpCircle size={22} color="#f97316" />, 'Questions', r.question_count)}
        {stat(<Trophy size={22} color="#fbbf24" />, 'Winner', r.winner_name ?? '—')}
      </div>

      {/* Full standings */}
      <h2 style={{ fontSize: 14, color: '#8b8296', letterSpacing: 1, textTransform: 'uppercase', fontWeight: 800, margin: '0 0 12px' }}>Final standings</h2>
      {standings.length === 0 ? (
        <div style={{ ...adminCard, color: '#8b8296', fontSize: 14, textAlign: 'center' }}>No standings were recorded for this game.</div>
      ) : (
        <div style={{ display: 'grid', gap: 6 }}>
          {standings.map((p, i) => (
            <div key={i} style={{ ...adminCard, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 14, borderColor: i < 3 ? `${MEDAL[i]}55` : 'rgba(255,255,255,.09)' }}>
              <b style={{ width: 26, textAlign: 'center', fontSize: 16, color: i < 3 ? MEDAL[i] : '#8b8296' }}>{i + 1}</b>
              <span style={{ width: 34, height: 34, borderRadius: '50%', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: p.avatar ? 18 : 14, background: p.avatar ? 'rgba(255,255,255,.1)' : 'linear-gradient(135deg,#FF6A00,#ff2d55)', flexShrink: 0 }}>{p.avatar || initial(p.name)}</span>
              <span style={{ flex: 1, fontWeight: 700, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
              <b style={{ fontFamily: 'ui-monospace,monospace', fontSize: 16, color: i === 0 ? '#fbbf24' : '#c9c2d6' }}>{p.score}</b>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
