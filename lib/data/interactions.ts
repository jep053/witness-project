import type { Candle, Comment } from '@/lib/types'

export const mockCandles: Candle[] = [
  // user-2 sent a candle to user-1's post-1
  {
    id: 'candle-1',
    post_id: 'post-1',
    user_id: 'user-2',
    created_at: '2026-08-20T10:15:00Z',
  },
]

export const mockComments: Comment[] = [
  {
    id: 'comment-1',
    post_id: 'post-1',
    user_id: 'user-2',
    content: 'Nice work on the auth flow!',
    created_at: '2026-08-20T10:20:00Z',
  },
]