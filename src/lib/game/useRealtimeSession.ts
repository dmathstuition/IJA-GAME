'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface SessionRow {
  id: string;
  org_id: string;
  join_code: string;
  mode: string;
  state: string;
  current_q_index: number | null;
  current_question: any;
}
export interface PlayerRow {
  id: string;
  name: string;
  score: number;
  answered: boolean;
  last_answer: string | null;
  last_correct: boolean | null;
}
export interface AnswerRow {
  player_id: string;
  q_index: number;
  choice: string;
}

/**
 * Subscribe to a live session: the session row, its players, and this round's
 * answers. Backs the host, projector and player screens off one Postgres source.
 */
export function useRealtimeSession(sessionId: string) {
  const [session, setSession] = useState<SessionRow | null>(null);
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [answers, setAnswers] = useState<AnswerRow[]>([]);

  useEffect(() => {
    if (!sessionId) return;
    const supabase = createClient();
    let active = true;

    async function seed() {
      const [{ data: s }, { data: p }, { data: a }] = await Promise.all([
        supabase.from('game_sessions').select('*').eq('id', sessionId).maybeSingle(),
        supabase.from('players').select('id,name,score,answered,last_answer,last_correct').eq('session_id', sessionId),
        supabase.from('round_answers').select('player_id,q_index,choice').eq('session_id', sessionId),
      ]);
      if (!active) return;
      setSession((s as SessionRow) ?? null);
      setPlayers((p as PlayerRow[]) ?? []);
      setAnswers((a as AnswerRow[]) ?? []);
    }
    seed();

    const channel = supabase
      .channel(`session:${sessionId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_sessions', filter: `id=eq.${sessionId}` },
        (payload) => setSession(payload.new as SessionRow))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `session_id=eq.${sessionId}` },
        () => {
          supabase.from('players').select('id,name,score,answered,last_answer,last_correct')
            .eq('session_id', sessionId).then(({ data }) => data && setPlayers(data as PlayerRow[]));
        })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'round_answers', filter: `session_id=eq.${sessionId}` },
        () => {
          supabase.from('round_answers').select('player_id,q_index,choice')
            .eq('session_id', sessionId).then(({ data }) => data && setAnswers(data as AnswerRow[]));
        })
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  return { session, players, answers };
}
