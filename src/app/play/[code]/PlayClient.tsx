'use client';

import '../../../components/game/game.css';
import { useEffect, useRef, useState } from 'react';
import { Trophy, Rocket, Volume2, VolumeX } from 'lucide-react';
import { useRealtimeSession } from '@/lib/game/useRealtimeSession';
import { joinSession, submitAnswer } from '@/lib/game/player';
import { useCountdown } from '@/components/game/useCountdown';
import { AnimatedBackground } from '@/components/game/AnimatedBackground';
import { AnswerTile } from '@/components/game/AnswerTile';
import { TimerRing } from '@/components/game/TimerRing';
import { Confetti } from '@/components/game/Confetti';
import { sfx, unlockAudio, isMuted, toggleMute } from '@/lib/game/sound';
import { AVATARS, avatarFor } from '@/lib/game/avatars';
import type { AnimationStyle } from '@/lib/themes';
import type { Choice } from '@/lib/types';

const CHOICES: Choice[] = ['A', 'B', 'C', 'D'];
const AV_BG = ['#e21b3c', '#1368ce', '#d89e00', '#26890c', '#a855f7', '#FF6A00'];

export function PlayClient({ sessionId, orgId, schoolName, animation }: { sessionId: string; orgId: string; schoolName: string; animation: AnimationStyle }) {
  const { session, players } = useRealtimeSession(sessionId);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(() => AVATARS[Math.floor(Math.random() * AVATARS.length)]);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [picked, setPicked] = useState<Choice | null>(null);
  const [muted, setMuted] = useState(false);
  const [gain, setGain] = useState<number | null>(null); // +points popped on reveal
  const streak = useRef(0);
  const scoreAtQ = useRef(0);

  useEffect(() => { setPlayerId(localStorage.getItem(`player:${sessionId}`)); setMuted(isMuted()); }, [sessionId]);

  const me = players.find((p) => p.id === playerId);
  const myAvatar = me?.avatar || avatar;
  const cq = session?.current_question as any;
  const qIndex = session?.current_q_index ?? -1;
  const state = session?.state;
  const remaining = useCountdown(cq?.startTime, cq?.timeLimit);
  const ranked = [...players].sort((a, b) => b.score - a.score);
  const myRank = ranked.findIndex((p) => p.id === playerId) + 1;

  useEffect(() => { setPicked(null); }, [qIndex]);
  // Capture the score at question start so we can pop the points gained on reveal.
  useEffect(() => { if (state === 'question_active') scoreAtQ.current = me?.score ?? 0; }, [state, qIndex]); // eslint-disable-line
  useEffect(() => {
    if (state !== 'reveal') return;
    if (me?.last_correct) {
      sfx.correct();
      streak.current += 1;
      setGain(Math.max(0, (me?.score ?? 0) - scoreAtQ.current));
    } else {
      sfx.wrong();
      streak.current = 0;
      setGain(null);
    }
  }, [state]); // eslint-disable-line

  async function join() {
    setBusy(true); setErr(''); unlockAudio();
    const r = await joinSession(sessionId, orgId, name.trim(), avatar);
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
    <button onClick={() => setMuted(toggleMute())} aria-label="Toggle sound" style={{ position: 'fixed', top: 12, right: 12, zIndex: 50, background: 'rgba(0,0,0,.35)', border: 'none', borderRadius: 10, padding: '6px 10px', cursor: 'pointer', color: '#fff' }}>{muted ? <VolumeX size={20} /> : <Volume2 size={20} />}</button>
  );

  return (
    <div style={{ minHeight: '100vh', color: 'var(--text)', fontFamily: 'Nunito, system-ui, sans-serif' }}>
      <AnimatedBackground style={animation} />
      <MuteBtn />

      {/* ── JOIN: name + avatar picker ── */}
      {!playerId && (
        <main style={shell}>
          <div className="qcard pop-in" style={{ width: '100%', maxWidth: 400, color: '#1a1030' }}>
            <div style={{ fontWeight: 900, letterSpacing: 3, color: 'var(--primary)', fontSize: 12 }}>{schoolName.toUpperCase()}</div>
            <h1 style={{ fontFamily: '"Fredoka One", Nunito, sans-serif', fontSize: 30, color: 'var(--primary)', margin: '6px 0 14px' }}>Join the game</h1>
            <div className="pop-in" style={{ width: 84, height: 84, margin: '0 auto 6px', borderRadius: '50%', background: 'var(--primary)', display: 'grid', placeItems: 'center', fontSize: 46, boxShadow: '0 8px 0 rgba(0,0,0,.15)' }}>{avatar}</div>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#888', marginBottom: 8 }}>PICK YOUR AVATAR</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 5, marginBottom: 14 }}>
              {AVATARS.map((a) => (
                <button key={a} onClick={() => { setAvatar(a); sfx.tap(); }} style={{ fontSize: 20, padding: 4, borderRadius: 10, cursor: 'pointer', border: a === avatar ? '2px solid var(--primary)' : '2px solid transparent', background: a === avatar ? 'rgba(0,0,0,.06)' : 'transparent', transform: a === avatar ? 'scale(1.12)' : 'none', transition: 'transform .12s' }}>{a}</button>
              ))}
            </div>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" maxLength={30}
              style={{ width: '100%', padding: 15, borderRadius: 14, border: '2px solid #ddd', fontSize: 18, textAlign: 'center', fontWeight: 700, outline: 'none' }}
              onFocus={unlockAudio} onKeyDown={(e) => { if (e.key === 'Enter' && name.trim().length >= 2) join(); }} />
            {err && <p style={{ color: 'var(--wrong)', fontSize: 13, marginTop: 10 }}>{err}</p>}
            <button className="kbtn kpill" onClick={join} disabled={busy || name.trim().length < 2} style={{ width: '100%', marginTop: 14 }}>
              {busy ? 'Joining…' : <><Rocket size={18} style={{ verticalAlign: '-3px', marginRight: 7 }} />Join as {avatar}</>}
            </button>
          </div>
        </main>
      )}

      {/* ── QUESTION ── */}
      {playerId && state === 'question_active' && cq && (
        <main style={{ ...shell, justifyContent: 'flex-start', paddingTop: 16 }}>
          <div style={{ width: '100%', maxWidth: 460, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 14, color: 'rgba(255,255,255,.9)' }}>
              <span style={{ fontSize: 22 }}>{myAvatar}</span>Question {qIndex + 1}
            </span>
            <TimerRing remaining={remaining} total={cq.timeLimit} size={56} />
          </div>
          <div className="qcard" style={{ width: '100%', maxWidth: 460, marginBottom: 14, padding: 20 }}>
            <div style={{ fontSize: 21, fontWeight: 900 }}>{cq.text}</div>
          </div>
          {picked ? (
            <div className="pop-in" style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>
              <div style={{ fontSize: 44, marginBottom: 6 }} className="float-y">{myAvatar}</div>
              ✓ Locked in <b style={{ color: 'var(--accent)' }}>{picked}</b> — hang tight…
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%', maxWidth: 460 }}>
              {CHOICES.map((c) => (
                <AnswerTile key={c} choice={c} label={cq.options[c]} compact onClick={() => pick(c)} disabled={remaining <= 0} />
              ))}
            </div>
          )}
        </main>
      )}

      {/* ── REVEAL: rich feedback ── */}
      {playerId && state === 'reveal' && (
        <main style={shell}>
          {me?.last_correct && <Confetti continuous />}
          <div style={{ position: 'relative' }} className="pop-in">
            <div style={{ width: 110, height: 110, borderRadius: '50%', background: me?.last_correct ? 'var(--correct)' : 'var(--wrong)', display: 'grid', placeItems: 'center', fontSize: 58, boxShadow: `0 10px 0 rgba(0,0,0,.2), 0 0 60px ${me?.last_correct ? 'var(--correct)' : 'var(--wrong)'}` }}>{me?.last_correct ? '✓' : '✕'}</div>
            {gain != null && gain > 0 && <div className="float-up" style={{ position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%)', fontWeight: 900, fontSize: 26, color: 'var(--accent)', textShadow: '0 2px 8px rgba(0,0,0,.5)' }}>+{gain}</div>}
          </div>
          <h1 style={{ fontFamily: '"Fredoka One",sans-serif', fontSize: 32, margin: '14px 0 4px', color: '#fff' }}>{me?.last_correct ? 'Correct!' : 'Not this time'}</h1>
          {me?.last_correct && streak.current >= 2 && <div className="pop-in" style={{ display: 'inline-block', background: 'rgba(255,122,26,.2)', border: '1px solid #FF6A00', color: '#FF6A00', fontWeight: 900, padding: '4px 14px', borderRadius: 999, marginBottom: 6 }}>🔥 {streak.current} in a row!</div>}
          <p style={{ color: 'rgba(255,255,255,.75)' }}>Answer was <b style={{ color: 'var(--accent)' }}>{cq?.answer}</b></p>
          <div style={{ marginTop: 14, fontSize: 20, fontWeight: 800, color: '#fff' }}>Score <b style={{ color: 'var(--accent)', fontFamily: 'ui-monospace,monospace' }}>{me?.score ?? 0}</b>{myRank > 0 && <span style={{ color: 'rgba(255,255,255,.7)', fontSize: 15 }}> · #{myRank}</span>}</div>
        </main>
      )}

      {/* ── LEADERBOARD / END ── */}
      {playerId && (state === 'leaderboard' || state === 'ended') && (
        <main style={{ ...shell, justifyContent: 'flex-start', paddingTop: 28 }}>
          {state === 'ended' && <Confetti continuous />}
          <h1 style={{ fontFamily: '"Fredoka One",sans-serif', fontSize: 28, color: 'var(--accent)' }}>{state === 'ended' ? <><Trophy size={24} style={{ verticalAlign: '-3px', marginRight: 8 }} />Final scores</> : 'Leaderboard'}</h1>
          <div style={{ width: '100%', maxWidth: 420, marginTop: 14, display: 'grid', gap: 8 }}>
            {ranked.map((p, i) => (
              <div key={p.id} className={`lbrow ${i === 0 ? 'top1' : ''}`} style={{ animationDelay: `${i * 0.05}s`, outline: p.id === playerId ? '2px solid var(--accent)' : 'none' }}>
                <b style={{ width: 24, color: i === 0 ? 'var(--accent)' : 'rgba(255,255,255,.7)' }}>{i + 1}</b>
                <span className="avatar" style={{ width: 36, height: 36, fontSize: 20, background: p.avatar ? 'rgba(255,255,255,.14)' : AV_BG[i % AV_BG.length] }}>{p.avatar || avatarFor(p.id)}</span>
                <span style={{ flex: 1, textAlign: 'left', fontWeight: 800 }}>{p.name}{p.id === playerId ? ' (you)' : ''}</span>
                <b style={{ fontFamily: 'ui-monospace,monospace', color: 'var(--accent)' }}>{p.score}</b>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* ── LOBBY: waiting room ── */}
      {playerId && (!state || state === 'lobby' || state === 'section_intro') && (
        <main style={shell}>
          <div className="qcard pop-in" style={{ maxWidth: 360, color: '#1a1030' }}>
            <div className="float-y" style={{ width: 92, height: 92, margin: '0 auto 8px', borderRadius: '50%', background: 'var(--primary)', display: 'grid', placeItems: 'center', fontSize: 50, boxShadow: '0 8px 0 rgba(0,0,0,.15)' }}>{myAvatar}</div>
            <h1 style={{ fontFamily: '"Fredoka One",sans-serif', fontSize: 24, color: 'var(--primary)' }}>You&apos;re in, {me?.name}!</h1>
            <p className="wait-pulse" style={{ color: '#666', marginTop: 6, fontWeight: 700 }}>Waiting for the host to start<span className="dots" /></p>
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #eee' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#888', marginBottom: 6 }}>{players.length} PLAYER{players.length === 1 ? '' : 'S'} IN</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
                {players.slice(0, 14).map((p) => (
                  <span key={p.id} title={p.name} style={{ fontSize: 22, filter: p.id === playerId ? 'none' : 'grayscale(.15)' }}>{p.avatar || avatarFor(p.id)}</span>
                ))}
                {players.length > 14 && <span style={{ fontSize: 13, color: '#888', alignSelf: 'center' }}>+{players.length - 14}</span>}
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
