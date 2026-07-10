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

## Live Supabase project

A project is already provisioned (free tier) and the migrations in
`supabase/migrations/` are applied to it:

- **Project ref:** `hwxoszwnpqrtxbzakzdi` · region `eu-west-1`
- **URL:** `https://hwxoszwnpqrtxbzakzdi.supabase.co`
- Anon/publishable key is in `.env.local` (git-ignored). The **service-role**
  key (for the Stripe webhook) must be pasted from the dashboard — the MCP
  doesn't expose it.

### Two settings before a full live run

1. **Auth → enable "Anonymous sign-ins."** Players join anonymously; the RLS
   write policies key off `auth.uid()`.
2. **Network egress.** If you run inside a restricted environment, add
   `hwxoszwnpqrtxbzakzdi.supabase.co` to the allowlist — otherwise every query
   fails with _"Host not in allowlist"_ and pages 404. Running on your own
   machine or Vercel has no such restriction.

## Running locally

```bash
npm install                          # done in this branch
# .env.local already points at the live project

npm run dev                          # http://localhost:3000
```

Flow: `/signup` → `/onboarding` (creates your school) → `/dashboard`
→ **Start a Standard game** → open `/display/CODE` on a projector and
`/play/CODE` on phones.

> **Verified:** `tsc --noEmit` clean, `next build` green (11 routes), schema +
> RLS applied and checked at the DB level (anon can read a live session; the
> `org_public` view exposes branding without leaking Stripe columns). Full
> in-container live play was blocked only by the egress allowlist above.

## Roadmap

| Phase | Scope                                                    | State       |
| ----- | -------------------------------------------------------- | ----------- |
| P0    | Foundation: schema + RLS, theming, tenant middleware     | ✅ done      |
| P1    | Auth, onboarding, subscription gate, dashboard            | ✅ done      |
| P1b   | Stripe billing: pricing, checkout, portal, webhook, gate  | ✅ done (needs keys) |
| P2    | Question banks (JSON import, sections, export)            | ✅ done      |
| P3    | Standard mode live on Supabase Realtime                  | ✅ host · play · display |
| P4    | Team · Speed · Oral modes                                | —           |
| P5    | Branding UI, exports, champion screen, polish            | —           |

### Billing (Stripe) setup

Code is complete; it needs a Stripe account wired up:

1. Create two recurring **prices** (Starter, School) in Stripe → set
   `STRIPE_PRICE_STARTER` / `STRIPE_PRICE_SCHOOL`.
2. Set `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
3. Add a webhook endpoint → `/api/stripe/webhook` (events:
   `checkout.session.completed`, `customer.subscription.*`) → set
   `STRIPE_WEBHOOK_SECRET`. The webhook writes with the **service-role** key,
   so set `SUPABASE_SERVICE_ROLE_KEY` too.

Flow: `/pricing` → Checkout → webhook flips `subscription_status` to `active`
→ middleware unlocks `/host`. The Customer Portal (`/dashboard/billing` →
Manage) handles upgrades, cards and cancellations.

P4 (Team · Speed · Oral modes) and P5 (branding UI, exports, champion) are next.

### Question banks (P2)

`/dashboard/questions` — create reusable sets, each with named sections.
Add questions one at a time or import JSON (file or paste) in the original
game's format; export any set back to JSON. **Start game** on a set launches a
live Standard session bound to it, and the host launches its questions instead
of the built-in samples (samples remain the fallback when no set is chosen).

## Credits

Built on the original game by **D-Maths Ed-Tech Hub** for Infant Jesus Academy.
