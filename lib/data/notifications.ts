import { mockNotifications } from '@/lib/mock-data/notifications'
import { mockFollows } from '@/lib/mock-data/follows'
import type { Notification } from '@/lib/types'

export async function getNotifications(userId: string): Promise<Notification[]> {
  return mockNotifications
    .filter((n) => n.recipient_id === userId)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
}

// Used to resolve whether a follow_request notification's action buttons
// should still show (per spec: buttons disappear once the request is
// accepted/declined).
export async function getFollowStatus(followId: string) {
  return mockFollows.find((f) => f.id === followId) ?? null
}