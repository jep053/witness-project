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

  return getUserById(user.id)
}

/** Auth session only — use when you just need the ID, without a profile lookup. */
export async function getAuthUserId(): Promise<string | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user?.id ?? null
}