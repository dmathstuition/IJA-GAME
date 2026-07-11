'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { Question, Section } from '@/lib/types';

/**
 * In-controller question management — the feature-parity port of the original
 * organiser's live JSON import / add / delete / clear. These operate on the
 * question set linked to a session; if the session has none yet, one is created
 * and linked so a host can build a bank from scratch mid-competition.
 */

async function sessionOrg(supabase: Awaited<ReturnType<typeof createClient>>, sessionId: string) {
  const { data } = await supabase
    .from('game_sessions')
    .select('id, org_id, join_code, question_set_id')
    .eq('id', sessionId)
    .maybeSingle();
  return data;
}

/** Flatten a set's sections into one question list. */
function flatten(sections: Section[] | null | undefined): Question[] {
  return (sections ?? []).flatMap((s) => s.questions ?? []);
}

/** Read the session's questions as one flat bank (creating nothing). */
async function loadBank(
  supabase: Awaited<ReturnType<typeof createClient>>,
  setId: string | null | undefined,
): Promise<Question[]> {
  if (!setId) return [];
  const { data } = await supabase.from('question_sets').select('sections').eq('id', setId).maybeSingle();
  return flatten(data?.sections as Section[]);
}

/**
 * Ensure the session has a writable question set, returning its id. Creates a
 * "Live bank" set for this session when none is linked.
 */
async function ensureSet(
  supabase: Awaited<ReturnType<typeof createClient>>,
  session: { id: string; org_id: string; join_code: string; question_set_id: string | null },
): Promise<string | { error: string }> {
  if (session.question_set_id) return session.question_set_id;
  const { data, error } = await supabase
    .from('question_sets')
    .insert({ org_id: session.org_id, name: `Live bank · ${session.join_code}`, sections: [] })
    .select('id')
    .single();
  if (error) return { error: error.message };
  const { error: linkErr } = await supabase
    .from('game_sessions')
    .update({ question_set_id: data.id })
    .eq('id', session.id);
  if (linkErr) return { error: linkErr.message };
  return data.id;
}

/** Persist a flat bank back onto the set as a single section. */
async function writeBank(
  supabase: Awaited<ReturnType<typeof createClient>>,
  setId: string,
  bank: Question[],
) {
  const sections: Section[] = [{ name: 'Imported', questions: bank }];
  const { error } = await supabase
    .from('question_sets')
    .update({ sections: sections as unknown as never, updated_at: new Date().toISOString() })
    .eq('id', setId);
  return error?.message;
}

/** Import questions into the session's bank (append or replace). */
export async function importQuestions(
  sessionId: string,
  questions: Question[],
  mode: 'append' | 'replace' = 'append',
) {
  if (!questions.length) return { error: 'No questions to import.' };
  const supabase = await createClient();
  const session = await sessionOrg(supabase, sessionId);
  if (!session) return { error: 'Session not found.' };

  const setId = await ensureSet(supabase, session);
  if (typeof setId !== 'string') return setId;

  const existing = mode === 'replace' ? [] : await loadBank(supabase, setId);
  const err = await writeBank(supabase, setId, [...existing, ...questions]);
  if (err) return { error: err };
  revalidatePath(`/host/${sessionId}`);
  return { ok: true, count: questions.length };
}

/** Add a single question to the session's bank. */
export async function addQuestion(sessionId: string, question: Question) {
  return importQuestions(sessionId, [question], 'append');
}

/** Delete one question (by flat index) from the session's bank. */
export async function deleteQuestion(sessionId: string, index: number) {
  const supabase = await createClient();
  const session = await sessionOrg(supabase, sessionId);
  if (!session?.question_set_id) return { error: 'No question set to edit.' };
  const bank = await loadBank(supabase, session.question_set_id);
  if (index < 0 || index >= bank.length) return { error: 'Question index out of range.' };
  bank.splice(index, 1);
  const err = await writeBank(supabase, session.question_set_id, bank);
  if (err) return { error: err };
  revalidatePath(`/host/${sessionId}`);
  return { ok: true };
}

/** Remove every question from the session's bank. */
export async function clearQuestions(sessionId: string) {
  const supabase = await createClient();
  const session = await sessionOrg(supabase, sessionId);
  if (!session?.question_set_id) return { ok: true };
  const err = await writeBank(supabase, session.question_set_id, []);
  if (err) return { error: err };
  revalidatePath(`/host/${sessionId}`);
  return { ok: true };
}
