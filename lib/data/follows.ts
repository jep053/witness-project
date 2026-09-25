import { createClient } from '@/lib/supabase/server'
import { mockFollows } from '@/lib/mock-data/follows'
import type { Follow } from '@/lib/types'
import { mockUsers } from '@/lib/mock-data/users'
import type { User } from '@/lib/types'

// Accepted only — a pending request isn't a follower yet.
export async function getFollowers(userId: string): Promise<User[]> {
  const followerIds = new Set(
    mockFollows
      .filter((f) => f.followee_id === userId && f.status === 'accepted')
      .map((f) => f.follower_id)
  )
  return mockUsers.filter((u) => followerIds.has(u.id))
}

export async function getFollowing(userId: string): Promise<User[]> {
  const followeeIds = new Set(
    mockFollows
      .filter((f) => f.follower_id === userId && f.status === 'accepted')
      .map((f) => f.followee_id)
  )
  return mockUsers.filter((u) => followeeIds.has(u.id))
}

export async function getFollowBetween(
  followerId: string,
  followeeId: string
): Promise<Follow | null> {
  return (
    mockFollows.find(
      (f) => f.follower_id === followerId && f.followee_id === followeeId
    ) ?? null
  )
}

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