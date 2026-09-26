import { createClient } from '@/lib/supabase/server'
import type { UserSettings } from '@/lib/types'

export async function getUserSettings(
  userId: string
): Promise<UserSettings | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('[getUserSettings] query failed:', error.message)
    return null
  }
  return data as UserSettings | null
}