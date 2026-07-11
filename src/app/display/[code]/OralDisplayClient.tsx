'use client';

import '../../../components/game/game.css';
import { Mic, Zap } from 'lucide-react';
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
const GROUP_COLOR = ['#8b5cf6', '#f97316', '#10b981', '#e21b3c', '#1368ce', '#d89e00'];

function winnerText(groups: { name: string; score: number }[]): string {
  if (!groups.length) return 'Final scores';
  const top = Math.max(...groups.map((g) => g.score));
  const leaders = groups.filter((g) => g.score === top);
  if (leaders.length === groups.length) return "It's a tie!";
  if (leaders.length > 1) return `${leaders.map((g) => g.name).join(' & ')} tie for the win!`;
  return `${leaders[0].name} win!`;
}

export function OralDisplayClient({ sessionId, joinCode, schoolName, animation }: { sessionId: string; joinCode: string; schoolName: string; animation: AnimationStyle }) {
  const { session } = useRealtimeSession(sessionId);
  const ms = (session as any)?.mode_state ?? { groups: [{ name: 'Group A', score: 0 }, { name: 'Group B', score: 0 }], lastResult: null };
  const groups = (ms.groups ?? []) as { name: string; score: number }[];
  const active = (session as any)?.active_team ?? 0;
  const bonus = (session as any)?.is_bonus ?? false;
  const state = session?.state;
  const cq = session?.current_question as any;
  const qIndex = session?.current_q_index ?? -1;
  const remaining = useCountdown(cq?.startTime, cq?.timeLimit ?? 60);

  const shell: React.CSSProperties = { position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' };
  const ScoreCards = ({ big }: { big?: boolean }) => (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${groups.length > 3 ? (big ? 180 : 130) : (big ? 260 : 180)}px, 1fr))`, gap: 14, width: '100%', maxWidth: 1000, margin: '0 auto' }}>
      {groups.map((g, i) => {
        const col = GROUP_COLOR[i % GROUP_COLOR.length];
        return (
          <div key={i} style={{ borderRadius: 16, padding: big ? 24 : 14, border: `3px solid ${col}`, background: `${col}22`, boxShadow: active === i && (state === 'question_active' || state === 'reveal') ? `0 0 30px ${col}88` : 'none', transform: active === i && state === 'question_active' ? 'scale(1.03)' : 'none', transition: 'all .2s' }}>
            <div style={{ fontWeight: 800, fontSize: big ? 24 : 17 }}>{g.name}</div>
            <div style={{ fontFamily: 'ui-monospace,monospace', fontWeight: 900, fontSize: big ? 56 : 36, color: 'var(--accent)' }}>{g.score}</div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', color: 'var(--text)', fontFamily: 'Nunito, system-ui, sans-serif' }}>
      <AnimatedBackground style={animation} />

      {(state === 'question_active' || state === 'reveal') && cq ? (
        <main style={{ ...shell, justifyContent: 'flex-start', paddingTop: 30, maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 14 }}>
            <span style={{ fontWeight: 800, fontFamily: 'ui-monospace,monospace', background: 'rgba(0,0,0,.3)', padding: '8px 16px', borderRadius: 999 }}><Mic size={14} style={{ verticalAlign: '-2px', marginRight: 5 }} />Q{qIndex + 1} · {groups[active]?.name ?? ''}</span>
            {bonus && <span style={{ fontWeight: 900, color: '#f97316', background: 'rgba(249,115,22,.15)', border: '1px solid #f97316', padding: '8px 18px', borderRadius: 999 }}><Zap size={16} style={{ verticalAlign: '-2px', marginRight: 4 }} />BONUS · +5</span>}
            <TimerRing remaining={remaining} total={cq.timeLimit ?? 60} size={84} />
          </div>
          <div style={{ marginBottom: 14, width: '100%' }}><ScoreCards /></div>
          <div className="qcard" style={{ width: '100%', marginBottom: 14, textAlign: 'center' }}><div style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 900 }}>{cq.text}</div></div>
          {state === 'reveal' && ms.lastResult && (
            <div className="pop-in" style={{ marginBottom: 14, fontSize: 'clamp(18px,2.4vw,26px)', fontWeight: 900, color: ms.lastResult.correct ? 'var(--correct)' : 'var(--wrong)' }}>
              {ms.lastResult.groupName} {ms.lastResult.chosen ? <>answered <b>{ms.lastResult.chosen}</b></> : 'answered'} — {ms.lastResult.correct ? `Correct! +${ms.lastResult.points}` : ms.lastResult.outcome === 'passed' ? `Wrong — passes to ${ms.lastResult.nextGroupName ?? 'the next group'} for +5` : cq.kind === 'theory' ? 'Every group missed it' : `Every group missed — the answer was ${ms.lastResult.answer}`}
            </div>
          )}
          {cq.kind === 'theory' ? (
            <div style={{ width: '100%', textAlign: 'center' }}>
              {state === 'question_active' ? (
                <div style={{ fontSize: 'clamp(18px,2.6vw,28px)', color: 'var(--text-dim)', fontWeight: 700 }}><Mic size={22} style={{ verticalAlign: '-4px', marginRight: 8 }} />The learner answers aloud…</div>
              ) : (
                <div className="qcard pop-in" style={{ padding: '20px 24px', border: '2px solid var(--correct)' }}>
                  <div style={{ fontSize: 13, letterSpacing: 2, color: 'var(--correct)', fontWeight: 900, marginBottom: 6 }}>MODEL ANSWER</div>
                  <div style={{ fontSize: 'clamp(20px,3vw,32px)', fontWeight: 800 }}>{cq.solution || '—'}</div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%' }}>
              {CHOICES.map((c) => {
                const chosen = ms.lastResult?.chosen;
                const isCorrect = cq.answer === c;
                const isChosen = state === 'reveal' && chosen === c;
                const tileState = state === 'reveal' ? (isCorrect ? 'reveal-correct' : isChosen ? 'idle' : 'reveal-wrong') : 'idle';
                return (
                  <div key={c} style={{ position: 'relative', borderRadius: 18, outline: isChosen && !isCorrect ? '3px solid var(--wrong)' : 'none' }}>
                    <AnswerTile choice={c} label={cq.options[c]} state={tileState} />
                    {isChosen && <span style={{ position: 'absolute', top: 10, right: 14, background: isCorrect ? 'var(--correct)' : 'var(--wrong)', padding: '3px 12px', borderRadius: 999, fontSize: 13, fontWeight: 800 }}>Learner {isCorrect ? '✓' : '✗'}</span>}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      ) : state === 'leaderboard' || state === 'ended' ? (
        <main style={shell}>
          {state === 'ended' && <Confetti continuous />}
          {state === 'ended' && <div className="float-y" style={{ display: 'inline-block' }}><Trophy size={80} /></div>}
          <h1 style={{ fontFamily: '"Fredoka One",sans-serif', fontSize: 'clamp(30px,5vw,56px)', color: 'var(--accent)', margin: '4px 0 12px' }}>
            {state === 'ended' ? winnerText(groups) : 'Scores'}
          </h1>
          <ScoreCards big />
        </main>
      ) : (
        <main style={shell}>
          <div style={{ fontWeight: 900, letterSpacing: 5, color: 'var(--accent)', fontSize: 16 }}>{schoolName.toUpperCase()} · <Mic size={15} style={{ verticalAlign: '-2px' }} /> ORAL ROUND</div>
          <div style={{ fontFamily: '"Fredoka One", sans-serif', fontSize: 'clamp(34px,7vw,64px)', color: 'var(--accent)', lineHeight: 1, margin: '12px 0 20px' }}>Get ready!</div>
          <ScoreCards big />
          <p style={{ color: 'var(--text-dim)', fontSize: 18, marginTop: 16 }}>The host will read each question aloud.</p>
        </main>
      )}
    </div>
  );
}
