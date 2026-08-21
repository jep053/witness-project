import { mockUsers } from '@/lib/mock-data/users'
import type { User } from '@/lib/types'

export async function getUserByUsername(username: string): Promise<User | null> {
  return mockUsers.find((u) => u.username === username) ?? null
}

export async function getUserById(userId: string): Promise<User | null> {
  return mockUsers.find((u) => u.id === userId) ?? null
}