import { useNavigate } from 'react-router-dom'

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center bg-gradient-to-b from-black via-slate-950 to-slate-900 px-4">
      <button
        type="button"
        onClick={() => navigate('/home')}
        className="group relative w-full max-w-md rounded-[1.6rem] border border-emerald-500/40 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 p-[2px] shadow-[0_0_40px_rgba(16,185,129,0.35)] transition hover:border-emerald-400 hover:shadow-[0_0_60px_rgba(16,185,129,0.55)]"
      >
        <div className="relative flex h-[220px] w-full flex-col justify-between overflow-hidden rounded-[1.4rem] bg-slate-950/95 px-5 py-4 text-left sm:h-[230px] sm:px-6 sm:py-5">
          <div className="pointer-events-none absolute inset-0 opacity-70">
            {Array.from({ length: 18 }).map((_, i) => {
              const left = Math.random() * 100
              const duration = 7 + Math.random() * 5
              const delay = Math.random() * 6
              const size = 14 + Math.random() * 10
              return (
                // eslint-disable-next-line react/no-array-index-key
                <span
                  key={i}
                  className="money-rain-item text-emerald-300/80"
                  style={{
                    left: `${left}%`,
                    top: '-15%',
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

          <div className="relative flex items-center justify-between gap-4">
            <div>
              <p className="text-[0.7rem] uppercase tracking-[0.18em] text-emerald-300/80">
                Tap to open board
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-50 sm:text-3xl">
                Challenge Board
              </h1>
              <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                A savings game where every day is a tile on your money board.
              </p>
            </div>
            <div className="hidden flex-col items-end text-right sm:flex">
              <span className="text-[0.7rem] uppercase tracking-[0.18em] text-slate-500">
                Goal preview
              </span>
              <span className="mt-1 text-xl font-semibold text-emerald-300">
                10,000 $
              </span>
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-[0.7rem] text-emerald-300">
                <span className="inline-flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500 text-[0.6rem] text-black">
                  ✓
                </span>
                Start challenge
              </span>
            </div>
          </div>

          <div className="relative mt-4 grid grid-cols-4 gap-1.5 text-[0.65rem] text-slate-100 sm:mt-6">
            {['10 $', '24 $', '45 $', '18 $', '30 $', '12 $', '58 $', '20 $'].map(
              (amount, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <div
                  key={i}
                  className={[
                    'flex aspect-[4/3] items-center justify-center rounded-xl border text-xs font-medium transition',
                    i === 2
                      ? 'border-emerald-400 bg-emerald-500/10 text-emerald-200'
                      : 'border-slate-800 bg-slate-900/70 text-slate-200 group-hover:border-emerald-500/40',
                  ].join(' ')}
                >
                  {amount}
                </div>
              ),
            )}
          </div>

          <div className="relative mt-3 flex items-center justify-between text-[0.7rem] text-slate-500">
            <span>Click anywhere on this board to enter.</span>
            <span className="hidden items-center gap-1 text-emerald-300 sm:inline-flex">
              Enter
              <span className="text-xs">➜</span>
            </span>
          </div>
        </div>
      </button>
    </div>
  )
}

