'use client';

import '../../../components/game/game.css';
import { Swords, Zap, Users } from 'lucide-react';
import { useRealtimeSession } from '@/lib/game/useRealtimeSession';
import { useCountdown } from '@/components/game/useCountdown';
import { AnimatedBackground } from '@/components/game/AnimatedBackground';
import { AnswerTile } from '@/components/game/AnswerTile';
import { TimerRing } from '@/components/game/TimerRing';
import { Confetti } from '@/components/game/Confetti';
import { Trophy } from '@/components/game/Shapes';
import type { AnimationStyle } from '@/lib/themes';
import type { Choice } from '@/lib/types';

const CHOICES: Choice[] = ['A', 'B', 'C', 'D'];
const TEAM_COLOR = ['#e21b3c', '#1368ce'];
const initial = (s: string) => (s?.[0] || '?').toUpperCase();

export function TeamDisplayClient({ sessionId, joinCode, schoolName, animation }: { sessionId: string; joinCode: string; schoolName: string; animation: AnimationStyle }) {
  const { session, players } = useRealtimeSession(sessionId);
  const ms = (session as any)?.mode_state ?? { teams: [{ name: 'Team 1', score: 0 }, { name: 'Team 2', score: 0 }], lastResult: null };
  const teams = ms.teams as [{ name: string; score: number }, { name: string; score: number }];
  const active = (session as any)?.active_team ?? 0;
  const bonus = (session as any)?.is_bonus ?? false;
  const state = session?.state;
  const cq = session?.current_question as any;
  const qIndex = session?.current_q_index ?? -1;
  const remaining = useCountdown(cq?.startTime, cq?.timeLimit);
  const rosters: [typeof players, typeof players] = [[], []];
  players.forEach((p) => { if (p.team === 0) rosters[0].push(p); else if (p.team === 1) rosters[1].push(p); });

  const shell: React.CSSProperties = { position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' };

  const ScoreCards = ({ big }: { big?: boolean }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, width: '100%', maxWidth: 900, margin: '0 auto' }}>
      {teams.map((t, i) => (
        <div key={i} style={{ borderRadius: 16, padding: big ? 28 : 16, border: `3px solid ${TEAM_COLOR[i]}`, background: `${TEAM_COLOR[i]}22`, boxShadow: active === i && (state === 'question_active' || state === 'reveal') ? `0 0 30px ${TEAM_COLOR[i]}88` : 'none', transform: active === i && (state === 'question_active') ? 'scale(1.03)' : 'none', transition: 'all .2s' }}>
          <div style={{ fontWeight: 800, fontSize: big ? 26 : 18 }}>{t.name}</div>
          <div style={{ fontFamily: 'ui-monospace,monospace', fontWeight: 900, fontSize: big ? 64 : 40, color: 'var(--accent)' }}>{t.score}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', color: 'var(--text)', fontFamily: 'Nunito, system-ui, sans-serif' }}>
      <AnimatedBackground style={animation} />

      {(state === 'question_active' || state === 'reveal') && cq ? (
        <main style={{ ...shell, justifyContent: 'flex-start', paddingTop: 30, maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 14 }}>
            <span style={{ fontWeight: 800, fontFamily: 'ui-monospace,monospace', background: 'rgba(0,0,0,.3)', padding: '8px 16px', borderRadius: 999 }}>Q{qIndex + 1} · {teams[active].name}</span>
            {bonus && <span style={{ fontWeight: 900, color: '#f97316', background: 'rgba(249,115,22,.15)', border: '1px solid #f97316', padding: '8px 18px', borderRadius: 999 }}><Zap size={16} style={{ verticalAlign: '-2px', marginRight: 4 }} />BONUS · +5</span>}
            <TimerRing remaining={remaining} total={cq.timeLimit} size={84} />
          </div>
          <div style={{ marginBottom: 14, width: '100%' }}><ScoreCards /></div>
          <div className="qcard" style={{ width: '100%', marginBottom: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(24px,3.6vw,40px)', fontWeight: 900 }}>{cq.text}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%' }}>
            {CHOICES.map((c) => (
              <AnswerTile key={c} choice={c} label={cq.options[c]} state={state === 'reveal' ? (cq.answer === c ? 'reveal-correct' : 'reveal-wrong') : 'idle'} />
            ))}
          </div>
        </main>
      ) : state === 'leaderboard' || state === 'ended' ? (
        <main style={shell}>
          {state === 'ended' && <Confetti continuous />}
          {state === 'ended' && <div className="float-y" style={{ display: 'inline-block' }}><Trophy size={80} /></div>}
          <h1 style={{ fontFamily: '"Fredoka One",sans-serif', fontSize: 'clamp(30px,5vw,56px)', color: 'var(--accent)', margin: '4px 0 10px' }}>
            {state === 'ended' ? (teams[0].score === teams[1].score ? "It's a tie!" : `${teams[teams[0].score > teams[1].score ? 0 : 1].name} win!`) : 'Team Scores'}
          </h1>
          <ScoreCards big />
        </main>
      ) : (
        <main style={shell}>
          <div style={{ fontWeight: 900, letterSpacing: 5, color: 'var(--accent)', fontSize: 16 }}>{schoolName.toUpperCase()} · <Swords size={15} style={{ verticalAlign: '-2px' }} /> TEAM BATTLE</div>
          <div style={{ fontFamily: '"Fredoka One", sans-serif', fontSize: 'clamp(34px,7vw,68px)', color: 'var(--accent)', lineHeight: 1, margin: '10px 0' }}>Join the battle!</div>
          <div className="codechip float-y" style={{ fontSize: 'clamp(50px,11vw,130px)' }}>{joinCode}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, width: '100%', maxWidth: 820, marginTop: 22 }}>
            {teams.map((t, i) => (
              <div key={i} style={{ borderRadius: 16, padding: 16, border: `3px solid ${TEAM_COLOR[i]}`, background: `${TEAM_COLOR[i]}18` }}>
                <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 8 }}>{t.name}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', minHeight: 30 }}>
                  {rosters[i].map((p) => (
                    <span key={p.id} className="pop-in" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.12)', padding: '5px 12px 5px 5px', borderRadius: 999, fontWeight: 700 }}>
                      <span className="avatar" style={{ width: 26, height: 26, fontSize: 12, background: TEAM_COLOR[i] }}>{initial(p.name)}</span>{p.name}
                    </span>
                  ))}
                  {rosters[i].length === 0 && <span style={{ color: 'var(--text-dim)' }}>waiting…</span>}
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontWeight: 800, color: 'var(--accent)', fontSize: 22, marginTop: 16 }}><Users size={20} style={{ verticalAlign: '-3px', marginRight: 6 }} />{players.length} joined</div>
        </main>
      )}
    </div>
  );
}
