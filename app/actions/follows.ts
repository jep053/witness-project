'use server'

import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth/require-auth'
import { createClient } from '@/lib/supabase/server'

export type RespondToFollowResult = { status: 'accepted' | 'declined' } | { error: string }
export type SendFollowResult = { status: 'pending' } | { error: string }

export async function sendFollowRequest(
  followeeId: string,
  currentPath: string
): Promise<SendFollowResult> {
  const user = await requireAuth(currentPath)

  if (user.id === followeeId) {
    return { error: 'You cannot follow yourself.' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('follows')
    .insert({ follower_id: user.id, followee_id: followeeId })

  // 23505: a follows row already exists for this pair (UNIQUE on
  // (follower_id, followee_id)) — treat as already-requested rather than
  // an error, in case of a double click or stale UI state.
  if (error && error.code !== '23505') {
    console.error('[sendFollowRequest] insert failed:', error.message)
    return { error: 'Could not send follow request.' }
  }

  revalidatePath('/profile/[username]', 'page')
  return { status: 'pending' }
}

export type RemoveFollowResult = { status: null } | { error: string }

// Covers both "cancel my pending request" and "unfollow" — same row,
// same delete policy (the follower side may always remove the row).
export async function removeFollow(
  followeeId: string,
  currentPath: string
): Promise<RemoveFollowResult> {
  const user = await requireAuth(currentPath)
  const supabase = await createClient()

  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('followee_id', followeeId)

  if (error) {
    console.error('[removeFollow] delete failed:', error.message)
    return { error: 'Could not update follow status.' }
  }

  revalidatePath(`/profile`)
  return { status: null }
}

export async function respondToFollowRequest(
  requesterId: string,
  accept: boolean,
  currentPath: string
): Promise<RespondToFollowResult> {
  const user = await requireAuth(currentPath)
  const supabase = await createClient()

  if (accept) {
    const { error } = await supabase
      .from('follows')
      .update({ status: 'accepted', accepted_at: new Date().toISOString() })
      .eq('follower_id', requesterId)
      .eq('followee_id', user.id)
      .eq('status', 'pending')

    if (error) {
      console.error('[respondToFollowRequest] accept failed:', error.message)
      return { error: 'Could not accept the request.' }
    }

    revalidatePath('/notifications')
    return { status: 'accepted' }
  }

  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', requesterId)
    .eq('followee_id', user.id)
    .eq('status', 'pending')

  if (error) {
    console.error('[respondToFollowRequest] decline failed:', error.message)
    return { error: 'Could not decline the request.' }
  }

  revalidatePath('/notifications')
  return { status: 'declined' }
}