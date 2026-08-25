# Decisions

Choices that are settled. Each one has other things built on top of it, so
reversing it means unpicking more than the decision itself.

This is the opposite of [DEFERRED.md](./DEFERRED.md): that file tracks what
hasn't been done yet, this one tracks what has been and shouldn't drift.

Every entry answers the same question — *what would we lose by changing this?*

---

## Product

### Follows require approval

Following someone creates a `pending` row. Content gated behind
`followers_only` opens only when the request is accepted.

**Why:** `followers_only` is meaningless if anyone can grant themselves the
role. Approval is what makes the middle privacy tier real.

**Cost of reversing:** the `FollowStatus` type, follow request notifications
with their inline actions, and every access check that filters on
`status === 'accepted'` — including forthcoming RLS policies.

### Feeds are reverse chronological, never engagement-ranked

The Others feed orders posts by recency. Nothing is weighted by how many
candles or comments a post received.

**Why:** candle counts are deliberately hidden. Ranking by them puts the same
metric back into the product as position rather than as a number — arguably
worse, because people would feel the ranking without being able to see what
drives it. A feed where popular posts float upward is a comparison feed no
matter what the interface shows.

**Cost of reversing:** the reason candles have no count in the first place.
The two decisions hold each other up.

**Room to grow:** if volume ever demands ordering beyond recency, use signals
unrelated to popularity — who the viewer follows, how recently they posted.
Those don't rank people against each other.

---

### Candles have no count

A post's candle button shows lit or unlit. It never shows how many.

**Why:** the point is that someone witnessed the effort. How many did is a
different thing to care about, and caring about it is the habit Witness
exists to interrupt.

**Cost of reversing:** the feed ordering decision above, and the follower
count decision below, are the same argument applied elsewhere. Reversing one
makes the others arbitrary.

**Note:** `candle_count` still exists on `PostWithMeta`. It feeds Bonfire
brightness. It must not reach the interface as a number.

---

### Followers and following are links, not counts

Profiles link to follower and following lists without showing sizes.

**Why:** same argument. A follower count is a scoreboard whether or not
anyone asked for one.

---

### Comparison is with your own past, never with other people

The check applied to every feature: does this invite comparison with someone
else? Streaks, leaderboards, badges, and public metrics all failed it.

**Why:** it's the reason the product exists. Everything above is downstream
of it.

---

## Privacy

### Two tiers: account gate, per-post narrowing

`users.profile_visibility` (`public` / `followers_only` / `private`) is the
master gate. A post can only narrow it further, via `is_hidden`.

**Why:** three-tier per-post visibility was tried and dropped. It let a post
claim to be public while its account was private — two sources of truth for
one question, and no obvious winner when they disagreed.

**Cost of reversing:** RLS policies are written against this shape. So is
every read function that touches another user's content.

**Note:** David's Figma still shows the old three-tier selector. It's the
Figma that's out of date, not the schema.

---

### Private posts never appear in any feed

Not filtered at render time — excluded at the query. Enforced again by RLS
once policies land.

**Why:** a privacy rule that lives in a component is one refactor away from
being lost.

---

## Architecture

### Screens never call Supabase directly

Every read goes through an `async` function in `lib/data/`.

**Why:** it makes the mock-to-real swap a change of function bodies rather
than a change of screens. It also keeps access rules in one layer, where they
can be checked against RLS policies.

**Cost of reversing:** any direct call from a component is a place a future
RLS policy can break silently.

---

### Data access functions were async from day one

They returned fixtures synchronously in every sense but the signature.

**Why:** a synchronous mock layer forces every call site to change when real
queries arrive. The `await` was free to write and expensive to add later.

---

### RLS is designed before queries are swapped in

Order: screens (read-only) → RLS policies → real queries.

**Why:** writing every query against an unprotected database and enabling RLS
afterwards means a batch of them start returning empty results at the same
moment, with no signal about which policy caused which failure. With policies
first, each screen validates its own as it converts.

---

### Tags are many-to-many and always multi-select

Posts link to tags through `post_tags`. Filters on My Journey and Others both
accept multiple tags with OR logic.

**Why:** a single `tag_id` foreign key was considered and rejected. Entries
rarely belong to exactly one thing.

**Cost of reversing:** the junction table, both filter interfaces, and the
tag selector in the composer.

---

### Tags are global; tag lists are personal

A tag row is shared across users — two people writing about running get the
same tag. Composer UIs offer every tag so existing ones get reused. Filter
UIs offer only tags the viewer has actually used.

**Why:** per-user tag rows would fragment the Others feed, where filtering by
someone else's tag is the point. But a filter listing every tag anyone ever
made grows without bound.

---

### Bonfire averages ratios first, quantizes last

Each active goal produces a 0–1 completion ratio. Those are averaged, and the
average is then mapped to one of four brightness tiers.

**Why:** quantizing per goal first destroys the detail that makes the average
meaningful — two goals at 49% and 51% land in different tiers and average to
something that reflects neither.

**Cost of reversing:** `BrightnessTier` is `1 | 2 | 3 | 4` throughout, and the
tier boundaries are documented against ratio ranges.

---

## Scope

### Notification filter tabs are post-MVP

The notifications list is a single stream — no All / Candle / Comments /
Follows tabs.

**Why:** with four notification types and low volume, tabs would hide content
rather than organize it. Whether filtering helps is a question about how
notifications actually accumulate, which can't be answered before there are
any. David's design doesn't include them either.

**Room to grow:** additive. Nothing built now assumes a single list.

### Search covers tags and users; post body search is post-MVP

The Others search bar matches tag names and usernames. It does not search
post text.

**Why:** the first two are substring matches against small tables and need no
schema support. Full-text search needs a `tsvector` column, a GIN index, a
trigger to keep it current, and a Korean-capable text search configuration —
a feature in its own right, not a widening of this one.

**Room to grow:** adding it later is additive. Nothing built now has to
change.

---

### Desktop web first

No mobile layout work during MVP.

**Why:** two people, one design source. Doing both halves the attention on
each.

---

## Collaboration

### Code, comments, and commits are in English

Interface strings too, from the point this was decided — David's Figma has
Korean copy that gets translated during porting.

**Why:** the codebase should stay open to collaborators who don't read
Korean.

---

### Figma is the source of truth for visuals, not for logic

David owns design. Where his prototype and the confirmed spec disagree, the
spec wins and the Figma gets updated.

**Why:** the prototype was built before several decisions were finalized. It
still carries three-tier post privacy, a `hasRecords` split on goals, and
integer-averaged bonfire levels — all superseded.