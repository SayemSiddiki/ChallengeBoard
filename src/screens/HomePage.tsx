import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Layout } from '../components/Layout'
import { FooterProgress } from '../components/FooterProgress'
import { useBoardStore } from '../store/boardStore'
import { useAuthStore } from '../store/authStore'
import { useLocation } from 'react-router-dom'

export function HomePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const guestMode = useBoardStore((s) => s.guestMode)
  const theme = useBoardStore((s) => s.theme)
  const setTheme = useBoardStore((s) => s.setTheme)
  const session = useAuthStore((s) => s.session)
  const isDark = theme === 'dark'

  const [preview, setPreview] = useState(() => ({
    day: 1 + Math.floor(Math.random() * 200),
    progress: 10 + Math.floor(Math.random() * 81),
    amounts: Array.from({ length: 8 }, () => 10 + Math.floor(Math.random() * 291)),
  }))

  useEffect(() => {
    const interval = setInterval(() => {
      setPreview({
        day: 1 + Math.floor(Math.random() * 200),
        progress: 10 + Math.floor(Math.random() * 81),
        amounts: Array.from(
          { length: 8 },
          () => 10 + Math.floor(Math.random() * 291),
        ),
      })
    }, 1200)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!location.hash) return
    const id = location.hash.replace('#', '')
    const el = document.getElementById(id)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [location.hash])

  const clampedPreviewProgress = Math.min(100, Math.max(0, preview.progress))

  return (
    <Layout>
      <div className="flex w-full flex-1 flex-col items-center justify-center gap-10 px-4 py-8 text-center md:flex-row md:text-left">
        <div className="relative z-10 flex-1 space-y-6 fade-up-soft">
          <div id="how-it-works" />
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-emerald-300">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[0.6rem] text-black">
              $
            </span>
            Savings challenge
          </div>
          {!session && (
            <div className="flex items-center justify-center md:justify-start">
              <button
                type="button"
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className={[
                  'group relative inline-flex h-9 w-44 items-center rounded-full border px-1 transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:ring-offset-2 focus:ring-offset-black',
                  isDark
                    ? 'border-slate-800 bg-slate-950 text-slate-200'
                    : 'border-slate-200 bg-white text-slate-700',
                ].join(' ')}
                aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              >
                <span
                  className={[
                    'absolute left-1 top-1 h-7 w-20 rounded-full bg-emerald-500 shadow transition-all duration-300 ease-out',
                    isDark ? 'translate-x-0' : 'translate-x-[4.75rem]',
                  ].join(' ')}
                />
                <span
                  className={[
                    'relative z-10 flex-1 text-center text-[0.7rem] font-semibold transition-colors',
                    isDark ? 'text-black' : 'text-slate-500',
                  ].join(' ')}
                >
                  Dark
                </span>
                <span
                  className={[
                    'relative z-10 flex-1 text-center text-[0.7rem] font-semibold transition-colors',
                    isDark ? 'text-slate-400' : 'text-black',
                  ].join(' ')}
                >
                  Light
                </span>
              </button>
            </div>
          )}
          <h1
            className={[
              'text-balance text-3xl font-semibold sm:text-4xl md:text-5xl',
              isDark ? 'text-slate-50' : 'text-slate-900',
            ].join(' ')}
          >
            Make every{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-sky-400 bg-clip-text text-transparent">
              day
            </span>{' '}
            a step toward your $ goal.
          </h1>
          <p
            className={[
              'max-w-xl text-pretty text-sm sm:text-base',
              isDark ? 'text-slate-400' : 'text-slate-600',
            ].join(' ')}
          >
            Challenge Board turns a big savings target into tiny daily wins. Pick
            your timeframe, tap a day, and watch your progress bar fill up.
          </p>
          <div className="relative mt-6 w-full max-w-xs">
            <div className="pointer-events-none absolute inset-0">
              {Array.from({ length: 6 }).map((_, i) => {
                const left = 10 + Math.random() * 80
                const duration = 7 + Math.random() * 4
                const delay = Math.random() * 6
                const size = 10 + Math.random() * 6
                return (
                  // eslint-disable-next-line react/no-array-index-key
                  <span
                    key={i}
                    className="money-rain-item"
                    style={{
                      left: `${left}%`,
                      top: '-10%',
                      fontSize: `${size}px`,
                      animationDuration: `${duration}s`,
                      animationDelay: `${delay}s`,
                    }}
                  >
                    💵
                  </span>
                )
              })}
            </div>
            <div className="relative flex w-full flex-col gap-2 text-sm">
              <button
                type="button"
                onClick={() => navigate('/rules')}
                className="inline-flex w-full items-center justify-center rounded-full border border-slate-300 bg-white/90 px-6 py-2.5 font-medium text-slate-800 shadow-sm transition hover:border-emerald-400 hover:bg-emerald-50/80"
              >
                Rules
              </button>
              {!session && (
                <button
                  type="button"
                  onClick={() => navigate('/auth')}
                  className="inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-6 py-2.5 font-semibold text-black shadow-lg shadow-emerald-500/40 transition hover:bg-emerald-400"
                >
                  Make an account
                </button>
              )}
              <button
                type="button"
                onClick={() => navigate('/board')}
                className="inline-flex w-full items-center justify-center rounded-full border border-slate-300 bg-white/80 px-6 py-2.5 font-medium text-slate-800 shadow-sm transition hover:border-emerald-400 hover:bg-emerald-50/70"
              >
                Continue as guest
              </button>
              <button
                type="button"
                onClick={() => navigate('/board')}
                className="inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-6 py-2.5 font-semibold text-black shadow-lg shadow-emerald-500/40 transition hover:bg-emerald-400"
              >
                Start a new challenge
              </button>
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-500">
            Guest mode is{' '}
            <span className="font-semibold text-emerald-500">always on</span> – you
            can upgrade to an account any time.
          </div>
          {!guestMode && (
            <div className="mt-2 text-xs text-emerald-500">
              Signed in – your board syncs automatically.
            </div>
          )}
        </div>
        <div className="relative z-10 w-full max-w-xl md:max-w-lg md:flex-1 fade-up-soft-delay-1">
          <div className="pointer-events-none absolute -inset-10 rounded-[2.25rem] bg-gradient-to-br from-emerald-500/15 via-cyan-400/10 to-transparent blur-3xl" />
          <div className="pointer-events-none absolute inset-0 translate-y-2 rounded-[2rem] border border-emerald-100/70 bg-emerald-50/50 shadow-lg shadow-emerald-500/10 backdrop-blur-md" />
          <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-emerald-50/95 p-6 text-left shadow-xl shadow-emerald-500/25 float-soft sm:p-7">
            <div id="features" />
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[0.75rem] uppercase tracking-[0.18em] text-slate-500">
                  Today&apos;s day
                </p>
                <p className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">
                  Day {preview.day} • {preview.amounts[2]} $
                </p>
              </div>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-base font-bold text-black sm:h-10 sm:w-10">
                ✓
              </span>
            </div>
            <div className="mb-4">
              <div className="relative flex items-center justify-between text-[0.75rem] text-slate-600">
                <span>Progress</span>
                <span className="font-medium text-emerald-600">
                  {preview.progress}%
                </span>
                <span
                  className="pointer-events-none absolute -right-3 top-1/2 -translate-y-1/2 text-xs"
                  aria-hidden="true"
                >
                  💵
                </span>
              </div>
              <div
                className="mt-2 h-2 w-full overflow-hidden rounded-full bg-emerald-100/40 relative"
                role="progressbar"
                aria-valuenow={clampedPreviewProgress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Preview savings progress: ${clampedPreviewProgress}%`}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-sky-400"
                  style={{ width: `${clampedPreviewProgress}%` }}
                />
                <span
                  className="pointer-events-none absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-[0.7rem]"
                  style={{ left: `${clampedPreviewProgress}%` }}
                  aria-hidden="true"
                >
                  💵
                </span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 text-[0.7rem] sm:text-xs">
              {preview.amounts.map((amount, i) => (
                <div
                  // eslint-disable-next-line react/no-array-index-key
                  key={i}
                  className={[
                    'flex aspect-[4/3] items-center justify-center rounded-xl border text-sm font-semibold sm:text-xs',
                    i === 2
                      ? 'border-emerald-400 bg-white text-emerald-700'
                      : 'border-emerald-100 bg-emerald-50/80 text-slate-800',
                  ].join(' ')}
                >
                  {amount} $
                </div>
              ))}
            </div>
            <p className="mt-5 text-[0.75rem] text-slate-600">
              Pick a random day, complete the amount, and watch your savings grow.
            </p>
          </div>
        </div>
      </div>
      <FooterProgress />
    </Layout>
  )
}

