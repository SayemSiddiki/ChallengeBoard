import type { FormEvent } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import type { Difficulty, ThemeMode } from '../store/boardStore'
import { useBoardStore } from '../store/boardStore'
import { useAuthStore } from '../store/authStore'
import { logout } from '../logout'

export function SettingsPage() {
  const navigate = useNavigate()
  const {
    goalAmount,
    tileCount,
    difficulty,
    theme,
    setSettings,
    regenerateBoard,
    setTheme,
  } = useBoardStore()
  const [goal, setGoal] = useState(goalAmount.toString())
  const [tiles, setTiles] = useState(tileCount.toString())
  const [level, setLevel] = useState<Difficulty>(difficulty)
  const [lengthPreset, setLengthPreset] = useState<
    'custom' | '6m' | '10m' | '12m'
  >('custom')
  const isDark = theme === 'dark'
  const showToast = useBoardStore((s) => s.showToast)
  const session = useAuthStore((s) => s.session)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const parsedGoal = Number(goal)
    const parsedTiles = Number(tiles)
    if (!Number.isFinite(parsedGoal) || parsedGoal <= 0) return
    if (!Number.isInteger(parsedTiles) || parsedTiles <= 0) return
    setSettings({
      goalAmount: parsedGoal,
      tileCount: parsedTiles,
      difficulty: level,
    })
    showToast('Settings saved. Tiles regenerated.', 'success')
  }

  return (
    <Layout>
      <div className="space-y-5">
        <div>
          <h1
            className={[
              'text-xl font-semibold',
              isDark ? 'text-slate-50' : 'text-slate-900',
            ].join(' ')}
          >
            Board settings
          </h1>
          <p
            className={[
              'mt-1 text-xs sm:text-sm',
              isDark ? 'text-slate-400' : 'text-slate-600',
            ].join(' ')}
          >
            Adjust your goal, tile count, and difficulty. Regenerating will
            create a new set of tiles that always sum exactly to your goal.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className={[
            'grid gap-5 rounded-2xl border p-4 sm:grid-cols-2 sm:p-6',
            isDark
              ? 'border-slate-900 bg-slate-950/60'
              : 'border-slate-200 bg-white shadow-sm',
          ].join(' ')}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label
                className={[
                  'block text-[0.7rem] font-medium',
                  isDark ? 'text-slate-200' : 'text-slate-700',
                ].join(' ')}
              >
                Goal amount
              </label>
              <input
                type="number"
                min={1}
                step={1}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className={[
                  'w-full rounded-xl border px-3 py-2 text-sm outline-none ring-0 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/70',
                  isDark
                    ? 'border-slate-800 bg-slate-950 text-slate-100'
                    : 'border-slate-300 bg-slate-50 text-slate-900',
                ].join(' ')}
              />
              <p className="text-[0.7rem] text-slate-500">
                Example: 10000 for a ten thousand dollar challenge.
              </p>
            </div>
            <div className="space-y-2">
              <label
                className={[
                  'block text-[0.7rem] font-medium',
                  isDark ? 'text-slate-200' : 'text-slate-700',
                ].join(' ')}
              >
                Challenge length
              </label>
              <div className="flex gap-2">
                {[
                  { id: '6m', label: '6 months', days: 180 },
                  { id: '10m', label: '10 months', days: 300 },
                  { id: '12m', label: '12 months', days: 365 },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setLengthPreset(opt.id as '6m' | '10m' | '12m')
                      setTiles(String(opt.days))
                    }}
                    className={[
                      'flex-1 rounded-xl border px-3 py-2 text-xs font-medium transition',
                      lengthPreset === opt.id
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600'
                        : isDark
                          ? 'border-slate-800 bg-slate-950 text-slate-200 hover:border-slate-600'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-emerald-400 hover:bg-emerald-50/60',
                    ].join(' ')}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-[0.7rem] text-slate-500">
                Presets map roughly to daily days: 6 months ≈ 180 days, 10 months ≈ 300 days,
                12 months ≈ 365 days. You can still customise the day count below.
              </p>
            </div>
            <div className="space-y-2">
              <label
                className={[
                  'block text-[0.7rem] font-medium',
                  isDark ? 'text-slate-200' : 'text-slate-700',
                ].join(' ')}
              >
                Day count
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={tiles}
                  onChange={(e) => {
                    setLengthPreset('custom')
                    setTiles(e.target.value)
                  }}
                  className={[
                    'w-full rounded-xl border px-3 py-2 text-sm outline-none ring-0 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/70',
                    isDark
                      ? 'border-slate-800 bg-slate-950 text-slate-100'
                      : 'border-slate-300 bg-slate-50 text-slate-900',
                  ].join(' ')}
                />
              </div>
              <p className="text-[0.7rem] text-slate-500">
                More days means smaller individual amounts, and each day is treated as one step
                on your challenge board.
              </p>
            </div>
          </div>
          <div className="space-y-5">
            <div className="space-y-2">
              <label
                className={[
                  'block text-[0.7rem] font-medium',
                  isDark ? 'text-slate-200' : 'text-slate-700',
                ].join(' ')}
              >
                Theme
              </label>
              <div className="flex gap-2">
                {[
                  { id: 'dark', label: 'Dark' },
                  { id: 'light', label: 'Light' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTheme(opt.id as ThemeMode)}
                    className={[
                      'flex-1 rounded-xl border px-3 py-2 text-xs font-medium transition',
                      theme === opt.id
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600'
                        : isDark
                          ? 'border-slate-800 bg-slate-950 text-slate-200 hover:border-slate-600'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-emerald-400 hover:bg-emerald-50/60',
                    ].join(' ')}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-[0.7rem] text-slate-500">
                Switch between a rich dark board and a light, paper-like view.
              </p>
            </div>
            <div className="space-y-2">
              <label
                className={[
                  'block text-[0.7rem] font-medium',
                  isDark ? 'text-slate-200' : 'text-slate-700',
                ].join(' ')}
              >
                Difficulty
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['easy', 'mixed', 'hard'] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setLevel(d)}
                    className={[
                      'rounded-xl border px-3 py-2 text-xs font-medium capitalize transition',
                      level === d
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600'
                        : isDark
                          ? 'border-slate-800 bg-slate-950 text-slate-200 hover:border-slate-600'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-emerald-400 hover:bg-emerald-50/60',
                    ].join(' ')}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <ul className="mt-1 space-y-1 text-[0.7rem] text-slate-500">
                <li>
                  <span className="font-semibold text-emerald-300">Easy</span>:{' '}
                  more small amounts.
                </li>
                <li>
                  <span className="font-semibold text-emerald-300">Mixed</span>:{' '}
                  balanced spread.
                </li>
                <li>
                  <span className="font-semibold text-emerald-300">Hard</span>:{' '}
                  more large amounts.
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-500 px-3 py-2 text-xs font-semibold text-black shadow shadow-emerald-500/40 transition hover:bg-emerald-400"
              >
                Save settings & regenerate tiles
              </button>
              <button
                type="button"
                onClick={regenerateBoard}
                className="inline-flex w-full items-center justify-center rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-slate-600"
              >
                Regenerate board with current settings
              </button>
            </div>
          </div>
        </form>

        {session && (
          <div
            className={[
              'rounded-2xl border p-4 sm:p-6',
              isDark
                ? 'border-slate-900 bg-slate-950/60'
                : 'border-slate-200 bg-white shadow-sm',
            ].join(' ')}
          >
            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <div className={isDark ? 'text-slate-50 font-semibold' : 'text-slate-900 font-semibold'}>
                  Account
                </div>
                <div className={isDark ? 'text-xs text-slate-400' : 'text-xs text-slate-600'}>
                  Sign out of this device.
                </div>
              </div>
              <button
                type="button"
                onClick={async () => {
                  await logout()
                  showToast('Signed out successfully.', 'success')
                  navigate('/home', { replace: true })
                }}
                className="inline-flex items-center justify-center rounded-full border border-red-500/40 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-200 hover:border-red-400 hover:bg-red-500/15"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

