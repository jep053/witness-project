import {
  mockGoals,
  addPlannedGoal,
  addActiveGoal,
  activateGoal,
} from '@/lib/mock-data/goals'
import { mockPostGoals } from '@/lib/mock-data/post-goals'
import { mockPosts } from '@/lib/mock-data/posts'
import type { Goal, GoalCadence, BrightnessTier } from '@/lib/types'

/**
 * Per-goal brightness for the goal grid.
 *
 * Deliberately a separate path from getBonfireBrightness(): the bonfire
 * averages raw ratios and quantizes once at the end, while each card
 * quantizes its own ratio. Averaging these tiers would be the rejected
 * approach — see DECISIONS.md.
 */
export async function getGoalTiers(
  userId: string
): Promise<Map<string, BrightnessTier>> {
  const activeGoals = await getActiveGoals(userId)
  const now = new Date()

  return new Map(
    activeGoals.map((goal) => [
      goal.id,
      getBrightnessTier(getGoalCompletionRatio(goal, now)),
    ])
  )
}

export async function getGoals(userId: string): Promise<Goal[]> {
  return mockGoals.filter((g) => g.user_id === userId)
}

export async function getActiveGoals(userId: string): Promise<Goal[]> {
  return mockGoals.filter((g) => g.user_id === userId && g.status === 'active')
}

export async function getPlannedGoals(userId: string): Promise<Goal[]> {
  return mockGoals.filter((g) => g.user_id === userId && g.status === 'planned')
}

// Created from the "Planned goals" tab with a title only.
export async function createPlannedGoal(userId: string, title: string): Promise<Goal> {
  return addPlannedGoal(userId, title)
}

// Created from the "Active goals" tab, where cadence is required.
export async function createActiveGoal(
  userId: string,
  title: string,
  cadence: GoalCadence,
  weeklyTargetCount: number | null
): Promise<Goal> {
  return addActiveGoal(userId, title, cadence, weeklyTargetCount)
}

// Called from a planned goal card's [Activate] button, after cadence is chosen.
export async function activateGoalById(
  goalId: string,
  cadence: GoalCadence,
  weeklyTargetCount: number | null
): Promise<Goal | null> {
  return activateGoal(goalId, cadence, weeklyTargetCount)
}

// Monday–Sunday week containing the given date.
// ASSUMPTION: fixed calendar week, not a rolling 7-day window.
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

// Bonfire brightness as a 0–1 ratio (average completion across active goals).
// No active goals → 0 (unlit).
export async function getBonfireBrightness(userId: string): Promise<number> {
  const activeGoals = await getActiveGoals(userId)
  if (activeGoals.length === 0) return 0

  const now = new Date()
  const ratios = activeGoals.map((goal) => getGoalCompletionRatio(goal, now))

  return ratios.reduce((sum, r) => sum + r, 0) / ratios.length
}

// Confirmed bands: 0–24% → 1, 25–49% → 2, 50–74% → 3, 75–100% → 4.
export function getBrightnessTier(ratio: number): BrightnessTier {
  const percent = ratio * 100
  if (percent >= 75) return 4
  if (percent >= 50) return 3
  if (percent >= 25) return 2
  return 1
}