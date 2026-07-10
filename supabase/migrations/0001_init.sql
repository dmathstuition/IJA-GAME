-- ============================================================================
--  Quizarena — initial schema
--  Multi-tenant SaaS: one Postgres database, isolated by org_id + RLS.
--  Ported from the Firebase Realtime `quiz/` tree of the IJA STEAM game.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ── enums ───────────────────────────────────────────────────────────────────
create type game_mode   as enum ('standard', 'team', 'speed', 'oral');
create type game_state   as enum (
  'lobby','section_intro','question_active','time_up','reveal',
  'leaderboard','section_leaderboard','ended'
);
create type org_role     as enum ('owner','admin','host');
create type sub_status    as enum ('trialing','active','past_due','canceled','incomplete');

-- ============================================================================
--  organizations  (a tenant = a school)
-- ============================================================================
create table organizations (
  id                    uuid primary key default gen_random_uuid(),
  slug                  text unique not null,          -- subdomain: {slug}.quizarena.app
  name                  text not null,                 -- "Infant Jesus Academy"
  logo_url              text,
  -- branding: { "preset": "steam", "palette": {...}, "animation": "steam" }
  theme                 jsonb not null default '{"preset":"steam"}'::jsonb,
  plan                  text not null default 'trial',
  subscription_status   sub_status not null default 'trialing',
  trial_ends_at         timestamptz default (now() + interval '14 days'),
  stripe_customer_id    text unique,
  stripe_subscription_id text unique,
  created_at            timestamptz not null default now()
);

-- ============================================================================
--  profiles  (organiser users; 1:1 with auth.users)
-- ============================================================================
create table profiles (
  id        uuid primary key references auth.users(id) on delete cascade,
  org_id    uuid not null references organizations(id) on delete cascade,
  email     text,
  full_name text,
  role      org_role not null default 'owner',
  created_at timestamptz not null default now()
);
create index on profiles(org_id);

-- Helper: current user's org. SECURITY DEFINER so it can read profiles
-- without tripping the very policies it powers (avoids RLS recursion).
create or replace function current_org_id()
returns uuid language sql stable security definer set search_path = public as $$
  select org_id from profiles where id = auth.uid()
$$;

-- ============================================================================
--  question_sets  (reusable banks; was quiz/sections)
--    sections: [ { "name": "Section 1", "questions": [ {text,options,answer,timeLimit}, ... ] } ]
-- ============================================================================
create table question_sets (
  id        uuid primary key default gen_random_uuid(),
  org_id    uuid not null references organizations(id) on delete cascade,
  name      text not null default 'Untitled set',
  sections  jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on question_sets(org_id);

-- ============================================================================
--  game_sessions  (was quiz/mode, quiz/state, quiz/currentQuestion, quiz/tb …)
--    One live competition. mode_state holds the per-mode blob
--    (team battle / speed / oral) that used to live under quiz/tb, quiz/sp, quiz/oral.
-- ============================================================================
create table game_sessions (
  id               uuid primary key default gen_random_uuid(),
  org_id           uuid not null references organizations(id) on delete cascade,
  join_code        text not null,                     -- short code players enter
  mode             game_mode  not null default 'standard',
  state            game_state not null default 'lobby',
  question_set_id  uuid references question_sets(id) on delete set null,
  current_section  int  default 0,
  current_q_index  int  default -1,
  current_question jsonb,                              -- {text,options,answer,timeLimit,startTime}
  section_intro    jsonb,
  active_team      int  default 0,
  is_bonus         boolean default false,
  mode_state       jsonb not null default '{}'::jsonb, -- team/speed/oral working state
  broadcast        jsonb,                              -- {text, ts}
  session_token    text  default gen_random_uuid()::text, -- bump to force players to rejoin
  created_at       timestamptz not null default now(),
  ended_at         timestamptz
);
create unique index game_sessions_active_code on game_sessions(org_id, join_code)
  where ended_at is null;
create index on game_sessions(org_id);

-- ============================================================================
--  players  (was quiz/players/{id}, plus speed & team fields)
-- ============================================================================
create table players (
  id             uuid primary key default gen_random_uuid(),
  session_id     uuid not null references game_sessions(id) on delete cascade,
  org_id         uuid not null references organizations(id) on delete cascade,
  auth_uid       uuid,                                 -- anonymous supabase auth id
  name           text not null,
  score          int  not null default 0,
  answered       boolean not null default false,
  last_answer    text,
  last_correct   boolean,
  section_scores jsonb not null default '{}'::jsonb,
  team           int  default -1,                      -- team battle: 0 | 1 | -1 unassigned
  sp_state       text default 'waiting',               -- speed: waiting | running | done
  created_at     timestamptz not null default now()
);
create index on players(session_id);
create index on players(org_id);

-- ============================================================================
--  round_answers  (was quiz/roundAnswers — powers the live vote bars)
-- ============================================================================
create table round_answers (
  id          bigint generated always as identity primary key,
  session_id  uuid not null references game_sessions(id) on delete cascade,
  org_id      uuid not null references organizations(id) on delete cascade,
  player_id   uuid not null references players(id) on delete cascade,
  q_index     int  not null,
  choice      text not null,                           -- 'A' | 'B' | 'C' | 'D'
  is_correct  boolean,
  answered_at timestamptz not null default now(),
  unique (session_id, player_id, q_index)
);
create index on round_answers(session_id, q_index);

-- ============================================================================
--  ROW-LEVEL SECURITY
--    Organisers: full access to rows in their own org only.
--    Players: anonymous; read the live session + write their own player row.
--    (Player write policies are intentionally permissive on the columns a
--     buzzer needs; tighten with an edge function before launch if needed.)
-- ============================================================================
alter table organizations  enable row level security;
alter table profiles        enable row level security;
alter table question_sets   enable row level security;
alter table game_sessions   enable row level security;
alter table players         enable row level security;
alter table round_answers   enable row level security;

-- organizations: a member reads/updates their own org
create policy org_member_read   on organizations for select using (id = current_org_id());
create policy org_member_update on organizations for update using (id = current_org_id());

-- profiles: read peers in your org; a user manages their own row
create policy profile_self       on profiles for all
  using (id = auth.uid()) with check (id = auth.uid());
create policy profile_org_read   on profiles for select using (org_id = current_org_id());

-- org-scoped tables: organisers get full CRUD within their org
create policy qs_org  on question_sets for all
  using (org_id = current_org_id()) with check (org_id = current_org_id());
create policy gs_org  on game_sessions for all
  using (org_id = current_org_id()) with check (org_id = current_org_id());
create policy pl_org  on players for all
  using (org_id = current_org_id()) with check (org_id = current_org_id());
create policy ra_org  on round_answers for all
  using (org_id = current_org_id()) with check (org_id = current_org_id());

-- Players (anonymous auth) read a live, un-ended session and manage their own row.
-- The join surface is a session's join_code; join_code is not a secret.
create policy gs_public_read on game_sessions for select
  using (ended_at is null);
create policy pl_public_read on players for select
  using (true);
create policy pl_self_insert on players for insert to anon, authenticated
  with check (auth_uid = auth.uid());
create policy pl_self_update on players for update to anon, authenticated
  using (auth_uid = auth.uid()) with check (auth_uid = auth.uid());
create policy ra_self_insert on round_answers for insert to anon, authenticated
  with check (player_id in (select id from players where auth_uid = auth.uid()));
create policy ra_public_read on round_answers for select using (true);
