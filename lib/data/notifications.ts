import { mockNotifications } from '@/lib/mock-data/notifications'
import { mockFollows } from '@/lib/mock-data/follows'
import { mockUsers } from '@/lib/mock-data/users'
import { mockPosts } from '@/lib/mock-data/posts'
import { mockComments } from '@/lib/mock-data/interactions'
import type { Notification, User } from '@/lib/types'

export interface NotificationWithContext extends Notification {
  sender: Pick<User, 'id' | 'username'>
  /** Comment text for `comment`, post excerpt for `candle`. Null otherwise. */
  preview: string | null
  /** False once a follow request has been accepted or declined. */
  awaiting_response: boolean
}

const PREVIEW_LIMIT = 80

function truncate(text: string): string {
  return text.length <= PREVIEW_LIMIT
    ? text
    : `${text.slice(0, PREVIEW_LIMIT).trimEnd()}...`
}

export async function getNotifications(
  userId: string
): Promise<NotificationWithContext[]> {
  return mockNotifications
    .filter((n) => n.receiver_id === userId)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .map((n) => {
      const senderUser = mockUsers.find((u) => u.id === n.sender_id)

      let preview: string | null = null
      if (n.type === 'comment' && n.post_id) {
        // The sender's most recent comment on that post.
        const comment = mockComments
          .filter((c) => c.post_id === n.post_id && c.user_id === n.sender_id)
          .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))[0]
        if (comment) preview = truncate(comment.content)
      } else if (n.type === 'candle' && n.post_id) {
        const post = mockPosts.find((p) => p.id === n.post_id)
        if (post) preview = truncate(post.content)
      }

      // follow_request notifications don't store follow_id:
      // the row is always (follower_id = sender_id, followee_id = receiver_id).
      const awaiting_response =
        n.type === 'follow_request' &&
        mockFollows.some(
          (f) =>
            f.follower_id === n.sender_id &&
            f.followee_id === n.receiver_id &&
            f.status === 'pending'
        )

      return {
        ...n,
        sender: {
          id: n.sender_id,
          username: senderUser?.username ?? 'unknown',
        },
        preview,
        awaiting_response,
      }
    })
}

export async function getUnreadCount(userId: string): Promise<number> {
  return mockNotifications.filter(
    (n) => n.receiver_id === userId && !n.is_read
  ).length
}