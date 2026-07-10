'use client';

import { useEffect, useState } from 'react';
import { useRealtimeSession } from '@/lib/game/useRealtimeSession';
import { joinSession, submitAnswer } from '@/lib/game/player';
import type { Choice } from '@/lib/types';

const CHOICES: Choice[] = ['A', 'B', 'C', 'D'];
const COLORS: Record<Choice, string> = { A: '#ef4444', B: '#3b82f6', C: '#a855f7', D: '#22c55e' };

export function PlayClient({ sessionId, orgId, schoolName }: { sessionId: string; orgId: string; schoolName: string }) {
  const { session, players } = useRealtimeSession(sessionId);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [picked, setPicked] = useState<Choice | null>(null);

  useEffect(() => {
    setPlayerId(localStorage.getItem(`player:${sessionId}`));
  }, [sessionId]);

  const me = players.find((p) => p.id === playerId);
  const cq = session?.current_question as any;
  const qIndex = session?.current_q_index ?? -1;

  useEffect(() => setPicked(null), [qIndex]);

  async function join() {
    setBusy(true); setErr('');
    const r = await joinSession(sessionId, orgId, name.trim());
    setBusy(false);
    if ('error' in r) return setErr(r.error ?? 'Could not join.');
    setPlayerId(r.playerId);
  }

  async function pick(c: Choice) {
    if (!playerId || picked) return;
    setPicked(c);
    const r = await submitAnswer(sessionId, orgId, playerId, qIndex, c);
    if ('error' in r) setErr(r.error ?? 'Could not submit.');
  }

  const wrap: React.CSSProperties = { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, color: 'var(--text)', fontFamily: 'system-ui', textAlign: 'center' };

  if (!playerId) {
    return (
      <main style={wrap}>
        <div style={{ fontSize: 12, letterSpacing: 3, color: 'var(--accent)' }}>{schoolName.toUpperCase()}</div>
        <h1 style={{ fontSize: 30, color: 'var(--accent)', margin: '8px 0 18px' }}>Join the quiz</h1>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" maxLength={30}
          style={{ padding: 14, borderRadius: 12, border: '2px solid rgba(255,255,255,.2)', background: 'rgba(0,0,0,.25)', color: 'var(--text)', fontSize: 18, textAlign: 'center', width: 280 }} />
        {err && <p style={{ color: 'var(--wrong)', fontSize: 13, marginTop: 10 }}>{err}</p>}
        <button onClick={join} disabled={busy || name.trim().length < 2}
          style={{ marginTop: 14, padding: '14px 40px', borderRadius: 100, border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 900, fontSize: 17, cursor: 'pointer' }}>
          {busy ? 'Joining…' : '🚀 Join'}
        </button>
      </main>
    );
  }

  // Joined — react to session state
  const state = session?.state;
  if (state === 'question_active' && cq) {
    return (
      <main style={{ ...wrap, justifyContent: 'flex-start', paddingTop: 24 }}>
        <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>Question {qIndex + 1}</div>
        <div style={{ fontSize: 22, fontWeight: 900, margin: '10px 0 20px' }}>{cq.text}</div>
        {picked ? (
          <div style={{ fontSize: 18, color: 'var(--accent)' }}>✅ Locked in <b>{picked}</b> — waiting for reveal…</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%', maxWidth: 420 }}>
            {CHOICES.map((c) => (
              <button key={c} onClick={() => pick(c)}
                style={{ padding: 20, borderRadius: 16, border: `2px solid ${COLORS[c]}`, background: 'rgba(0,0,0,.25)', color: 'var(--text)', fontWeight: 800, fontSize: 16, cursor: 'pointer', minHeight: 90 }}>
                <div style={{ color: COLORS[c], fontSize: 22, fontWeight: 900 }}>{c}</div>
                {cq.options[c]}
              </button>
            ))}
          </div>
        )}
      </main>
    );
  }

  if (state === 'reveal') {
    const ok = me?.last_correct;
    return (
      <main style={wrap}>
        <div style={{ fontSize: 64 }}>{ok ? '🎉' : '❌'}</div>
        <h1 style={{ fontSize: 26, color: ok ? 'var(--correct)' : 'var(--wrong)' }}>{ok ? 'Correct!' : 'Not this time'}</h1>
        <p style={{ color: 'var(--text-dim)' }}>Correct answer: <b style={{ color: 'var(--accent)' }}>{cq?.answer}</b></p>
        <div style={{ marginTop: 16, fontSize: 20 }}>Score: <b style={{ color: 'var(--accent)' }}>{me?.score ?? 0}</b></div>
      </main>
    );
  }

  if (state === 'leaderboard' || state === 'ended') {
    const ranked = [...players].sort((a, b) => b.score - a.score);
    return (
      <main style={{ ...wrap, justifyContent: 'flex-start', paddingTop: 30 }}>
        <h1 style={{ fontSize: 26, color: 'var(--accent)' }}>{state === 'ended' ? '🏆 Final scores' : 'Leaderboard'}</h1>
        <div style={{ width: '100%', maxWidth: 380, marginTop: 14 }}>
          {ranked.map((p, i) => (
            <div key={p.id} style={{ display: 'flex', gap: 10, padding: '10px 14px', borderRadius: 12, marginBottom: 6, background: p.id === playerId ? 'rgba(255,214,0,.12)' : 'rgba(0,0,0,.25)', border: '1px solid rgba(255,255,255,.08)' }}>
              <b style={{ width: 24 }}>{i + 1}</b>
              <span style={{ flex: 1, textAlign: 'left' }}>{p.name}</span>
              <b style={{ color: 'var(--accent)' }}>{p.score}</b>
            </div>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main style={wrap}>
      <div style={{ fontSize: 46 }}>🎉</div>
      <h1 style={{ fontSize: 24, color: 'var(--accent)' }}>You&apos;re in, {me?.name}!</h1>
      <p style={{ color: 'var(--text-dim)' }}>Waiting for the host to start…</p>
      <div style={{ marginTop: 14, fontSize: 16 }}>Score: <b style={{ color: 'var(--accent)' }}>{me?.score ?? 0}</b></div>
    </main>
  );
}
