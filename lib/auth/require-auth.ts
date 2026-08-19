import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Call this at the top of any server action that guests must not perform
// (e.g. sending a candle, posting a comment). Redirects to login if
// there's no session, carrying the current path so the user returns
// to where they were after signing in.
export async function requireAuth(currentPath: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth/login?next=${encodeURIComponent(currentPath)}`)
  }

  return user
}