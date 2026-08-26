import { mockUserSettings } from '@/lib/mock-data/users'
import type { UserSettings } from '@/lib/types'

export async function getUserSettings(
  userId: string
): Promise<UserSettings | null> {
  return mockUserSettings.find((s) => s.user_id === userId) ?? null
}