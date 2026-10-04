'use server'

import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth/require-auth'
import { createClient } from '@/lib/supabase/server'
import { normalizeOptional, validateProfile } from '@/lib/validation/profile'

export type UpdateProfileResult = { ok: true } | { error: string }

export async function updateProfile(
  displayName: string,
  bio: string,
  currentPath: string
): Promise<UpdateProfileResult> {
  const user = await requireAuth(currentPath)

  const name = normalizeOptional(displayName)
  const cleanBio = normalizeOptional(bio)

  // Server-side check — the modal's limits are UX, not enforcement.
  const problem = validateProfile(name, cleanBio)
  if (problem) return { error: problem }

  const supabase = await createClient()
  const { error } = await supabase
    .from('users')
    .update({ display_name: name, bio: cleanBio })
    .eq('id', user.id)

  if (error) {
    console.error('[updateProfile] update failed:', error.message)
    return { error: 'Could not save your profile.' }
  }

  revalidatePath('/', 'layout')
  return { ok: true }
}