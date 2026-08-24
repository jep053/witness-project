import type { Follow } from '@/lib/types'

export const mockFollows: Follow[] = [
  // user-2 (David) follows user-1 (Jeong Min) — already accepted
  {
    id: 'follow-1',
    follower_id: 'user-2',
    followee_id: 'user-1',
    status: 'accepted',
    created_at: '2026-01-13T09:00:00Z',
  },
  // user-3 (Kim) requested to follow user-1 — still pending
  {
    id: 'follow-2',
    follower_id: 'user-3',
    followee_id: 'user-1',
    status: 'pending',
    created_at: '2026-08-19T12:00:00Z',
  },
]