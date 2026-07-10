-- Realtime + atomic org creation.

-- Broadcast row changes to subscribed clients (host / play / display).
alter publication supabase_realtime add table game_sessions;
alter publication supabase_realtime add table players;
alter publication supabase_realtime add table round_answers;

-- Create an org + owner profile for the current user, atomically.
-- SECURITY DEFINER so the first insert happens before any org-scoped policy applies.
create or replace function create_organization(p_name text, p_slug text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  if exists (select 1 from profiles where id = auth.uid()) then
    raise exception 'user already belongs to an organization';
  end if;

  insert into organizations (slug, name)
  values (lower(p_slug), p_name)
  returning id into v_org_id;

  insert into profiles (id, org_id, email, role)
  values (auth.uid(), v_org_id, (select email from auth.users where id = auth.uid()), 'owner');

  return v_org_id;
end;
$$;

revoke all on function create_organization(text, text) from public;
grant execute on function create_organization(text, text) to authenticated;
