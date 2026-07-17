'use client';

import '../../../components/game/game.css';
import { Users } from 'lucide-react';
import { useRealtimeSession } from '@/lib/game/useRealtimeSession';
import { useCountdown } from '@/components/game/useCountdown';
import { AnimatedBackground } from '@/components/game/AnimatedBackground';
import { AnswerTile } from '@/components/game/AnswerTile';
import { TimerRing } from '@/components/game/TimerRing';
import { Confetti } from '@/components/game/Confetti';
import { Star } from '@/components/game/Shapes';
import { ChampionSpotlight } from '@/components/game/ChampionSpotlight';
import type { AnimationStyle } from '@/lib/themes';
import type { Choice } from '@/lib/types';

const CHOICES: Choice[] = ['A', 'B', 'C', 'D'];
const AV = ['#e21b3c', '#1368ce', '#d89e00', '#26890c', '#a855f7', '#FF6A00'];
const initial = (s: string) => (s?.[0] || '?').toUpperCase();

export function DisplayClient({ sessionId, joinCode, schoolName, animation }: { sessionId: string; joinCode: string; schoolName: string; animation: AnimationStyle }) {
  const { session, players, answers } = useRealtimeSession(sessionId);
  const state = session?.state;
  const cq = session?.current_question as any;
  const qIndex = session?.current_q_index ?? -1;
  const round = answers.filter((a) => a.q_index === qIndex);
  const tally = CHOICES.map((c) => round.filter((a) => a.choice === c).length);
  const answered = new Set(round.map((a) => a.player_id)).size;
  const remaining = useCountdown(cq?.startTime, cq?.timeLimit);
  const ranked = [...players].sort((a, b) => b.score - a.score);

  const shell: React.CSSProperties = { position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' };

  return (
    <div style={{ minHeight: '100vh', color: 'var(--text)', fontFamily: 'Nunito, system-ui, sans-serif' }}>
      <AnimatedBackground style={animation} />

      {(state === 'question_active' || state === 'reveal') && cq ? (
        <main style={{ ...shell, justifyContent: 'flex-start', paddingTop: 34, maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontWeight: 800, fontFamily: 'ui-monospace,monospace', background: 'rgba(0,0,0,.3)', padding: '8px 16px', borderRadius: 999, fontSize: 18 }}>Question {qIndex + 1}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 800, background: 'rgba(0,0,0,.3)', padding: '8px 16px', borderRadius: 999, fontSize: 18 }}><Users size={17} /> {answered} answered</span>
            <TimerRing remaining={remaining} total={cq.timeLimit} size={92} />
          </div>
          <div className="qcard" style={{ width: '100%', marginBottom: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 900 }}>{cq.text}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, width: '100%' }}>
            {CHOICES.map((c, i) => (
              <div key={c} style={{ position: 'relative' }}>
                <AnswerTile choice={c} label={cq.options[c]} state={state === 'reveal' ? (cq.answer === c ? 'reveal-correct' : 'reveal-wrong') : 'idle'} />
                <span style={{ position: 'absolute', top: 12, right: 14, fontWeight: 900, fontFamily: 'ui-monospace,monospace', background: 'rgba(0,0,0,.4)', padding: '3px 12px', borderRadius: 999, fontSize: 15 }}>{tally[i]}</span>
              </div>
            ))}
          </div>
        </main>
      ) : state === 'leaderboard' || state === 'ended' ? (
        <main style={{ ...shell, justifyContent: 'flex-start', paddingTop: 46 }}>
          {state === 'ended' && <Confetti continuous />}
          {state === 'ended' && ranked[0] ? (
            <ChampionSpotlight name={ranked[0].name} subtitle={`${ranked[0].score} pts`} />
          ) : (
            <h1 style={{ fontFamily: '"Fredoka One",sans-serif', fontSize: 'clamp(30px,5vw,56px)', color: 'var(--accent)', margin: '4px 0 24px', textShadow: '0 6px 30px rgba(0,0,0,.4)' }}>Leaderboard</h1>
          )}

          {state === 'ended' && ranked.length >= 3 && (
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 14, marginBottom: 26, zIndex: 2 }}>
              {[[1, 150, '#C0C0C0'], [0, 200, 'var(--accent)'], [2, 110, '#cd7f32']].map(([rank, h, col]) => {
                const p = ranked[rank as number];
                return (
                  <div key={rank as number} style={{ display: 'grid', gap: 8, placeItems: 'center' }}>
                    <span className="avatar" style={{ width: 56, height: 56, fontSize: p.avatar ? 30 : 22, background: p.avatar ? 'rgba(255,255,255,.14)' : (col as string) }}>{p.avatar || initial(p.name)}</span>
                    <div style={{ fontWeight: 900, maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                    <div style={{ fontFamily: 'ui-monospace,monospace', color: 'var(--accent)', fontWeight: 900 }}>{p.score}</div>
                    <div className="slide-up" style={{ width: 108, height: h as number, borderRadius: '16px 16px 0 0', background: `linear-gradient(180deg, ${col as string}, transparent)`, border: `2px solid ${col as string}`, display: 'grid', placeItems: 'start center', paddingTop: 10, fontFamily: '"Fredoka One",sans-serif', fontSize: 28 }}>
                      {(rank as number) === 0 ? <Star size={34} /> : `#${(rank as number) + 1}`}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ width: '100%', maxWidth: 720, display: 'grid', gap: 8, zIndex: 2 }}>
            {ranked.slice(0, 10).map((p, i) => (
              <div key={p.id} className={`lbrow ${i === 0 ? 'top1' : ''}`} style={{ animationDelay: `${i * 0.05}s`, fontSize: 22 }}>
                <b style={{ width: 36, color: i === 0 ? 'var(--accent)' : 'rgba(255,255,255,.7)' }}>{i + 1}</b>
                <span className="avatar" style={{ background: p.avatar ? 'rgba(255,255,255,.14)' : AV[i % AV.length], fontSize: p.avatar ? 22 : undefined }}>{p.avatar || initial(p.name)}</span>
                <span style={{ flex: 1, textAlign: 'left', fontWeight: 800 }}>{p.name}</span>
                <b style={{ fontFamily: 'ui-monospace,monospace', color: 'var(--accent)' }}>{p.score}</b>
              </div>
            ))}
          </div>
        </main>
      ) : (
        // Lobby
        <main style={shell}>
          <div style={{ fontWeight: 900, letterSpacing: 5, color: 'var(--accent)', fontSize: 16 }}>{schoolName.toUpperCase()}</div>
          <div style={{ fontFamily: '"Fredoka One", sans-serif', fontSize: 'clamp(36px,7vw,72px)', color: 'var(--accent)', lineHeight: 1, margin: '10px 0', textShadow: '0 8px 30px rgba(0,0,0,.45)' }}>Join the game!</div>
          <div style={{ color: 'rgba(255,255,255,.75)', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Enter this code on your phone</div>
          <div className="codechip float-y" style={{ fontSize: 'clamp(56px,12vw,140px)' }}>{joinCode}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 900, marginTop: 20 }}>
            {ranked.map((p, i) => (
              <span key={p.id} className="pop-in" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.12)', padding: '7px 16px 7px 7px', borderRadius: 999, fontWeight: 800, fontSize: 18, animationDelay: `${Math.min(i * 0.06, 1.2)}s` }}>
                <span className="avatar" style={{ width: 32, height: 32, fontSize: p.avatar ? 18 : 14, background: p.avatar ? 'rgba(255,255,255,.14)' : AV[i % AV.length] }}>{p.avatar || initial(p.name)}</span>{p.name}
              </span>
            ))}
          </div>
          <div style={{ fontWeight: 800, color: 'var(--accent)', fontSize: 24, marginTop: 18 }}><Users size={22} style={{ verticalAlign: '-3px', marginRight: 6 }} />{players.length} joined</div>
        </main>
      )}
    </div>
  );
}
