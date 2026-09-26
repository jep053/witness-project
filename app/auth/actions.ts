'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const username = (formData.get('username') as string)?.trim()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const next = (formData.get('next') as string) || '/'

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
    },
  })

  if (error) {
    // Postgres raises a unique_violation from inside the trigger when the
    // username is taken; Supabase surfaces it as a generic "Database error
    // saving new user" rather than a clean message, so translate it here.
    const message = error.message.includes('Database error')
      ? 'That username is already taken.'
      : error.message

    redirect(
      `/auth/signup?error=${encodeURIComponent(message)}&next=${encodeURIComponent(next)}`
    )
  }

  revalidatePath('/', 'layout')
  redirect(next)
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const next = (formData.get('next') as string) || '/'

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect(
      `/auth/login?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`
    )
  }

  revalidatePath('/', 'layout')
  redirect(next)
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/others')
}