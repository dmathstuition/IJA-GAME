'use client';

import '../../../components/game/game.css';
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
const GROUP_COLOR = ['#8b5cf6', '#f97316'];

export function OralDisplayClient({ sessionId, joinCode, schoolName, animation }: { sessionId: string; joinCode: string; schoolName: string; animation: AnimationStyle }) {
  const { session } = useRealtimeSession(sessionId);
  const ms = (session as any)?.mode_state ?? { groups: [{ name: 'Group A', score: 0 }, { name: 'Group B', score: 0 }], lastResult: null };
  const groups = ms.groups as [{ name: string; score: number }, { name: string; score: number }];
  const active = (session as any)?.active_team ?? 0;
  const bonus = (session as any)?.is_bonus ?? false;
  const state = session?.state;
  const cq = session?.current_question as any;
  const qIndex = session?.current_q_index ?? -1;
  const remaining = useCountdown(cq?.startTime, cq?.timeLimit ?? 60);

  const shell: React.CSSProperties = { position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' };
  const ScoreCards = ({ big }: { big?: boolean }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, width: '100%', maxWidth: 900, margin: '0 auto' }}>
      {groups.map((g, i) => (
        <div key={i} style={{ borderRadius: 16, padding: big ? 28 : 16, border: `3px solid ${GROUP_COLOR[i]}`, background: `${GROUP_COLOR[i]}22`, boxShadow: active === i && (state === 'question_active' || state === 'reveal') ? `0 0 30px ${GROUP_COLOR[i]}88` : 'none', transform: active === i && state === 'question_active' ? 'scale(1.03)' : 'none', transition: 'all .2s' }}>
          <div style={{ fontWeight: 800, fontSize: big ? 26 : 18 }}>{g.name}</div>
          <div style={{ fontFamily: 'ui-monospace,monospace', fontWeight: 900, fontSize: big ? 64 : 40, color: 'var(--accent)' }}>{g.score}</div>
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
            <span style={{ fontWeight: 800, fontFamily: 'ui-monospace,monospace', background: 'rgba(0,0,0,.3)', padding: '8px 16px', borderRadius: 999 }}>🎤 Q{qIndex + 1} · {groups[active].name}</span>
            {bonus && <span style={{ fontWeight: 900, color: '#f97316', background: 'rgba(249,115,22,.15)', border: '1px solid #f97316', padding: '8px 18px', borderRadius: 999 }}>⚡ BONUS · +5</span>}
            <TimerRing remaining={remaining} total={cq.timeLimit ?? 60} size={84} />
          </div>
          <div style={{ marginBottom: 14, width: '100%' }}><ScoreCards /></div>
          <div className="qcard" style={{ width: '100%', marginBottom: 16, textAlign: 'center' }}><div style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 900 }}>{cq.text}</div></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%' }}>
            {CHOICES.map((c) => <AnswerTile key={c} choice={c} label={cq.options[c]} state={state === 'reveal' ? (cq.answer === c ? 'reveal-correct' : 'reveal-wrong') : 'idle'} />)}
          </div>
        </main>
      ) : state === 'leaderboard' || state === 'ended' ? (
        <main style={shell}>
          {state === 'ended' && <Confetti continuous />}
          {state === 'ended' && <div className="float-y" style={{ display: 'inline-block' }}><Trophy size={80} /></div>}
          <h1 style={{ fontFamily: '"Fredoka One",sans-serif', fontSize: 'clamp(30px,5vw,56px)', color: 'var(--accent)', margin: '4px 0 12px' }}>
            {state === 'ended' ? (groups[0].score === groups[1].score ? "It's a tie!" : `${groups[groups[0].score > groups[1].score ? 0 : 1].name} win!`) : 'Scores'}
          </h1>
          <ScoreCards big />
        </main>
      ) : (
        <main style={shell}>
          <div style={{ fontWeight: 900, letterSpacing: 5, color: 'var(--accent)', fontSize: 16 }}>{schoolName.toUpperCase()} · 🎤 ORAL ROUND</div>
          <div style={{ fontFamily: '"Fredoka One", sans-serif', fontSize: 'clamp(34px,7vw,64px)', color: 'var(--accent)', lineHeight: 1, margin: '12px 0 20px' }}>Get ready!</div>
          <ScoreCards big />
          <p style={{ color: 'var(--text-dim)', fontSize: 18, marginTop: 16 }}>The host will read each question aloud.</p>
        </main>
      )}
    </div>
  );
}
