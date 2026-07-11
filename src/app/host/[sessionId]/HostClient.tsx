'use client';

import { useTransition } from 'react';
import { useRealtimeSession } from '@/lib/game/useRealtimeSession';
import { launchQuestion, revealCurrent, setState } from '@/lib/game/actions';
import { exportLeaderboard } from '@/lib/game/exportCsv';
import { SAMPLE_QUESTIONS } from '@/lib/game/sample';
import type { Choice, Question } from '@/lib/types';

const CHOICES: Choice[] = ['A', 'B', 'C', 'D'];

export function HostClient({ sessionId, joinCode, questions }: { sessionId: string; joinCode: string; questions?: Question[] }) {
  const { session, players, answers } = useRealtimeSession(sessionId);
  const [pending, start] = useTransition();
  const bank = questions && questions.length ? questions : SAMPLE_QUESTIONS;

  const qIndex = session?.current_q_index ?? -1;
  const cq = session?.current_question as any;
  const roundAnswers = answers.filter((a) => a.q_index === qIndex);
  const dist = CHOICES.map((c) => roundAnswers.filter((a) => a.choice === c).length);
  const answeredCount = new Set(roundAnswers.map((a) => a.player_id)).size;
  const ranked = [...players].sort((a, b) => b.score - a.score);

  const btn = (bg: string) => ({
    padding: '10px 14px', borderRadius: 10, border: 'none', color: '#fff',
    background: bg, fontWeight: 800, cursor: 'pointer', fontSize: 14,
  });

  return (
    <main style={{ maxWidth: 1000, margin: '0 auto', padding: 24, color: 'var(--text)', fontFamily: 'system-ui' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: 2, color: 'var(--text-dim)' }}>ORGANISER · {session?.state ?? '…'}</div>
          <h1 style={{ fontSize: 26, color: 'var(--accent)' }}>Live Control</h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>JOIN CODE</div>
          <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: 4, color: 'var(--accent)', fontFamily: 'ui-monospace' }}>{joinCode}</div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{players.length} players · {answeredCount} answered</div>
        </div>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, marginTop: 20 }}>
        <div style={{ display: 'grid', gap: 12 }}>
          {/* Global controls */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button style={btn('var(--accent)')} disabled={pending} onClick={() => start(() => { revealCurrent(sessionId); })}>Reveal answer</button>
            <button style={btn('#7c3aed')} disabled={pending} onClick={() => start(() => { setState(sessionId, 'leaderboard'); })}>Leaderboard</button>
            <button style={btn('#334155')} disabled={pending} onClick={() => start(() => { setState(sessionId, 'lobby'); })}>Lobby</button>
            <button style={btn('#0ea5e9')} disabled={players.length === 0} onClick={() => exportLeaderboard(joinCode, players)}>⬇ CSV</button>
            <button style={btn('var(--wrong)')} disabled={pending} onClick={() => start(() => { setState(sessionId, 'ended'); })}>End</button>
          </div>

          {/* Current question + distribution */}
          <div style={{ border: '1px solid rgba(255,255,255,.12)', borderRadius: 14, padding: 16, background: 'linear-gradient(160deg, rgba(30,20,45,.55), rgba(15,10,25,.7))' }}>
            <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{cq ? `Question ${qIndex + 1}` : 'No question live'}</div>
            <div style={{ fontSize: 18, fontWeight: 800, margin: '6px 0 12px' }}>{cq?.text ?? 'Launch a question below →'}</div>
            {cq && CHOICES.map((c, i) => {
              const total = players.length || 1;
              const pct = Math.round((dist[i] / total) * 100);
              const isAns = session?.state === 'reveal' && cq.answer === c;
              return (
                <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <b style={{ width: 16, color: isAns ? 'var(--correct)' : 'var(--text-dim)' }}>{c}</b>
                  <div style={{ flex: 1, fontSize: 13 }}>{cq.options[c]}</div>
                  <div style={{ width: 120, height: 8, background: 'rgba(255,255,255,.08)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: isAns ? 'var(--correct)' : 'var(--primary)' }} />
                  </div>
                  <span style={{ width: 24, textAlign: 'right', fontSize: 12, color: 'var(--text-dim)' }}>{dist[i]}</span>
                </div>
              );
            })}
          </div>

          {/* Question bank */}
          <div style={{ border: '1px solid rgba(255,255,255,.12)', borderRadius: 14, padding: 16, background: 'linear-gradient(160deg, rgba(30,20,45,.55), rgba(15,10,25,.7))' }}>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>
              {questions && questions.length ? `QUESTION BANK · ${bank.length}` : 'SAMPLE QUESTION BANK (no set selected)'}
            </div>
            <div style={{ display: 'grid', gap: 6 }}>
              {bank.map((q, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, opacity: qIndex === i ? 1 : 0.8 }}>{i + 1}. {q.text}</span>
                  <button style={btn('var(--correct)')} disabled={pending} onClick={() => start(() => { launchQuestion(sessionId, q, i); })}>
                    {qIndex === i ? 'Relaunch' : 'Launch'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Players */}
        <aside style={{ border: '1px solid rgba(255,255,255,.12)', borderRadius: 14, padding: 14, background: 'linear-gradient(160deg, rgba(30,20,45,.55), rgba(15,10,25,.7))' }}>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>PLAYERS</div>
          {ranked.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Waiting for players to join…</p>}
          {ranked.map((p) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: p.answered ? 'var(--correct)' : 'rgba(255,255,255,.2)' }} />
              <span style={{ flex: 1, fontSize: 14 }}>{p.name}</span>
              <b style={{ color: 'var(--accent)', fontFamily: 'ui-monospace' }}>{p.score}</b>
            </div>
          ))}
        </aside>
      </section>

      <p style={{ marginTop: 16, fontSize: 12, color: 'var(--text-dim)' }}>
        Projector: <code>/display/{joinCode}</code> · Players: <code>/play/{joinCode}</code>
      </p>
    </main>
  );
}
