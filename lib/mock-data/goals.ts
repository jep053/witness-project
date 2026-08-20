import type { Goal } from '@/lib/types'

export const mockGoals: Goal[] = [
  {
    id: 'goal-1',
    user_id: 'user-1',
    title: 'Ship Witness MVP',
    status: 'active',
    cadence: 'daily',
    weekly_target_count: null,
    created_at: '2026-01-15T09:00:00Z',
    activated_at: '2026-01-15T09:00:00Z',
  },
  {
    id: 'goal-2',
    user_id: 'user-1',
    title: 'Read one book a month',
    status: 'active',
    cadence: 'weekly_count',
    weekly_target_count: 2,
    created_at: '2026-01-20T09:00:00Z',
    activated_at: '2026-01-22T09:00:00Z',
  },
  {
    id: 'goal-3',
    user_id: 'user-1',
    title: 'Learn Korean calligraphy',
    status: 'planned', // not active yet — doesn't factor into Bonfire brightness
    cadence: null,
    weekly_target_count: null,
    created_at: '2026-02-01T09:00:00Z',
    activated_at: null,
  },
]