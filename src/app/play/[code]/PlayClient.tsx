'use client';

import '../../../components/game/game.css';
import { useEffect, useState } from 'react';
import { Trophy, PartyPopper, Rocket, Volume2, VolumeX } from 'lucide-react';
import { useRealtimeSession } from '@/lib/game/useRealtimeSession';
import { joinSession, submitAnswer } from '@/lib/game/player';
import { useCountdown } from '@/components/game/useCountdown';
import { AnimatedBackground } from '@/components/game/AnimatedBackground';
import { AnswerTile } from '@/components/game/AnswerTile';
import { TimerRing } from '@/components/game/TimerRing';
import { Confetti } from '@/components/game/Confetti';
import { sfx, unlockAudio, isMuted, toggleMute } from '@/lib/game/sound';
import type { AnimationStyle } from '@/lib/themes';
import type { Choice } from '@/lib/types';

const CHOICES: Choice[] = ['A', 'B', 'C', 'D'];
const AV = ['#e21b3c', '#1368ce', '#d89e00', '#26890c', '#a855f7', '#FF6A00'];

export function PlayClient({ sessionId, orgId, schoolName, animation }: { sessionId: string; orgId: string; schoolName: string; animation: AnimationStyle }) {
  const { session, players } = useRealtimeSession(sessionId);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [picked, setPicked] = useState<Choice | null>(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => { setPlayerId(localStorage.getItem(`player:${sessionId}`)); setMuted(isMuted()); }, [sessionId]);

  const me = players.find((p) => p.id === playerId);
  const cq = session?.current_question as any;
  const qIndex = session?.current_q_index ?? -1;
  const state = session?.state;
  const remaining = useCountdown(cq?.startTime, cq?.timeLimit);

  useEffect(() => { setPicked(null); }, [qIndex]);
  useEffect(() => { if (state === 'reveal') { me?.last_correct ? sfx.correct() : sfx.wrong(); } }, [state]); // eslint-disable-line

  async function join() {
    setBusy(true); setErr(''); unlockAudio();
    const r = await joinSession(sessionId, orgId, name.trim());
    setBusy(false);
    if ('error' in r) return setErr(r.error ?? 'Could not join.');
    sfx.join(); setPlayerId(r.playerId);
  }
  async function pick(c: Choice) {
    if (!playerId || picked || remaining <= 0) return;
    setPicked(c); sfx.lock();
    const r = await submitAnswer(sessionId, orgId, playerId, qIndex, c);
    if ('error' in r) setErr(r.error ?? 'Could not submit.');
  }

  const shell: React.CSSProperties = { position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 18, textAlign: 'center' };
  const MuteBtn = () => (
    <button onClick={() => setMuted(toggleMute())} aria-label="Toggle sound" style={{ position: 'fixed', top: 12, right: 12, zIndex: 50, background: 'rgba(0,0,0,.35)', border: 'none', borderRadius: 10, padding: '6px 10px', fontSize: 18, cursor: 'pointer' }}>{muted ? <VolumeX size={20} /> : <Volume2 size={20} />}</button>
  );

  return (
    <div style={{ minHeight: '100vh', color: 'var(--text)', fontFamily: 'Nunito, system-ui, sans-serif' }}>
      <AnimatedBackground style={animation} />
      <MuteBtn />

      {!playerId && (
        <main style={shell}>
          <div className="qcard" style={{ width: '100%', maxWidth: 380, color: '#1a1030' }}>
            <div style={{ fontWeight: 900, letterSpacing: 3, color: 'var(--primary)', fontSize: 12 }}>{schoolName.toUpperCase()}</div>
            <h1 style={{ fontFamily: '"Fredoka One", Nunito, sans-serif', fontSize: 30, color: 'var(--primary)', margin: '6px 0 16px' }}>Join the game</h1>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" maxLength={30}
              style={{ width: '100%', padding: 15, borderRadius: 14, border: '2px solid #ddd', fontSize: 18, textAlign: 'center', fontWeight: 700, outline: 'none' }}
              onFocus={unlockAudio} />
            {err && <p style={{ color: 'var(--wrong)', fontSize: 13, marginTop: 10 }}>{err}</p>}
            <button className="kbtn kpill" onClick={join} disabled={busy || name.trim().length < 2} style={{ width: '100%', marginTop: 14 }}>
              {busy ? 'Joining…' : <><Rocket size={18} style={{ verticalAlign: '-3px', marginRight: 7 }} />Join</>}
            </button>
          </div>
        </main>
      )}

      {playerId && state === 'question_active' && cq && (
        <main style={{ ...shell, justifyContent: 'flex-start', paddingTop: 16 }}>
          <div style={{ width: '100%', maxWidth: 460, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontWeight: 800, fontSize: 14, color: 'rgba(255,255,255,.85)' }}>Question {qIndex + 1}</span>
            <TimerRing remaining={remaining} total={cq.timeLimit} size={56} />
          </div>
          <div className="qcard" style={{ width: '100%', maxWidth: 460, marginBottom: 14, padding: 20 }}>
            <div style={{ fontSize: 21, fontWeight: 900 }}>{cq.text}</div>
          </div>
          {picked ? (
            <div className="pop-in" style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)' }}>✓ Locked in <b>{picked}</b> — waiting for reveal…</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%', maxWidth: 460 }}>
              {CHOICES.map((c) => (
                <AnswerTile key={c} choice={c} label={cq.options[c]} compact onClick={() => pick(c)} disabled={remaining <= 0} />
              ))}
            </div>
          )}
        </main>
      )}

      {playerId && state === 'reveal' && (
        <main style={shell}>
          {me?.last_correct && <Confetti continuous />}
          <div className="pop-in" style={{ width: 100, height: 100, borderRadius: '50%', background: me?.last_correct ? 'var(--correct)' : 'var(--wrong)', display: 'grid', placeItems: 'center', fontSize: 54, boxShadow: `0 10px 0 rgba(0,0,0,.2), 0 0 50px ${me?.last_correct ? 'var(--correct)' : 'var(--wrong)'}` }}>{me?.last_correct ? '✓' : '✕'}</div>
          <h1 style={{ fontFamily: '"Fredoka One",sans-serif', fontSize: 32, margin: '14px 0 4px', color: '#fff' }}>{me?.last_correct ? 'Correct!' : 'Not this time'}</h1>
          <p style={{ color: 'rgba(255,255,255,.75)' }}>Answer was <b style={{ color: 'var(--accent)' }}>{cq?.answer}</b></p>
          <div style={{ marginTop: 14, fontSize: 20, fontWeight: 800 }}>Score <b style={{ color: 'var(--accent)', fontFamily: 'ui-monospace,monospace' }}>{me?.score ?? 0}</b></div>
        </main>
      )}

      {playerId && (state === 'leaderboard' || state === 'ended') && (
        <main style={{ ...shell, justifyContent: 'flex-start', paddingTop: 28 }}>
          {state === 'ended' && <Confetti continuous />}
          <h1 style={{ fontFamily: '"Fredoka One",sans-serif', fontSize: 28, color: 'var(--accent)' }}>{state === 'ended' ? <><Trophy size={24} style={{ verticalAlign: '-3px', marginRight: 8 }} />Final scores</> : 'Leaderboard'}</h1>
          <div style={{ width: '100%', maxWidth: 420, marginTop: 14, display: 'grid', gap: 8 }}>
            {[...players].sort((a, b) => b.score - a.score).map((p, i) => (
              <div key={p.id} className={`lbrow ${i === 0 ? 'top1' : ''}`} style={{ animationDelay: `${i * 0.05}s`, outline: p.id === playerId ? '2px solid var(--accent)' : 'none' }}>
                <b style={{ width: 24, color: i === 0 ? 'var(--accent)' : 'rgba(255,255,255,.7)' }}>{i + 1}</b>
                <span className="avatar" style={{ width: 34, height: 34, fontSize: 15, background: AV[i % AV.length] }}>{(p.name[0] || '?').toUpperCase()}</span>
                <span style={{ flex: 1, textAlign: 'left', fontWeight: 800 }}>{p.name}{p.id === playerId ? ' (you)' : ''}</span>
                <b style={{ fontFamily: 'ui-monospace,monospace', color: 'var(--accent)' }}>{p.score}</b>
              </div>
            ))}
          </div>
        </main>
      )}

      {playerId && (!state || state === 'lobby' || state === 'section_intro') && (
        <main style={shell}>
          <div className="qcard float-y" style={{ maxWidth: 340, color: '#1a1030' }}>
            <div><PartyPopper size={46} color="var(--accent)" /></div>
            <h1 style={{ fontFamily: '"Fredoka One",sans-serif', fontSize: 24, color: 'var(--primary)' }}>You&apos;re in, {me?.name}!</h1>
            <p style={{ color: '#666', marginTop: 4 }}>Waiting for the host to start…</p>
            <div style={{ marginTop: 12, fontWeight: 800 }}>Score <b style={{ color: 'var(--primary)' }}>{me?.score ?? 0}</b></div>
          </div>
        </main>
      )}
    </div>
  );
}
