import type { Goal, GoalCadenceType, CadenceConfig } from '@/lib/types'

// `let` instead of `const` — same reasoning as tags: goals get created
// and activated during mock-stage testing, so the array needs to grow
// and existing entries need to be updatable (planned → active).
export let mockGoals: Goal[] = [
  {
    id: 'goal-1',
    user_id: 'user-1',
    title: 'Ship Witness MVP',
    description: null,
    status: 'active',
    cadence_type: 'daily',
    cadence_config: { type: 'daily' },
    streak_count: 3,
    last_recorded_at: '2026-08-20T09:00:00Z',
    created_at: '2026-01-15T09:00:00Z',
  },
  {
    id: 'goal-2',
    user_id: 'user-1',
    title: 'Read one book a month',
    description: null,
    status: 'active',
    cadence_type: 'weekly_count',
    cadence_config: { type: 'weekly_count', target: 2 },
    streak_count: 1,
    last_recorded_at: '2026-08-17T09:00:00Z',
    created_at: '2026-01-20T09:00:00Z',
  },
  {
    id: 'goal-3',
    user_id: 'user-1',
    title: 'Learn Korean calligraphy',
    description: null,
    status: 'planned', // not active yet — excluded from Bonfire brightness
    cadence_type: null,
    cadence_config: null,
    streak_count: 0,
    last_recorded_at: null,
    created_at: '2026-02-01T09:00:00Z',
  },
  // user-2 (David) — public profile, so his goals are visible to everyone.
  // Titles show on his profile; per-goal progress does not.
  {
    id: 'goal-4',
    user_id: 'user-2',
    title: 'Sketch every morning',
    description: null,
    status: 'active',
    cadence_type: 'daily',
    cadence_config: { type: 'daily' },
    streak_count: 5,
    last_recorded_at: '2026-08-24T08:00:00Z',
    created_at: '2026-01-12T09:00:00Z',
  },
  // user-3 (Kim) — followers_only, and user-1 is an accepted follower,
  // so this exercises the middle privacy tier on the profile screen.
  {
    id: 'goal-5',
    user_id: 'user-3',
    title: 'Marathon training',
    description: null,
    status: 'active',
    cadence_type: 'weekly_count',
    cadence_config: { type: 'weekly_count', target: 4 },
    streak_count: 2,
    last_recorded_at: '2026-08-23T07:30:00Z',
    created_at: '2026-02-01T09:00:00Z',
  },
]

let nextGoalId = 4

// Adding a goal from the "비활성 목표" tab: title only, no cadence yet.
export function addPlannedGoal(userId: string, title: string): Goal {
  const newGoal: Goal = {
    id: `goal-${nextGoalId++}`,
    user_id: userId,
    title,
    description: null,
    status: 'planned',
    cadence_type: null,
    cadence_config: null,
    streak_count: 0,
    last_recorded_at: null,
    created_at: new Date().toISOString(),
  }
  mockGoals.push(newGoal)
  return newGoal
}

// Adding a goal from the "활성 목표" tab: cadence required immediately.
export function addActiveGoal(
  userId: string,
  title: string,
  cadenceType: GoalCadenceType,
  cadenceConfig: CadenceConfig | null
): Goal {
  const newGoal: Goal = {
    id: `goal-${nextGoalId++}`,
    user_id: userId,
    title,
    description: null,
    status: 'active',
    cadence_type: cadenceType,
    cadence_config: cadenceConfig,
    streak_count: 0,
    last_recorded_at: null,
    created_at: new Date().toISOString(),
  }
  mockGoals.push(newGoal)
  return newGoal
}

// Activation flow: a planned goal picks a cadence and moves to active,
// joining the Bonfire brightness calculation.
export function activateGoal(
  goalId: string,
  cadenceType: GoalCadenceType,
  cadenceConfig: CadenceConfig | null
): Goal | null {
  const goal = mockGoals.find((g) => g.id === goalId)
  if (!goal) return null

  goal.status = 'active'
  goal.cadence_type = cadenceType
  goal.cadence_config = cadenceConfig

  return goal
}
