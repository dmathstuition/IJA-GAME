'use client';

import '../../../components/game/game.css';
import { useEffect, useState } from 'react';
import { useRealtimeSession } from '@/lib/game/useRealtimeSession';
import { joinSession, submitAnswer } from '@/lib/game/player';
import { AnimatedBackground } from '@/components/game/AnimatedBackground';
import { AnswerTile } from '@/components/game/AnswerTile';
import { TimerRing } from '@/components/game/TimerRing';
import { Confetti } from '@/components/game/Confetti';
import { sfx, unlockAudio } from '@/lib/game/sound';
import type { AnimationStyle } from '@/lib/themes';
import type { Choice } from '@/lib/types';

const CHOICES: Choice[] = ['A', 'B', 'C', 'D'];
const SPEED_SECS = 15;

export function SpeedPlayClient({ sessionId, orgId, schoolName, animation }: { sessionId: string; orgId: string; schoolName: string; animation: AnimationStyle }) {
  const { session, players } = useRealtimeSession(sessionId);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [picked, setPicked] = useState<Choice | null>(null);
  const [remaining, setRemaining] = useState(SPEED_SECS);

  useEffect(() => { setPlayerId(localStorage.getItem(`player:${sessionId}`)); }, [sessionId]);

  const me = players.find((p) => p.id === playerId);
  const ms = (session as any)?.mode_state ?? { limit: 15, runnerId: null, runnerScore: 0, results: [] };
  const limit = ms.limit ?? 15;
  const state = session?.state;
  const cq = session?.current_question as any;
  const qIndex = session?.current_q_index ?? -1;
  const amRunner = ms.runnerId && ms.runnerId === playerId;

  useEffect(() => { setPicked(null); }, [qIndex]);
  useEffect(() => {
    if (!amRunner || state !== 'question_active' || !cq?.startTime) return;
    const tick = () => setRemaining(Math.max(0, SPEED_SECS - (Date.now() - cq.startTime) / 1000));
    tick(); const id = setInterval(tick, 200); return () => clearInterval(id);
  }, [amRunner, state, cq?.startTime]);

  async function join() {
    setBusy(true); setErr(''); unlockAudio();
    const r = await joinSession(sessionId, orgId, name.trim());
    setBusy(false);
    if ('error' in r) return setErr(r.error ?? 'Could not join.');
    sfx.join(); setPlayerId(r.playerId);
  }
  async function pick(c: Choice) {
    if (!playerId || picked || remaining <= 0) return;
    setPicked(c); sfx.tap();
    await submitAnswer(sessionId, orgId, playerId, qIndex, c);
  }

  const shell: React.CSSProperties = { position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 18, textAlign: 'center' };
  const runnerName = players.find((p) => p.id === ms.runnerId)?.name;

  let body: React.ReactNode;
  if (!playerId) {
    body = (
      <div className="qcard" style={{ width: '100%', maxWidth: 380, color: '#1a1030' }}>
        <div style={{ fontWeight: 900, letterSpacing: 3, color: 'var(--primary)', fontSize: 12 }}>{schoolName.toUpperCase()}</div>
        <h1 style={{ fontFamily: '"Fredoka One", Nunito, sans-serif', fontSize: 28, color: 'var(--primary)', margin: '6px 0 16px' }}>⚡ Speed Round</h1>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" maxLength={30} onFocus={unlockAudio}
          style={{ width: '100%', padding: 15, borderRadius: 14, border: '2px solid #ddd', fontSize: 18, textAlign: 'center', fontWeight: 700, outline: 'none' }} />
        {err && <p style={{ color: 'var(--wrong)', fontSize: 13, marginTop: 10 }}>{err}</p>}
        <button className="kbtn kpill" onClick={join} disabled={busy || name.trim().length < 2} style={{ width: '100%', marginTop: 14 }}>{busy ? 'Joining…' : '🚀 Join'}</button>
      </div>
    );
  } else if (amRunner && state === 'question_active' && cq) {
    body = (
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontWeight: 800, background: '#f97316', padding: '5px 14px', borderRadius: 999 }}>⚡ Q{qIndex + 1}/{limit}</span>
          <span style={{ fontWeight: 900, color: 'var(--accent)' }}>{ms.runnerScore ?? 0} ✓</span>
          <TimerRing remaining={remaining} total={SPEED_SECS} size={52} />
        </div>
        <div className="qcard" style={{ marginBottom: 12, padding: 18 }}><div style={{ fontSize: 20, fontWeight: 900 }}>{cq.text}</div></div>
        {picked ? <div className="pop-in" style={{ fontWeight: 800 }}>✓ {picked} — next up…</div> : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {CHOICES.map((c) => <AnswerTile key={c} choice={c} label={cq.options[c]} compact onClick={() => pick(c)} disabled={remaining <= 0} />)}
          </div>
        )}
      </div>
    );
  } else if (me?.sp_state === 'done') {
    const myScore = (ms.results ?? []).find((r: any) => r.playerId === playerId)?.score ?? me?.score ?? 0;
    body = (<>
      <Confetti continuous />
      <div className="pop-in" style={{ fontSize: 60 }}>⚡</div>
      <h1 style={{ fontFamily: '"Fredoka One",sans-serif', fontSize: 30, color: 'var(--accent)' }}>Run complete!</h1>
      <div style={{ fontFamily: 'ui-monospace,monospace', fontWeight: 900, fontSize: 44, color: 'var(--accent)' }}>{myScore}/{limit}</div>
    </>);
  } else if (state === 'leaderboard' || state === 'ended') {
    const results = [...(ms.results ?? [])].sort((a: any, b: any) => b.score - a.score);
    body = (<>
      {state === 'ended' && <Confetti continuous />}
      <h1 style={{ fontFamily: '"Fredoka One",sans-serif', fontSize: 26, color: 'var(--accent)' }}>⚡ Speed Results</h1>
      <div style={{ width: '100%', maxWidth: 400, marginTop: 12, display: 'grid', gap: 8 }}>
        {results.map((r: any, i: number) => (
          <div key={r.playerId} className={`lbrow ${i === 0 ? 'top1' : ''}`} style={{ outline: r.playerId === playerId ? '2px solid var(--accent)' : 'none' }}>
            <b style={{ width: 24 }}>{i + 1}</b><span style={{ flex: 1, textAlign: 'left', fontWeight: 800 }}>{r.name}</span><b style={{ color: 'var(--accent)', fontFamily: 'ui-monospace,monospace' }}>{r.score}/{limit}</b>
          </div>
        ))}
      </div>
    </>);
  } else {
    body = (
      <div className="qcard float-y" style={{ maxWidth: 340, color: '#1a1030' }}>
        <div style={{ fontSize: 40 }}>⚡</div>
        <h1 style={{ fontFamily: '"Fredoka One",sans-serif', fontSize: 22, color: 'var(--primary)' }}>Get ready, {me?.name}!</h1>
        <p style={{ color: '#666', marginTop: 4 }}>{runnerName ? `${runnerName} is on the clock…` : 'Waiting for the host to launch a runner…'}</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', color: 'var(--text)', fontFamily: 'Nunito, system-ui, sans-serif' }}>
      <AnimatedBackground style={animation} />
      <main style={shell}>{body}</main>
    </div>
  );
}
