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
  return mockComments
    .filter((c) => c.post_id === postId)
    .sort((a, b) => (a.created_at > b.created_at ? 1 : -1))
    .map((c) => {
      const author = mockUsers.find((u) => u.id === c.user_id)
      return {
        ...c,
        author: {
          id: c.user_id,
          username: author?.username ?? 'unknown',
        },
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