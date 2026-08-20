import type { Notification } from '@/lib/types'

export const mockNotifications: Notification[] = [
  // Triggered by candle-1 (user-2 candled user-1's post-1)
  {
    id: 'notif-1',
    recipient_id: 'user-1',
    actor_id: 'user-2',
    type: 'candle',
    post_id: 'post-1',
    follow_id: null,
    is_read: false,
    created_at: '2026-08-20T10:15:00Z',
  },
  // Triggered by comment-1
  {
    id: 'notif-2',
    recipient_id: 'user-1',
    actor_id: 'user-2',
    type: 'comment',
    post_id: 'post-1',
    follow_id: null,
    is_read: false,
    created_at: '2026-08-20T10:20:00Z',
  },
  // Triggered by follow-2 (user-3's pending follow request to user-1)
  {
    id: 'notif-3',
    recipient_id: 'user-1',
    actor_id: 'user-3',
    type: 'follow_request',
    post_id: null,
    follow_id: 'follow-2',
    is_read: false,
    created_at: '2026-08-19T12:00:00Z',
  },
]