import { createClient } from '@/lib/supabase/server'
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
  const supabase = await createClient()

  // notifications has two FKs to users (sender_id, receiver_id), so the
  // join needs the explicit FK name to disambiguate which one to follow.
  const { data: notifData, error: notifError } = await supabase
    .from('notifications')
    .select('*, users!notifications_sender_id_fkey(id, username)')
    .eq('receiver_id', userId)
    .order('created_at', { ascending: false })

  if (notifError) {
    console.error('[getNotifications] query failed:', notifError.message)
    return []
  }

  type NotifRow = Notification & {
    users: Pick<User, 'id' | 'username'> | null
  }
  const notifications = (notifData ?? []) as NotifRow[]
  if (notifications.length === 0) return []

  const postIds = [
    ...new Set(notifications.filter((n) => n.post_id).map((n) => n.post_id as string)),
  ]
  const hasFollowRequests = notifications.some((n) => n.type === 'follow_request')

  // Independent, parallel — same reasoning as attachMetaBatch: keep each
  // table's RLS separately debuggable rather than folding into one nested
  // select before all three are confirmed working against seed data.
  const [postsRes, commentsRes, followsRes] = await Promise.all([
    postIds.length > 0
      ? supabase.from('posts').select('id, content').in('id', postIds)
      : Promise.resolve({ data: [] as { id: string; content: string }[], error: null }),
    postIds.length > 0
      ? supabase
          .from('comments')
          .select('post_id, user_id, content, created_at')
          .in('post_id', postIds)
      : Promise.resolve({
          data: [] as { post_id: string; user_id: string; content: string; created_at: string }[],
          error: null,
        }),
    hasFollowRequests
      ? supabase
          .from('follows')
          .select('follower_id')
          .eq('followee_id', userId)
          .eq('status', 'pending')
      : Promise.resolve({ data: [] as { follower_id: string }[], error: null }),
  ])

  if (postsRes.error) console.error('[getNotifications] posts failed:', postsRes.error.message)
  if (commentsRes.error) console.error('[getNotifications] comments failed:', commentsRes.error.message)
  if (followsRes.error) console.error('[getNotifications] follows failed:', followsRes.error.message)

  const postContentById = new Map((postsRes.data ?? []).map((p) => [p.id, p.content]))
  const pendingFollowerIds = new Set((followsRes.data ?? []).map((f) => f.follower_id))

  // Most recent comment per (post, sender) — mirrors the mock version's intent.
  const latestComment = new Map<string, { content: string; created_at: string }>()
  for (const c of commentsRes.data ?? []) {
    const key = `${c.post_id}:${c.user_id}`
    const existing = latestComment.get(key)
    if (!existing || c.created_at > existing.created_at) {
      latestComment.set(key, { content: c.content, created_at: c.created_at })
    }
  }

  return notifications.map((n) => {
    let preview: string | null = null
    if (n.type === 'comment' && n.post_id) {
      const comment = latestComment.get(`${n.post_id}:${n.sender_id}`)
      if (comment) preview = truncate(comment.content)
    } else if (n.type === 'candle' && n.post_id) {
      const content = postContentById.get(n.post_id)
      if (content) preview = truncate(content)
    }

    // follow_request notifications don't store follow_id: the row is
    // always (follower_id = sender_id, followee_id = receiver_id).
    const awaiting_response =
      n.type === 'follow_request' && pendingFollowerIds.has(n.sender_id)

    return {
      ...n,
      sender: n.users ?? { id: n.sender_id, username: 'unknown' },
      preview,
      awaiting_response,
    }
  })
}

export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', userId)
    .eq('is_read', false)

  if (error) {
    console.error('[getUnreadCount] query failed:', error.message)
    return 0
  }
  return count ?? 0
}