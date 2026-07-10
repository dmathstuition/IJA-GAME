'use client';

import '../../../components/game/game.css';
import { useEffect, useState } from 'react';
import { useRealtimeSession } from '@/lib/game/useRealtimeSession';
import { AnimatedBackground } from '@/components/game/AnimatedBackground';
import { AnswerTile } from '@/components/game/AnswerTile';
import { TimerRing } from '@/components/game/TimerRing';
import { Confetti } from '@/components/game/Confetti';
import { Trophy } from '@/components/game/Shapes';
import type { AnimationStyle } from '@/lib/themes';
import type { Choice } from '@/lib/types';

const CHOICES: Choice[] = ['A', 'B', 'C', 'D'];
const SPEED_SECS = 15;
const initial = (s: string) => (s?.[0] || '?').toUpperCase();

export function SpeedDisplayClient({ sessionId, joinCode, schoolName, animation }: { sessionId: string; joinCode: string; schoolName: string; animation: AnimationStyle }) {
  const { session, players } = useRealtimeSession(sessionId);
  const ms = (session as any)?.mode_state ?? { limit: 15, runnerId: null, runnerIndex: 0, runnerScore: 0, results: [] };
  const limit = ms.limit ?? 15;
  const state = session?.state;
  const cq = session?.current_question as any;
  const qIndex = session?.current_q_index ?? -1;
  const runner = players.find((p) => p.id === ms.runnerId);
  const [remaining, setRemaining] = useState(SPEED_SECS);
  useEffect(() => {
    if (state !== 'question_active' || !cq?.startTime) return;
    const tick = () => setRemaining(Math.max(0, SPEED_SECS - (Date.now() - cq.startTime) / 1000));
    tick(); const id = setInterval(tick, 200); return () => clearInterval(id);
  }, [state, cq?.startTime]);

  const shell: React.CSSProperties = { position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' };

  return (
    <div style={{ minHeight: '100vh', color: 'var(--text)', fontFamily: 'Nunito, system-ui, sans-serif' }}>
      <AnimatedBackground style={animation} />

      {state === 'question_active' && cq && runner ? (
        <main style={{ ...shell, justifyContent: 'flex-start', paddingTop: 34, maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 16 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontWeight: 800, background: '#f97316', padding: '8px 18px', borderRadius: 999, fontSize: 20 }}>
              <span className="avatar" style={{ width: 34, height: 34, fontSize: 15, background: 'rgba(0,0,0,.25)' }}>{initial(runner.name)}</span>{runner.name}
            </span>
            <span style={{ fontWeight: 900, fontFamily: 'ui-monospace,monospace', fontSize: 26, color: 'var(--accent)' }}>{ms.runnerScore ?? 0} ✓ · Q{qIndex + 1}/{limit}</span>
            <TimerRing remaining={remaining} total={SPEED_SECS} size={92} />
          </div>
          <div className="qcard" style={{ width: '100%', marginBottom: 16, textAlign: 'center' }}><div style={{ fontSize: 'clamp(24px,3.6vw,42px)', fontWeight: 900 }}>{cq.text}</div></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%' }}>
            {CHOICES.map((c) => <AnswerTile key={c} choice={c} label={cq.options[c]} />)}
          </div>
        </main>
      ) : state === 'leaderboard' || state === 'ended' ? (
        <main style={{ ...shell, justifyContent: 'flex-start', paddingTop: 46 }}>
          {state === 'ended' && <Confetti continuous />}
          {state === 'ended' && <div className="float-y" style={{ display: 'inline-block' }}><Trophy size={80} /></div>}
          <h1 style={{ fontFamily: '"Fredoka One",sans-serif', fontSize: 'clamp(30px,5vw,54px)', color: 'var(--accent)', margin: '4px 0 20px' }}>⚡ Speed Champions</h1>
          <div style={{ width: '100%', maxWidth: 640, display: 'grid', gap: 8 }}>
            {[...(ms.results ?? [])].sort((a: any, b: any) => b.score - a.score).slice(0, 10).map((r: any, i: number) => (
              <div key={r.playerId} className={`lbrow ${i === 0 ? 'top1' : ''}`} style={{ fontSize: 22 }}>
                <b style={{ width: 34, color: i === 0 ? 'var(--accent)' : 'rgba(255,255,255,.7)' }}>{i + 1}</b>
                <span className="avatar" style={{ background: '#f97316' }}>{initial(r.name)}</span>
                <span style={{ flex: 1, textAlign: 'left', fontWeight: 800 }}>{r.name}</span>
                <b style={{ fontFamily: 'ui-monospace,monospace', color: 'var(--accent)' }}>{r.score}/{limit}</b>
              </div>
            ))}
            {(ms.results ?? []).length === 0 && <p style={{ color: 'var(--text-dim)' }}>No runs completed yet.</p>}
          </div>
        </main>
      ) : (
        <main style={shell}>
          <div style={{ fontWeight: 900, letterSpacing: 5, color: 'var(--accent)', fontSize: 16 }}>{schoolName.toUpperCase()} · ⚡ SPEED ROUND</div>
          <div style={{ fontFamily: '"Fredoka One", sans-serif', fontSize: 'clamp(34px,7vw,68px)', color: 'var(--accent)', lineHeight: 1, margin: '10px 0' }}>{runner ? 'Get ready…' : 'Join the round!'}</div>
          <div className="codechip float-y" style={{ fontSize: 'clamp(50px,11vw,130px)' }}>{joinCode}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 860, marginTop: 20 }}>
            {players.map((p, i) => (
              <span key={p.id} className="pop-in" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: p.sp_state === 'done' ? 'rgba(34,197,94,.18)' : 'rgba(255,255,255,.12)', padding: '7px 16px 7px 7px', borderRadius: 999, fontWeight: 800, fontSize: 18, animationDelay: `${Math.min(i * 0.06, 1.2)}s` }}>
                <span className="avatar" style={{ width: 32, height: 32, fontSize: 14, background: '#f97316' }}>{initial(p.name)}</span>{p.name}{p.sp_state === 'done' && ' ✓'}
              </span>
            ))}
          </div>
          <div style={{ fontWeight: 800, color: 'var(--accent)', fontSize: 22, marginTop: 18 }}>👥 {players.length} joined</div>
        </main>
      )}
    </div>
  );
}
