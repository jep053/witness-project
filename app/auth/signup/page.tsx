import Link from 'next/link'
import { signup } from '@/app/auth/actions'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const { error, next } = await searchParams

  return (
    <div>
      <h1>Sign up</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form action={signup}>
        <input type="hidden" name="next" value={next ?? '/'} />

        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required />

        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required minLength={6} />

        <button type="submit">Sign up</button>
      </form>
      <Link href={`/auth/login${next ? `?next=${encodeURIComponent(next)}` : ''}`}>
        Already have an account? Log in
      </Link>
    </div>
  )
}