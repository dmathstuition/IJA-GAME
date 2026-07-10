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

interface TeamModeState {
  teams: [{ name: string; score: number }, { name: string; score: number }];
  used: number[];
  lastResult?: {
    team: number;
    teamName: string;
    correct: boolean;
    points: number;
    answer: Choice;
    lockedChoice: Choice | null;
    lockedBy: string | null;
    outcome: 'correct' | 'passed' | 'both_missed';
  } | null;
}

const freshState = (t0: string, t1: string): TeamModeState => ({
  teams: [{ name: t0, score: 0 }, { name: t1, score: 0 }],
  used: [],
  lastResult: null,
});

/** Create a Team Battle session bound to a question set. */
export async function createTeamSession(questionSetId: string, t0 = 'Red Eagles', t1 = 'Blue Lions') {
  const supabase = await createClient();
  const org = await orgId(supabase);
  if (!org) return { error: 'No organization for this user.' };

  const { data, error } = await supabase
    .from('game_sessions')
    .insert({
      org_id: org, join_code: code(), mode: 'team', state: 'lobby',
      question_set_id: questionSetId, active_team: 0, is_bonus: false,
      mode_state: freshState(t0, t1) as unknown as never,
    })
    .select('id')
    .single();
  if (error) return { error: error.message };
  return { id: data.id as string };
}

async function getState(supabase: Awaited<ReturnType<typeof createClient>>, sessionId: string) {
  const { data } = await supabase
    .from('game_sessions')
    .select('mode_state, active_team, is_bonus, current_question, current_q_index')
    .eq('id', sessionId)
    .single();
  return data;
}

export async function setTeamNames(sessionId: string, t0: string, t1: string) {
  const supabase = await createClient();
  const s = await getState(supabase, sessionId);
  const ms = (s?.mode_state as unknown as TeamModeState) ?? freshState(t0, t1);
  ms.teams[0].name = t0 || 'Team 1';
  ms.teams[1].name = t1 || 'Team 2';
  const { error } = await supabase.from('game_sessions').update({ mode_state: ms as unknown as never }).eq('id', sessionId);
  return error ? { error: error.message } : { ok: true as const };
}

export async function assignPlayer(playerId: string, teamIdx: number) {
  const supabase = await createClient();
  const { error } = await supabase.from('players').update({ team: teamIdx }).eq('id', playerId);
  return error ? { error: error.message } : { ok: true as const };
}

export async function autoAssignTeams(sessionId: string) {
  const supabase = await createClient();
  const { data: players } = await supabase.from('players').select('id').eq('session_id', sessionId).order('created_at');
  await Promise.all((players ?? []).map((p, i) => supabase.from('players').update({ team: i % 2 }).eq('id', p.id)));
  return { ok: true as const };
}

export async function setActiveTeam(sessionId: string, idx: number) {
  const supabase = await createClient();
  await supabase.from('game_sessions').update({ active_team: idx }).eq('id', sessionId);
  return { ok: true as const };
}

/** Launch a question for the current active team (normal round). */
export async function launchTeamQuestion(sessionId: string, question: Question, qIndex: number) {
  const supabase = await createClient();
  await supabase
    .from('game_sessions')
    .update({
      state: 'question_active', is_bonus: false, current_q_index: qIndex,
      current_question: { ...question, qIndex, startTime: Date.now() } as unknown as never,
    })
    .eq('id', sessionId);
  await supabase.from('players').update({ answered: false, last_answer: null }).eq('session_id', sessionId);
  return { ok: true as const };
}

/**
 * Score the active team's locked answer (their earliest submission).
 *  - correct → award (10 normal / 5 bonus), mark used, reveal
 *  - wrong & not bonus → pass the same question to the other team (bonus round)
 *  - wrong & bonus → both missed, mark used, reveal
 */
export async function revealTeam(sessionId: string) {
  const supabase = await createClient();
  const s = await getState(supabase, sessionId);
  if (!s) return { error: 'Session not found' };
  const ms = s.mode_state as unknown as TeamModeState;
  const cq = s.current_question as unknown as (Question & { qIndex: number }) | null;
  const qIndex = s.current_q_index ?? -1;
  const active = s.active_team ?? 0;
  const bonus = s.is_bonus ?? false;
  if (!cq || qIndex < 0) return { error: 'No active question' };

  // Teams of each player, and answers for this question (earliest first).
  const [{ data: players }, { data: answers }] = await Promise.all([
    supabase.from('players').select('id, name, team').eq('session_id', sessionId),
    supabase.from('round_answers').select('player_id, choice, answered_at').eq('session_id', sessionId).eq('q_index', qIndex).order('answered_at'),
  ]);
  const teamOf = new Map((players ?? []).map((p) => [p.id, p.team]));
  const nameOf = new Map((players ?? []).map((p) => [p.id, p.name]));
  const lock = (answers ?? []).find((a) => teamOf.get(a.player_id) === active) ?? null;
  const lockedChoice = (lock?.choice as Choice) ?? null;
  const correct = !!lockedChoice && lockedChoice === cq.answer;

  const patch: Record<string, unknown> = {};
  let outcome: 'correct' | 'passed' | 'both_missed';

  if (correct) {
    ms.teams[active].score += bonus ? BONUS : NORMAL;
    if (!ms.used.includes(qIndex)) ms.used.push(qIndex);
    patch.state = 'reveal'; patch.is_bonus = false; outcome = 'correct';
  } else if (!bonus) {
    // pass to the other team, same question, fresh clock
    patch.active_team = 1 - active;
    patch.is_bonus = true;
    patch.state = 'question_active';
    patch.current_question = { ...cq, startTime: Date.now() } as unknown as never;
    await supabase.from('players').update({ answered: false, last_answer: null }).eq('session_id', sessionId);
    outcome = 'passed';
  } else {
    if (!ms.used.includes(qIndex)) ms.used.push(qIndex);
    patch.state = 'reveal'; patch.is_bonus = false; outcome = 'both_missed';
  }

  ms.lastResult = {
    team: active, teamName: ms.teams[active].name, correct, points: correct ? (bonus ? BONUS : NORMAL) : 0,
    answer: cq.answer, lockedChoice, lockedBy: lock ? (nameOf.get(lock.player_id) ?? null) : null, outcome,
  };
  patch.mode_state = ms as unknown as never;

  const { error } = await supabase.from('game_sessions').update(patch).eq('id', sessionId);
  return error ? { error: error.message } : { ok: true as const, outcome };
}

/** Skip the current question without scoring. */
export async function skipTeamQuestion(sessionId: string) {
  const supabase = await createClient();
  const s = await getState(supabase, sessionId);
  const ms = s?.mode_state as unknown as TeamModeState;
  const qIndex = s?.current_q_index ?? -1;
  if (ms && qIndex >= 0 && !ms.used.includes(qIndex)) ms.used.push(qIndex);
  await supabase.from('game_sessions').update({ state: 'lobby', is_bonus: false, current_question: null, current_q_index: -1, mode_state: ms as unknown as never }).eq('id', sessionId);
  return { ok: true as const };
}
