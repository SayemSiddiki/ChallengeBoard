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
        emailRedirectTo: window.location.origin + '/board',
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
      <div className="mx-auto mt-10 max-w-md rounded-2xl border border-slate-900 bg-slate-950/70 p-5">
        <h1 className="text-lg font-semibold text-slate-50">
          Sign in with email
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Use a one-time magic link to sync your Challenge Board across
          devices. If Supabase is not configured, this page will show a
          friendly message and guest mode will keep working.
        </p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div className="space-y-1.5">
            <label className="block text-[0.7rem] font-medium text-slate-200">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-0 placeholder:text-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/70"
            />
          </div>
          <button
            type="submit"
            disabled={!enabled || cooldown > 0}
            className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-500 px-3 py-2 text-xs font-semibold text-black shadow shadow-emerald-500/40 transition disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-400"
          >
            {enabled
              ? cooldown > 0
                ? `Wait ${cooldown}s`
                : 'Send magic link'
              : 'Supabase not configured'}
          </button>
        </form>
        {status && (
          <div className="mt-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
            {status}
          </div>
        )}
        {error && (
          <div className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            {error}
          </div>
        )}
        <div className="mt-4 space-y-2 border-t border-slate-800 pt-4">
          <p className="text-[0.7rem] text-slate-400">
            Or continue with a social account:
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              disabled={!enabled}
              onClick={() => handleOAuthSignIn('google')}
              className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-100 hover:border-emerald-500 hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Continue with Google
            </button>
            <button
              type="button"
              disabled={!enabled}
              onClick={() => handleOAuthSignIn('github')}
              className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-100 hover:border-emerald-500 hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Continue with GitHub
            </button>
          </div>
        </div>
        {!enabled && (
          <p className="mt-3 text-[0.7rem] text-slate-500">
            Set <code>VITE_SUPABASE_URL</code> and{' '}
            <code>VITE_SUPABASE_ANON_KEY</code> in your environment to enable
            Supabase sync.
          </p>
        )}
      </div>
    </Layout>
  )
}

