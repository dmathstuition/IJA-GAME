'use client';

import '../../../components/game/game.css';
import { useState, useTransition } from 'react';
import { useRealtimeSession } from '@/lib/game/useRealtimeSession';
import { setState } from '@/lib/game/actions';
import { setTeamNames, assignPlayer, autoAssignTeams, setActiveTeam, launchTeamQuestion, revealTeam, skipTeamQuestion } from '@/lib/game/team';
import type { Question, Choice } from '@/lib/types';

const CHOICES: Choice[] = ['A', 'B', 'C', 'D'];
const TEAM_COLOR = ['#e21b3c', '#1368ce'];

export function TeamHostClient({ sessionId, joinCode, questions }: { sessionId: string; joinCode: string; questions?: Question[] }) {
  const { session, players, answers } = useRealtimeSession(sessionId);
  const [pending, start] = useTransition();
  const bank = questions && questions.length ? questions : [];
  const ms = (session as any)?.mode_state ?? { teams: [{ name: 'Red Eagles', score: 0 }, { name: 'Blue Lions', score: 0 }], used: [], lastResult: null };
  const teams = ms.teams as [{ name: string; score: number }, { name: string; score: number }];
  const used: number[] = ms.used ?? [];
  const active = (session as any)?.active_team ?? 0;
  const bonus = (session as any)?.is_bonus ?? false;
  const state = session?.state;
  const cq = session?.current_question as any;
  const qIndex = session?.current_q_index ?? -1;
  const [n0, setN0] = useState('');
  const [n1, setN1] = useState('');

  const teamOf = new Map(players.map((p) => [p.id, (p as any).team ?? -1]));
  const roundAns = answers.filter((a) => a.q_index === qIndex).sort((a, b) => (a.answered_at ?? '').localeCompare(b.answered_at ?? ''));
  const lock = roundAns.find((a) => teamOf.get(a.player_id) === active);

  const rosters: [typeof players, typeof players, typeof players] = [[], [], []];
  players.forEach((p) => rosters[((p as any).team === 0 ? 0 : (p as any).team === 1 ? 1 : 2)].push(p));

  const live = state === 'question_active';
  const btn = (bg: string): React.CSSProperties => ({ padding: '9px 14px', borderRadius: 9, border: 'none', color: '#fff', background: bg, fontWeight: 800, cursor: 'pointer', fontSize: 13 });

  return (
    <main style={{ maxWidth: 1000, margin: '0 auto', padding: 20, color: 'var(--text)', fontFamily: 'system-ui' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: 2, color: 'var(--text-dim)' }}>⚔️ TEAM BATTLE · {state ?? '…'} {bonus && '· BONUS'}</div>
          <h1 style={{ fontSize: 24, color: 'var(--accent)' }}>Team Control</h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>JOIN CODE</div>
          <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: 4, color: 'var(--accent)', fontFamily: 'ui-monospace' }}>{joinCode}</div>
        </div>
      </header>

      {/* Team score cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, margin: '16px 0' }}>
        {teams.map((t, i) => (
          <div key={i} style={{ borderRadius: 14, padding: 16, textAlign: 'center', border: `2px solid ${TEAM_COLOR[i]}`, background: `${TEAM_COLOR[i]}22`, boxShadow: active === i ? `0 0 24px ${TEAM_COLOR[i]}66` : 'none', transform: active === i ? 'scale(1.02)' : 'none', transition: 'all .2s' }}>
            <div style={{ fontWeight: 800, marginBottom: 4 }}>{t.name} {active === i && <span style={{ fontSize: 11, color: 'var(--accent)' }}>{bonus ? '· BONUS +5' : '· ACTIVE +10'}</span>}</div>
            <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 34, fontWeight: 900, color: 'var(--accent)' }}>{t.score}</div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{rosters[i].length} players</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
        <div style={{ display: 'grid', gap: 12 }}>
          {/* Current question */}
          <div style={{ border: '1px solid rgba(255,255,255,.12)', borderRadius: 14, padding: 16, background: 'rgba(0,0,0,.25)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 6 }}>{cq ? `Q${qIndex + 1} · for ${teams[active].name}${bonus ? ' (bonus)' : ''}` : 'No question live'}</div>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>{cq?.text ?? 'Launch a question for the active team below →'}</div>
            {cq && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {CHOICES.map((c) => {
                  const isAns = state === 'reveal' && cq.answer === c;
                  const isLock = lock?.choice === c;
                  return (
                    <div key={c} style={{ padding: '8px 10px', borderRadius: 8, fontSize: 13, border: `1px solid ${isAns ? 'var(--correct)' : isLock ? 'var(--accent)' : 'rgba(255,255,255,.1)'}`, background: isAns ? 'rgba(34,197,94,.15)' : 'rgba(0,0,0,.2)' }}>
                      <b>{c}</b> {cq.options[c]} {isLock && <span style={{ color: 'var(--accent)', fontSize: 11 }}>🔒 {players.find((p) => p.id === lock!.player_id)?.name}</span>}
                    </div>
                  );
                })}
              </div>
            )}
            {ms.lastResult && state === 'reveal' && (
              <div style={{ marginTop: 10, fontSize: 13, fontWeight: 700, color: ms.lastResult.correct ? 'var(--correct)' : 'var(--wrong)' }}>
                {ms.lastResult.outcome === 'correct' && `✓ ${ms.lastResult.teamName} scored +${ms.lastResult.points}`}
                {ms.lastResult.outcome === 'both_missed' && `✗ Both teams missed — answer was ${ms.lastResult.answer}`}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              <button style={btn('var(--accent)')} disabled={pending || !live} onClick={() => start(() => { revealTeam(sessionId); })}>👁 Reveal {bonus ? '(bonus)' : ''}</button>
              <button style={btn('#f97316')} disabled={pending || !cq} onClick={() => start(() => { skipTeamQuestion(sessionId); })}>⏭ Skip</button>
              <button style={btn('#7c3aed')} disabled={pending} onClick={() => start(() => { setState(sessionId, 'leaderboard'); })}>🏆 Scores</button>
              <button style={btn('var(--wrong)')} disabled={pending} onClick={() => start(() => { setState(sessionId, 'ended'); })}>End</button>
            </div>
          </div>

          {/* Active team switch */}
          <div style={{ border: '1px solid rgba(255,255,255,.12)', borderRadius: 14, padding: 14, background: 'rgba(0,0,0,.25)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>ACTIVE TEAM</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {teams.map((t, i) => (
                <button key={i} style={{ ...btn(active === i ? TEAM_COLOR[i] : 'transparent'), border: `1px solid ${TEAM_COLOR[i]}`, flex: 1 }} disabled={pending || live} onClick={() => start(() => { setActiveTeam(sessionId, i); })}>{t.name}</button>
              ))}
            </div>
          </div>

          {/* Question bank */}
          <div style={{ border: '1px solid rgba(255,255,255,.12)', borderRadius: 14, padding: 16, background: 'rgba(0,0,0,.25)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>QUESTION BANK · {used.length}/{bank.length} used</div>
            {bank.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>This session has no question set. Start a Team Battle from a question bank.</p>}
            <div style={{ display: 'grid', gap: 6 }}>
              {bank.map((q, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between', opacity: used.includes(i) ? 0.4 : 1 }}>
                  <span style={{ fontSize: 13 }}>{i + 1}. {q.text}</span>
                  <button style={btn('var(--correct)')} disabled={pending || live || used.includes(i)} onClick={() => start(() => { launchTeamQuestion(sessionId, q, i); })}>{used.includes(i) ? 'Used' : `Launch → ${teams[active].name}`}</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Player assignment sidebar */}
        <aside style={{ border: '1px solid rgba(255,255,255,.12)', borderRadius: 14, padding: 14, background: 'rgba(0,0,0,.25)' }}>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>TEAMS & PLAYERS</div>
          <div style={{ display: 'grid', gap: 6, marginBottom: 10 }}>
            <input value={n0} onChange={(e) => setN0(e.target.value)} placeholder={teams[0].name} style={{ padding: 8, borderRadius: 8, border: `1px solid ${TEAM_COLOR[0]}`, background: '#0c1018', color: '#fff', fontSize: 13 }} />
            <input value={n1} onChange={(e) => setN1(e.target.value)} placeholder={teams[1].name} style={{ padding: 8, borderRadius: 8, border: `1px solid ${TEAM_COLOR[1]}`, background: '#0c1018', color: '#fff', fontSize: 13 }} />
            <div style={{ display: 'flex', gap: 6 }}>
              <button style={{ ...btn('var(--primary)'), flex: 1 }} disabled={pending} onClick={() => start(() => { setTeamNames(sessionId, n0 || teams[0].name, n1 || teams[1].name); })}>Save names</button>
              <button style={btn('#334155')} disabled={pending} onClick={() => start(() => { autoAssignTeams(sessionId); })}>Auto</button>
            </div>
          </div>
          {[0, 1, 2].map((col) => (
            <div key={col} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: col === 2 ? 'var(--text-dim)' : TEAM_COLOR[col], marginBottom: 4 }}>{col === 2 ? 'UNASSIGNED' : teams[col].name} ({rosters[col].length})</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {rosters[col].map((p) => (
                  <button key={p.id} title="Click to move" onClick={() => start(() => { assignPlayer(p.id, col === 0 ? 1 : col === 1 ? -1 : 0); })}
                    style={{ fontSize: 12, padding: '3px 9px', borderRadius: 999, border: '1px solid rgba(255,255,255,.15)', background: 'rgba(255,255,255,.08)', color: '#fff', cursor: 'pointer' }}>{p.name} · {p.score}</button>
                ))}
                {rosters[col].length === 0 && <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>—</span>}
              </div>
            </div>
          ))}
        </aside>
      </div>

      <p style={{ marginTop: 14, fontSize: 12, color: 'var(--text-dim)' }}>Projector: <code>/display/{joinCode}</code> · Players: <code>/play/{joinCode}</code></p>
    </main>
  );
}
