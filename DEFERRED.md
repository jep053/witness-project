# Deferred Work

Temporary decisions made to keep the read-only screen phase unblocked.
Each entry names what to change, where, and which roadmap step unblocks it.

Roadmap reference:
- **Step 4** — Screen implementation (read-only): My Journey → Others → Notifications → Profile → Settings
- **Step 5** — RLS policy design
- **Step 6** — Replace mock data functions with real Supabase queries
- **Step 7** — Deployment prep

---

## Blocked on Step 6 (real Supabase queries)

### `getCurrentUser()` mock-user fallback
**Where:** `lib/auth/sessions.ts`

Auth is real Supabase but profiles still come from the mock layer, which is
keyed by `'user-1'` rather than real auth UUIDs. A fallback to `getUserById('user-1')`
lets signed-in screens render during Step 4.

**To remove:** delete the `?? await getUserById('user-1')` fallback. The lookup
should return `null` for a missing profile row, not silently substitute another user.

**Risk if missed:** every signed-in user resolves to the same profile. Not a
crash — the app looks like it works. Verify by signing in as two accounts.

### Candle toggles are local-only
**Where:** `components/post-card.tsx` — `CandleButton` state

Clicking a candle toggles local React state so the lit/unlit transition and
the tap animation can be verified. Nothing is persisted: the state resets on
refresh, and no row is written to `candle_lights`.

**Why it looks like it works:** this is the risk. The button responds exactly
as the finished feature will, so it's easy to assume the write path already
exists. It doesn't — `lib/data/interactions.ts` is read-only.

**To change:** replace the local state with a server action that inserts or
deletes a `candle_lights` row, and seed the initial `lit` value from whether
the current user has already lit that post.

**Note:** this deliberately differs from New Record, which tells the user it
isn't wired up. A candle is tapped casually and often — a notice on every tap
would be noise, where a single blocked submit is not.

### Comments are fetched for every post upfront
**Where:** `lib/data/interactions.ts` — `getComments()`, called from the
My Journey page for each post

Comment sections are collapsed by default, but every post's comments are
fetched when the page renders. Against fixtures this costs nothing.

**Why it needs to change:** with real queries this is one round trip per post
on every page load, for data most visitors never expand.

**To change:** move the fetch to expand time. PostCard becomes responsible for
loading its own comments on first open, which means a loading state inside the
comment section and a client-side call rather than a server prop. Keep
`comment_count` on `PostWithMeta` so the button label stays correct without
fetching.

---

### New Record submit is a no-op
**Where:** `app/(main)/my-journey/` — New Record accordion

The accordion is fully interactive (text, tag add/remove, hidden toggle,
cancel) but the submit handler deliberately does nothing except tell the user
posting isn't wired up. Kept as a placeholder so layout spacing and interaction
patterns can be verified during the read-only phase.

**To remove:** replace the handler body with a server action calling a real
`createPost()`. No write functions exist in `lib/data/` yet — `posts.ts` is
read-only.

**Also needed:** `visibility` (Public / Followers / etc.) has no selection UI.
David's design hardcodes `"Public"`. Request this from David before building
the write path.

**Design mismatch:** David's Figma still carries the old three-tier post
privacy (`Public` / `Followers` / `Private`). The confirmed spec replaced it
with account-level `profile_visibility` as the master gate plus a per-post
`is_hidden` override. Ask David to update the Figma so the two don't drift
further — no per-post visibility selector is needed.

---

### Avatar images
**Where:** `components/avatar.tsx`

Avatars render initials over a deterministic color. The `users.avatar_url`
column exists but is unused.

**Why deferred:** image upload requires Supabase Storage, an upload UI,
resizing, and CDN handling — and upload is a write path, so it can't land
before Step 6 anyway.

**To change:** render `avatar_url` when present, keep the initial-and-color
version as the fallback for users without an image.

---

## Blocked on David (design)

### Bonfire is a wireframe bar
**Where:** Profile screen (Step 4, D phase)

Four stacked segments (high / mid / low / off) rather than the intended
burning-fire visual.

**Why it's fine for now:** what needs verifying is that `getBrightnessTier()`
returns 1–4 correctly and maps to the right segment. The bar proves that as
well as an animated flame would.

**To change:** swap the component internals only. The `BrightnessTier` (1–4)
contract stays, so `getBonfireBrightness()` and page code are untouched.

---

### GoalCard `hasRecords` split
**Where:** Profile screen (Step 4, D phase)

David's Figma still splits active goals into "진행 중 (기록 있음)" and
"아직 시작 안 함". The confirmed spec has no such distinction.

**To do:** drop the `hasRecords` branch when porting; render all active goals
in one grid. Ask David to update the Figma so the two don't drift further.

---

### Settings screen
Not designed yet. Sidebar has four items (My Journey, Others, Notifications,
Profile); Settings is absent.

**To do:** David is reflecting the previously agreed settings design in Figma.
Add the sidebar entry when the screen itself is built.

---

## Blocked on Step 7 (deployment prep)

### Email verification is off
Supabase `confirm email` is disabled for MVP convenience.
**Must be enabled before any public deployment.** Without it, anyone can
register with an address they don't control.

### Google OAuth
Deferred until email/password auth is stable.

### Default `app/page.tsx`
Still the create-next-app starter. Guests get redirected to `/others`, so this
is only visible when signed in. Should redirect to `/my-journey` or be deleted.

---

## Guest experience

### Sign-in prompt on the login page
Guests can see all sidebar links; non-`/others` links redirect to login.
`requireAuth()` already carries `?next=` with the original path.

**To do:** show a message on the login page when `next` is present, explaining
why they were redirected — framed around starting their own journey rather
than "make an account". Planned alongside the Others screen.

**Design mismatch:** David's Figma still carries the old three-tier post
privacy (`Public` / `Followers` / `Private`). The confirmed spec replaced it
with account-level `profile_visibility` as the master gate plus a per-post
`is_hidden` override. Ask David to update the Figma so the two don't drift
further — no per-post visibility selector is needed.
