'use server';

import { createClient } from '@/lib/supabase/server';
import type { Question } from '@/lib/types';

const DEFAULT_LIMIT = 15;

function code() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}
async function orgId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data } = await supabase.from('profiles').select('org_id').single();
  return data?.org_id as string | undefined;
}

interface SpeedState {
  limit: number;
  runnerId: string | null;
  runnerIndex: number;
  runnerScore: number;
  results: { playerId: string; name: string; score: number }[];
}
const fresh = (limit: number): SpeedState => ({ limit, runnerId: null, runnerIndex: 0, runnerScore: 0, results: [] });

export async function createSpeedSession(questionSetId: string, limit = DEFAULT_LIMIT) {
  const supabase = await createClient();
  const org = await orgId(supabase);
  if (!org) return { error: 'No organization for this user.' };
  const { data, error } = await supabase
    .from('game_sessions')
    .insert({ org_id: org, join_code: code(), mode: 'speed', state: 'lobby', question_set_id: questionSetId, mode_state: fresh(limit) as unknown as never })
    .select('id')
    .single();
  if (error) return { error: error.message };
  return { id: data.id as string };
}

/** Put a player on the clock: first question, fresh score. */
export async function startRunner(sessionId: string, playerId: string, playerName: string, first: Question) {
  const supabase = await createClient();
  const { data: s } = await supabase.from('game_sessions').select('mode_state').eq('id', sessionId).single();
  const ms = (s?.mode_state as unknown as SpeedState) ?? fresh(DEFAULT_LIMIT);
  ms.runnerId = playerId; ms.runnerIndex = 0; ms.runnerScore = 0;
  await supabase.from('players').update({ sp_state: 'running', answered: false, last_answer: null }).eq('id', playerId);
  await supabase
    .from('game_sessions')
    .update({ state: 'question_active', mode_state: ms as unknown as never, current_q_index: 0, current_question: { ...first, qIndex: 0, startTime: Date.now() } as unknown as never })
    .eq('id', sessionId);
  return { ok: true as const };
}

/**
 * Advance the runner past question `fromIndex` (scoring their answer for it),
 * then load the next question or finish. Driven by the host client on answer or
 * timeout. Idempotent: a stale call whose fromIndex != the live index is a no-op.
 */
export async function advanceSpeed(sessionId: string, bank: Question[], fromIndex: number) {
  const supabase = await createClient();
  const { data: s } = await supabase.from('game_sessions').select('mode_state, current_question').eq('id', sessionId).single();
  if (!s) return { error: 'no session' };
  const ms = s.mode_state as unknown as SpeedState;
  if (!ms.runnerId || ms.runnerIndex !== fromIndex) return { ok: true as const }; // already advanced

  const cq = s.current_question as unknown as (Question & { qIndex: number }) | null;
  const { data: ans } = await supabase
    .from('round_answers')
    .select('choice')
    .eq('session_id', sessionId)
    .eq('player_id', ms.runnerId)
    .eq('q_index', fromIndex)
    .maybeSingle();
  if (cq && ans?.choice === cq.answer) ms.runnerScore += 1;

  const nextIndex = fromIndex + 1;
  const limit = Math.min(ms.limit, bank.length);

  if (nextIndex < limit) {
    ms.runnerIndex = nextIndex;
    await supabase.from('players').update({ answered: false, last_answer: null }).eq('id', ms.runnerId);
    await supabase
      .from('game_sessions')
      .update({ mode_state: ms as unknown as never, current_q_index: nextIndex, current_question: { ...bank[nextIndex], qIndex: nextIndex, startTime: Date.now() } as unknown as never })
      .eq('id', sessionId);
    return { ok: true as const, finished: false };
  }

  // Finish this runner.
  const { data: p } = await supabase.from('players').select('name').eq('id', ms.runnerId).single();
  ms.results = [...ms.results.filter((r) => r.playerId !== ms.runnerId), { playerId: ms.runnerId, name: p?.name ?? '—', score: ms.runnerScore }];
  await supabase.from('players').update({ sp_state: 'done', score: ms.runnerScore }).eq('id', ms.runnerId);
  const finishedId = ms.runnerId;
  ms.runnerId = null;
  await supabase.from('game_sessions').update({ mode_state: ms as unknown as never, state: 'reveal', current_question: null, current_q_index: -1 }).eq('id', sessionId);
  return { ok: true as const, finished: true, finishedId };
}

export async function stopSpeed(sessionId: string) {
  const supabase = await createClient();
  const { data: s } = await supabase.from('game_sessions').select('mode_state').eq('id', sessionId).single();
  const ms = (s?.mode_state as unknown as SpeedState) ?? fresh(DEFAULT_LIMIT);
  ms.runnerId = null;
  await supabase.from('game_sessions').update({ mode_state: ms as unknown as never, state: 'leaderboard', current_question: null, current_q_index: -1 }).eq('id', sessionId);
  return { ok: true as const };
}
