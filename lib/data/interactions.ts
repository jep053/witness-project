import { createClient } from '@/lib/supabase/server'

import { mockCandles, mockComments } from '@/lib/mock-data/interactions'
import { mockUsers } from '@/lib/mock-data/users'
import type { Comment, User } from '@/lib/types'

/** A comment joined with its author, since Comment only carries user_id. */
export interface CommentWithAuthor extends Comment {
  author: Pick<User, 'id' | 'username'>
}

// NOTE: currently called for every post on a page, including posts whose
// comment section is collapsed. Acceptable against fixtures; see DEFERRED.md
// for the on-expand fetch this becomes in Phase 6.
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
  return mockCandles.some((c) => c.post_id === postId && c.user_id === userId)
}