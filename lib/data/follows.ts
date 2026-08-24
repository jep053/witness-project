import { mockFollows } from '@/lib/mock-data/follows'
import type { Follow } from '@/lib/types'

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
  return new Set(
    mockFollows
      .filter((f) => f.follower_id === userId && f.status === 'accepted')
      .map((f) => f.followee_id)
  )
}