-- ============================================================================
--  score_reveal: score a whole standard round in ONE database call.
--  Replaces the app-side loop that ran 3 sequential queries per player
--  (seconds of lag with a full class). Time-based points: 10 base + up to 5
--  for speed, measured against the question's server start time.
--  SECURITY INVOKER: RLS still applies, so only the organiser's org can score.
-- ============================================================================

create or replace function score_reveal(
  p_session  uuid,
  p_q_index  int,
  p_answer   text,
  p_start_ms bigint,
  p_limit_ms bigint
) returns void
language plpgsql security invoker set search_path = public as $$
begin
  -- 1. mark every answer right/wrong
  update round_answers
     set is_correct = (choice = p_answer)
   where session_id = p_session and q_index = p_q_index;

  -- 2. award speed-weighted points to correct answers
  update players p
     set score = p.score + 10 + case
           when p_start_ms > 0 and p_limit_ms > 0 then
             round((1 - least(greatest(
               (extract(epoch from ra.answered_at) * 1000 - p_start_ms) / p_limit_ms,
             0), 1)) * 5)::int
           else 0
         end,
         last_correct = true
    from round_answers ra
   where ra.player_id = p.id
     and ra.session_id = p_session and ra.q_index = p_q_index
     and ra.is_correct;

  -- 3. flag wrong answers
  update players p
     set last_correct = false
    from round_answers ra
   where ra.player_id = p.id
     and ra.session_id = p_session and ra.q_index = p_q_index
     and not ra.is_correct;

  -- 4. flip the session to reveal
  update game_sessions set state = 'reveal' where id = p_session;
end $$;
