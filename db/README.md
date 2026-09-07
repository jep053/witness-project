# Database

SQL that isn't captured by the Supabase dashboard. Kept here so the database
can be rebuilt from scratch — for a fresh project, a second environment, or a
collaborator setting up their own.

Run in this order:

| File | What it does |
|---|---|
| `functions.sql` | Two helper functions the policies depend on |
| `policies.sql` | RLS policies for all 11 tables |
| `verify.sql` | Checks the policies behave as intended |

Table definitions are not here yet — the schema was created through the
dashboard. If this project is ever rebuilt elsewhere, a `schema.sql` will need
to be exported first.

## Seed data

`scripts/generate-seed.ts` produces fixtures matching `lib/mock-data/`:

```bash
npx tsx scripts/generate-seed.ts > seed.sql
```

The five accounts it expects must exist in `auth.users` first, since
`public.users.id` is a foreign key to it. Create them from the dashboard with
Auto Confirm enabled, then paste their UUIDs into `AUTH_UUIDS` in the script.

The fixtures aren't arbitrary. They cover every branch the visibility rules
have: a public account, a followers-only account that is followed, one that
isn't, a private account, and a pending request alongside an accepted one.
Anything that changes those combinations weakens what `verify.sql` proves.

## Changing the visibility rules

The rule lives in `can_view_profile()` and is mirrored by `getProfileAccess()`
in `lib/data/users.ts`. Both must change together — the database enforces it,
and the application decides what to render before a query is ever made.

Re-run `verify.sql` after any change. Its expected results are written into
the comments.