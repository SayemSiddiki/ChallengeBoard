import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { useBoardStore } from '../store/boardStore'
import { useAuthStore } from '../store/authStore'
import { logout } from '../logout'

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
  const showToast = useBoardStore((s) => s.showToast)
  const session = useAuthStore((s) => s.session)
  const isSessionLoading = useAuthStore((s) => s.isSessionLoading)
  const profile = useAuthStore((s) => s.profile)
  const isProfileLoading = useAuthStore((s) => s.isProfileLoading)
  const isDark = theme === 'dark'

  const displayName =
    profile?.full_name?.trim() ||
    [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim() ||
    null

  const [menuOpen, setMenuOpen] = useState(false)
  const pillRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null
      if (!target) return
      if (pillRef.current && !pillRef.current.contains(target)) {
        setMenuOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('mousedown', onPointerDown)
    window.addEventListener('touchstart', onPointerDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('touchstart', onPointerDown)
    }
  }, [menuOpen])

  const handleSignOut = async () => {
    setMenuOpen(false)
    await logout()
    showToast('Signed out successfully.', 'success')
    navigate('/home', { replace: true })
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
          {session && (
            <div ref={pillRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className={[
                  'inline-flex items-center gap-2 rounded-full border px-3 py-1',
                  isDark
                    ? 'border-slate-800 bg-slate-900/80 text-slate-200'
                    : 'border-slate-200 bg-white text-slate-700',
                ].join(' ')}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-[0.7rem] font-semibold text-emerald-400">
                  $
                </span>
                <span className="font-medium">
                  {isSessionLoading || isProfileLoading
                    ? 'Loading…'
                    : displayName || 'Loading…'}
                </span>
                <span className="ml-1 text-[0.65rem] opacity-70">▾</span>
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className={[
                    'absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border shadow-lg',
                    isDark
                      ? 'border-slate-800 bg-slate-950 text-slate-100 shadow-black/40'
                      : 'border-slate-200 bg-white text-slate-900 shadow-slate-900/10',
                  ].join(' ')}
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleSignOut}
                    className={[
                      'w-full px-3 py-2 text-left text-xs font-semibold transition',
                      isDark
                        ? 'hover:bg-slate-900'
                        : 'hover:bg-slate-50',
                    ].join(' ')}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  )
}

