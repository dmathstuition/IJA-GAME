'use client';

import '../../../components/game/game.css';
import { useState, useTransition } from 'react';
import { Mic, SkipForward, Trophy } from 'lucide-react';
import { useRealtimeSession } from '@/lib/game/useRealtimeSession';
import { useCountdown } from '@/components/game/useCountdown';
import { setState } from '@/lib/game/actions';
import { setGroupNames, setActiveGroup, launchOralQuestion, markOral, markOralTheory, skipOral } from '@/lib/game/oral';
import { HostTools } from '@/components/game/HostTools';
import type { Question, Choice } from '@/lib/types';

const CHOICES: Choice[] = ['A', 'B', 'C', 'D'];
const GROUP_COLOR = ['#8b5cf6', '#f97316'];
const ANS_COLOR: Record<Choice, string> = { A: '#e21b3c', B: '#1368ce', C: '#d89e00', D: '#26890c' };

export function OralHostClient({ sessionId, joinCode, questions }: { sessionId: string; joinCode: string; questions?: Question[] }) {
  const { session } = useRealtimeSession(sessionId);
  const [pending, start] = useTransition();
  const bank = questions && questions.length ? questions : [];
  const ms = (session as any)?.mode_state ?? { groups: [{ name: 'Group A', score: 0 }, { name: 'Group B', score: 0 }], used: [], lastResult: null };
  const groups = ms.groups as [{ name: string; score: number }, { name: string; score: number }];
  const used: number[] = ms.used ?? [];
  const active = (session as any)?.active_team ?? 0;
  const bonus = (session as any)?.is_bonus ?? false;
  const state = session?.state;
  const cq = session?.current_question as any;
  const qIndex = session?.current_q_index ?? -1;
  const live = state === 'question_active';
  const remaining = useCountdown(cq?.startTime, cq?.timeLimit ?? 60);
  const [g0, setG0] = useState('');
  const [g1, setG1] = useState('');

  const btn = (bg: string): React.CSSProperties => ({ padding: '10px 16px', borderRadius: 9, border: 'none', color: '#fff', background: bg, fontWeight: 800, cursor: 'pointer', fontSize: 14 });

  return (
    <main style={{ maxWidth: 940, margin: '0 auto', padding: 20, color: 'var(--text)', fontFamily: 'system-ui' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: 2, color: 'var(--text-dim)' }}><Mic size={12} style={{ verticalAlign: '-2px', marginRight: 5 }} />ORAL ROUND · {state ?? '…'} {bonus && '· BONUS'}</div>
          <h1 style={{ fontSize: 24, color: 'var(--accent)' }}>Oral Control</h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>JOIN CODE (display)</div>
          <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: 4, color: 'var(--accent)', fontFamily: 'ui-monospace' }}>{joinCode}</div>
        </div>
      </header>

      {/* group score cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, margin: '16px 0' }}>
        {groups.map((g, i) => (
          <div key={i} style={{ borderRadius: 14, padding: 16, textAlign: 'center', border: `2px solid ${GROUP_COLOR[i]}`, background: `${GROUP_COLOR[i]}22`, boxShadow: active === i ? `0 0 24px ${GROUP_COLOR[i]}66` : 'none', transform: active === i ? 'scale(1.02)' : 'none', transition: 'all .2s' }}>
            <div style={{ fontWeight: 800, marginBottom: 4 }}>{g.name} {active === i && <span style={{ fontSize: 11, color: 'var(--accent)' }}>{bonus ? '· BONUS +5' : '· ACTIVE +10'}</span>}</div>
            <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 34, fontWeight: 900, color: 'var(--accent)' }}>{g.score}</div>
          </div>
        ))}
      </div>

      {/* current question — host reads it */}
      <div style={{ border: '1px solid rgba(255,255,255,.12)', borderRadius: 14, padding: 16, background: 'linear-gradient(160deg, rgba(30,20,45,.55), rgba(15,10,25,.7))', marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{cq ? `Q${qIndex + 1} · read to ${groups[active].name}${bonus ? ' (bonus)' : ''}` : 'No question live'}</div>
          {live && <div style={{ fontFamily: 'ui-monospace,monospace', fontWeight: 900, fontSize: 22, color: remaining <= 10 ? 'var(--wrong)' : 'var(--accent)' }}>{Math.ceil(remaining)}s</div>}
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
          {cq?.kind === 'theory' && <span style={{ fontSize: 11, fontWeight: 900, color: '#f59e0b', border: '1px solid #f59e0b', borderRadius: 6, padding: '2px 6px', marginRight: 8, verticalAlign: 'middle' }}>THEORY</span>}
          {cq?.text ?? 'Launch a question for the active group below →'}
        </div>
        {cq && cq.kind === 'theory' && (
          <div style={{ padding: '8px 12px', borderRadius: 8, fontSize: 13, marginBottom: 10, border: '1px solid var(--correct)', background: 'rgba(34,197,94,.1)' }}>
            <span style={{ color: 'var(--correct)', fontWeight: 800, fontSize: 11 }}>MODEL ANSWER (host only) </span>{cq.solution || '—'}
          </div>
        )}
        {cq && cq.kind !== 'theory' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
            {CHOICES.map((c) => (
              <div key={c} style={{ padding: '7px 10px', borderRadius: 8, fontSize: 13, border: `1px solid ${cq.answer === c ? 'var(--correct)' : 'rgba(255,255,255,.1)'}`, background: cq.answer === c ? 'rgba(34,197,94,.12)' : 'rgba(0,0,0,.2)' }}>
                <b>{c}</b> {cq.options[c]} {cq.answer === c && <span style={{ color: 'var(--correct)', fontSize: 11 }}>✓ answer</span>}
              </div>
            ))}
          </div>
        )}
        {ms.lastResult && state === 'reveal' && (
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: ms.lastResult.correct ? 'var(--correct)' : 'var(--wrong)' }}>
            {ms.lastResult.groupName} {ms.lastResult.chosen ? <>picked <b>{ms.lastResult.chosen}</b></> : 'answered'} —{' '}
            {ms.lastResult.outcome === 'correct' && `✓ Correct! +${ms.lastResult.points}`}
            {ms.lastResult.outcome === 'passed' && `✗ wrong, passed to the other group`}
            {ms.lastResult.outcome === 'both_missed' && (ms.lastResult.kind === 'theory' ? `✗ wrong` : `✗ wrong — answer was ${ms.lastResult.answer}`)}
          </div>
        )}
        {live && cq?.kind === 'theory' && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 6 }}>DID THE LEARNER ANSWER CORRECTLY?</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button style={{ ...btn('var(--correct)'), padding: '14px 8px', fontSize: 16 }} disabled={pending} onClick={() => start(() => { markOralTheory(sessionId, true); })}>✓ Correct</button>
              <button style={{ ...btn('var(--wrong)'), padding: '14px 8px', fontSize: 16 }} disabled={pending} onClick={() => start(() => { markOralTheory(sessionId, false); })}>✗ Wrong</button>
            </div>
          </div>
        )}
        {live && cq?.kind !== 'theory' && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 6 }}>TAP THE ANSWER THE LEARNER GAVE</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6 }}>
              {CHOICES.map((c) => (
                <button key={c} style={{ ...btn(ANS_COLOR[c]), padding: '14px 8px', fontSize: 16 }} disabled={pending} onClick={() => start(() => { markOral(sessionId, c); })}>{c}. {cq.options[c]}</button>
              ))}
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button style={btn('#f97316')} disabled={pending || !cq} onClick={() => start(() => { skipOral(sessionId); })}><SkipForward size={14} style={{ verticalAlign: '-2px', marginRight: 5 }} />Skip</button>
          <button style={btn('#7c3aed')} disabled={pending} onClick={() => start(() => { setState(sessionId, 'leaderboard'); })}><Trophy size={14} style={{ verticalAlign: '-2px', marginRight: 5 }} />Scores</button>
          <button style={btn('var(--wrong)')} disabled={pending} onClick={() => start(() => { setState(sessionId, 'ended'); })}>End</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 12 }}>
        {/* bank */}
        <div style={{ border: '1px solid rgba(255,255,255,.12)', borderRadius: 14, padding: 16, background: 'linear-gradient(160deg, rgba(30,20,45,.55), rgba(15,10,25,.7))' }}>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>QUESTION BANK · {used.length}/{bank.length} used</div>
          {bank.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>No question set. Start Oral from a question bank.</p>}
          <div style={{ display: 'grid', gap: 6 }}>
            {bank.map((q, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between', opacity: used.includes(i) ? 0.4 : 1 }}>
                <span style={{ fontSize: 13 }}>{i + 1}. {q.text} {q.kind === 'theory' && <span style={{ fontSize: 10, fontWeight: 900, color: '#f59e0b' }}>THEORY</span>}</span>
                <button style={btn('var(--correct)')} disabled={pending || live || used.includes(i)} onClick={() => start(() => { launchOralQuestion(sessionId, q, i); })}>{used.includes(i) ? 'Used' : `Read → ${groups[active].name}`}</button>
              </div>
            ))}
          </div>
        </div>
        {/* group setup */}
        <aside style={{ border: '1px solid rgba(255,255,255,.12)', borderRadius: 14, padding: 14, background: 'linear-gradient(160deg, rgba(30,20,45,.55), rgba(15,10,25,.7))' }}>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>GROUPS</div>
          <input value={g0} onChange={(e) => setG0(e.target.value)} placeholder={groups[0].name} style={{ width: '100%', padding: 8, borderRadius: 8, border: `1px solid ${GROUP_COLOR[0]}`, background: '#0c1018', color: '#fff', fontSize: 13, marginBottom: 6 }} />
          <input value={g1} onChange={(e) => setG1(e.target.value)} placeholder={groups[1].name} style={{ width: '100%', padding: 8, borderRadius: 8, border: `1px solid ${GROUP_COLOR[1]}`, background: '#0c1018', color: '#fff', fontSize: 13, marginBottom: 8 }} />
          <button style={{ ...btn('var(--primary)'), width: '100%', marginBottom: 12 }} disabled={pending} onClick={() => start(() => { setGroupNames(sessionId, g0 || groups[0].name, g1 || groups[1].name); })}>Save names</button>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 6 }}>ACTIVE GROUP</div>
          <div style={{ display: 'grid', gap: 6 }}>
            {groups.map((g, i) => (
              <button key={i} style={{ ...btn(active === i ? GROUP_COLOR[i] : 'transparent'), border: `1px solid ${GROUP_COLOR[i]}` }} disabled={pending || live} onClick={() => start(() => { setActiveGroup(sessionId, i); })}>{g.name}</button>
            ))}
          </div>
        </aside>
      </div>
      <p style={{ marginTop: 12, fontSize: 12, color: 'var(--text-dim)' }}>Projector: <code>/display/{joinCode}</code> — the audience sees the question; you judge each group&apos;s spoken answer.</p>
      <HostTools sessionId={sessionId} joinCode={joinCode} questions={questions ?? []} />
    </main>
  );
}
