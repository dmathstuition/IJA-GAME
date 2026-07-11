'use client';

import '../../../components/game/game.css';
import { useState, useTransition } from 'react';
import { Mic, SkipForward, Trophy, Plus, X } from 'lucide-react';
import { useRealtimeSession } from '@/lib/game/useRealtimeSession';
import { useCountdown } from '@/components/game/useCountdown';
import { setState } from '@/lib/game/actions';
import { setGroups, setActiveGroup, launchOralQuestion, markOral, markOralTheory, skipOral } from '@/lib/game/oral';
import { HostTools } from '@/components/game/HostTools';
import type { Question, Choice } from '@/lib/types';

const CHOICES: Choice[] = ['A', 'B', 'C', 'D'];
// Up to six on-stage groups, SPAK style.
const GROUP_COLOR = ['#8b5cf6', '#f97316', '#10b981', '#e21b3c', '#1368ce', '#d89e00'];
const MAX_GROUPS = 6;
const ANS_COLOR: Record<Choice, string> = { A: '#e21b3c', B: '#1368ce', C: '#d89e00', D: '#26890c' };

export function OralHostClient({ sessionId, joinCode, questions }: { sessionId: string; joinCode: string; questions?: Question[] }) {
  const { session } = useRealtimeSession(sessionId);
  const [pending, start] = useTransition();
  const bank = questions && questions.length ? questions : [];
  const ms = (session as any)?.mode_state ?? { groups: [{ name: 'Group A', score: 0 }, { name: 'Group B', score: 0 }], used: [], lastResult: null };
  const groups = (ms.groups ?? []) as { name: string; score: number }[];
  const used: number[] = ms.used ?? [];
  const passCount: number = ms.passCount ?? 0;
  const active = (session as any)?.active_team ?? 0;
  const bonus = (session as any)?.is_bonus ?? false;
  const state = session?.state;
  const cq = session?.current_question as any;
  const qIndex = session?.current_q_index ?? -1;
  const live = state === 'question_active';
  const remaining = useCountdown(cq?.startTime, cq?.timeLimit ?? 60);

  // Group editor: null = not editing (mirror live groups); array = draft names.
  const [draft, setDraft] = useState<string[] | null>(null);
  const rows = draft ?? groups.map((g) => g.name);
  const edit = (i: number, v: string) => { const d = [...rows]; d[i] = v; setDraft(d); };
  const addRow = () => setDraft([...rows, '']);
  const removeRow = (i: number) => setDraft(rows.filter((_, j) => j !== i));
  const saveGroups = () => start(async () => {
    const names = rows.map((n, i) => n.trim() || groups[i]?.name || `Group ${String.fromCharCode(65 + i)}`);
    const r = await setGroups(sessionId, names);
    if ((r as any).error) alert((r as any).error);
    else setDraft(null);
  });

  const btn = (bg: string): React.CSSProperties => ({ padding: '10px 16px', borderRadius: 9, border: 'none', color: '#fff', background: bg, fontWeight: 800, cursor: 'pointer', fontSize: 14 });

  return (
    <main style={{ maxWidth: 1000, margin: '0 auto', padding: 20, color: 'var(--text)', fontFamily: 'system-ui' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: 2, color: 'var(--text-dim)' }}><Mic size={12} style={{ verticalAlign: '-2px', marginRight: 5 }} />QUIZ BOWL · {groups.length} groups · {state ?? '…'} {bonus && '· BONUS'}</div>
          <h1 style={{ fontSize: 24, color: 'var(--accent)' }}>Oral / Quiz Bowl Control</h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>JOIN CODE (display)</div>
          <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: 4, color: 'var(--accent)', fontFamily: 'ui-monospace' }}>{joinCode}</div>
        </div>
      </header>

      {/* group score cards — grows with the number of groups */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${groups.length > 3 ? 130 : 180}px, 1fr))`, gap: 10, margin: '16px 0' }}>
        {groups.map((g, i) => {
          const col = GROUP_COLOR[i % GROUP_COLOR.length];
          return (
            <div key={i} style={{ borderRadius: 14, padding: '12px 10px', textAlign: 'center', border: `2px solid ${col}`, background: `${col}22`, boxShadow: active === i ? `0 0 24px ${col}66` : 'none', transform: active === i ? 'scale(1.03)' : 'none', transition: 'all .2s' }}>
              <div style={{ fontWeight: 800, marginBottom: 2, fontSize: 14 }}>{g.name}</div>
              {active === i && <div style={{ fontSize: 10.5, color: 'var(--accent)', fontWeight: 800 }}>{bonus ? `ANSWERING · BONUS +5` : 'ANSWERING · +10'}</div>}
              <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 30, fontWeight: 900, color: 'var(--accent)' }}>{g.score}</div>
            </div>
          );
        })}
      </div>

      {/* current question — host reads it */}
      <div style={{ border: '1px solid rgba(255,255,255,.12)', borderRadius: 14, padding: 16, background: 'linear-gradient(160deg, rgba(30,20,45,.55), rgba(15,10,25,.7))', marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
            {cq ? `Q${qIndex + 1} · read to ${groups[active]?.name ?? '—'}${bonus ? ` (pass ${passCount}/${groups.length - 1} · bonus)` : ''}` : 'No question live'}
          </div>
          {live && <div style={{ fontFamily: 'ui-monospace,monospace', fontWeight: 900, fontSize: 22, color: remaining <= 10 ? 'var(--wrong)' : 'var(--accent)' }}>{Math.ceil(remaining)}s</div>}
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
          {cq?.kind === 'theory' && <span style={{ fontSize: 11, fontWeight: 900, color: '#f59e0b', border: '1px solid #f59e0b', borderRadius: 6, padding: '2px 6px', marginRight: 8, verticalAlign: 'middle' }}>THEORY</span>}
          {cq?.text ?? 'Launch a question for the answering group below →'}
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
        {ms.lastResult && (state === 'reveal' || (live && ms.lastResult.outcome === 'passed')) && (
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: ms.lastResult.correct ? 'var(--correct)' : 'var(--wrong)' }}>
            {ms.lastResult.groupName} {ms.lastResult.chosen ? <>picked <b>{ms.lastResult.chosen}</b></> : 'answered'} —{' '}
            {ms.lastResult.outcome === 'correct' && `✓ Correct! +${ms.lastResult.points}`}
            {ms.lastResult.outcome === 'passed' && `✗ wrong — passed to ${ms.lastResult.nextGroupName ?? 'the next group'} for +5`}
            {ms.lastResult.outcome === 'all_missed' && (ms.lastResult.kind === 'theory' ? `✗ every group missed it` : `✗ every group missed — answer was ${ms.lastResult.answer}`)}
          </div>
        )}
        {live && cq?.kind === 'theory' && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 6 }}>DID {groups[active]?.name?.toUpperCase() ?? 'THE GROUP'} ANSWER CORRECTLY?</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button style={{ ...btn('var(--correct)'), padding: '14px 8px', fontSize: 16 }} disabled={pending} onClick={() => start(() => { markOralTheory(sessionId, true); })}>✓ Correct</button>
              <button style={{ ...btn('var(--wrong)'), padding: '14px 8px', fontSize: 16 }} disabled={pending} onClick={() => start(() => { markOralTheory(sessionId, false); })}>✗ Wrong</button>
            </div>
          </div>
        )}
        {live && cq?.kind !== 'theory' && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 6 }}>TAP THE ANSWER {groups[active]?.name?.toUpperCase() ?? 'THE GROUP'} GAVE</div>
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
          {bank.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>No question set. Start Oral from a question bank, or import via Organiser Tools.</p>}
          <div style={{ display: 'grid', gap: 6 }}>
            {bank.map((q, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between', opacity: used.includes(i) ? 0.4 : 1 }}>
                <span style={{ fontSize: 13 }}>{i + 1}. {q.text} {q.kind === 'theory' && <span style={{ fontSize: 10, fontWeight: 900, color: '#f59e0b' }}>THEORY</span>}</span>
                <button style={btn('var(--correct)')} disabled={pending || live || used.includes(i)} onClick={() => start(() => { launchOralQuestion(sessionId, q, i); })}>{used.includes(i) ? 'Used' : `Read → ${groups[active]?.name ?? ''}`}</button>
              </div>
            ))}
          </div>
        </div>

        {/* group setup — 2 to 6 on-stage groups */}
        <aside style={{ border: '1px solid rgba(255,255,255,.12)', borderRadius: 14, padding: 14, background: 'linear-gradient(160deg, rgba(30,20,45,.55), rgba(15,10,25,.7))' }}>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>GROUPS ({rows.length}/{MAX_GROUPS})</div>
          {rows.map((name, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
              <input
                value={name}
                onChange={(e) => edit(i, e.target.value)}
                placeholder={groups[i]?.name ?? `Group ${String.fromCharCode(65 + i)}`}
                style={{ flex: 1, minWidth: 0, padding: 8, borderRadius: 8, border: `1px solid ${GROUP_COLOR[i % GROUP_COLOR.length]}`, background: '#0c1018', color: '#fff', fontSize: 13 }}
              />
              {rows.length > 2 && (
                <button title="Remove group" onClick={() => removeRow(i)} disabled={pending || live}
                  style={{ width: 32, borderRadius: 8, border: '1px solid rgba(255,45,85,.4)', background: 'rgba(255,45,85,.08)', color: '#ff6b8a', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                  <X size={13} />
                </button>
              )}
            </div>
          ))}
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            <button style={{ ...btn('var(--primary)'), flex: 1, padding: '8px 10px', fontSize: 13 }} disabled={pending || live} onClick={saveGroups}>Save groups</button>
            <button title="Add a group" style={{ ...btn('#334155'), padding: '8px 12px', fontSize: 13 }} disabled={pending || live || rows.length >= MAX_GROUPS} onClick={addRow}><Plus size={14} /></button>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 6 }}>ANSWERING GROUP</div>
          <div style={{ display: 'grid', gap: 6 }}>
            {groups.map((g, i) => {
              const col = GROUP_COLOR[i % GROUP_COLOR.length];
              return (
                <button key={i} style={{ ...btn(active === i ? col : 'transparent'), border: `1px solid ${col}`, padding: '8px 10px', fontSize: 13 }} disabled={pending || live} onClick={() => start(() => { setActiveGroup(sessionId, i); })}>{g.name}</button>
              );
            })}
          </div>
          <p style={{ fontSize: 11.5, color: 'var(--text-dim)', marginTop: 10, lineHeight: 1.5 }}>
            No phones needed — groups answer aloud, you judge. A miss passes the question to the next group for +5 until someone gets it.
          </p>
        </aside>
      </div>
      <p style={{ marginTop: 12, fontSize: 12, color: 'var(--text-dim)' }}>Projector: <code>/display/{joinCode}</code> — the audience sees the question and scoreboard; you judge each group&apos;s spoken answer.</p>
      <HostTools sessionId={sessionId} joinCode={joinCode} questions={questions ?? []} />
    </main>
  );
}
