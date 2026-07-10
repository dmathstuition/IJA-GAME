'use client';

import '../../../components/game/game.css';
import { useEffect, useState } from 'react';
import { useRealtimeSession } from '@/lib/game/useRealtimeSession';
import { joinSession, submitAnswer } from '@/lib/game/player';
import { useCountdown } from '@/components/game/useCountdown';
import { AnimatedBackground } from '@/components/game/AnimatedBackground';
import { AnswerTile } from '@/components/game/AnswerTile';
import { TimerRing } from '@/components/game/TimerRing';
import { Confetti } from '@/components/game/Confetti';
import { sfx, unlockAudio } from '@/lib/game/sound';
import type { AnimationStyle } from '@/lib/themes';
import type { Choice } from '@/lib/types';

const CHOICES: Choice[] = ['A', 'B', 'C', 'D'];
const TEAM_COLOR = ['#e21b3c', '#1368ce'];

export function TeamPlayClient({ sessionId, orgId, schoolName, animation }: { sessionId: string; orgId: string; schoolName: string; animation: AnimationStyle }) {
  const { session, players } = useRealtimeSession(sessionId);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [picked, setPicked] = useState<Choice | null>(null);

  useEffect(() => { setPlayerId(localStorage.getItem(`player:${sessionId}`)); }, [sessionId]);

  const me = players.find((p) => p.id === playerId);
  const myTeam = me?.team ?? -1;
  const ms = (session as any)?.mode_state ?? { teams: [{ name: 'Team 1', score: 0 }, { name: 'Team 2', score: 0 }], lastResult: null };
  const teams = ms.teams as [{ name: string; score: number }, { name: string; score: number }];
  const active = (session as any)?.active_team ?? 0;
  const bonus = (session as any)?.is_bonus ?? false;
  const state = session?.state;
  const cq = session?.current_question as any;
  const qIndex = session?.current_q_index ?? -1;
  const remaining = useCountdown(cq?.startTime, cq?.timeLimit);
  const myTurn = myTeam === active;

  useEffect(() => { setPicked(null); }, [qIndex, active]);

  async function join() {
    setBusy(true); setErr(''); unlockAudio();
    const r = await joinSession(sessionId, orgId, name.trim());
    setBusy(false);
    if ('error' in r) return setErr(r.error ?? 'Could not join.');
    sfx.join(); setPlayerId(r.playerId);
  }
  async function pick(c: Choice) {
    if (!playerId || picked || remaining <= 0 || !myTurn) return;
    setPicked(c); sfx.lock();
    const r = await submitAnswer(sessionId, orgId, playerId, qIndex, c);
    if ('error' in r) setErr(r.error ?? 'Could not submit.');
  }

  const shell: React.CSSProperties = { position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 18, textAlign: 'center' };
  const TeamBadge = () => myTeam >= 0 ? (
    <div style={{ display: 'inline-block', padding: '6px 18px', borderRadius: 999, fontWeight: 800, background: TEAM_COLOR[myTeam], marginBottom: 6 }}>⚔️ {teams[myTeam].name}</div>
  ) : null;
  const Scores = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%', maxWidth: 360, marginTop: 12 }}>
      {teams.map((t, i) => (
        <div key={i} style={{ borderRadius: 12, padding: 12, border: `2px solid ${TEAM_COLOR[i]}`, background: `${TEAM_COLOR[i]}22` }}>
          <div style={{ fontSize: 12, fontWeight: 700 }}>{t.name}</div>
          <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 26, fontWeight: 900, color: 'var(--accent)' }}>{t.score}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', color: 'var(--text)', fontFamily: 'Nunito, system-ui, sans-serif' }}>
      <AnimatedBackground style={animation} />

      {!playerId ? (
        <main style={shell}>
          <div className="qcard" style={{ width: '100%', maxWidth: 380, color: '#1a1030' }}>
            <div style={{ fontWeight: 900, letterSpacing: 3, color: 'var(--primary)', fontSize: 12 }}>{schoolName.toUpperCase()}</div>
            <h1 style={{ fontFamily: '"Fredoka One", Nunito, sans-serif', fontSize: 28, color: 'var(--primary)', margin: '6px 0 16px' }}>⚔️ Team Battle</h1>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" maxLength={30} onFocus={unlockAudio}
              style={{ width: '100%', padding: 15, borderRadius: 14, border: '2px solid #ddd', fontSize: 18, textAlign: 'center', fontWeight: 700, outline: 'none' }} />
            {err && <p style={{ color: 'var(--wrong)', fontSize: 13, marginTop: 10 }}>{err}</p>}
            <button className="kbtn kpill" onClick={join} disabled={busy || name.trim().length < 2} style={{ width: '100%', marginTop: 14 }}>{busy ? 'Joining…' : '🚀 Join'}</button>
          </div>
        </main>
      ) : state === 'question_active' && cq && myTurn && !picked ? (
        <main style={{ ...shell, justifyContent: 'flex-start', paddingTop: 16 }}>
          <div style={{ width: '100%', maxWidth: 460, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <TeamBadge /><TimerRing remaining={remaining} total={cq.timeLimit} size={56} />
          </div>
          <div className="qcard" style={{ width: '100%', maxWidth: 460, marginBottom: 12, padding: 20 }}>
            {bonus && <div style={{ color: '#f97316', fontWeight: 900, fontSize: 13, marginBottom: 4 }}>⚡ BONUS · +5</div>}
            <div style={{ fontSize: 21, fontWeight: 900 }}>{cq.text}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%', maxWidth: 460 }}>
            {CHOICES.map((c) => <AnswerTile key={c} choice={c} label={cq.options[c]} compact onClick={() => pick(c)} disabled={remaining <= 0} />)}
          </div>
        </main>
      ) : state === 'question_active' && cq && (picked || !myTurn) ? (
        <main style={shell}>
          <TeamBadge />
          <div className="pop-in" style={{ fontSize: 20, fontWeight: 800, marginTop: 8 }}>
            {picked ? <>✓ Your team locked <b>{picked}</b></> : <><b style={{ color: TEAM_COLOR[active] }}>{teams[active].name}</b> is answering…</>}
          </div>
          <Scores />
        </main>
      ) : state === 'reveal' ? (
        <main style={shell}>
          {ms.lastResult?.correct && ms.lastResult?.team === myTeam && <Confetti continuous />}
          <TeamBadge />
          <div className="pop-in" style={{ fontSize: 26, fontWeight: 900, marginTop: 8, color: ms.lastResult?.correct ? 'var(--correct)' : 'var(--wrong)' }}>
            {ms.lastResult?.outcome === 'correct' ? `${ms.lastResult.teamName} +${ms.lastResult.points}!` : `Answer: ${cq?.answer}`}
          </div>
          <Scores />
        </main>
      ) : (state === 'leaderboard' || state === 'ended') ? (
        <main style={shell}>
          {state === 'ended' && <Confetti continuous />}
          <h1 style={{ fontFamily: '"Fredoka One",sans-serif', fontSize: 28, color: 'var(--accent)' }}>{state === 'ended' ? '🏆 Final Score' : 'Scores'}</h1>
          {state === 'ended' && <div style={{ fontSize: 20, fontWeight: 800, marginTop: 6 }}>{teams[0].score === teams[1].score ? "It's a tie!" : `${teams[teams[0].score > teams[1].score ? 0 : 1].name} win!`}</div>}
          <Scores />
        </main>
      ) : (
        <main style={shell}>
          <div className="qcard float-y" style={{ maxWidth: 340, color: '#1a1030' }}>
            <div style={{ fontSize: 40 }}>⚔️</div>
            <h1 style={{ fontFamily: '"Fredoka One",sans-serif', fontSize: 22, color: 'var(--primary)' }}>You&apos;re in, {me?.name}!</h1>
            <p style={{ color: '#666', marginTop: 4 }}>{myTeam >= 0 ? `Team: ${teams[myTeam].name}` : 'Waiting for the host to assign your team…'}</p>
          </div>
          <Scores />
        </main>
      )}
    </div>
  );
}
