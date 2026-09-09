import { createClient } from '@/lib/supabase/server'
import { mockTags, addMockTag } from '@/lib/mock-data/tags'
import type { Tag } from '@/lib/types'
import { mockPosts } from '@/lib/mock-data/posts'
import { mockPostTags } from '@/lib/mock-data/posts'

export async function searchTags(query: string): Promise<Tag[]> {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return mockTags.filter((t) => t.name.toLowerCase().includes(q))
}

export async function getAllTags(): Promise<Tag[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('tags').select('*').order('name')

  if (error) {
    console.error('[getAllTags] query failed:', error.message)
    return []
  }
  return data
}


// Reuses an existing tag by name (case-insensitive), or creates a new one.
// Matches confirmed spec: "기존 태그와 이름이 같으면 재사용, 없으면 새로 생성".
export async function getOrCreateTag(name: string): Promise<Tag> {
  const trimmed = name.trim()
  const existing = mockTags.find(
    (t) => t.name.toLowerCase() === trimmed.toLowerCase()
  )
  if (existing) return existing

  return addMockTag(trimmed)
}

// Tags are stored globally and shared across users — two people writing
// "workout" get the same tag row. Filter UIs should use this instead of
// getAllTags(), so the chip list stays scoped to what the user actually
// writes about rather than growing with every tag anyone creates.
export async function getMyTags(userId: string): Promise<Tag[]> {
  const supabase = await createClient()

  // Inner-joins post_tags -> posts to scope tags to what this user has
  // actually posted with, then -> tags for the display row.
  const { data, error } = await supabase
    .from('post_tags')
    .select('tags(*), posts!inner(user_id)')
    .eq('posts.user_id', userId)

  if (error) {
    console.error('[getMyTags] query failed:', error.message)
    return []
  }

  const seen = new Map<string, Tag>()
  for (const row of data) {
    const tag = row.tags as unknown as Tag
    if (tag) seen.set(tag.id, tag)
  }
  return [...seen.values()]
}
