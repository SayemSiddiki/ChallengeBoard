import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useBoardStore, loadBoardStateForCurrentUser } from './store/boardStore'
import { Logo } from './components/logo'
import { getSupabaseClient } from './supabaseClient'
import { logout } from './logout'

function App() {
  const theme = useBoardStore((s) => s.theme)
  const toast = useBoardStore((s) => s.toast)
  const clearToast = useBoardStore((s) => s.clearToast)
  const setGuestMode = useBoardStore((s) => s.setGuestMode)
  const location = useLocation()

  const isDark = theme === 'dark'

  useEffect(() => {
    const supabase = getSupabaseClient()
    if (!supabase) {
      setGuestMode(true)
      return
    }

    supabase.auth.getUser().then(async ({ data }) => {
      const isLoggedIn = !!data.user
      setGuestMode(!isLoggedIn)
      if (isLoggedIn) {
        await loadBoardStateForCurrentUser()
      }
    })

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const isLoggedIn = !!session
        setGuestMode(!isLoggedIn)
        if (isLoggedIn) {
          await loadBoardStateForCurrentUser()
        }
      },
    )

    return () => {
      sub.subscription.unsubscribe()
    }
  }, [setGuestMode])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => {
      clearToast()
    }, 3000)
    return () => clearTimeout(t)
  }, [toast, clearToast])

  return (
    <div
      className={[
        'relative min-h-screen flex flex-col transition-colors',
        isDark ? 'bg-black text-slate-50' : 'bg-emerald-50 text-slate-900',
      ].join(' ')}
    >
      {!isDark && (
        <>
          <div className="app-bg-gradient-light" />
          <div className="app-bg-blobs-light" />
          <div className="app-bg-edges-light" />
          <div className="app-bg-grid-light" />
        </>
      )}
      {toast && (
        <div className="pointer-events-none fixed inset-x-0 top-4 z-40 flex justify-center">
          <div
            className="pointer-events-auto flex max-w-md items-start gap-3 rounded-xl border border-emerald-500/60 bg-emerald-950/95 px-4 py-3 text-sm text-emerald-50 shadow-lg shadow-emerald-500/40"
            role="status"
            aria-live="polite"
          >
            <div className="mt-0.5 h-5 w-5 flex-shrink-0 rounded-full bg-emerald-500 text-center text-[0.7rem] font-bold text-black">
              ✓
            </div>
            <div className="flex-1">
              <p className="font-semibold">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={clearToast}
              className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs text-emerald-100 hover:bg-emerald-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1 focus:ring-offset-slate-900"
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        </div>
      )}
      <header
        className={[
          'sticky top-0 z-20 border-b backdrop-blur',
          isDark
            ? 'border-slate-800 bg-black/80'
            : 'border-slate-200 bg-white/80',
        ].join(' ')}
      >
        <div className="flex w-full flex-col gap-2 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <Logo />
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center justify-center rounded-full border border-slate-600 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-200 hover:border-slate-400 hover:bg-slate-800"
            >
              Sign out
            </button>
          </div>
          <div className="h-px w-full rounded-full border-t border-dotted border-emerald-500/20" />
        </div>
      </header>
      <main className="flex-1">
        <div key={location.pathname} className="page-transition">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default App
