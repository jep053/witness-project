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


export type FollowStatus = 'pending' | 'accepted'

export interface Follow {
  id: string
  follower_id: string
  followee_id: string
  status: FollowStatus
  created_at: string
  accepted_at: string | null
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



export interface Post {
  id: string
  user_id: string
  content: string
  is_hidden: boolean
  created_at: string
  updated_at: string
}

export type GoalStatus = 'planned' | 'active' | 'archived'
export type GoalCadenceType = 'daily' | 'weekly_count'

/** Shape of goals.cadence_config, which varies by cadence_type. */
export type CadenceConfig =
  | { type: 'daily' }
  | { type: 'weekly_count'; target: number }

export interface Goal {
  id: string
  user_id: string
  title: string
  description: string | null
  status: GoalStatus
  cadence_type: GoalCadenceType | null // set once status becomes 'active'
  cadence_config: CadenceConfig | null
  streak_count: number
  last_recorded_at: string | null
  created_at: string
}

export interface Notification {
  id: string
  sender_id: string
  receiver_id: string
  type: NotificationType
  post_id: string | null
  is_read: boolean
  created_at: string
}