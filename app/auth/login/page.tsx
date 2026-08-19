import Link from 'next/link'
import { login } from '@/app/auth/actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const { error, next } = await searchParams

  return (
    <div>
      <h1>Log in</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form action={login}>
        <input type="hidden" name="next" value={next ?? '/'} />

        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required />

        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required />

        <button type="submit">Log in</button>
      </form>
      <Link href={`/auth/signup${next ? `?next=${encodeURIComponent(next)}` : ''}`}>
        Don&apos;t have an account? Sign up
      </Link>
    </div>
  )
}