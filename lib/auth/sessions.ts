import { createClient } from '@/lib/supabase/server'
import { getUserById } from '@/lib/data/users'
import type { User } from '@/lib/types'

/**
 * Returns the signed-in user's profile, or null for guests.
 *
 * Combines the Supabase Auth session (source of truth for identity)
 * with the matching row in our `users` table (source of truth for
 * profile fields like username, display_name, avatar_url).
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // TEMP: profiles still come from the mock layer, which is keyed by
  // 'user-1' rather than real auth UUIDs. Falls back to the primary mock
  // user so screens can be verified against a real session.
  // Remove this fallback when swapping in real Supabase queries.
  return (await getUserById(user.id)) ?? (await getUserById('user-1'))
}

/** Auth session only — use when you just need the ID, without a profile lookup. */
export async function getAuthUserId(): Promise<string | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user?.id ?? null
}