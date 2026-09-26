import { createClient } from '@/lib/supabase/server'
import { mockFollows } from '@/lib/mock-data/follows'
import type { Follow, User } from '@/lib/types'

// Accepted only — a pending request isn't a follower yet.
export async function getFollowers(userId: string): Promise<User[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('follows')
    .select('users!follows_follower_id_fkey(*)')
    .eq('followee_id', userId)
    .eq('status', 'accepted')

  if (error) {
    console.error('[getFollowers] query failed:', error.message)
    return []
  }

  return (data ?? [])
    .map((row) => row.users as unknown as User | null)
    .filter((u): u is User => u !== null)
}

export async function getFollowing(userId: string): Promise<User[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('follows')
    .select('users!follows_followee_id_fkey(*)')
    .eq('follower_id', userId)
    .eq('status', 'accepted')

  if (error) {
    console.error('[getFollowing] query failed:', error.message)
    return []
  }

  return (data ?? [])
    .map((row) => row.users as unknown as User | null)
    .filter((u): u is User => u !== null)
}

export async function getFollowBetween(
  followerId: string,
  followeeId: string
): Promise<Follow | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('follows')
    .select('*')
    .eq('follower_id', followerId)
    .eq('followee_id', followeeId)
    .maybeSingle()

  if (error) {
    console.error('[getFollowBetween] query failed:', error.message)
    return null
  }
  return data as Follow | null
}

// TODO(6-4): convert when the follow-request accept/decline screen lands.
export async function getPendingFollowRequests(userId: string): Promise<Follow[]> {
  return mockFollows.filter(
    (f) => f.followee_id === userId && f.status === 'pending'
  )
}

// Accepted follows only — a pending request grants no access to
// followers-only content. Returned as a Set because callers check
// membership per post while rendering a feed.
export async function getFollowingIds(userId: string): Promise<Set<string>> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('follows')
    .select('followee_id')
    .eq('follower_id', userId)
    .eq('status', 'accepted')

  if (error) {
    console.error('[getFollowingIds] query failed:', error.message)
    return new Set()
  }

  return new Set((data ?? []).map((f) => f.followee_id))
}