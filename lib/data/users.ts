import { mockUsers } from '@/lib/mock-data/users'
import type { User } from '@/lib/types'
import { getFollowBetween } from '@/lib/data/follows'

// Private and followers-only profiles are discoverable by design: the profile
// page renders its header and a Follow button, and gates only the content.
// See Profile wireframe.
export async function searchUsers(
  query: string,
  viewerId: string | null
): Promise<User[]> {
  const q = query.trim().toLowerCase()
  if (!q) return []

  return mockUsers.filter(
    (u) => u.id !== viewerId && u.username.toLowerCase().includes(q)
  )
}

export async function getUserByUsername(username: string): Promise<User | null> {
  return mockUsers.find((u) => u.username === username) ?? null
}

export async function getUserById(userId: string): Promise<User | null> {
  return mockUsers.find((u) => u.id === userId) ?? null
}

export type ProfileAccess = 'self' | 'visible' | 'locked_followers' | 'locked_private'

/**
 * Whether the viewer may see a profile's content (bonfire, goals).
 *
 * Mirrors what RLS will enforce in Step 5 — keep the two in sync.
 * `private` blocks everyone but the owner, including accepted followers,
 * so it is checked before any follow lookup happens.
 */
export async function getProfileAccess(
  profile: User,
  viewerId: string | null
): Promise<ProfileAccess> {
  if (viewerId === profile.id) return 'self'

  switch (profile.profile_visibility) {
    case 'public':
      return 'visible'
    case 'private':
      return 'locked_private'
    case 'followers_only': {
      if (!viewerId) return 'locked_followers'
      const follow = await getFollowBetween(viewerId, profile.id)
      return follow?.status === 'accepted' ? 'visible' : 'locked_followers'
    }
  }
}