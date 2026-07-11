'use server';

import { createClient } from '@/lib/supabase/server';
import type { Question, Choice } from '@/lib/types';

const CORRECT_POINTS = 10;
const SPEED_BONUS = 5;

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
  const { error } = await supabase
    .from('game_sessions')
    .update({
      state: 'question_active',
      current_q_index: qIndex,
      current_question: { ...question, qIndex, startTime: Date.now() } as unknown as never,
    })
    .eq('id', sessionId);
  if (error) return { error: error.message };

  // Reset answer flags for the new round.
  await supabase.from('players').update({ answered: false, last_answer: null }).eq('session_id', sessionId);
  return { ok: true };
}

/** Score the current question and reveal the answer. */
export async function revealCurrent(sessionId: string) {
  const supabase = await createClient();
  const { data: session } = await supabase
    .from('game_sessions')
    .select('current_question, current_q_index')
    .eq('id', sessionId)
    .single();

  const cq = session?.current_question as unknown as (Question & { qIndex: number; startTime?: number }) | null;
  const qIndex = session?.current_q_index ?? -1;
  if (cq && qIndex >= 0) {
    const answer = cq.answer as Choice;
    const startTime = cq.startTime ?? 0;
    const timeLimit = (cq.timeLimit ?? 30) * 1000;
    const { data: answers } = await supabase
      .from('round_answers')
      .select('id, player_id, choice, answered_at')
      .eq('session_id', sessionId)
      .eq('q_index', qIndex);

    for (const a of answers ?? []) {
      const correct = a.choice === answer;
      await supabase.from('round_answers').update({ is_correct: correct }).eq('id', a.id);
      if (correct) {
        // Time-based scoring (ported from the original): 10 base + up to 5 for speed.
        let pts = CORRECT_POINTS;
        if (startTime && a.answered_at && timeLimit > 0) {
          const taken = new Date(a.answered_at).getTime() - startTime;
          const frac = Math.min(Math.max(taken / timeLimit, 0), 1);
          pts += Math.round((1 - frac) * SPEED_BONUS);
        }
        const { data: p } = await supabase.from('players').select('score').eq('id', a.player_id).single();
        await supabase
          .from('players')
          .update({ score: (p?.score ?? 0) + pts, last_correct: true })
          .eq('id', a.player_id);
      } else {
        await supabase.from('players').update({ last_correct: false }).eq('id', a.player_id);
      }
    }
  }

  await supabase.from('game_sessions').update({ state: 'reveal' }).eq('id', sessionId);
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
