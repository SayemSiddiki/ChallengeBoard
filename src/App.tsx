import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useBoardStore, loadBoardStateForCurrentUser } from './store/boardStore'
import { Logo } from './components/logo'
import { getSupabaseClient } from './supabaseClient'
import { useAuthStore } from './store/authStore'
import { bestEffortNameFromMetadata, getProfile, upsertProfile } from './lib/profile'
import { ProfileNameModal } from './components/ProfileNameModal'
import { Footer } from './components/Footer'

function profileFlagKey(userId: string) {
  return `profile-name-set:${userId}`
}

function setSavedNameFlag(userId: string) {
  try {
    window.localStorage.setItem(profileFlagKey(userId), '1')
  } catch {
    // ignore
  }
}

function App() {
  const theme = useBoardStore((s) => s.theme)
  const toast = useBoardStore((s) => s.toast)
  const clearToast = useBoardStore((s) => s.clearToast)
  const setGuestMode = useBoardStore((s) => s.setGuestMode)
  const location = useLocation()
  const navigate = useNavigate()

  const session = useAuthStore((s) => s.session)
  const setSession = useAuthStore((s) => s.setSession)
  const setIsSessionLoading = useAuthStore((s) => s.setIsSessionLoading)
  const setProfile = useAuthStore((s) => s.setProfile)
  const setIsProfileLoading = useAuthStore((s) => s.setIsProfileLoading)

  const isDark = theme === 'dark'

  useEffect(() => {
    const supabase = getSupabaseClient()
    if (!supabase) {
      setGuestMode(true)
      setSession(null)
      setProfile(null)
      setIsSessionLoading(false)
      return
    }

    ;(async () => {
      setIsSessionLoading(true)
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      setGuestMode(!data.session)
      setIsSessionLoading(false)

      if (data.session) {
        await loadBoardStateForCurrentUser()

        setIsProfileLoading(true)
        const { profile } = await getProfile(data.session.user.id, supabase)
        if (profile) {
          setProfile(profile)
          if (profile.first_name && profile.last_name) {
            setSavedNameFlag(data.session.user.id)
          }
          setIsProfileLoading(false)
        } else {
          // Attempt to auto-fill from OAuth metadata
          const meta = bestEffortNameFromMetadata(data.session.user.user_metadata)
          if (meta.first_name && meta.last_name) {
            const { profile: saved } = await upsertProfile(
              data.session.user.id,
              {
                first_name: meta.first_name,
                last_name: meta.last_name,
                avatar_url: meta.avatar_url,
              },
              supabase,
            )
            setProfile(saved)
            setSavedNameFlag(data.session.user.id)
          } else {
            setProfile(null)
          }
          setIsProfileLoading(false)
        }
      } else {
        setProfile(null)
      }
    })()

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        setGuestMode(!session)
        if (session) {
          await loadBoardStateForCurrentUser()

          setIsProfileLoading(true)
          const { profile } = await getProfile(session.user.id, supabase)
          if (profile) {
            setProfile(profile)
            if (profile.first_name && profile.last_name) {
              setSavedNameFlag(session.user.id)
            }
            setIsProfileLoading(false)
          } else {
            const meta = bestEffortNameFromMetadata(session.user.user_metadata)
            if (meta.first_name && meta.last_name) {
              const { profile: saved } = await upsertProfile(
                session.user.id,
                {
                  first_name: meta.first_name,
                  last_name: meta.last_name,
                  avatar_url: meta.avatar_url,
                },
                supabase,
              )
              setProfile(saved)
              setSavedNameFlag(session.user.id)
            } else {
              setProfile(null)
            }
            setIsProfileLoading(false)
          }
        } else {
          setProfile(null)
        }
      },
    )

    return () => {
      sub.subscription.unsubscribe()
    }
  }, [setGuestMode, setIsProfileLoading, setIsSessionLoading, setProfile, setSession])

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
      <ProfileNameModal />
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
            {!session && (
              <button
                type="button"
                onClick={() => navigate('/auth')}
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-black shadow shadow-emerald-500/40 hover:bg-emerald-400"
              >
                Sign in
              </button>
            )}
          </div>
          <div className="h-px w-full rounded-full border-t border-dotted border-emerald-500/20" />
        </div>
      </header>
      <main className="flex-1">
        <div key={location.pathname} className="page-transition">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default App
