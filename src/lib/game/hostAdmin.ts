'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * Organiser control actions ported from the original panel: broadcast a message
 * to every screen, and manage players (remove one, clear all, force a rejoin,
 * reset scores, full reset). All are scoped to the session; RLS restricts them
 * to the organiser's own org.
 */

// ── Broadcast ───────────────────────────────────────────────────────────────

/** Push a banner message to all display / player screens. */
export async function broadcastMessage(sessionId: string, text: string) {
  const trimmed = text.trim();
  if (!trimmed) return { error: 'Message is empty.' };
  const supabase = await createClient();
  const { error } = await supabase
    .from('game_sessions')
    .update({ broadcast: { text: trimmed, ts: Date.now() } as unknown as never })
    .eq('id', sessionId);
  return error ? { error: error.message } : { ok: true };
}

/** Clear the current broadcast banner. */
export async function clearBroadcast(sessionId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('game_sessions').update({ broadcast: null }).eq('id', sessionId);
  return error ? { error: error.message } : { ok: true };
}

// ── Player management ────────────────────────────────────────────────────────

/** Remove a single player from the session. */
export async function removePlayer(sessionId: string, playerId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('players').delete().eq('id', playerId).eq('session_id', sessionId);
  return error ? { error: error.message } : { ok: true };
}

/** Remove every player (and their answers) from the session. */
export async function clearAllPlayers(sessionId: string) {
  const supabase = await createClient();
  await supabase.from('round_answers').delete().eq('session_id', sessionId);
  const { error } = await supabase.from('players').delete().eq('session_id', sessionId);
  return error ? { error: error.message } : { ok: true };
}

/** Reset all scores and answer flags without removing players. */
export async function resetScores(sessionId: string) {
  const supabase = await createClient();
  await supabase.from('round_answers').delete().eq('session_id', sessionId);
  const { error } = await supabase
    .from('players')
    .update({ score: 0, answered: false, last_answer: null, last_correct: null, section_scores: {} })
    .eq('session_id', sessionId);
  return error ? { error: error.message } : { ok: true };
}

/**
 * End the competition and log everyone out: rotate the session token so every
 * connected player is forced to rejoin, and send the session back to the lobby.
 */
export async function endAndLogoutAll(sessionId: string) {
  const supabase = await createClient();
  await supabase.from('round_answers').delete().eq('session_id', sessionId);
  await supabase.from('players').delete().eq('session_id', sessionId);
  const { error } = await supabase
    .from('game_sessions')
    .update({
      state: 'lobby',
      current_question: null,
      current_q_index: -1,
      broadcast: null,
      session_token: crypto.randomUUID(),
    })
    .eq('id', sessionId);
  return error ? { error: error.message } : { ok: true };
}

/**
 * Full reset: wipe players, answers, scores, mode state and the live question —
 * a clean slate back at the lobby, keeping the same join code and question set.
 */
export async function fullReset(sessionId: string) {
  const supabase = await createClient();
  await supabase.from('round_answers').delete().eq('session_id', sessionId);
  await supabase.from('players').delete().eq('session_id', sessionId);
  const { error } = await supabase
    .from('game_sessions')
    .update({
      state: 'lobby',
      current_question: null,
      current_q_index: -1,
      current_section: 0,
      active_team: 0,
      is_bonus: false,
      mode_state: {},
      broadcast: null,
      session_token: crypto.randomUUID(),
    })
    .eq('id', sessionId);
  return error ? { error: error.message } : { ok: true };
}
