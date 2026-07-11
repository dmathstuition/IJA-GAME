'use server';

import { createClient } from '@/lib/supabase/server';
import type { Question, Choice } from '@/lib/types';

// Scoring constants live in the score_reveal() SQL function (10 + up to 5 speed).

function code() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

async function orgId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data } = await supabase.from('profiles').select('org_id').single();
  return data?.org_id as string | undefined;
}

/** Create a lobby session for the signed-in organiser's school. */
export async function createSession(
  mode: 'standard' | 'team' | 'speed' | 'oral' = 'standard',
  questionSetId?: string | null,
) {
  const supabase = await createClient();
  const org = await orgId(supabase);
  if (!org) return { error: 'No organization for this user.' };

  const { data, error } = await supabase
    .from('game_sessions')
    .insert({ org_id: org, join_code: code(), mode, state: 'lobby', question_set_id: questionSetId ?? null })
    .select('id, join_code')
    .single();

  if (error) return { error: error.message };
  return { id: data.id, joinCode: data.join_code };
}

/** Launch a question live: everyone's timer starts from the same server anchor. */
export async function launchQuestion(sessionId: string, question: Question, qIndex: number) {
  const supabase = await createClient();
  // Both writes are independent — run them in one round of parallel queries.
  const [{ error }] = await Promise.all([
    supabase
      .from('game_sessions')
      .update({
        state: 'question_active',
        current_q_index: qIndex,
        current_question: { ...question, qIndex, startTime: Date.now() } as unknown as never,
      })
      .eq('id', sessionId),
    supabase.from('players').update({ answered: false, last_answer: null }).eq('session_id', sessionId),
  ]);
  return error ? { error: error.message } : { ok: true };
}

/**
 * Score the current question and reveal the answer. All scoring runs inside
 * one score_reveal() SQL call (10 base + up to 5 speed bonus per player) —
 * the old app-side loop was 3 queries per player and lagged with a full class.
 */
export async function revealCurrent(sessionId: string) {
  const supabase = await createClient();
  const { data: session } = await supabase
    .from('game_sessions')
    .select('current_question, current_q_index')
    .eq('id', sessionId)
    .single();

  const cq = session?.current_question as unknown as (Question & { qIndex: number; startTime?: number }) | null;
  const qIndex = session?.current_q_index ?? -1;
  if (!cq || qIndex < 0) {
    await supabase.from('game_sessions').update({ state: 'reveal' }).eq('id', sessionId);
    return { ok: true };
  }

  const { error } = await supabase.rpc('score_reveal', {
    p_session: sessionId,
    p_q_index: qIndex,
    p_answer: cq.answer as Choice,
    p_start_ms: cq.startTime ?? 0,
    p_limit_ms: (cq.timeLimit ?? 30) * 1000,
  });
  return error ? { error: error.message } : { ok: true };
}

/**
 * Permanently delete a session (players and answers cascade with it).
 * Returns the deleted row so an RLS-blocked delete (0 rows) surfaces as an
 * error instead of silently "working".
 */
export async function deleteSession(sessionId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('game_sessions').delete().eq('id', sessionId).select('id');
  if (error) return { error: error.message };
  if (!data?.length) return { error: 'This session could not be deleted — it does not belong to your school.' };
  return { ok: true };
}

export async function setState(sessionId: string, state: 'lobby' | 'leaderboard' | 'ended') {
  const supabase = await createClient();
  const patch: Record<string, unknown> = { state };
  if (state === 'lobby') {
    patch.current_question = null;
    patch.current_q_index = -1;
  }
  if (state === 'ended') patch.ended_at = new Date().toISOString();
  const { error } = await supabase.from('game_sessions').update(patch).eq('id', sessionId);
  return error ? { error: error.message } : { ok: true };
}
