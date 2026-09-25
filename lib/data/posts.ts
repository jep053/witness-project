import { createClient } from '@/lib/supabase/server'

import { mockPosts, mockPostTags } from '@/lib/mock-data/posts'
import { mockTags } from '@/lib/mock-data/tags'
import { mockGoals } from '@/lib/mock-data/goals'
import { mockPostGoals } from '@/lib/mock-data/post-goals'
import { mockCandles, mockComments } from '@/lib/mock-data/interactions'
import type { Post, Tag, Goal } from '@/lib/types'

import { mockUsers } from '@/lib/mock-data/users'
import { getFollowingIds } from '@/lib/data/follows'
import type { User } from '@/lib/types'

export interface FeedPost extends PostWithMeta {
  author: Pick<User, 'id' | 'username'>
  viewer_follows_author: boolean
}

export async function getFeedPosts(
  viewerId: string | null,
  tagIds?: string[]
): Promise<FeedPost[]> {
  const supabase = await createClient()
  const followingIds = viewerId
    ? await getFollowingIds(viewerId)
    : new Set<string>()

  // profile_visibility (public/followers_only/private) is NOT re-checked
  // here — RLS's can_view_profile() already enforces that on the SELECT.
  // What's left as app-level filtering is is_hidden and excluding the
  // viewer's own posts, neither of which RLS is responsible for.
  let query = supabase
    .from('posts')
    .select('*, users(id, username)')
    .eq('is_hidden', false)
    .order('created_at', { ascending: false })

  if (viewerId) {
    query = query.neq('user_id', viewerId)
  }

  const { data: postsData, error: postsError } = await query

  if (postsError) {
    console.error('[getFeedPosts] posts query failed:', postsError.message)
    return []
  }

  type FeedRow = Post & { users: Pick<User, 'id' | 'username'> | null }
  let rows = (postsData ?? []) as FeedRow[]

  if (tagIds && tagIds.length > 0) {
    const { data: postTagsData, error: filterError } = await supabase
      .from('post_tags')
      .select('post_id')
      .in('tag_id', tagIds)

    if (filterError) {
      console.error('[getFeedPosts] tag filter failed:', filterError.message)
      return []
    }

    const matchingPostIds = new Set((postTagsData ?? []).map((pt) => pt.post_id))
    rows = rows.filter((p) => matchingPostIds.has(p.id))
  }

  const authorByPost = new Map(rows.map((r) => [r.id, r.users]))
  const posts: Post[] = rows.map(({ users, ...post }) => post)

  const meta = await attachMetaBatch(supabase, posts)

  return meta.map((post) => {
    const author = authorByPost.get(post.id)
    return {
      ...post,
      author: author ?? { id: post.user_id, username: 'unknown' },
      viewer_follows_author: followingIds.has(post.user_id),
    }
  })
}

export interface PostWithMeta extends Post {
  tags: Tag[]
  goals: Goal[] // goals this post counted as a check-in toward
  candle_count: number
  comment_count: number
}

// Mock-based single-post meta lookup — still backs getFeedPosts/getUserPosts/
// getPostById until the Others screen's turn (Step 6-2 phase 2).
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

// Real Supabase batch meta lookup — backs getMyPosts. Kept as four parallel
// single-table queries deliberately, so each table's RLS can be verified
// independently. Collapse into one nested select once all four are
// confirmed working against seed data.
async function attachMetaBatch(
  supabase: Awaited<ReturnType<typeof createClient>>,
  posts: Post[]
): Promise<PostWithMeta[]> {
  if (posts.length === 0) return []
  const postIds = posts.map((p) => p.id)

  const [tagsRes, goalsRes, candlesRes, commentsRes] = await Promise.all([
    supabase.from('post_tags').select('post_id, tags(*)').in('post_id', postIds),
    supabase.from('post_goals').select('post_id, goals(*)').in('post_id', postIds),
    supabase.from('candle_lights').select('post_id').in('post_id', postIds),
    supabase.from('comments').select('post_id').in('post_id', postIds),
  ])

  if (tagsRes.error) console.error('[getMyPosts] post_tags failed:', tagsRes.error.message)
  if (goalsRes.error) console.error('[getMyPosts] post_goals failed:', goalsRes.error.message)
  if (candlesRes.error) console.error('[getMyPosts] candle_lights failed:', candlesRes.error.message)
  if (commentsRes.error) console.error('[getMyPosts] comments failed:', commentsRes.error.message)

  const tagsByPost = new Map<string, Tag[]>()
  for (const row of tagsRes.data ?? []) {
    const list = tagsByPost.get(row.post_id) ?? []
    if (row.tags) list.push(row.tags as unknown as Tag)
    tagsByPost.set(row.post_id, list)
  }

  const goalsByPost = new Map<string, Goal[]>()
  for (const row of goalsRes.data ?? []) {
    const list = goalsByPost.get(row.post_id) ?? []
    if (row.goals) list.push(row.goals as unknown as Goal)
    goalsByPost.set(row.post_id, list)
  }

  const candleCountByPost = new Map<string, number>()
  for (const row of candlesRes.data ?? []) {
    candleCountByPost.set(row.post_id, (candleCountByPost.get(row.post_id) ?? 0) + 1)
  }

  const commentCountByPost = new Map<string, number>()
  for (const row of commentsRes.data ?? []) {
    commentCountByPost.set(row.post_id, (commentCountByPost.get(row.post_id) ?? 0) + 1)
  }

  return posts.map((post) => ({
    ...post,
    tags: tagsByPost.get(post.id) ?? [],
    goals: goalsByPost.get(post.id) ?? [],
    candle_count: candleCountByPost.get(post.id) ?? 0,
    comment_count: commentCountByPost.get(post.id) ?? 0,
  }))
}

// Posts belonging to the current user (My Journey feed).
// tagIds: optional multi-select filter, OR logic — matches confirmed spec.
export async function getMyPosts(
  userId: string,
  tagIds?: string[]
): Promise<PostWithMeta[]> {
  const supabase = await createClient()

  const { data: postsData, error: postsError } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (postsError) {
    console.error('[getMyPosts] posts query failed:', postsError.message)
    return []
  }

  let posts = (postsData ?? []) as Post[]

  if (tagIds && tagIds.length > 0) {
    const { data: postTagsData, error: filterError } = await supabase
      .from('post_tags')
      .select('post_id')
      .in('tag_id', tagIds)

    if (filterError) {
      console.error('[getMyPosts] tag filter failed:', filterError.message)
      return []
    }

    const matchingPostIds = new Set((postTagsData ?? []).map((pt) => pt.post_id))
    posts = posts.filter((p) => matchingPostIds.has(p.id))
  }

  return attachMetaBatch(supabase, posts)
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