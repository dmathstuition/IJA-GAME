'use client';

import { useRealtimeSession } from '@/lib/game/useRealtimeSession';
import type { Choice } from '@/lib/types';

const CHOICES: Choice[] = ['A', 'B', 'C', 'D'];
const COLORS: Record<Choice, string> = { A: '#ef4444', B: '#3b82f6', C: '#a855f7', D: '#22c55e' };

export function DisplayClient({ sessionId, joinCode, schoolName }: { sessionId: string; joinCode: string; schoolName: string }) {
  const { session, players, answers } = useRealtimeSession(sessionId);
  const state = session?.state;
  const cq = session?.current_question as any;
  const qIndex = session?.current_q_index ?? -1;
  const dist = CHOICES.map((c) => answers.filter((a) => a.q_index === qIndex && a.choice === c).length);
  const totalAns = dist.reduce((a, b) => a + b, 0) || 1;

  const center: React.CSSProperties = { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text)', fontFamily: 'system-ui', textAlign: 'center', padding: 40 };

  if (state === 'question_active' || state === 'reveal') {
    return (
      <main style={{ ...center, justifyContent: 'flex-start', paddingTop: 40 }}>
        <div style={{ fontSize: 18, color: 'var(--text-dim)' }}>Question {qIndex + 1}</div>
        <h1 style={{ fontSize: 'clamp(28px,4vw,52px)', fontWeight: 900, margin: '14px 0 28px', maxWidth: 1100 }}>{cq?.text}</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, width: '100%', maxWidth: 1000 }}>
          {CHOICES.map((c, i) => {
            const isAns = state === 'reveal' && cq?.answer === c;
            const pct = Math.round((dist[i] / totalAns) * 100);
            return (
              <div key={c} style={{ padding: 22, borderRadius: 18, border: `3px solid ${isAns ? 'var(--correct)' : COLORS[c]}`, background: isAns ? 'rgba(34,197,94,.18)' : 'rgba(0,0,0,.25)', opacity: state === 'reveal' && !isAns ? 0.4 : 1, textAlign: 'left', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, width: `${pct}%`, background: 'rgba(255,255,255,.06)' }} />
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ color: COLORS[c], fontSize: 30, fontWeight: 900 }}>{c}</span>
                  <span style={{ fontSize: 24, fontWeight: 800 }}>{cq?.options[c]}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 18, color: 'var(--text-dim)' }}>{dist[i]}</span>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    );
  }

  if (state === 'leaderboard' || state === 'ended') {
    const ranked = [...players].sort((a, b) => b.score - a.score).slice(0, 10);
    return (
      <main style={{ ...center, justifyContent: 'flex-start', paddingTop: 50 }}>
        <h1 style={{ fontSize: 'clamp(32px,5vw,64px)', color: 'var(--accent)', fontWeight: 900 }}>{state === 'ended' ? '🏆 Champions' : 'Leaderboard'}</h1>
        <div style={{ width: '100%', maxWidth: 720, marginTop: 24 }}>
          {ranked.map((p, i) => (
            <div key={p.id} style={{ display: 'flex', gap: 16, padding: '16px 24px', borderRadius: 14, marginBottom: 8, background: i === 0 ? 'rgba(255,214,0,.14)' : 'rgba(0,0,0,.25)', border: '1px solid rgba(255,255,255,.08)', fontSize: 24 }}>
              <b style={{ width: 40, color: i === 0 ? 'var(--accent)' : 'var(--text-dim)' }}>{i + 1}</b>
              <span style={{ flex: 1, textAlign: 'left', fontWeight: 800 }}>{p.name}</span>
              <b style={{ color: 'var(--accent)', fontFamily: 'ui-monospace' }}>{p.score}</b>
            </div>
          ))}
        </div>
      </main>
    );
  }

  // Lobby
  return (
    <main style={center}>
      <div style={{ fontSize: 16, letterSpacing: 4, color: 'var(--accent)' }}>{schoolName.toUpperCase()}</div>
      <h1 style={{ fontSize: 'clamp(40px,7vw,90px)', color: 'var(--accent)', fontWeight: 900, margin: '10px 0' }}>Join the game</h1>
      <p style={{ color: 'var(--text-dim)', fontSize: 22 }}>Go to the player link and enter code</p>
      <div style={{ fontSize: 'clamp(60px,12vw,150px)', fontWeight: 900, letterSpacing: 12, color: 'var(--accent)', fontFamily: 'ui-monospace' }}>{joinCode}</div>
      <div style={{ marginTop: 20, fontSize: 26 }}>👥 {players.length} joined</div>
    </main>
  );
}
