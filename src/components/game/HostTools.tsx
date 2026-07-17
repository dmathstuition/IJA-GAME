'use client';

import { useRef, useState, useTransition } from 'react';
import { Wrench, X, Upload, FolderOpen, Download, Megaphone, RotateCcw, LogOut, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRealtimeSession } from '@/lib/game/useRealtimeSession';
import { parseImport, IMPORT_EXAMPLE } from '@/lib/game/importParse';
import { importQuestions, addQuestion, deleteQuestion, clearQuestions } from '@/lib/game/questions';
import { broadcastMessage, clearBroadcast, removePlayer, clearAllPlayers, resetScores, endAndLogoutAll, fullReset } from '@/lib/game/hostAdmin';
import type { Choice, Question } from '@/lib/types';

const CHOICES: Choice[] = ['A', 'B', 'C', 'D'];
type Tab = 'questions' | 'broadcast' | 'players';

const card: React.CSSProperties = { border: '1px solid rgba(255,255,255,.12)', borderRadius: 14, padding: 14, background: 'linear-gradient(160deg, rgba(30,20,45,.55), rgba(15,10,25,.7))' };
const input: React.CSSProperties = { width: '100%', padding: 9, borderRadius: 8, border: '1px solid rgba(255,255,255,.15)', background: '#0c0916', color: '#fff', fontSize: 13, boxSizing: 'border-box' };
const btn = (bg: string): React.CSSProperties => ({ padding: '8px 14px', borderRadius: 9, border: 'none', color: '#fff', background: bg, fontWeight: 800, cursor: 'pointer', fontSize: 13, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 });
const ghost: React.CSSProperties = { padding: '8px 14px', borderRadius: 9, border: '1px solid rgba(255,255,255,.18)', color: '#c9c2d6', background: 'transparent', fontWeight: 700, cursor: 'pointer', fontSize: 13, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 };

/**
 * Organiser Tools drawer — brings the original control panel's full toolset into
 * the new controller: in-panel JSON import (paste + file), add / delete / clear
 * questions, export, broadcast to all screens, and player management. Shared by
 * all four host modes; changes to the bank trigger router.refresh() so the mode
 * panel picks up the new questions.
 */
export function HostTools({ sessionId, joinCode, questions }: { sessionId: string; joinCode: string; questions: Question[] }) {
  const router = useRouter();
  const { session, players } = useRealtimeSession(sessionId);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('questions');
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(null), 3500); };
  const refresh = () => router.refresh();
  const broadcast = (session as any)?.broadcast as { text: string; ts: number } | null;

  // ── import (paste) ─────────────────────────────────────────────────────────
  const [paste, setPaste] = useState('');
  const [replace, setReplace] = useState(false);
  const preview = paste.trim() ? parseImport(paste) : null;
  const fileRef = useRef<HTMLInputElement>(null);

  const runImport = (text: string) => {
    const { questions: qs, errors } = parseImport(text);
    if (!qs.length) { flash(errors[0] ?? 'No questions found.'); return; }
    start(async () => {
      const r = await importQuestions(sessionId, qs, replace ? 'replace' : 'append');
      if ((r as any).error) flash((r as any).error);
      else { flash(`Imported ${qs.length} question${qs.length > 1 ? 's' : ''}${errors.length ? ` (${errors.length} skipped)` : ''}.`); setPaste(''); refresh(); }
    });
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => runImport(String(reader.result ?? ''));
    reader.readAsText(f);
    e.target.value = '';
  };

  // ── add single ─────────────────────────────────────────────────────────────
  const [nq, setNq] = useState<Question>({ text: '', options: { A: '', B: '', C: '', D: '' }, answer: 'A', timeLimit: 30, kind: 'mcq' });
  const addOne = () => {
    if (!nq.text.trim()) { flash('Enter question text.'); return; }
    if (nq.kind === 'theory' && !nq.solution?.trim()) { flash('Enter a model answer.'); return; }
    start(async () => {
      const r = await addQuestion(sessionId, nq);
      if ((r as any).error) flash((r as any).error);
      else { flash('Question added.'); setNq({ text: '', options: { A: '', B: '', C: '', D: '' }, answer: 'A', timeLimit: nq.kind === 'theory' ? 60 : 30, kind: nq.kind }); refresh(); }
    });
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(questions, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `quizzard-${joinCode}-questions.json`; a.click();
    URL.revokeObjectURL(url);
  };

  // ── broadcast ──────────────────────────────────────────────────────────────
  const [bcast, setBcast] = useState('');

  const confirmAct = (label: string, fn: () => Promise<unknown>) => {
    if (!window.confirm(`${label}?`)) return;
    start(async () => { await fn(); flash(`${label} — done.`); refresh(); });
  };

  return (
    <>
      {/* Floating launcher */}
      <button onClick={() => setOpen((o) => !o)} style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 60, ...btn('linear-gradient(140deg,#ff7a1a,#ff2d55)'), padding: '12px 18px', fontSize: 14, boxShadow: '0 10px 30px rgba(255,45,85,.35)' }}>
        <Wrench size={16} /> Organiser Tools
      </button>

      {open && (
        <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 55, background: 'rgba(4,2,10,.6)', backdropFilter: 'blur(3px)' }}>
          <aside onClick={(e) => e.stopPropagation()} style={{ position: 'fixed', top: 0, right: 0, height: '100vh', width: 'min(460px, 100vw)', overflowY: 'auto', background: '#0a0714', borderLeft: '1px solid rgba(255,255,255,.1)', padding: 18, color: 'var(--text)', fontFamily: 'system-ui' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <b style={{ fontSize: 16, display: 'inline-flex', alignItems: 'center', gap: 8 }}><Wrench size={17} /> Organiser Tools</b>
              <button onClick={() => setOpen(false)} style={ghost}><X size={14} /> Close</button>
            </div>

            {msg && <div style={{ ...card, padding: 10, marginBottom: 12, background: 'rgba(255,122,26,.15)', borderColor: '#ff7a1a', fontSize: 13, fontWeight: 700 }}>{msg}</div>}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {(['questions', 'broadcast', 'players'] as Tab[]).map((t) => (
                <button key={t} onClick={() => setTab(t)} style={tab === t ? btn('var(--primary)') : ghost}>
                  {t === 'questions' ? `Questions (${questions.length})` : t === 'broadcast' ? 'Broadcast' : `Players (${players.length})`}
                </button>
              ))}
            </div>

            {/* ── QUESTIONS ── */}
            {tab === 'questions' && (
              <div style={{ display: 'grid', gap: 14 }}>
                {/* Import JSON */}
                <div style={card}>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8, fontWeight: 800, letterSpacing: 1 }}>IMPORT JSON</div>
                  <textarea value={paste} onChange={(e) => setPaste(e.target.value)} rows={6} placeholder={`Paste question JSON…\n\n${IMPORT_EXAMPLE}`} style={{ ...input, fontFamily: 'ui-monospace,monospace', fontSize: 12, resize: 'vertical' }} />
                  {preview && (
                    <div style={{ fontSize: 12, margin: '8px 0', color: preview.questions.length ? 'var(--correct)' : 'var(--wrong)' }}>
                      {preview.questions.length} valid question{preview.questions.length !== 1 ? 's' : ''}
                      {preview.errors.length > 0 && ` · ${preview.errors.length} issue(s)`}
                    </div>
                  )}
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-dim)', margin: '6px 0 10px' }}>
                    <input type="checkbox" checked={replace} onChange={(e) => setReplace(e.target.checked)} />
                    Replace existing bank (otherwise append)
                  </label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button style={btn('var(--correct)')} disabled={pending || !preview?.questions.length} onClick={() => runImport(paste)}><Upload size={14} /> Import paste</button>
                    <button style={ghost} disabled={pending} onClick={() => fileRef.current?.click()}><FolderOpen size={14} /> Import file…</button>
                    <input ref={fileRef} type="file" accept="application/json,.json" onChange={onFile} style={{ display: 'none' }} />
                    <button style={ghost} disabled={!questions.length} onClick={exportJson}><Download size={14} /> Export JSON</button>
                  </div>
                </div>

                {/* Add single */}
                <div style={card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 800, letterSpacing: 1 }}>ADD ONE QUESTION</div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => setNq({ ...nq, kind: 'mcq' })} style={{ ...(nq.kind !== 'theory' ? btn('var(--primary)') : ghost), padding: '5px 10px', fontSize: 12 }}>Multiple choice</button>
                      <button onClick={() => setNq({ ...nq, kind: 'theory' })} style={{ ...(nq.kind === 'theory' ? btn('var(--primary)') : ghost), padding: '5px 10px', fontSize: 12 }}>Theory (oral)</button>
                    </div>
                  </div>
                  <input value={nq.text} onChange={(e) => setNq({ ...nq, text: e.target.value })} placeholder="Question text" style={{ ...input, marginBottom: 6 }} />
                  {nq.kind === 'theory' ? (
                    <textarea value={nq.solution ?? ''} onChange={(e) => setNq({ ...nq, solution: e.target.value })} rows={2} placeholder="Model answer (shown on reveal / to the host)" style={{ ...input, resize: 'vertical', marginBottom: 6 }} />
                  ) : (
                    CHOICES.map((c) => (
                      <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <button onClick={() => setNq({ ...nq, answer: c })} title="Mark correct" style={{ width: 30, ...btn(nq.answer === c ? 'var(--correct)' : '#2a2340') }}>{c}</button>
                        <input value={nq.options[c]} onChange={(e) => setNq({ ...nq, options: { ...nq.options, [c]: e.target.value } })} placeholder={`Option ${c}`} style={input} />
                      </div>
                    ))
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 10px' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Time (s)</span>
                    <input type="number" min={5} max={120} value={nq.timeLimit} onChange={(e) => setNq({ ...nq, timeLimit: Number(e.target.value) || 30 })} style={{ ...input, width: 80 }} />
                    {nq.kind !== 'theory' && <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Correct: <b style={{ color: 'var(--accent)' }}>{nq.answer}</b></span>}
                  </div>
                  <button style={btn('var(--primary)')} disabled={pending} onClick={addOne}><Plus size={14} /> Add question</button>
                </div>

                {/* List + clear */}
                <div style={card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 800, letterSpacing: 1 }}>BANK · {questions.length}</div>
                    <button style={ghost} disabled={pending || !questions.length} onClick={() => confirmAct('Clear all questions', () => clearQuestions(sessionId))}>Clear all</button>
                  </div>
                  {questions.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Empty. Import or add questions above.</p>}
                  <div style={{ display: 'grid', gap: 5 }}>
                    {questions.map((q, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between', padding: '5px 8px', borderRadius: 8, background: 'rgba(255,255,255,.04)' }}>
                        <span style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i + 1}. {q.text} <span style={{ color: 'var(--text-dim)' }}>{q.kind === 'theory' ? '(theory)' : `(${q.answer})`}</span></span>
                        <button style={{ ...ghost, padding: '4px 8px', color: 'var(--wrong)', borderColor: 'transparent' }} disabled={pending} onClick={() => start(async () => { await deleteQuestion(sessionId, i); refresh(); })}><X size={13} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── BROADCAST ── */}
            {tab === 'broadcast' && (
              <div style={{ display: 'grid', gap: 12 }}>
                <div style={card}>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8, fontWeight: 800, letterSpacing: 1 }}>MESSAGE ALL SCREENS</div>
                  <textarea value={bcast} onChange={(e) => setBcast(e.target.value)} rows={3} placeholder="e.g. Break time — back in 5 minutes!" style={{ ...input, resize: 'vertical', marginBottom: 10 }} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={btn('var(--primary)')} disabled={pending || !bcast.trim()} onClick={() => start(async () => { await broadcastMessage(sessionId, bcast); flash('Broadcast sent.'); setBcast(''); })}><Megaphone size={14} /> Send</button>
                    <button style={ghost} disabled={pending || !broadcast} onClick={() => start(async () => { await clearBroadcast(sessionId); flash('Broadcast cleared.'); })}>Clear banner</button>
                  </div>
                </div>
                {broadcast && (
                  <div style={{ ...card, borderColor: 'var(--accent)' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>CURRENTLY SHOWING</div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{broadcast.text}</div>
                  </div>
                )}
              </div>
            )}

            {/* ── PLAYERS ── */}
            {tab === 'players' && (
              <div style={{ display: 'grid', gap: 12 }}>
                <div style={card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 800, letterSpacing: 1 }}>PLAYERS · {players.length}</div>
                    <button style={ghost} disabled={pending || !players.length} onClick={() => confirmAct('Remove all players', () => clearAllPlayers(sessionId))}>Clear all</button>
                  </div>
                  {players.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>No players yet.</p>}
                  <div style={{ display: 'grid', gap: 5 }}>
                    {[...players].sort((a, b) => b.score - a.score).map((p) => (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between', padding: '5px 8px', borderRadius: 8, background: 'rgba(255,255,255,.04)' }}>
                        <span style={{ fontSize: 13 }}>{p.name} <b style={{ color: 'var(--accent)', fontFamily: 'ui-monospace' }}>{p.score}</b></span>
                        <button style={{ ...ghost, padding: '4px 8px', color: 'var(--wrong)', borderColor: 'transparent' }} disabled={pending} onClick={() => start(async () => { await removePlayer(sessionId, p.id); })}><Trash2 size={13} /> Remove</button>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={card}>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8, fontWeight: 800, letterSpacing: 1 }}>DANGER ZONE</div>
                  <div style={{ display: 'grid', gap: 8 }}>
                    <button style={ghost} disabled={pending} onClick={() => confirmAct('Reset all scores', () => resetScores(sessionId))}><RotateCcw size={14} /> Reset scores (keep players)</button>
                    <button style={ghost} disabled={pending} onClick={() => confirmAct('End & log everyone out', () => endAndLogoutAll(sessionId))}><LogOut size={14} /> End & logout all</button>
                    <button style={btn('var(--wrong)')} disabled={pending} onClick={() => confirmAct('Full reset — wipe everything back to lobby', () => fullReset(sessionId))}><AlertTriangle size={14} /> Full reset</button>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
