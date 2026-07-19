-- ============================================================================
--  Team seats + account management
--  - org_invites: pending invitations to join an existing school.
--  - invite_info / accept_invite: let an invitee view & accept without first
--    being an org member (SECURITY DEFINER, since RLS keys off current_org_id).
--  - remove_member / delete_organization: owner/admin housekeeping that RLS
--    alone can't express (acting on OTHER users' rows / the org itself).
-- ============================================================================

create table org_invites (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizations(id) on delete cascade,
  email       text not null,
  role        org_role not null default 'host',
  token       text not null unique default encode(gen_random_bytes(16), 'hex'),
  invited_by  uuid references auth.users(id) on delete set null,
  accepted_at timestamptz,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default (now() + interval '14 days')
);
create index on org_invites(org_id);
-- One live invitation per email per school.
create unique index org_invites_pending on org_invites(org_id, lower(email)) where accepted_at is null;

alter table org_invites enable row level security;

-- Members of a school manage their own school's invites.
create policy inv_org on org_invites for all
  using (org_id = current_org_id()) with check (org_id = current_org_id());

-- ── Invitee-facing lookup: read one invite by its token (no membership yet). ──
create or replace function invite_info(p_token text)
returns table (org_name text, invite_role org_role, email text, valid boolean)
language sql stable security definer set search_path = public as $$
  select o.name, i.role, i.email,
         (i.accepted_at is null and i.expires_at > now()) as valid
  from org_invites i
  join organizations o on o.id = i.org_id
  where i.token = p_token;
$$;
revoke all on function invite_info(text) from public;
grant execute on function invite_info(text) to anon, authenticated;

-- ── Accept an invite: create the caller's profile in the inviting org. ──
create or replace function accept_invite(p_token text)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_inv   org_invites;
  v_email text;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select * into v_inv from org_invites where token = p_token;
  if v_inv.id is null then raise exception 'This invitation link is not valid.'; end if;
  if v_inv.accepted_at is not null then raise exception 'This invitation has already been used.'; end if;
  if v_inv.expires_at <= now() then raise exception 'This invitation has expired.'; end if;
  if exists (select 1 from profiles where id = auth.uid()) then
    raise exception 'You already belong to a school. Sign in with a fresh account to accept.';
  end if;

  select email into v_email from auth.users where id = auth.uid();
  if lower(v_email) <> lower(v_inv.email) then
    raise exception 'This invitation was sent to a different email address.';
  end if;

  insert into profiles (id, org_id, email, role)
    values (auth.uid(), v_inv.org_id, v_email, v_inv.role);
  update org_invites set accepted_at = now() where id = v_inv.id;
  return v_inv.org_id;
end;
$$;
revoke all on function accept_invite(text) from public;
grant execute on function accept_invite(text) to authenticated;

-- ── Remove a member: owner/admin only, can't remove the last owner or self-demote the org's sole owner. ──
create or replace function remove_member(p_user_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_actor_role org_role;
  v_org        uuid;
  v_target_org uuid;
  v_target_role org_role;
begin
  select role, org_id into v_actor_role, v_org from profiles where id = auth.uid();
  if v_actor_role is null then raise exception 'not authenticated'; end if;
  if v_actor_role not in ('owner','admin') then raise exception 'Only owners and admins can remove members.'; end if;

  select org_id, role into v_target_org, v_target_role from profiles where id = p_user_id;
  if v_target_org is distinct from v_org then raise exception 'That member is not part of your school.'; end if;

  -- Never leave a school without an owner.
  if v_target_role = 'owner'
     and (select count(*) from profiles where org_id = v_org and role = 'owner') <= 1 then
    raise exception 'You cannot remove the only owner of the school.';
  end if;

  delete from profiles where id = p_user_id;
end;
$$;
revoke all on function remove_member(uuid) from public;
grant execute on function remove_member(uuid) to authenticated;

-- ── Delete the whole school: owner only. Cascades to every org-scoped table. ──
create or replace function delete_organization()
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_role org_role;
  v_org  uuid;
begin
  select role, org_id into v_role, v_org from profiles where id = auth.uid();
  if v_role is null then raise exception 'not authenticated'; end if;
  if v_role <> 'owner' then raise exception 'Only the school owner can delete the school.'; end if;
  delete from organizations where id = v_org;  -- cascades profiles, sessions, results, invites…
end;
$$;
revoke all on function delete_organization() from public;
grant execute on function delete_organization() to authenticated;
