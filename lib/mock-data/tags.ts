import type { Tag } from '@/lib/types'

// `let` instead of `const` — mock data needs to grow when users create
// new custom tags. In-memory only: resets on server restart, which is
// fine for this MVP mock stage (real Supabase will remove this concern).
export let mockTags: Tag[] = [
  { id: 'tag-1', name: 'coding' },
  { id: 'tag-2', name: 'exercise' },
  { id: 'tag-3', name: 'reading' },
  { id: 'tag-4', name: 'mindfulness' },
]

let nextTagId = 5

export function addMockTag(name: string): Tag {
  const newTag: Tag = { id: `tag-${nextTagId++}`, name }
  mockTags.push(newTag)
  return newTag
}