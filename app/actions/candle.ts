'use server'

import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth/require-auth'
import { createClient } from '@/lib/supabase/server'
import type { CommentWithAuthor } from '@/lib/data/interactions'

// Guests are blocked here rather than at the page level, since
// Others is public but reacting/commenting requires an account.
export type ToggleCandleResult = { lit: boolean } | { error: string }

export async function toggleCandle(
  postId: string,
  currentPath: string
): Promise<ToggleCandleResult> {
  const user = await requireAuth(currentPath)
  const supabase = await createClient()

  const { data: existing, error: checkError } = await supabase
    .from('candle_lights')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (checkError) {
    console.error('[toggleCandle] check failed:', checkError.message)
    return { error: 'Could not update candle.' }
  }

  if (existing) {
    const { error } = await supabase
      .from('candle_lights')
      .delete()
      .eq('id', existing.id)

    if (error) {
      console.error('[toggleCandle] delete failed:', error.message)
      return { error: 'Could not remove candle.' }
    }

    revalidatePath('/my-journey')
    revalidatePath('/others')
    return { lit: false }
  }

  const { error } = await supabase
    .from('candle_lights')
    .insert({ post_id: postId, user_id: user.id })

  if (error) {
    console.error('[toggleCandle] insert failed:', error.message)
    return { error: 'Could not light candle.' }
  }

  revalidatePath('/my-journey')
  revalidatePath('/others')
  return { lit: true }
}

export type PostCommentResult = { comment: CommentWithAuthor } | { error: string }

export async function postComment(
  postId: string,
  content: string,
  currentPath: string
): Promise<PostCommentResult> {
  const user = await requireAuth(currentPath)

  const trimmed = content.trim()
  if (!trimmed) return { error: 'Comment cannot be empty.' }
  if (trimmed.length > 500) return { error: 'Comments can be at most 500 characters.' }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('comments')
    .insert({ post_id: postId, user_id: user.id, content: trimmed })
    .select('*, users(id, username)')
    .single()

  if (error || !data) {
    console.error('[postComment] insert failed:', error?.message)
    return { error: 'Could not post comment.' }
  }

  const { users, ...comment } = data as typeof data & {
    users: { id: string; username: string } | null
  }

  revalidatePath('/my-journey')
  revalidatePath('/others')

  return {
    comment: {
      ...comment,
      author: users ?? { id: user.id, username: 'unknown' },
    } as CommentWithAuthor,
  }
}