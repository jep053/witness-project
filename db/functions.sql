-- Helper functions used by the RLS policies in policies.sql.
--
-- Run this BEFORE policies.sql. Both functions are security definer so they
-- can read `users` and `follows` from inside a policy that guards those same
-- tables — without it, evaluating a policy would call a function that reads a
-- table that evaluates a policy, and so on. `set search_path = public` is the
-- required companion: it stops a caller from redirecting these elevated
-- functions at a different schema.
--
-- Keep these in sync with getProfileAccess() and getFollowingIds() in
-- lib/data/. They encode the same rule and are the reason those two exist in
-- one place each rather than being repeated per query.

-- Whether `follower` has an accepted follow of `followee`.
--
-- Pending is deliberately excluded: `followers_only` means nothing if
-- requesting access grants it.
create or replace function public.is_accepted_follower(
  follower uuid,
  followee uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.follows f
    where f.follower_id = follower
      and f.followee_id = followee
      and f.status = 'accepted'
  );
$$;

-- Whether `viewer` may see `target`'s content.
--
--   viewer = target      -> always, whatever the setting
--   public               -> everyone, including signed-out visitors
--   followers_only       -> accepted followers only
--   private              -> nobody but the owner
--
-- `private` is checked before any follow lookup because it outranks the
-- follow relationship entirely: a private account stays closed to its own
-- accepted followers.
create or replace function public.can_view_profile(
  viewer uuid,
  target uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when viewer is not null and viewer = target then true
    else (
      select case u.profile_visibility
        when 'public' then true
        when 'private' then false
        when 'followers_only' then
          viewer is not null
          and public.is_accepted_follower(viewer, target)
        else false
      end
      from public.users u
      where u.id = target
    )
  end;
$$;