'use server'

import { requireAuth } from '@/lib/auth/require-auth'

// Guests are blocked here rather than at the page level, since
// Others is public but reacting/commenting requires an account.
export async function sendCandle(postId: string, currentPath: string) {
  const user = await requireAuth(currentPath)
  // TODO: replace with a real insert once Supabase wiring is done.
  console.log(`Candle sent by ${user.id} to post ${postId}`)
}

export async function postComment(postId: string, content: string, currentPath: string) {
  const user = await requireAuth(currentPath)
  // TODO: replace with a real insert once Supabase wiring is done.
  console.log(`Comment by ${user.id} on post ${postId}: ${content}`)
}