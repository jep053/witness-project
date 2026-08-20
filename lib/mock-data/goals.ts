import type { Goal, GoalCadence } from '@/lib/types'

// `let` instead of `const` — same reasoning as tags: goals get created
// and activated during mock-stage testing, so the array needs to grow
// and existing entries need to be updatable (planned → active).
export let mockGoals: Goal[] = [
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
    status: 'planned', // not active yet — excluded from Bonfire brightness
    cadence: null,
    weekly_target_count: null,
    created_at: '2026-02-01T09:00:00Z',
    activated_at: null,
  },
]

let nextGoalId = 4

// Adding a goal from the "비활성 목표" tab: title only, no cadence yet.
export function addPlannedGoal(userId: string, title: string): Goal {
  const newGoal: Goal = {
    id: `goal-${nextGoalId++}`,
    user_id: userId,
    title,
    status: 'planned',
    cadence: null,
    weekly_target_count: null,
    created_at: new Date().toISOString(),
    activated_at: null,
  }
  mockGoals.push(newGoal)
  return newGoal
}

// Adding a goal from the "활성 목표" tab: cadence required immediately.
export function addActiveGoal(
  userId: string,
  title: string,
  cadence: GoalCadence,
  weeklyTargetCount: number | null
): Goal {
  const newGoal: Goal = {
    id: `goal-${nextGoalId++}`,
    user_id: userId,
    title,
    status: 'active',
    cadence,
    weekly_target_count: cadence === 'weekly_count' ? weeklyTargetCount : null,
    created_at: new Date().toISOString(),
    activated_at: new Date().toISOString(),
  }
  mockGoals.push(newGoal)
  return newGoal
}

// Activation flow: a planned goal picks a cadence and moves to active,
// joining the Bonfire brightness calculation.
export function activateGoal(
  goalId: string,
  cadence: GoalCadence,
  weeklyTargetCount: number | null
): Goal | null {
  const goal = mockGoals.find((g) => g.id === goalId)
  if (!goal) return null

  goal.status = 'active'
  goal.cadence = cadence
  goal.weekly_target_count = cadence === 'weekly_count' ? weeklyTargetCount : null
  goal.activated_at = new Date().toISOString()

  return goal
}