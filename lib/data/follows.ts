import { mockFollows } from '@/lib/mock-data/follows'
import type { Follow } from '@/lib/types'

export async function getFollowBetween(
  followerId: string,
  followingId: string
): Promise<Follow | null> {
  return (
    mockFollows.find(
      (f) => f.follower_id === followerId && f.following_id === followingId
    ) ?? null
  )
}

export async function getPendingFollowRequests(userId: string): Promise<Follow[]> {
  return mockFollows.filter((f) => f.following_id === userId && f.status === 'pending')
}