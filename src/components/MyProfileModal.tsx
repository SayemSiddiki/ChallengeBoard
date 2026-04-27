import { useMemo } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { Profile } from '../lib/profile'
import type { Deposit, Tile } from '../store/boardStore'

type MyProfileModalProps = {
  open: boolean
  session: Session
  profile: Profile | null
  isDark: boolean
  goalAmount: number
  tiles: Tile[]
  deposits: Deposit[]
  onClose: () => void
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function streakStats(deposits: Deposit[]) {
  const daySet = new Set<string>()
  deposits.forEach((deposit) => {
    const date = new Date(deposit.createdAt)
    if (!Number.isNaN(date.getTime())) {
      daySet.add(date.toISOString().slice(0, 10))
    }
  })
  const days = Array.from(daySet).sort()
  if (!days.length) {
    return { currentStreak: 0, longestStreak: 0 }
  }

  let longest = 1
  let running = 1
  for (let i = 1; i < days.length; i += 1) {
    const prev = new Date(days[i - 1])
    const current = new Date(days[i])
    const diff = (current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
    if (diff === 1) {
      running += 1
      if (running > longest) longest = running
    } else {
      running = 1
    }
  }

  let currentStreak = 1
  for (let i = days.length - 1; i > 0; i -= 1) {
    const current = new Date(days[i])
    const prev = new Date(days[i - 1])
    const diff = (current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
    if (diff === 1) {
      currentStreak += 1
    } else {
      break
    }
  }

  return { currentStreak, longestStreak: longest }
}

export function MyProfileModal({
  open,
  session,
  profile,
  isDark,
  goalAmount,
  tiles,
  deposits,
  onClose,
}: MyProfileModalProps) {
  const stats = useMemo(() => {
    const totalSaved = deposits.reduce((sum, row) => sum + row.amount, 0)
    const completedDays = tiles.filter((tile) => tile.isDone).length
    const progress = goalAmount > 0 ? Math.min(100, (totalSaved / goalAmount) * 100) : 0
    const avgSaved = completedDays > 0 ? totalSaved / completedDays : 0
    const startCandidate =
      deposits.length > 0
        ? new Date(
            deposits.reduce((min, row) =>
              new Date(row.createdAt).getTime() < new Date(min.createdAt).getTime() ? row : min,
            deposits[0]).createdAt,
          )
        : null
    const startDate = startCandidate && !Number.isNaN(startCandidate.getTime())
      ? startCandidate
      : new Date()
    const elapsedDays = Math.max(
      1,
      Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1,
    )
    const missedDays = Math.max(0, elapsedDays - completedDays)
    const { currentStreak, longestStreak } = streakStats(deposits)

    const lastDepositTime = deposits[0] ? new Date(deposits[0].createdAt).getTime() : 0
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
    const status = !deposits.length || Date.now() - lastDepositTime <= sevenDaysMs ? 'Active' : 'Paused'

    const achievements: string[] = []
    if (longestStreak >= 7) achievements.push('7 day streak')
    if (totalSaved >= 100) achievements.push('First 100 saved')
    if (progress >= 50) achievements.push('Halfway mark')
    if (!achievements.length) achievements.push('Consistent saver')

    return {
      totalSaved,
      completedDays,
      progress,
      avgSaved,
      startDate,
      missedDays,
      currentStreak,
      longestStreak,
      status,
      achievements: achievements.slice(0, 3),
      challengeName: `${tiles.length || 30} Day Save Plan`,
    }
  }, [deposits, goalAmount, tiles])

  const name =
    profile?.full_name?.trim() ||
    [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim() ||
    'Challenge Board User'
  const username = (session.user.email?.split('@')[0] || 'user').toLowerCase()

  if (!open) return null

  const lines = [
    { label: 'Name', value: name },
    { label: 'Username', value: username },
    { label: 'Avatar', value: 'Flat vector avatar' },
    { label: 'Balance', value: `${Math.round(stats.totalSaved)} dollars` },
    { label: 'Goal', value: `${Math.round(goalAmount)} dollars` },
    { label: 'Progress', value: `${Math.round(stats.progress)} percent` },
    { label: 'Current streak', value: `${stats.currentStreak} days` },
    { label: 'Longest streak', value: `${stats.longestStreak} days` },
    { label: 'Challenge', value: stats.challengeName },
    { label: 'Completed days', value: `${stats.completedDays}` },
    { label: 'Missed days', value: `${stats.missedDays}` },
    { label: 'Daily average', value: `${Math.round(stats.avgSaved)} dollars` },
    { label: 'Start date', value: formatDate(stats.startDate) },
    { label: 'Status', value: stats.status },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div
        className={[
          'w-full max-w-2xl rounded-3xl border p-6 shadow-2xl',
          isDark
            ? 'border-slate-800 bg-slate-950 text-slate-100'
            : 'border-slate-200 bg-white text-slate-900',
        ].join(' ')}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">My profile</h2>
            <p className={['mt-1 text-sm', isDark ? 'text-slate-300' : 'text-slate-600'].join(' ')}>
              Clean summary of your saving challenge.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={['rounded-full px-2 py-1 text-sm', isDark ? 'hover:bg-slate-900' : 'hover:bg-slate-100'].join(' ')}
            aria-label="Close profile"
          >
            ✕
          </button>
        </div>

        <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {lines.map((line) => (
            <div key={line.label} className="rounded-xl border border-slate-800/60 px-3 py-2">
              <div className={['text-[0.7rem] uppercase tracking-[0.14em]', isDark ? 'text-slate-400' : 'text-slate-500'].join(' ')}>
                {line.label}
              </div>
              <div className="mt-0.5 text-sm font-medium">{line.value}</div>
            </div>
          ))}
        </div>

        <div className={['mt-4 rounded-xl border px-3 py-2', isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-slate-50'].join(' ')}>
          <div className={['text-[0.7rem] uppercase tracking-[0.14em]', isDark ? 'text-slate-400' : 'text-slate-500'].join(' ')}>
            Bio
          </div>
          <div className="mt-1 text-sm">I save a small amount every day and stay consistent.</div>
        </div>

        <div className={['mt-4 rounded-xl border px-3 py-2', isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-slate-50'].join(' ')}>
          <div className={['text-[0.7rem] uppercase tracking-[0.14em]', isDark ? 'text-slate-400' : 'text-slate-500'].join(' ')}>
            Achievements
          </div>
          <ul className="mt-1 space-y-1 text-sm">
            {stats.achievements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
