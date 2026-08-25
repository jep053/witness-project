import { mockUsers } from '@/lib/mock-data/users'
import type { User } from '@/lib/types'

// Private and followers-only profiles are discoverable by design: the profile
// page renders its header and a Follow button, and gates only the content.
// See Profile wireframe.
export async function searchUsers(
  query: string,
  viewerId: string | null
): Promise<User[]> {
  const q = query.trim().toLowerCase()
  if (!q) return []

  return mockUsers.filter(
    (u) => u.id !== viewerId && u.username.toLowerCase().includes(q)
  )
}

export async function getUserByUsername(username: string): Promise<User | null> {
  return mockUsers.find((u) => u.username === username) ?? null
}

export async function getUserById(userId: string): Promise<User | null> {
  return mockUsers.find((u) => u.id === userId) ?? null
}