import { useMemo, useState } from 'react'
import { Layout } from '../components/Layout'
import { useBoardStore } from '../store/boardStore'
import { useBudgetStore } from '../store/budgetStore'

const values = Array.from({ length: 26 }, (_, index) => 50 + index * 10)

export function BudgetChallengePage() {
  const theme = useBoardStore((s) => s.theme)
  const updateMonthMeta = useBudgetStore((s) => s.updateMonthMeta)
  const isDark = theme === 'dark'
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<number | null>(null)
  const [rotation, setRotation] = useState(0)

  const wheelStyle = useMemo(() => {
    const segment = 360 / values.length
    const stops = values
      .map((_, i) => {
        const start = i * segment
        const end = (i + 1) * segment
        const color = i % 2 === 0 ? '#34d399' : '#60a5fa'
        return `${color} ${start}deg ${end}deg`
      })
      .join(', ')
    return {
      background: `conic-gradient(${stops})`,
      transform: `rotate(${rotation}deg)`,
    }
  }, [rotation])

  const spin = () => {
    if (spinning) return
    const picked = values[Math.floor(Math.random() * values.length)]
    const spinTurns = 1800 + Math.floor(Math.random() * 900)
    setSpinning(true)
    setResult(null)
    setRotation((prev) => prev + spinTurns)
    window.setTimeout(() => {
      setResult(picked)
      updateMonthMeta({ challengeYourself: picked })
      setSpinning(false)
    }, 1600)
  }

  return (
    <Layout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className={['text-2xl font-semibold', isDark ? 'text-slate-50' : 'text-slate-900'].join(' ')}>
            Challenge Yourself
          </h1>
          <p className={['mt-1 text-sm', isDark ? 'text-slate-400' : 'text-slate-600'].join(' ')}>
            Spin and get a challenge amount from $50 to $300.
          </p>
        </div>

        <div className={['rounded-3xl border p-6', isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-white'].join(' ')}>
          <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute left-1/2 top-[-12px] z-20 h-0 w-0 -translate-x-1/2 border-l-[10px] border-r-[10px] border-b-[16px] border-l-transparent border-r-transparent border-b-emerald-500" />
              <div
                className={['h-72 w-72 rounded-full border-[10px] shadow-lg transition-transform duration-[1600ms] ease-out', isDark ? 'border-slate-800' : 'border-slate-200'].join(' ')}
                style={wheelStyle}
              />
              <div className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black text-2xl font-bold text-white shadow-lg">
                Spin
              </div>
            </div>

            <button
              type="button"
              onClick={spin}
              disabled={spinning}
              className="rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-black shadow shadow-emerald-500/40 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {spinning ? 'Spinning...' : 'Spin Wheel'}
            </button>

            <div className="text-center">
              <div className={['text-xs uppercase tracking-[0.18em]', isDark ? 'text-slate-500' : 'text-slate-500'].join(' ')}>
                Suggested Amount
              </div>
              <div className={['mt-1 text-3xl font-bold', result ? 'text-emerald-500' : isDark ? 'text-slate-400' : 'text-slate-500'].join(' ')}>
                {result ? `$${result}` : '--'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

