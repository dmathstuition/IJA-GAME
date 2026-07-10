-- Public, column-safe branding for player/projector screens.
-- A view's default security_invoker=false means it runs as owner and bypasses
-- the organizations RLS, but only ever exposes these non-sensitive columns
-- (never stripe_* / subscription_status) to the anon role.
create view org_public as
  select id, slug, name, theme, logo_url from organizations;

grant select on org_public to anon, authenticated;
