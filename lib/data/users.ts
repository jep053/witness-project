import { createClient } from '@/lib/supabase/server'
import type { User } from '@/lib/types'
import { getFollowBetween } from '@/lib/data/follows'

// Private and followers-only profiles are discoverable by design: the profile
// page renders its header and a Follow button, and gates only the content.
// See Profile wireframe.
export async function searchUsers(
  query: string,
  viewerId: string | null
): Promise<User[]> {
  const q = query.trim()
  if (!q) return []

  const supabase = await createClient()
  let request = supabase.from('users').select('*').ilike('username', `%${q}%`)

  if (viewerId) {
    request = request.neq('id', viewerId)
  }

  const { data, error } = await request

  if (error) {
    console.error('[searchUsers] query failed:', error.message)
    return []
  }
  return data as User[]
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .maybeSingle()

  if (error) {
    console.error('[getUserByUsername] query failed:', error.message)
    return null
  }
  return data as User | null
}

export async function getUserById(userId: string): Promise<User | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('[getUserById] query failed:', error.message)
    return null
  }
  return data as User | null
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