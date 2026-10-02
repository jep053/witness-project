'use server'

import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth/require-auth'
import { createClient } from '@/lib/supabase/server'

export async function markAllNotificationsRead(currentPath: string) {
  const user = await requireAuth(currentPath)
  const supabase = await createClient()

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('receiver_id', user.id)
    .eq('is_read', false)

  if (error) {
    console.error('[markAllNotificationsRead] update failed:', error.message)
    return
  }

  revalidatePath('/notifications')
  // Sidebar unread-count badge lives in the layout, not this page.
  revalidatePath('/', 'layout')
}