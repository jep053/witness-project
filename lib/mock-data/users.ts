import type { User, UserSettings } from '@/lib/types'

export const mockUsers: User[] = [
  {
    id: 'user-1',
    username: 'jeongmin',
    display_name: 'Jeong Min',
    avatar_url: null,
    bio: 'Building Witness. Comparing with past self.',
    profile_visibility: 'public',
    created_at: '2026-01-10T09:00:00Z',
  },
  {
    id: 'user-2',
    username: 'david',
    display_name: 'David',
    avatar_url: null,
    bio: 'Designing Witness.',
    profile_visibility: 'public',
    created_at: '2026-01-12T09:00:00Z',
  },
  {
    id: 'user-3',
    username: 'runner_kim',
    display_name: 'Kim',
    avatar_url: null,
    bio: 'Training for a marathon.',
    profile_visibility: 'followers_only',
    created_at: '2026-02-01T09:00:00Z',
  },
  {
    id: 'user-4',
    username: 'quiet_lee',
    display_name: 'Lee',
    avatar_url: null,
    bio: 'Writing for a small circle.',
    profile_visibility: 'followers_only',
    created_at: '2026-02-10T09:00:00Z',
  },
  {
    id: 'user-5',
    username: 'solo_park',
    display_name: 'Park',
    avatar_url: null,
    bio: 'Keeping this to myself.',
    profile_visibility: 'private',
    created_at: '2026-02-15T09:00:00Z',
  },
]

export const mockUserSettings: UserSettings[] = mockUsers.map((u) => ({
  user_id: u.id,
  notify_candle: true,
  notify_comment: true,
  notify_follow_request: true,
  notify_follow_accepted: true,
  language: 'en',
}))