import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Layout } from '../components/Layout'
import { FooterProgress } from '../components/FooterProgress'
import { useBoardStore } from '../store/boardStore'
import { useAuthStore } from '../store/authStore'
import { useLocation } from 'react-router-dom'

export function HomePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const guestMode = useBoardStore((s) => s.guestMode)
  const tiles = useBoardStore((s) => s.tiles)
  const theme = useBoardStore((s) => s.theme)
  const session = useAuthStore((s) => s.session)
  const isDark = theme === 'dark'

  useEffect(() => {
    if (!location.hash) return
    const id = location.hash.replace('#', '')
    const el = document.getElementById(id)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [location.hash])

  const totalTiles = Math.max(tiles.length, 1)
  const completedTiles = tiles.filter((tile) => tile.isDone).length
  const remainingTiles = Math.max(totalTiles - completedTiles, 0)
  const completedPercent = Math.round((completedTiles / totalTiles) * 100)

  return (
    <Layout>
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center gap-10 px-4 py-8 text-center md:flex-row md:text-left">
        <div className="relative z-10 flex-1 space-y-6 fade-up-soft">
          <div id="how-it-works" />
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-emerald-300">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[0.6rem] text-black">
              $
            </span>
            Savings challenge
          </div>
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
              'max-w-xl whitespace-nowrap text-base tracking-tight sm:text-lg',
              isDark ? 'text-slate-400' : 'text-slate-600',
            ].join(' ')}
          >
            &ldquo;Protect your king and your pieces, protect your cash and your savings.&rdquo;
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
                📋 Rules
              </button>
              {!session && (
                <button
                  type="button"
                  onClick={() => navigate('/auth')}
                  className="inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-6 py-2.5 font-semibold text-black shadow-lg shadow-emerald-500/40 transition hover:bg-emerald-400"
                >
                  👤 Make a account
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
                onClick={() => navigate('/budget')}
                className="inline-flex w-full items-center justify-center rounded-full border border-slate-300 bg-white/80 px-6 py-2.5 font-medium text-slate-800 shadow-sm transition hover:border-emerald-400 hover:bg-emerald-50/70"
              >
                ◔ Budget plan
              </button>
              <button
                type="button"
                onClick={() => navigate('/board')}
                className="inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-6 py-2.5 font-semibold text-black shadow-lg shadow-emerald-500/40 transition hover:bg-emerald-400"
              >
                🏁 Start a new challenge
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
        <div className="relative z-10 w-full max-w-xl md:max-w-4xl md:flex-1 fade-up-soft-delay-1">
          <img
            src="/premium-chess-board.png"
            alt="Premium 3D Chess Board"
            className={[
              'chess-subtle-motion w-full object-contain',
              isDark
                ? 'mix-blend-screen drop-shadow-[0_0_100px_rgba(16,185,129,0.5)]'
                : 'mix-blend-normal drop-shadow-[0_0_26px_rgba(16,185,129,0.2)]',
            ].join(' ')}
          />
        </div>
      </div>
      <section className="mx-auto w-full max-w-3xl px-2 py-2">
        <div className="mb-5 flex items-center justify-between">
          <h2 className={['text-base font-semibold sm:text-lg', isDark ? 'text-slate-100' : 'text-slate-900'].join(' ')}>
            Board progress
          </h2>
          <span className="text-xs text-slate-500">{completedTiles}/{totalTiles} complete</span>
        </div>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <div
            className={[
              'h-36 w-36 rounded-full',
              isDark
                ? 'shadow-[0_0_24px_rgba(16,185,129,0.24)]'
                : 'shadow-[0_0_20px_rgba(16,185,129,0.18)]',
            ].join(' ')}
            style={{
              background: `conic-gradient(#10b981 0 ${completedPercent}%, #334155 ${completedPercent}% 100%)`,
            }}
            role="img"
            aria-label={`Board progress pie chart showing ${completedPercent}% complete`}
          >
            <div className={['m-auto mt-6 h-24 w-24 rounded-full', isDark ? 'bg-slate-950' : 'bg-white'].join(' ')}>
              <div className="flex h-full items-center justify-center text-sm font-semibold text-emerald-500">
                {completedPercent}%
              </div>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="inline-flex items-center gap-2.5 text-slate-500">
              <span className="inline-block h-3 w-3 rounded-full bg-emerald-500" />
              <span>Completed:</span>
              <span className="min-w-[1.5ch] tabular-nums">{completedTiles}</span>
            </div>
            <div className="inline-flex items-center gap-2.5 text-slate-500">
              <span className="inline-block h-3 w-3 rounded-full bg-slate-600" />
              <span>Remaining:</span>
              <span className="min-w-[1.5ch] tabular-nums">{remainingTiles}</span>
            </div>
          </div>
        </div>
      </section>
      <FooterProgress />
    </Layout>
  )
}
