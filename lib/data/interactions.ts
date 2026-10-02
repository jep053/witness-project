import { createClient } from '@/lib/supabase/server'
import type { Comment, User } from '@/lib/types'

export interface CommentWithAuthor extends Comment {
  author: Pick<User, 'id' | 'username'>
}

export async function getComments(postId: string): Promise<CommentWithAuthor[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('comments')
    .select('*, users(id, username)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[getComments] query failed:', error.message)
    return []
  }

  return (data ?? []).map((c) => {
    const author = c.users as unknown as Pick<User, 'id' | 'username'> | null
    return {
      ...c,
      author: author ?? { id: c.user_id, username: 'unknown' },
    }
  })
}

/** Whether the given user has lit a candle on the given post. */
export async function hasLitCandle(
  postId: string,
  userId: string
): Promise<boolean> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('candle_lights')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('[hasLitCandle] query failed:', error.message)
    return false
  }
  return data !== null
}