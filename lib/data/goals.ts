import { createClient } from '@/lib/supabase/server'
import {
  addPlannedGoal,
  addActiveGoal,
  activateGoal,
} from '@/lib/mock-data/goals'
import type { Goal, GoalCadenceType, CadenceConfig, BrightnessTier } from '@/lib/types'

export async function getGoals(userId: string): Promise<Goal[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[getGoals] query failed:', error.message)
    return []
  }
  return data as Goal[]
}

export async function getActiveGoals(userId: string): Promise<Goal[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[getActiveGoals] query failed:', error.message)
    return []
  }
  return data as Goal[]
}

export async function getPlannedGoals(userId: string): Promise<Goal[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'planned')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[getPlannedGoals] query failed:', error.message)
    return []
  }
  return data as Goal[]
}

// Write path — stays on mock until 6-4.
export async function createPlannedGoal(userId: string, title: string): Promise<Goal> {
  return addPlannedGoal(userId, title)
}

export async function createActiveGoal(
  userId: string,
  title: string,
  cadenceType: GoalCadenceType,
  cadenceConfig: CadenceConfig | null
): Promise<Goal> {
  return addActiveGoal(userId, title, cadenceType, cadenceConfig)
}

export async function activateGoalById(
  goalId: string,
  cadenceType: GoalCadenceType,
  cadenceConfig: CadenceConfig | null
): Promise<Goal | null> {
  return activateGoal(goalId, cadenceType, cadenceConfig)
}

// Monday–Sunday week containing the given date.
// ASSUMPTION: fixed calendar week, not a rolling 7-day window.
function getWeekRange(referenceDate: Date) {
  const day = referenceDate.getDay()
  const diffToMonday = day === 0 ? -6 : 1 - day
  const start = new Date(referenceDate)
  start.setDate(referenceDate.getDate() + diffToMonday)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

// Real check-ins for one goal within the current calendar week.
//
// NOTE: seed posts are dated in August; "this week" is evaluated against
// the real current date, so against seed data alone this returns 0
// check-ins and every tier reads as 1 (unlit). Expected — resolves once
// posts start being created for real through the write path (6-4).
async function getThisWeekCheckIns(
  supabase: Awaited<ReturnType<typeof createClient>>,
  goalId: string,
  now: Date
): Promise<{ created_at: string }[]> {
  const { start, end } = getWeekRange(now)

  const { data, error } = await supabase
    .from('post_goals')
    .select('posts!inner(created_at)')
    .eq('goal_id', goalId)
    .gte('posts.created_at', start.toISOString())
    .lte('posts.created_at', end.toISOString())

  if (error) {
    console.error('[getThisWeekCheckIns] query failed:', error.message)
    return []
  }

  return (data ?? []).map((row) => ({
    created_at: (row.posts as unknown as { created_at: string }).created_at,
  }))
}

async function getGoalCompletionRatio(
  supabase: Awaited<ReturnType<typeof createClient>>,
  goal: Goal,
  now: Date
): Promise<number> {
  const checkIns = await getThisWeekCheckIns(supabase, goal.id, now)

  if (goal.cadence_type === 'daily') {
    const uniqueDays = new Set(
      checkIns.map((c) => new Date(c.created_at).toDateString())
    )
    return Math.min(uniqueDays.size / 7, 1)
  }

  if (
    goal.cadence_type === 'weekly_count' &&
    goal.cadence_config?.type === 'weekly_count'
  ) {
    return Math.min(checkIns.length / goal.cadence_config.target, 1)
  }

  return 0
}

// Bonfire brightness as a 0–1 ratio (average completion across active goals).
// No active goals → 0 (unlit).
export async function getBonfireBrightness(userId: string): Promise<number> {
  const supabase = await createClient()
  const activeGoals = await getActiveGoals(userId)
  if (activeGoals.length === 0) return 0

  const now = new Date()
  const ratios = await Promise.all(
    activeGoals.map((goal) => getGoalCompletionRatio(supabase, goal, now))
  )

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
  const supabase = await createClient()
  const activeGoals = await getActiveGoals(userId)
  const now = new Date()

  const tiers = await Promise.all(
    activeGoals.map(async (goal) => {
      const ratio = await getGoalCompletionRatio(supabase, goal, now)
      return [goal.id, getBrightnessTier(ratio)] as const
    })
  )

  return new Map(tiers)
}