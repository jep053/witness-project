import { mockGoals } from '@/lib/mock-data/goals'
import { mockPostGoals } from '@/lib/mock-data/post-goals'
import { mockPosts } from '@/lib/mock-data/posts'
import type { Goal } from '@/lib/types'

export async function getGoals(userId: string): Promise<Goal[]> {
  return mockGoals.filter((g) => g.user_id === userId)
}

export async function getActiveGoals(userId: string): Promise<Goal[]> {
  return mockGoals.filter((g) => g.user_id === userId && g.status === 'active')
}

// Monday–Sunday week containing the given date.
// ASSUMPTION: using a fixed calendar week rather than a rolling 7-day
// window. Revisit if a rolling window is actually wanted.
function getWeekRange(referenceDate: Date) {
  const day = referenceDate.getDay() // 0 = Sunday
  const diffToMonday = day === 0 ? -6 : 1 - day
  const start = new Date(referenceDate)
  start.setDate(referenceDate.getDate() + diffToMonday)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

// Posts linked to a given goal, created within the current week.
function getThisWeekCheckIns(goalId: string, now: Date) {
  const { start, end } = getWeekRange(now)
  const linkedPostIds = new Set(
    mockPostGoals.filter((pg) => pg.goal_id === goalId).map((pg) => pg.post_id)
  )

  return mockPosts.filter((p) => {
    if (!linkedPostIds.has(p.id)) return false
    const createdAt = new Date(p.created_at)
    return createdAt >= start && createdAt <= end
  })
}

// Completion ratio (0–1) for a single active goal, based on its cadence.
function getGoalCompletionRatio(goal: Goal, now: Date): number {
  const checkIns = getThisWeekCheckIns(goal.id, now)

  if (goal.cadence === 'daily') {
    // Unique calendar days this week with a check-in, out of 7.
    const uniqueDays = new Set(
      checkIns.map((p) => new Date(p.created_at).toDateString())
    )
    return Math.min(uniqueDays.size / 7, 1)
  }

  if (goal.cadence === 'weekly_count' && goal.weekly_target_count) {
    return Math.min(checkIns.length / goal.weekly_target_count, 1)
  }

  return 0
}

// Bonfire brightness = average completion ratio across all active goals.
// No active goals yet → brightness is 0 (unlit). A goal has to be
// created and activated with a target before the fire starts building.
export async function getBonfireBrightness(userId: string): Promise<number> {
  const activeGoals = await getActiveGoals(userId)
  if (activeGoals.length === 0) return 0

  const now = new Date()
  const ratios = activeGoals.map((goal) => getGoalCompletionRatio(goal, now))

  return ratios.reduce((sum, r) => sum + r, 0) / ratios.length
}