// Past games — durable results snapshots for the signed-in school (RLS-scoped).
import { createClient } from '@/lib/supabase/server';
import { AdminShell, adminCard } from '@/components/AdminShell';
import { FileText, Swords, Zap, Mic, Trophy, Users, HelpCircle } from 'lucide-react';

const MODE_ICON: Record<string, React.ReactNode> = {
  standard: <FileText size={20} color="#60a5fa" />,
  team: <Swords size={20} color="#e21b3c" />,
  speed: <Zap size={20} color="#f97316" />,
  oral: <Mic size={20} color="#8b5cf6" />,
};

interface Row {
  id: string;
  join_code: string;
  mode: string;
  question_set_name: string | null;
  player_count: number;
  question_count: number;
  winner_name: string | null;
  winner_score: number | null;
  created_at: string;
}

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: results } = await supabase
    .from('game_results')
    .select('id, join_code, mode, question_set_name, player_count, question_count, winner_name, winner_score, created_at')
    .order('created_at', { ascending: false })
    .limit(100);
  const rows = (results ?? []) as Row[];

  const fmt = (d: string) => new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <AdminShell active="History" title="Past games" subtitle="Every finished competition, saved automatically when a game ends.">
      {rows.length === 0 ? (
        <div style={{ ...adminCard, textAlign: 'center', padding: '44px 22px', color: '#8b8296' }}>
          <Trophy size={30} color="#5a5568" style={{ marginBottom: 10 }} />
          <div style={{ fontWeight: 800, fontSize: 16, color: '#c9c2d6' }}>No games played yet</div>
          <div style={{ fontSize: 14, marginTop: 4 }}>Finish a live game and its results will appear here for review and export.</div>
          <a href="/dashboard" style={{ display: 'inline-block', marginTop: 16, color: 'var(--accent, #FF6A00)', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Start a game →</a>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {rows.map((r) => (
            <a key={r.id} href={`/dashboard/history/${r.id}`} className="qz-lift" style={{ ...adminCard, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', textDecoration: 'none', color: 'inherit' }}>
              <span style={{ display: 'grid', placeItems: 'center', width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,.05)', flexShrink: 0 }}>{MODE_ICON[r.mode] ?? MODE_ICON.standard}</span>
              <div style={{ flex: 1, minWidth: 170 }}>
                <div style={{ fontWeight: 800, fontSize: 15.5, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ textTransform: 'capitalize' }}>{r.mode}</span>
                  <span style={{ fontFamily: 'ui-monospace,monospace', letterSpacing: 2, fontSize: 13, color: '#8b8296' }}>{r.join_code}</span>
                </div>
                <div style={{ fontSize: 12.5, color: '#8b8296', marginTop: 2 }}>{fmt(r.created_at)}{r.question_set_name ? ` · ${r.question_set_name}` : ''}</div>
              </div>
              {r.winner_name && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 120 }}>
                  <Trophy size={15} color="#fbbf24" />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.winner_name}</div>
                    <div style={{ fontSize: 11.5, color: '#8b8296' }}>{r.winner_score} pts</div>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 14, color: '#8b8296', fontSize: 13 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Users size={14} /> {r.player_count}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><HelpCircle size={14} /> {r.question_count}</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
