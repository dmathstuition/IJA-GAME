# Quizarena

Multi-school SaaS for running live quiz competitions — the migration of the
Infant Jesus Academy STEAM game into a product any school can sign up for,
brand as its own, and pay for.

**Stack:** Next.js 15 (App Router) · TypeScript · Supabase (Postgres · Auth ·
Realtime) · Stripe · Tailwind · Vercel.

> 📐 **Architecture blueprint:** the full plan, tenancy decision, data model,
> theming and phased roadmap live in the published blueprint shared alongside
> this branch.

---

## Where things are

```
middleware.ts                  Tenant resolution from {slug}.quizarena.app
supabase/
  migrations/0001_init.sql     Schema + Row-Level Security (the isolation model)
  seed.sql                     Demo school for local dev
src/
  app/
    page.tsx                   Marketing landing (themed port of the portal)
    dashboard/                 Organiser admin (questions, branding, billing)
    api/stripe/webhook/        Keeps subscription_status in sync
  lib/
    types.ts                   Shared quiz domain types (Question, Session, …)
    themes.ts                  Per-school theme registry (palette + animation)
    stripe.ts                  Server Stripe client
    supabase/{client,server}   SSR-safe Supabase clients
  components/ThemeProvider.tsx Paints a school's palette as CSS variables
legacy/                        Original Firebase HTML, kept for the port
```

## The multi-tenancy model (important)

Every table carries `org_id`, and **Row-Level Security** enforces that a school
can only ever read or write its own rows — in the database, not in app code.
This is what "each school has their own data" means here: strong isolation on a
single, cheap-to-operate Postgres. See `supabase/migrations/0001_init.sql`.

## Running locally

```bash
npm install
cp .env.example .env.local          # fill in Supabase + Stripe keys

# Supabase (needs the Supabase CLI + Docker):
supabase start
supabase db reset                   # applies migrations + seed

npm run dev                         # http://localhost:3000
# Tenant view: http://ija.localhost:3000
```

> This branch is **Phase 0 (Foundation)** — structure, schema, auth-ready
> clients, tenant middleware and the theme system. It is a scaffold: run
> `npm install` before `npm run dev`. Game surfaces (`/host`, `/play`,
> `/display`) are ported in Phases 3–4.

## Roadmap

| Phase | Scope                                                    | State       |
| ----- | -------------------------------------------------------- | ----------- |
| P0    | Foundation: schema + RLS, theming, tenant middleware     | ✅ this branch |
| P1    | Sign-up, Stripe billing, subscription gate, dashboard     | next        |
| P2    | Question banks (JSON import, sections, export)            | —           |
| P3    | Standard mode live on Supabase Realtime                  | —           |
| P4    | Team · Speed · Oral modes                                | —           |
| P5    | Branding UI, exports, champion screen, polish            | —           |

## Credits

Built on the original game by **D-Maths Ed-Tech Hub** for Infant Jesus Academy.
