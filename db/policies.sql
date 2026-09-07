-- Row Level Security policies for all 11 tables.
--
-- Run functions.sql first — every content policy here calls
-- can_view_profile().
--
-- Two ideas run through this file:
--
--   1. Profile visibility is decided in one function, not repeated per table.
--      Tables that hold a user's content call can_view_profile(); changing the
--      rule means changing one definition.
--
--   2. Tables that hang off a post defer to the posts policy through an
--      `exists (select 1 from posts where id = post_id)` check. Because posts
--      is itself under RLS, that subquery returns nothing for a post the
--      viewer can't see — so the child row disappears too, without restating
--      the visibility rule.
--
-- What RLS cannot do here: it filters rows, not columns. "Goal titles are
-- public, per-goal progress is not" is therefore enforced in the data layer
-- (getGoalTiers is only called for one's own profile), not below. That rule
-- has a single line of defence — treat it carefully when writing queries.

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------

alter table public.users enable row level security;

-- Profiles are discoverable on purpose: search surfaces private accounts, and
-- their profile page shows a header and Follow button while gating content.
-- So rows are readable by everyone, and can_view_profile() guards the content
-- tables instead. This is also why `email` was dropped from this table —
-- row-level rules can't hide a single column from a readable row.
create policy "Profiles are readable by everyone"
on public.users for select
using (true);

create policy "Users update their own profile"
on public.users for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- No insert policy: the row is created at signup by a trigger or the server,
-- not by the client.

-- ---------------------------------------------------------------------------
-- follows
-- ---------------------------------------------------------------------------

alter table public.follows enable row level security;

-- Both sides can see the row: the follower to know their request status, the
-- followee to act on it.
create policy "Users see follows they are part of"
on public.follows for select
using (auth.uid() = follower_id or auth.uid() = followee_id);

create policy "Users create their own follow requests"
on public.follows for insert
with check (auth.uid() = follower_id);

-- Only the followee accepts. A follower who changes their mind deletes the
-- row rather than updating its status.
create policy "Followees respond to requests"
on public.follows for update
using (auth.uid() = followee_id)
with check (auth.uid() = followee_id);

create policy "Either side removes a follow"
on public.follows for delete
using (auth.uid() = follower_id or auth.uid() = followee_id);

-- ---------------------------------------------------------------------------
-- posts
-- ---------------------------------------------------------------------------

alter table public.posts enable row level security;

-- The two-tier privacy model: the account setting sets the ceiling, and
-- is_hidden narrows a single post to its author.
create policy "Posts follow profile visibility"
on public.posts for select
using (
  public.can_view_profile(auth.uid(), user_id)
  and (is_hidden = false or auth.uid() = user_id)
);

create policy "Users write their own posts"
on public.posts for insert
with check (auth.uid() = user_id);

create policy "Users update their own posts"
on public.posts for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users delete their own posts"
on public.posts for delete
using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- post_tags, post_goals
-- ---------------------------------------------------------------------------

alter table public.post_tags enable row level security;
alter table public.post_goals enable row level security;

create policy "Post tags follow their post"
on public.post_tags for select
using (exists (select 1 from public.posts p where p.id = post_id));

create policy "Authors manage their post tags"
on public.post_tags for all
using (
  exists (
    select 1 from public.posts p
    where p.id = post_id and p.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.posts p
    where p.id = post_id and p.user_id = auth.uid()
  )
);

create policy "Post goals follow their post"
on public.post_goals for select
using (exists (select 1 from public.posts p where p.id = post_id));

create policy "Authors manage their post goals"
on public.post_goals for all
using (
  exists (
    select 1 from public.posts p
    where p.id = post_id and p.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.posts p
    where p.id = post_id and p.user_id = auth.uid()
  )
);

-- ---------------------------------------------------------------------------
-- comments
-- ---------------------------------------------------------------------------

alter table public.comments enable row level security;

create policy "Comments follow their post"
on public.comments for select
using (exists (select 1 from public.posts p where p.id = post_id));

-- You can only comment on a post you can see.
create policy "Users comment on visible posts"
on public.comments for insert
with check (
  auth.uid() = user_id
  and exists (select 1 from public.posts p where p.id = post_id)
);

create policy "Users edit their own comments"
on public.comments for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- A post's author can remove comments left on their own post.
create policy "Comment author or post author deletes"
on public.comments for delete
using (
  auth.uid() = user_id
  or exists (
    select 1 from public.posts p
    where p.id = post_id and p.user_id = auth.uid()
  )
);

-- ---------------------------------------------------------------------------
-- candle_lights
-- ---------------------------------------------------------------------------

alter table public.candle_lights enable row level security;

create policy "Candles follow their post"
on public.candle_lights for select
using (exists (select 1 from public.posts p where p.id = post_id));

create policy "Users light candles on visible posts"
on public.candle_lights for insert
with check (
  auth.uid() = user_id
  and exists (select 1 from public.posts p where p.id = post_id)
);

create policy "Users remove their own candles"
on public.candle_lights for delete
using (auth.uid() = user_id);

-- No update policy: a candle is lit or it isn't. There is nothing to change
-- about an existing row.

-- ---------------------------------------------------------------------------
-- goals
-- ---------------------------------------------------------------------------

alter table public.goals enable row level security;

-- Visible to whoever can see the profile. Per-goal progress columns
-- (streak_count, last_recorded_at) come along with the row — withholding them
-- from visitors happens in the data layer. See the note at the top.
create policy "Goals follow profile visibility"
on public.goals for select
using (public.can_view_profile(auth.uid(), user_id));

create policy "Users manage their own goals"
on public.goals for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------------

alter table public.notifications enable row level security;

create policy "Users read their own notifications"
on public.notifications for select
using (auth.uid() = receiver_id);

-- Marking read is the only change a recipient makes.
create policy "Users mark their notifications read"
on public.notifications for update
using (auth.uid() = receiver_id)
with check (auth.uid() = receiver_id);

create policy "Users delete their own notifications"
on public.notifications for delete
using (auth.uid() = receiver_id);

-- No insert policy, deliberately. Notifications are a side effect of candles,
-- comments and follows — never something a client writes directly. Opening
-- insert would let anyone forge a notification to another user. They will be
-- created by a trigger or a server action in Step 6.

-- ---------------------------------------------------------------------------
-- user_settings
-- ---------------------------------------------------------------------------

alter table public.user_settings enable row level security;

create policy "Users read their own settings"
on public.user_settings for select
using (auth.uid() = user_id);

create policy "Users update their own settings"
on public.user_settings for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- No insert policy: the row is created once at signup, alongside the users
-- row.

-- ---------------------------------------------------------------------------
-- tags
-- ---------------------------------------------------------------------------

alter table public.tags enable row level security;

-- Tags are global and unowned — two people writing about running get the same
-- row. See DECISIONS.md.
create policy "Tags are readable by everyone"
on public.tags for select
using (true);

create policy "Signed-in users create tags"
on public.tags for insert
with check (auth.uid() is not null);

-- No update or delete policy. A tag row is shared, so renaming or removing
-- one would reach into other people's posts.