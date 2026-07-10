'use client';

import '../../../components/game/game.css';
import { useEffect, useRef, useTransition } from 'react';
import { useRealtimeSession } from '@/lib/game/useRealtimeSession';
import { setState } from '@/lib/game/actions';
import { startRunner, advanceSpeed, stopSpeed } from '@/lib/game/speed';
import type { Question } from '@/lib/types';

const SPEED_SECS = 15;

export function SpeedHostClient({ sessionId, joinCode, questions }: { sessionId: string; joinCode: string; questions?: Question[] }) {
  const { session, players, answers } = useRealtimeSession(sessionId);
  const [pending, start] = useTransition();
  const bank = questions && questions.length ? questions : [];
  const ms = (session as any)?.mode_state ?? { limit: 15, runnerId: null, runnerIndex: 0, runnerScore: 0, results: [] };
  const limit = Math.min(ms.limit ?? 15, bank.length);
  const state = session?.state;
  const cq = session?.current_question as any;
  const runnerId: string | null = ms.runnerId;
  const runner = players.find((p) => p.id === runnerId);
  const processed = useRef<Set<string>>(new Set());

  // Drive the runner: advance when they answer the current question or time runs out.
  useEffect(() => {
    if (state !== 'question_active' || !runnerId || !cq) return;
    const idx = ms.runnerIndex ?? 0;
    const key = `${runnerId}:${idx}`;
    const go = () => {
      if (processed.current.has(key)) return;
      processed.current.add(key);
      advanceSpeed(sessionId, bank, idx);
    };
    const answered = answers.some((a) => a.player_id === runnerId && a.q_index === idx);
    if (answered) { go(); return; }
    const remaining = (cq.startTime ?? Date.now()) + SPEED_SECS * 1000 - Date.now();
    const t = setTimeout(go, Math.max(0, remaining) + 150);
    return () => clearTimeout(t);
  }, [state, runnerId, ms.runnerIndex, answers, cq?.startTime]); // eslint-disable-line

  const results = [...(ms.results ?? [])].sort((a: any, b: any) => b.score - a.score);
  const btn = (bg: string): React.CSSProperties => ({ padding: '8px 14px', borderRadius: 9, border: 'none', color: '#fff', background: bg, fontWeight: 800, cursor: 'pointer', fontSize: 13 });

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 20, color: 'var(--text)', fontFamily: 'system-ui' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: 2, color: 'var(--text-dim)' }}>⚡ SPEED · {limit} questions · {SPEED_SECS}s each</div>
          <h1 style={{ fontSize: 24, color: 'var(--accent)' }}>Speed Control</h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>JOIN CODE</div>
          <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: 4, color: 'var(--accent)', fontFamily: 'ui-monospace' }}>{joinCode}</div>
        </div>
      </header>

      <div style={{ display: 'flex', gap: 8, margin: '16px 0', flexWrap: 'wrap' }}>
        <button style={btn('#7c3aed')} disabled={pending} onClick={() => start(() => { setState(sessionId, 'leaderboard'); })}>🏆 Results</button>
        <button style={btn('#f97316')} disabled={pending || !runnerId} onClick={() => start(() => { stopSpeed(sessionId); })}>⏹ Stop runner</button>
        <button style={btn('var(--wrong)')} disabled={pending} onClick={() => start(() => { setState(sessionId, 'ended'); })}>End</button>
      </div>

      {/* Current runner */}
      <div style={{ border: '1px solid rgba(255,255,255,.12)', borderRadius: 14, padding: 16, background: 'rgba(0,0,0,.25)', marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 6 }}>CURRENT RUNNER</div>
        {runner ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div><b style={{ fontSize: 18 }}>{runner.name}</b><div style={{ fontSize: 13, color: 'var(--text-dim)' }}>Q{(ms.runnerIndex ?? 0) + 1} / {limit}</div></div>
            <div style={{ fontFamily: 'ui-monospace,monospace', fontWeight: 900, fontSize: 30, color: 'var(--accent)' }}>{ms.runnerScore ?? 0} ✓</div>
          </div>
        ) : <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>No active runner — launch a player below.</p>}
        {cq && runner && <div style={{ marginTop: 8, fontSize: 14 }}>{cq.text}</div>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Registered players */}
        <div style={{ border: '1px solid rgba(255,255,255,.12)', borderRadius: 14, padding: 14, background: 'rgba(0,0,0,.25)' }}>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>PLAYERS — CLICK ▶ TO LAUNCH</div>
          {players.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>No players yet.</p>}
          <div style={{ display: 'grid', gap: 5 }}>
            {players.map((p) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between', padding: '6px 8px', borderRadius: 8, background: 'rgba(255,255,255,.05)' }}>
                <span style={{ fontSize: 14 }}>{p.name} {p.sp_state === 'done' && <span style={{ fontSize: 11, color: 'var(--correct)' }}>done</span>}{p.sp_state === 'running' && <span style={{ fontSize: 11, color: '#f97316' }}>running…</span>}</span>
                <button style={btn(bank.length ? '#f97316' : '#555')} disabled={pending || !!runnerId || !bank.length} onClick={() => start(() => { startRunner(sessionId, p.id, p.name, bank[0]); })}>▶</button>
              </div>
            ))}
          </div>
        </div>
        {/* Results */}
        <div style={{ border: '1px solid rgba(255,255,255,.12)', borderRadius: 14, padding: 14, background: 'rgba(0,0,0,.25)' }}>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>RESULTS</div>
          {results.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>No runs completed yet.</p>}
          <div style={{ display: 'grid', gap: 4 }}>
            {results.map((r: any, i: number) => (
              <div key={r.playerId} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14 }}>
                <b style={{ width: 20, color: i === 0 ? 'var(--accent)' : 'var(--text-dim)' }}>{i + 1}</b>
                <span style={{ flex: 1 }}>{r.name}</span>
                <b style={{ fontFamily: 'ui-monospace,monospace', color: 'var(--accent)' }}>{r.score}/{limit}</b>
              </div>
            ))}
          </div>
        </div>
      </div>

      {bank.length === 0 && <p style={{ marginTop: 12, fontSize: 13, color: 'var(--wrong)' }}>This session has no question set. Start Speed from a question bank.</p>}
      <p style={{ marginTop: 12, fontSize: 12, color: 'var(--text-dim)' }}>Projector: <code>/display/{joinCode}</code> · Players: <code>/play/{joinCode}</code></p>
    </main>
  );
}
