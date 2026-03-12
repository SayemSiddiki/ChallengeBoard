import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useBoardStore } from '../store/boardStore'
import { getSupabaseClient } from '../supabaseClient'

const navItems = [
  { to: '/home', label: 'Home' },
  { to: '/board', label: 'Board' },
  { to: '/history', label: 'History' },
  { to: '/settings', label: 'Settings' },
]

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const theme = useBoardStore((s) => s.theme)
  const guestMode = useBoardStore((s) => s.guestMode)
  const setGuestMode = useBoardStore((s) => s.setGuestMode)
  const showToast = useBoardStore((s) => s.showToast)
  const isDark = theme === 'dark'

  const handleSignOut = async () => {
    const supabase = getSupabaseClient()
    if (supabase) {
      await supabase.auth.signOut()
    }
    setGuestMode(true)
    showToast('Signed out successfully.', 'success')
  }

  return (
    <div className="flex min-h-[calc(100vh-4.5rem)] w-full flex-col px-4 py-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <nav
          className={[
            'flex gap-2 rounded-full border p-1 text-xs sm:text-sm',
            isDark
              ? 'border-slate-800 bg-slate-900/60'
              : 'border-slate-200 bg-white/80 shadow-sm',
          ].join(' ')}
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'inline-flex flex-1 items-center justify-center rounded-full px-3 py-1.5 font-medium transition',
                  isActive
                    ? isDark
                      ? 'bg-slate-100 text-black'
                      : 'bg-emerald-500 text-black'
                    : isDark
                      ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center justify-between gap-3 text-xs sm:justify-end">
          <span
            className={[
              'hidden rounded-full border px-3 py-1 font-medium sm:inline-block',
              isDark
                ? 'border-slate-800 bg-slate-900/80 text-slate-300'
                : 'border-slate-200 bg-white text-slate-600',
            ].join(' ')}
          >
            {location.pathname === '/'
              ? 'Welcome'
              : location.pathname.replace('/', '').toUpperCase()}
          </span>
          <div
            className={[
              'inline-flex items-center gap-2 rounded-full border px-3 py-1',
              isDark
                ? 'border-slate-800 bg-slate-900/80 text-slate-200'
                : 'border-slate-200 bg-white text-slate-700',
            ].join(' ')}
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-[0.7rem] font-semibold text-emerald-400">
              $
            </span>
            {guestMode ? (
              <>
                <span className="hidden sm:inline">Guest mode</span>
                <button
                  type="button"
                  onClick={() => navigate('/auth')}
                  className="rounded-full bg-emerald-500 px-2.5 py-0.5 text-[0.7rem] font-semibold text-black hover:bg-emerald-400"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">Signed in</span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="rounded-full border border-slate-400 px-2.5 py-0.5 text-[0.7rem] font-medium hover:border-red-400 hover:text-red-500"
                >
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  )
}

