# Witness

A self-reflection journal where you compare with your past self, not others.

Most social platforms measure you against everyone else. Witness is built the
other way around: the only useful comparison is with who you were last week.
Every product decision is checked against that principle. 

## The bonfire

Your active goals feed a single bonfire whose brightness reflects how
consistently you've shown up this week. Each goal contributes a 0–1 ratio
(days recorded ÷ 7 for daily goals, check-ins ÷ target for weekly ones).
Those ratios are averaged first, and only then quantized into four
brightness tiers.

The order matters. Quantizing each goal before averaging collapses the
detail. Two goals at 49% and 51% would land in different tiers and average
out to something that reflects neither. Average first, quantize last.

## Reactions

Posts can be lit with a candle. There is no count — a candle either burns or
it doesn't. Someone witnessed your effort; how many did isn't the point.

---

## Stack

| | |
|---|---|
| Framework | Next.js (App Router) |
| Hosting | Vercel |
| Database & Auth | Supabase (PostgreSQL, RLS) |
| UI | shadcn/ui — Base UI primitives, Luma preset |
| Animation | Motion |
| Design | Figma |

Typography is split by role: DM Sans for body text, Kalam for the sidebar and
brand, Lora italic for usernames.

## Running locally

```bash
git clone https://github.com/<owner>/witness-project.git
cd witness-project
npm install
npm run dev
```

Create `.env.local` with your Supabase project credentials:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Layout

```
app/
  (main)/          Screens with the sidebar
  auth/            Login and signup
components/        Shared UI
lib/
  auth/            Session helpers, route guards
  data/            Data access — async functions only
  mock-data/       Fixtures, replaced by real queries in Step 6
  supabase/        Client and server instances
  types/
proxy.ts           Route protection (renamed from middleware.ts in Next.js 16)
```

## Conventions

**Screens never call Supabase directly.** Every read goes through an `async`
function in `lib/data/`. Those functions currently return mock fixtures; when
real queries land, only their bodies change and no call site is touched.

**Code, comments, and commit messages are in English** so the codebase stays
open to collaborators.

**Data architecture comes before screens.** Types and access functions are
settled first, so screen work is about presentation rather than discovering
the shape of the data mid-render.

**Phases don't overlap.** Read paths before write paths, basic CRUD before
auth, auth before RLS. When two phases are in flight at once, a bug could
belong to either and debugging turns into guesswork.

## Progress

| Step | |
|---|---|
| 1. Foundations — schema, Supabase, auth, route protection | Done |
| 2. Data layer — types, fixtures, access functions | Done |
| 3. Design alignment — tokens, Figma reconciliation | Done |
| 4. Screens (read-only) | In progress |
| 5. RLS policies | |
| 6. Real Supabase queries | |
| 7. Deployment prep | |

RLS is deliberately designed **before** queries are swapped in. Writing every
query against an unprotected database and enabling RLS afterwards means a
large batch of them silently start returning empty results at once. With
policies in place first, each screen validates its own policy as it's
converted.

Temporary decisions, and what unblocks each one, are tracked in
[DEFERRED.md](./DEFERRED.md). Anything deliberately left incomplete should be
recorded there rather than in a comment that only its author will find.

## Credits

- **Jeong Min Park** (`@handle`) — Product direction & implementation
- **David** (`@DavidGitHubHandle`) — Software architecture & UI/Figma design

## License

No license is granted at this time. All rights reserved.

The source is public for reference and review, but reuse, redistribution, and
derivative works are not permitted without written permission. A permissive
license may be added later once the project's direction is settled.