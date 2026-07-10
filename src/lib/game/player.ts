'use client';

import { createClient } from '@/lib/supabase/client';
import type { Choice } from '@/lib/types';

/**
 * Join a session as an anonymous player. Requires "Anonymous sign-ins" to be
 * enabled in Supabase Auth settings — the write policies key off auth.uid().
 * Returns the new player's id (also cached in localStorage per session).
 */
export async function joinSession(sessionId: string, orgId: string, name: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    const { error } = await supabase.auth.signInAnonymously();
    if (error) return { error: `Could not start a player session: ${error.message}` };
  }
  const {
    data: { user: anon },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('players')
    .insert({ session_id: sessionId, org_id: orgId, name, auth_uid: anon!.id })
    .select('id')
    .single();
  if (error) return { error: error.message };

  localStorage.setItem(`player:${sessionId}`, data.id);
  return { playerId: data.id };
}

/** Lock an answer for the current question. */
export async function submitAnswer(
  sessionId: string,
  orgId: string,
  playerId: string,
  qIndex: number,
  choice: Choice,
) {
  const supabase = createClient();
  const { error: aErr } = await supabase
    .from('round_answers')
    .insert({ session_id: sessionId, org_id: orgId, player_id: playerId, q_index: qIndex, choice });
  if (aErr && !aErr.message.includes('duplicate')) return { error: aErr.message };

  await supabase.from('players').update({ answered: true, last_answer: choice }).eq('id', playerId);
  return { ok: true };
}
