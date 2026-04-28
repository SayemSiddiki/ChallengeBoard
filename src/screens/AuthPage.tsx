import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { getSupabaseClient } from '../supabaseClient'

export function AuthPage() {
  const supabase = getSupabaseClient()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [enabled, setEnabled] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    setEnabled(!!supabase)
  }, [supabase])

  useEffect(() => {
    const oauth = searchParams.get('oauth')
    if (!oauth) return
    if (oauth === 'cancelled') {
      setError('Login cancelled.')
    } else {
      setError('Login failed. Please try again.')
    }
    // Clear the param so refresh doesn't repeat the message
    navigate('/auth', { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setInterval(() => {
      setCooldown((c) => c - 1)
    }, 1000)
    return () => clearInterval(t)
  }, [cooldown])

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    if (!supabase) {
      setError('Supabase is not configured. Guest mode will keep working.')
      return
    }
    setStatus(`Redirecting to ${provider === 'google' ? 'Google' : 'GitHub'}...`)
    setError(null)

    const { error: supaError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin + '/auth/callback',
      },
    })

    if (supaError) {
      setError(supaError.message)
      setStatus(null)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!supabase) {
      setError('Supabase is not configured. Guest mode will keep working.')
      return
    }
    if (cooldown > 0) {
      return
    }
    setStatus('Sending magic link...')
    setError(null)
    const { error: supaError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + '/home',
      },
    })
    if (supaError) {
      if (
        supaError.message.toLowerCase().includes('rate limit') ||
        supaError.status === 429
      ) {
        setError(
          'You have requested too many emails. Please wait a bit before trying again.',
        )
      } else {
        setError(supaError.message)
      }
      setStatus(null)
      return
    }
    setStatus('Check your email for a magic link.')
    setCooldown(30)
  }

  return (
    <Layout>
      <div className="relative -mx-4 -my-6 flex min-h-[calc(100vh-4.5rem)] w-[calc(100%+2rem)] items-center justify-center overflow-hidden px-4 py-10 sm:px-8">
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.3]"
          style={{ backgroundImage: "url('/auth-bg-chess.png')" }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#050509]/82 via-[#050509]/72 to-[#050509]/86"
          aria-hidden="true"
        />
        <div className="relative w-full max-w-3xl p-5 sm:p-8">
            <h1 className="text-3xl font-semibold text-slate-50 drop-shadow-[0_8px_28px_rgba(2,8,23,0.7)] sm:text-4xl">
              Sign in with email
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Use a one-time magic link to sync your Challenge Board across
              devices. If Supabase is not configured, this page will show a
              friendly message and guest mode will keep working.
            </p>
            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-medium uppercase tracking-wide text-slate-300">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/90 px-4 py-3.5 text-base text-slate-100 outline-none ring-0 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <button
                type="submit"
                disabled={!enabled || cooldown > 0}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-4 py-3.5 text-sm font-semibold text-slate-950 shadow-lg transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-400"
              >
                {enabled
                  ? cooldown > 0
                    ? `Wait ${cooldown}s`
                    : 'Send magic link'
                  : 'Supabase not configured'}
              </button>
            </form>
            {status && (
              <div className="mt-5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {status}
              </div>
            )}
            {error && (
              <div className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}
            <div className="mt-7 space-y-3 border-t border-slate-800 pt-6">
              <p className="text-center text-xs uppercase tracking-wide text-slate-400">
                OR
              </p>
              <button
                type="button"
                disabled={!enabled}
                onClick={() => handleOAuthSignIn('google')}
                className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-emerald-500 hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Continue with Google
              </button>
            </div>
            {!enabled && (
              <p className="mt-5 text-xs text-slate-500">
                Set <code>VITE_SUPABASE_URL</code> and{' '}
                <code>VITE_SUPABASE_ANON_KEY</code> in your environment to enable
                Supabase sync.
              </p>
            )}
          </div>
        </div>
    </Layout>
  )
}

