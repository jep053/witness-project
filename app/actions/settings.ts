'use server'

import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth/require-auth'
import { createClient } from '@/lib/supabase/server'
import type { ProfileVisibility, UserSettings } from '@/lib/types'

export type ActionResult = { ok: true } | { error: string }

export async function updateProfileVisibility(
  visibility: ProfileVisibility
): Promise<ActionResult> {
  const user = await requireAuth('/settings')
  const supabase = await createClient()

  const { error } = await supabase
    .from('users')
    .update({ profile_visibility: visibility })
    .eq('id', user.id)

  if (error) {
    console.error('[updateProfileVisibility] update failed:', error.message)
    return { error: 'Could not update visibility.' }
  }

  revalidatePath('/settings')
  revalidatePath('/', 'layout') // profile card elsewhere may reflect this
  return { ok: true }
}

export async function updateNotificationSetting(
  key: keyof Omit<UserSettings, 'user_id' | 'language'>,
  value: boolean
): Promise<ActionResult> {
  const user = await requireAuth('/settings')
  const supabase = await createClient()

  const { error } = await supabase
    .from('user_settings')
    .update({ [key]: value })
    .eq('user_id', user.id)

  if (error) {
    console.error('[updateNotificationSetting] update failed:', error.message)
    return { error: 'Could not update notification setting.' }
  }

  revalidatePath('/settings')
  return { ok: true }
}