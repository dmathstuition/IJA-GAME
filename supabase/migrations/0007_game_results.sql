-- ============================================================================
--  game_results — durable snapshot of a finished competition.
--  Written when a session ends (state → 'ended'). Independent of the live
--  session lifecycle, so history survives even after the session (and its
--  players/answers) are deleted. One row per session (session_id unique).
-- ============================================================================
create table game_results (
  id                uuid primary key default gen_random_uuid(),
  org_id            uuid not null references organizations(id) on delete cascade,
  session_id        uuid unique references game_sessions(id) on delete set null,
  join_code         text not null,
  mode              game_mode not null default 'standard',
  question_set_id   uuid references question_sets(id) on delete set null,
  question_set_name text,                                  -- denormalised snapshot
  player_count      int  not null default 0,
  question_count    int  not null default 0,
  standings         jsonb not null default '[]'::jsonb,    -- [{ name, score, avatar }]
  winner_name       text,
  winner_score      int,
  created_at        timestamptz not null default now()     -- when the game ended
);
create index on game_results(org_id, created_at desc);

alter table game_results enable row level security;

-- Org-scoped: an organiser reads and writes only their own school's results.
create policy gr_org on game_results for all
  using (org_id = current_org_id()) with check (org_id = current_org_id());
