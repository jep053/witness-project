import { createClient } from '@/lib/supabase/server'
import { normalizeTagName } from '@/lib/validation/tags'
import type { Tag } from '@/lib/types'

type TagJoinRow = { tags: Tag | Tag[] | null }

function dedupeTags(rows: TagJoinRow[]): Tag[] {
  const seen = new Map<string, Tag>()
  for (const row of rows) {
    const tag = (Array.isArray(row.tags) ? row.tags[0] : row.tags) as Tag | null
    if (tag) seen.set(tag.id, tag)
  }
  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name))
}

// Only tags attached to at least one post the viewer can see. post_tags
// follows post visibility under RLS, so this needs no extra filtering: it
// hides ghost tags (no posts) and tags that exist only on someone's
// "Only me" posts. Note: PostgREST caps a response at 1000 rows by default —
// fine for MVP; revisit if the tag list ever needs pagination.
export async function getAllTags(): Promise<Tag[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('post_tags').select('tags(*)')

  if (error) {
    console.error('[getAllTags] query failed:', error.message)
    return []
  }
  return dedupeTags((data ?? []) as unknown as TagJoinRow[])
}

export async function searchTags(query: string): Promise<Tag[]> {
  const q = query.trim()
  if (!q) return []

  // Escape LIKE wildcards so a user typing "%" or "_" isn't a pattern.
  const escaped = q.replace(/[\\%_]/g, '\\$&')

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('post_tags')
    .select('tags!inner(*)')
    .ilike('tags.name', `%${escaped}%`)

  if (error) {
    console.error('[searchTags] query failed:', error.message)
    return []
  }
  return dedupeTags((data ?? []) as unknown as TagJoinRow[])
}

// Reuses an existing tag by (normalized) name, or creates it. Called only
// from createPost — never from the client directly, so a tag is never
// created without a post about to use it.
export async function getOrCreateTag(rawName: string): Promise<Tag | null> {
  const name = normalizeTagName(rawName)
  const supabase = await createClient()

  const find = () =>
    supabase.from('tags').select('*').eq('name', name).maybeSingle()

  const { data: existing } = await find()
  if (existing) return existing as Tag

  const { data: created, error } = await supabase
    .from('tags')
    .insert({ name })
    .select()
    .single()

  if (!error) return created as Tag

  // Two requests created the same tag at once; the unique index on
  // lower(name) rejected the loser. Fetch the winner's row.
  if (error.code === '23505') {
    const { data: raced } = await find()
    return (raced as Tag | null) ?? null
  }

  console.error('[getOrCreateTag] insert failed:', error.message)
  return null
}

// Tags are stored globally and shared across users — two people writing
// "workout" get the same tag row. Filter UIs should use this instead of
// getAllTags(), so the chip list stays scoped to what the user actually
// writes about rather than growing with every tag anyone creates.
export async function getMyTags(userId: string): Promise<Tag[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('post_tags')
    .select('tags(*), posts!inner(user_id)')
    .eq('posts.user_id', userId)

  if (error) {
    console.error('[getMyTags] query failed:', error.message)
    return []
  }
  return dedupeTags((data ?? []) as unknown as TagJoinRow[])
}