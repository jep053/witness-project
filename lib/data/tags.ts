import { mockTags, addMockTag } from '@/lib/mock-data/tags'
import type { Tag } from '@/lib/types'

export async function getAllTags(): Promise<Tag[]> {
  return mockTags
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