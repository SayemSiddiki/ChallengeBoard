import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { getSupabaseClient } from '../supabaseClient'

function getParam(url: URL, key: string) {
  return url.searchParams.get(key) ?? url.hash.match(new RegExp(`${key}=([^&]+)`))?.[1] ?? null
}

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const supabase = getSupabaseClient()
  const [message, setMessage] = useState<string>('Finishing sign-in…')

  const url = useMemo(() => new URL(window.location.href), [])

  useEffect(() => {
    let cancelled = false

    async function run() {
      const error = getParam(url, 'error')
      const errorCode = getParam(url, 'error_code')
      const errorDescription = getParam(url, 'error_description')
      const code = url.searchParams.get('code')

      if (error || errorCode) {
        const isCancelled =
          error === 'access_denied' ||
          errorCode === 'access_denied' ||
          (errorDescription || '').toLowerCase().includes('cancel')

        setMessage(isCancelled ? 'Login cancelled. Returning…' : 'Login failed. Returning…')

        setTimeout(() => {
          if (!cancelled) {
            navigate('/auth?oauth=cancelled', { replace: true })
          }
        }, 1200)
        return
      }

      if (!supabase) {
        setMessage('Supabase is not configured. Returning…')
        setTimeout(() => {
          if (!cancelled) navigate('/auth', { replace: true })
        }, 1200)
        return
      }

      // PKCE flow: exchange code for a session
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        if (exchangeError) {
          setMessage('Login failed. Returning…')
          setTimeout(() => {
            if (!cancelled) navigate('/auth?oauth=failed', { replace: true })
          }, 1200)
          return
        }
      }

      // If a session exists (or was just created), go to board
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        navigate('/board', { replace: true })
        return
      }

      setMessage('Login failed. Returning…')
      setTimeout(() => {
        if (!cancelled) navigate('/auth?oauth=failed', { replace: true })
      }, 1200)
    }

    run()

    return () => {
      cancelled = true
    }
  }, [navigate, supabase, url])

  return (
    <Layout>
      <div className="mx-auto mt-10 max-w-md rounded-2xl border border-slate-900 bg-slate-950/70 p-5 text-center">
        <h1 className="text-lg font-semibold text-slate-50">Signing you in</h1>
        <p className="mt-2 text-sm text-slate-300">{message}</p>
        <p className="mt-3 text-[0.7rem] text-slate-500">
          If nothing happens, go back to{' '}
          <button
            type="button"
            onClick={() => navigate('/auth', { replace: true })}
            className="text-emerald-300 underline underline-offset-2 hover:text-emerald-200"
          >
            the login page
          </button>
          .
        </p>
      </div>
    </Layout>
  )
}

