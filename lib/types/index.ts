// Mirrors the confirmed Supabase schema (Witness DB Schema v3).
// When real Supabase is wired up, these types should match the generated
// database types — keep field names identical.

export type ProfileVisibility = 'public' | 'followers_only' | 'private'

/** Bonfire brightness level. 1 = faintest, 4 = brightest. */
export type BrightnessTier = 1 | 2 | 3 | 4

export interface User {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  bio: string | null
  profile_visibility: ProfileVisibility
  created_at: string
}

export interface UserSettings {
  user_id: string
  notify_candle: boolean
  notify_comment: boolean
  notify_follow_request: boolean
  notify_follow_accepted: boolean
  language: string // reserved for post-MVP i18n
}

export interface Tag {
  id: string
  name: string
}

export interface Post {
  id: string
  user_id: string
  content: string
  image_url: string | null
  is_hidden: boolean
  created_at: string
}

// Junction table — a post can have multiple tags (N:M)
export interface PostTag {
  post_id: string
  tag_id: string
}

// Junction table — a post can be linked to multiple goals (N:M).
// A post linked to a goal acts as that goal's check-in: it counts
// toward the goal's weekly target and feeds Bonfire brightness.
export interface PostGoal {
  post_id: string
  goal_id: string
}

export type GoalStatus = 'planned' | 'active' | 'archived'
export type GoalCadence = 'daily' | 'weekly_count'

export interface Goal {
  id: string
  user_id: string
  title: string
  status: GoalStatus
  cadence: GoalCadence | null // only set once status becomes 'active'
  weekly_target_count: number | null // only used when cadence = 'weekly_count'
  created_at: string
  activated_at: string | null
}

export type FollowStatus = 'pending' | 'accepted'

export interface Follow {
  id: string
  follower_id: string
  following_id: string
  status: FollowStatus
  created_at: string
}

export interface Candle {
  id: string
  post_id: string
  user_id: string
  created_at: string
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
}

// notification_type is stored as TEXT for extensibility, not a DB enum —
// this union is our app-level constraint on top of that.
export type NotificationType =
  | 'candle'
  | 'comment'
  | 'follow_request'
  | 'follow_accepted'

export interface Notification {
  id: string
  recipient_id: string
  actor_id: string // the user who triggered it (who sent the candle, etc.)
  type: NotificationType
  post_id: string | null // relevant for candle/comment notifications
  follow_id: string | null // relevant for follow notifications
  is_read: boolean
  created_at: string
}

