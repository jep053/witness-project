import type { PostGoal } from '@/lib/types'

// A post linked to a goal = a check-in toward that goal's weekly target.
export const mockPostGoals: PostGoal[] = [
  { post_id: 'post-1', goal_id: 'goal-1' }, // Aug 20 check-in for "Ship Witness MVP" (daily)
  { post_id: 'post-2', goal_id: 'goal-2' }, // Aug 19 check-in for "Read one book a month" (weekly_count: 2)
]