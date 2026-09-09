// lib/types/index.ts
//
// Domain types layered on top of the generated Supabase types (database.ts).
// database.ts is the single source of truth for column names/nullability —
// regenerate it with `npx supabase gen types typescript --project-id <ref>
// --schema public > lib/types/database.ts` whenever the schema changes.
//
// A few DB columns are stored as loose TEXT/jsonb (not native Postgres enums)
// for extensibility. The generated types see these as `string` / `Json`; we
// narrow them to closed unions here via Omit<Row, K> & { K: literal }.

import type { Database } from './database'

type Tables = Database['public']['Tables']

/** Bonfire brightness level. 1 = faintest, 4 = brightest. */
export type BrightnessTier = 1 | 2 | 3 | 4

export type ProfileVisibility = 'public' | 'followers_only' | 'private'

export type FollowStatus = 'pending' | 'accepted'

// notification_type is stored as TEXT for extensibility, not a DB enum —
// this union is our app-level constraint on top of that.
export type NotificationType =
  | 'candle'
  | 'comment'
  | 'follow_request'
  | 'follow_accepted'

export type GoalStatus = 'planned' | 'active' | 'archived'
export type GoalCadenceType = 'daily' | 'weekly_count'

/** Shape of goals.cadence_config, which varies by cadence_type. */
export type CadenceConfig =
  | { type: 'daily' }
  | { type: 'weekly_count'; target: number }

// ---- Row types, derived from the generated schema ----

// NOTE: display_name is nullable in the DB (was incorrectly non-null before
// gen types) — components reading it must handle the null case.
export type User = Omit<Tables['users']['Row'], 'profile_visibility'> & {
  profile_visibility: ProfileVisibility
}

export type UserSettings = Tables['user_settings']['Row']

export type Tag = Tables['tags']['Row']

// Junction table — a post can have multiple tags (N:M)
export type PostTag = Tables['post_tags']['Row']

// Junction table — a post can be linked to multiple goals (N:M).
// A post linked to a goal acts as that goal's check-in: it counts
// toward the goal's weekly target and feeds Bonfire brightness.
export type PostGoal = Tables['post_goals']['Row']

export type Follow = Omit<Tables['follows']['Row'], 'status'> & {
  status: FollowStatus
}

export type Candle = Tables['candle_lights']['Row']

export type Comment = Tables['comments']['Row']

export type Post = Tables['posts']['Row']

export type Goal = Omit <
  Tables['goals']['Row'],
  'status' | 'cadence_type' | 'cadence_config'
> & {
  status: GoalStatus
  cadence_type: GoalCadenceType | null // set once status becomes 'active'
  cadence_config: CadenceConfig | null
}

export type Notification = Omit<Tables['notifications']['Row'], 'type'> & {
  type: NotificationType
}