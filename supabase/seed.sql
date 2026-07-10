-- Local dev seed: one demo school on the STEAM theme, so you can point a
-- {slug}.localhost subdomain at it immediately. Run via `supabase db reset`.

insert into organizations (slug, name, theme, plan, subscription_status)
values (
  'ija',
  'Infant Jesus Academy',
  '{"preset":"steam"}'::jsonb,
  'school',
  'active'
)
on conflict (slug) do nothing;
