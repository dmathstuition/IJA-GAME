'use server';

import { createClient } from '@/lib/supabase/server';
import type { Question, Choice } from '@/lib/types';

const NORMAL = 10;
const BONUS = 5;

function code() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}
async function orgId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data } = await supabase.from('profiles').select('org_id').single();
  return data?.org_id as string | undefined;
}

interface OralState {
  groups: [{ name: string; score: number }, { name: string; score: number }];
  used: number[];
  lastResult?: {
    group: number;
    groupName: string;
    correct: boolean;
    points: number;
    answer: Choice;
    chosen: Choice | null;
    outcome: 'correct' | 'passed' | 'both_missed';
    kind?: 'mcq' | 'theory';
    solution?: string;
  } | null;
}
const fresh = (g0: string, g1: string): OralState => ({ groups: [{ name: g0, score: 0 }, { name: g1, score: 0 }], used: [], lastResult: null });

export async function createOralSession(questionSetId: string, g0 = 'Group A', g1 = 'Group B') {
  const supabase = await createClient();
  const org = await orgId(supabase);
  if (!org) return { error: 'No organization for this user.' };
  const { data, error } = await supabase
    .from('game_sessions')
    .insert({ org_id: org, join_code: code(), mode: 'oral', state: 'lobby', question_set_id: questionSetId, active_team: 0, is_bonus: false, mode_state: fresh(g0, g1) as unknown as never })
    .select('id')
    .single();
  if (error) return { error: error.message };
  return { id: data.id as string };
}

async function getState(supabase: Awaited<ReturnType<typeof createClient>>, sessionId: string) {
  const { data } = await supabase.from('game_sessions').select('mode_state, active_team, is_bonus, current_question, current_q_index').eq('id', sessionId).single();
  return data;
}

export async function setGroupNames(sessionId: string, g0: string, g1: string) {
  const supabase = await createClient();
  const s = await getState(supabase, sessionId);
  const ms = (s?.mode_state as unknown as OralState) ?? fresh(g0, g1);
  ms.groups[0].name = g0 || 'Group A';
  ms.groups[1].name = g1 || 'Group B';
  const { error } = await supabase.from('game_sessions').update({ mode_state: ms as unknown as never }).eq('id', sessionId);
  return error ? { error: error.message } : { ok: true as const };
}

export async function setActiveGroup(sessionId: string, idx: number) {
  const supabase = await createClient();
  await supabase.from('game_sessions').update({ active_team: idx }).eq('id', sessionId);
  return { ok: true as const };
}

/** Read a question aloud to the active group. */
export async function launchOralQuestion(sessionId: string, question: Question, qIndex: number) {
  const supabase = await createClient();
  await supabase
    .from('game_sessions')
    .update({ state: 'question_active', is_bonus: false, current_q_index: qIndex, current_question: { ...question, qIndex, startTime: Date.now() } as unknown as never })
    .eq('id', sessionId);
  return { ok: true as const };
}

/**
 * The teacher records which option the learner actually said; correctness is
 * derived from the question's answer.
 *  chosen === answer → +10 (or +5 bonus), reveal.
 *  wrong & not bonus → pass to the other group (bonus round, same question).
 *  wrong & bonus → both missed, reveal.
 */
export async function markOral(sessionId: string, chosen: Choice) {
  return scoreOral(sessionId, (cq) => chosen === cq.answer, chosen);
}

/**
 * Judge a spoken answer to a theory (no-options) question. The host decides
 * correctness; scoring/pass/bonus follows the same rules as an MCQ oral.
 */
export async function markOralTheory(sessionId: string, correct: boolean) {
  return scoreOral(sessionId, () => correct, null);
}

/** Shared oral scoring for both MCQ (derive correctness) and theory (host judges). */
async function scoreOral(sessionId: string, judge: (cq: Question) => boolean, chosen: Choice | null) {
  const supabase = await createClient();
  const s = await getState(supabase, sessionId);
  if (!s) return { error: 'Session not found' };
  const ms = s.mode_state as unknown as OralState;
  const cq = s.current_question as unknown as (Question & { qIndex: number }) | null;
  const qIndex = s.current_q_index ?? -1;
  const active = s.active_team ?? 0;
  const bonus = s.is_bonus ?? false;
  if (!cq || qIndex < 0) return { error: 'No active question' };
  const correct = judge(cq);

  const patch: Record<string, unknown> = {};
  let outcome: 'correct' | 'passed' | 'both_missed';

  if (correct) {
    ms.groups[active].score += bonus ? BONUS : NORMAL;
    if (!ms.used.includes(qIndex)) ms.used.push(qIndex);
    patch.state = 'reveal'; patch.is_bonus = false; outcome = 'correct';
  } else if (!bonus) {
    patch.active_team = 1 - active;
    patch.is_bonus = true;
    patch.state = 'question_active';
    patch.current_question = { ...cq, startTime: Date.now() } as unknown as never;
    outcome = 'passed';
  } else {
    if (!ms.used.includes(qIndex)) ms.used.push(qIndex);
    patch.state = 'reveal'; patch.is_bonus = false; outcome = 'both_missed';
  }

  ms.lastResult = { group: active, groupName: ms.groups[active].name, correct, points: correct ? (bonus ? BONUS : NORMAL) : 0, answer: cq.answer, chosen, outcome, kind: cq.kind ?? 'mcq', solution: cq.solution };
  patch.mode_state = ms as unknown as never;
  const { error } = await supabase.from('game_sessions').update(patch).eq('id', sessionId);
  return error ? { error: error.message } : { ok: true as const, outcome };
}

export async function skipOral(sessionId: string) {
  const supabase = await createClient();
  const s = await getState(supabase, sessionId);
  const ms = s?.mode_state as unknown as OralState;
  const qIndex = s?.current_q_index ?? -1;
  if (ms && qIndex >= 0 && !ms.used.includes(qIndex)) ms.used.push(qIndex);
  await supabase.from('game_sessions').update({ state: 'lobby', is_bonus: false, current_question: null, current_q_index: -1, mode_state: ms as unknown as never }).eq('id', sessionId);
  return { ok: true as const };
}
