'use server';

import { createClient } from '@/lib/supabase/server';
import type { Question, Choice } from '@/lib/types';

const NORMAL = 10;
const BONUS = 5;
const MAX_GROUPS = 6; // keep in sync with GROUP_COLOR palettes in the clients

function code() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}
async function orgId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data } = await supabase.from('profiles').select('org_id').single();
  return data?.org_id as string | undefined;
}

/**
 * Quiz-bowl state (Interswitch-SPAK / Millionaire style): 2–6 groups compete
 * on stage with no devices — the host reads questions and judges answers.
 * A missed question passes round-robin to the next group at bonus value until
 * someone gets it or every group has tried.
 */
interface OralState {
  groups: { name: string; score: number }[];
  used: number[];
  passCount?: number; // how many groups have already missed this question
  lastResult?: {
    group: number;
    groupName: string;
    correct: boolean;
    points: number;
    answer: Choice;
    chosen: Choice | null;
    outcome: 'correct' | 'passed' | 'all_missed';
    nextGroupName?: string;
    kind?: 'mcq' | 'theory';
    solution?: string;
  } | null;
}

const DEFAULT_NAMES = ['Group A', 'Group B'];
const fresh = (names: string[]): OralState => ({
  groups: names.map((name) => ({ name, score: 0 })),
  used: [],
  passCount: 0,
  lastResult: null,
});

export async function createOralSession(questionSetId: string, names: string[] = DEFAULT_NAMES) {
  const supabase = await createClient();
  const org = await orgId(supabase);
  if (!org) return { error: 'No organization for this user.' };
  const clean = names.filter((n) => n.trim()).slice(0, MAX_GROUPS);
  const { data, error } = await supabase
    .from('game_sessions')
    .insert({ org_id: org, join_code: code(), mode: 'oral', state: 'lobby', question_set_id: questionSetId, active_team: 0, is_bonus: false, mode_state: fresh(clean.length >= 2 ? clean : DEFAULT_NAMES) as unknown as never })
    .select('id')
    .single();
  if (error) return { error: error.message };
  return { id: data.id as string };
}

async function getState(supabase: Awaited<ReturnType<typeof createClient>>, sessionId: string) {
  const { data } = await supabase.from('game_sessions').select('mode_state, active_team, is_bonus, current_question, current_q_index').eq('id', sessionId).single();
  return data;
}

/**
 * Replace the group list (2–6 names). Scores are preserved by position, so
 * renaming keeps points; added groups start at 0; removed groups drop off.
 */
export async function setGroups(sessionId: string, names: string[]) {
  const clean = names.map((n) => n.trim()).filter(Boolean).slice(0, MAX_GROUPS);
  if (clean.length < 2) return { error: 'At least two groups are needed.' };
  const supabase = await createClient();
  const s = await getState(supabase, sessionId);
  const ms = (s?.mode_state as unknown as OralState) ?? fresh(clean);
  ms.groups = clean.map((name, i) => ({ name, score: ms.groups?.[i]?.score ?? 0 }));
  const patch: Record<string, unknown> = { mode_state: ms as unknown as never };
  if ((s?.active_team ?? 0) >= clean.length) patch.active_team = 0;
  const { error } = await supabase.from('game_sessions').update(patch).eq('id', sessionId);
  return error ? { error: error.message } : { ok: true as const };
}

/** Back-compat helper for the original two-group flow. */
export async function setGroupNames(sessionId: string, g0: string, g1: string) {
  return setGroups(sessionId, [g0 || 'Group A', g1 || 'Group B']);
}

export async function setActiveGroup(sessionId: string, idx: number) {
  const supabase = await createClient();
  await supabase.from('game_sessions').update({ active_team: idx }).eq('id', sessionId);
  return { ok: true as const };
}

/** Read a question aloud to the active group. */
export async function launchOralQuestion(sessionId: string, question: Question, qIndex: number) {
  const supabase = await createClient();
  const s = await getState(supabase, sessionId);
  const ms = (s?.mode_state as unknown as OralState) ?? fresh(DEFAULT_NAMES);
  ms.passCount = 0;
  await supabase
    .from('game_sessions')
    .update({ state: 'question_active', is_bonus: false, current_q_index: qIndex, current_question: { ...question, qIndex, startTime: Date.now() } as unknown as never, mode_state: ms as unknown as never })
    .eq('id', sessionId);
  return { ok: true as const };
}

/** The teacher records which option the learner said; correctness is derived. */
export async function markOral(sessionId: string, chosen: Choice) {
  return scoreOral(sessionId, (cq) => chosen === cq.answer, chosen);
}

/** Judge a spoken answer to a theory (no-options) question. */
export async function markOralTheory(sessionId: string, correct: boolean) {
  return scoreOral(sessionId, () => correct, null);
}

/**
 * Shared quiz-bowl scoring:
 *  correct → +10 direct (+5 on a pass), reveal.
 *  wrong & other groups still waiting → pass to the next group (bonus, same question).
 *  wrong & every group has tried → all missed, reveal.
 */
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
  const n = ms.groups.length;
  const correct = judge(cq);

  const patch: Record<string, unknown> = {};
  let outcome: 'correct' | 'passed' | 'all_missed';
  let nextGroupName: string | undefined;

  if (correct) {
    ms.groups[active].score += bonus ? BONUS : NORMAL;
    if (!ms.used.includes(qIndex)) ms.used.push(qIndex);
    ms.passCount = 0;
    patch.state = 'reveal'; patch.is_bonus = false; outcome = 'correct';
  } else if ((ms.passCount ?? 0) < n - 1) {
    const next = (active + 1) % n;
    ms.passCount = (ms.passCount ?? 0) + 1;
    nextGroupName = ms.groups[next].name;
    patch.active_team = next;
    patch.is_bonus = true;
    patch.state = 'question_active';
    patch.current_question = { ...cq, startTime: Date.now() } as unknown as never;
    outcome = 'passed';
  } else {
    if (!ms.used.includes(qIndex)) ms.used.push(qIndex);
    ms.passCount = 0;
    patch.state = 'reveal'; patch.is_bonus = false; outcome = 'all_missed';
  }

  ms.lastResult = { group: active, groupName: ms.groups[active].name, correct, points: correct ? (bonus ? BONUS : NORMAL) : 0, answer: cq.answer, chosen, outcome, nextGroupName, kind: cq.kind ?? 'mcq', solution: cq.solution };
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
  if (ms) ms.passCount = 0;
  await supabase.from('game_sessions').update({ state: 'lobby', is_bonus: false, current_question: null, current_q_index: -1, mode_state: ms as unknown as never }).eq('id', sessionId);
  return { ok: true as const };
}
