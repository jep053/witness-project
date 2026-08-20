import { mockPosts, mockPostTags } from '@/lib/mock-data/posts'
import { mockTags } from '@/lib/mock-data/tags'
import { mockGoals } from '@/lib/mock-data/goals'
import { mockPostGoals } from '@/lib/mock-data/post-goals'
import { mockCandles, mockComments } from '@/lib/mock-data/interactions'
import type { Post, Tag, Goal } from '@/lib/types'

export interface PostWithMeta extends Post {
  tags: Tag[]
  goals: Goal[] // goals this post counted as a check-in toward
  candle_count: number
  comment_count: number
}

function attachMeta(post: Post): PostWithMeta {
  const tagIds = mockPostTags
    .filter((pt) => pt.post_id === post.id)
    .map((pt) => pt.tag_id)

  const goalIds = mockPostGoals
    .filter((pg) => pg.post_id === post.id)
    .map((pg) => pg.goal_id)

  return {
    ...post,
    tags: mockTags.filter((t) => tagIds.includes(t.id)),
    goals: mockGoals.filter((g) => goalIds.includes(g.id)),
    candle_count: mockCandles.filter((c) => c.post_id === post.id).length,
    comment_count: mockComments.filter((c) => c.post_id === post.id).length,
  }
}

// Posts belonging to the current user (My Journey feed).
// tagIds: optional multi-select filter, OR logic — matches confirmed spec.
export async function getMyPosts(
  userId: string,
  tagIds?: string[]
): Promise<PostWithMeta[]> {
  let posts = mockPosts.filter((p) => p.user_id === userId)

  if (tagIds && tagIds.length > 0) {
    const matchingPostIds = new Set(
      mockPostTags
        .filter((pt) => tagIds.includes(pt.tag_id))
        .map((pt) => pt.post_id)
    )
    posts = posts.filter((p) => matchingPostIds.has(p.id))
  }

  return posts.map(attachMeta).sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
}

// Posts from a specific user, respecting is_hidden — used on Others' profile pages.
// Visibility (profile_visibility) should be checked by the caller before
// calling this, since that's an account-level gate, not a post-level one.
export async function getUserPosts(
  userId: string,
  tagIds?: string[]
): Promise<PostWithMeta[]> {
  let posts = mockPosts.filter((p) => p.user_id === userId && !p.is_hidden)

  if (tagIds && tagIds.length > 0) {
    const matchingPostIds = new Set(
      mockPostTags
        .filter((pt) => tagIds.includes(pt.tag_id))
        .map((pt) => pt.post_id)
    )
    posts = posts.filter((p) => matchingPostIds.has(p.id))
  }

  return posts.map(attachMeta).sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
}

export async function getPostById(postId: string): Promise<PostWithMeta | null> {
  const post = mockPosts.find((p) => p.id === postId)
  return post ? attachMeta(post) : null
}