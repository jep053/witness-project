-- Checks that the policies in policies.sql behave as intended.
--
-- The SQL editor runs as a superuser and bypasses RLS, so every check
-- impersonates a role inside a transaction. `set local` only lasts for the
-- transaction, and `rollback` at the end guarantees nothing here writes.
--
-- Expected results assume the fixtures produced by scripts/generate-seed.ts:
--
--   jeongmin    public          2 posts, 3 goals
--   david       public          0 posts, 1 goal
--   runner_kim  followers_only  2 posts, 1 goal   (jeongmin follows, accepted)
--   quiet_lee   followers_only  1 post,  0 goals  (nobody follows)
--   solo_park   private         1 post,  0 goals
--
-- Replace the UUID below if the seed is regenerated against new auth users.

-- ---------------------------------------------------------------------------
-- 1. The visibility function, before any policy is involved
-- ---------------------------------------------------------------------------

-- Expect: david true, jeongmin true, quiet_lee false, runner_kim true,
--         solo_park false
select
  t.username as target,
  t.profile_visibility,
  public.can_view_profile(v.id, t.id) as jeongmin_can_view
from public.users v
cross join public.users t
where v.username = 'jeongmin'
order by t.username;

-- Expect: only david and jeongmin true. A signed-out visitor has no follow
-- relationship, so followers_only accounts stay closed.
select
  username,
  profile_visibility,
  public.can_view_profile(null, id) as guest_can_view
from public.users
order by username;

-- ---------------------------------------------------------------------------
-- 2. Row counts as a signed-in user
-- ---------------------------------------------------------------------------

-- Expect: posts 4, goals 5, notifications 5, comments 1, follows 3
--
-- posts   = own 2 + runner_kim 2 (accepted follower)
-- goals   = own 3 + david 1 (public) + runner_kim 1
-- follows = every row jeongmin is either side of
begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"a22030a2-8ed5-4c29-bcd2-93c5d2420099"}';

select
  (select count(*) from public.posts) as posts,
  (select count(*) from public.goals) as goals,
  (select count(*) from public.notifications) as notifications,
  (select count(*) from public.comments) as comments,
  (select count(*) from public.follows) as follows;

rollback;

-- ---------------------------------------------------------------------------
-- 3. Row counts as a signed-out visitor
-- ---------------------------------------------------------------------------

-- Expect: posts 2, goals 4, notifications 0
--
-- Only public accounts are reachable. notifications must be 0 — a non-zero
-- result means the policy isn't applying.
begin;
set local role anon;

select
  (select count(*) from public.posts) as posts,
  (select count(*) from public.goals) as goals,
  (select count(*) from public.notifications) as notifications;

rollback;

-- ---------------------------------------------------------------------------
-- 4. The middle privacy tier, from the other side
-- ---------------------------------------------------------------------------

-- runner_kim's request to follow jeongmin is still pending, and jeongmin is
-- public anyway — so this checks that a pending request grants nothing beyond
-- what public visibility already allows.
--
-- Expect: quiet_lee's post absent (nobody follows quiet_lee), solo_park's
-- post absent.
begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"4e74d342-d218-4d52-8601-748c2e556d50"}';

select u.username, count(p.id) as visible_posts
from public.users u
left join public.posts p on p.user_id = u.id
group by u.username
order by u.username;

rollback;

-- ---------------------------------------------------------------------------
-- 5. Child tables inherit their post's visibility
-- ---------------------------------------------------------------------------

-- comments and candle_lights both hang off jeongmin's first post, which
-- quiet_lee cannot see. Expect 0 for both.
begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"827db36d-169f-4d92-9ff3-5f97cfecfd92"}';

select
  (select count(*) from public.comments) as comments,
  (select count(*) from public.candle_lights) as candles,
  (select count(*) from public.post_tags) as post_tags;

rollback;

-- ---------------------------------------------------------------------------
-- 6. RLS is on everywhere
-- ---------------------------------------------------------------------------

-- Expect 11 rows, all true. A false here means an unguarded table.
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;