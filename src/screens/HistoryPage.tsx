import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { useBoardStore } from '../store/boardStore'
import { exportDepositsToCsv } from '../utils/csv'

export function HistoryPage() {
  const navigate = useNavigate()
  const deposits = useBoardStore((s) => s.deposits)
  const theme = useBoardStore((s) => s.theme)
  const updateDepositNote = useBoardStore((s) => s.updateDepositNote)
  const deleteDeposit = useBoardStore((s) => s.deleteDeposit)
  const showToast = useBoardStore((s) => s.showToast)
  const isDark = theme === 'dark'
  const [selectedMonth, setSelectedMonth] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'tile' | 'custom'>('all')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20

  const months = useMemo(() => {
    const set = new Set<string>()
    deposits.forEach((d) => {
      const dt = new Date(d.createdAt)
      if (!Number.isNaN(dt.getTime())) {
        const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`
        set.add(key)
      }
    })
    return Array.from(set).sort().reverse()
  }, [deposits])

  const stats = useMemo(() => {
    if (deposits.length === 0) {
      return {
        thisMonthTotal: 0,
        allTimeTotal: 0,
        averagePerDay: 0,
        bestStreak: 0,
      }
    }

    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    let thisMonthTotal = 0
    let allTimeTotal = 0
    const daySet = new Set<string>()

    deposits.forEach((d) => {
      const dt = new Date(d.createdAt)
      if (Number.isNaN(dt.getTime())) return
      allTimeTotal += d.amount
      const dayKey = dt.toISOString().slice(0, 10)
      daySet.add(dayKey)
      if (dt.getFullYear() === currentYear && dt.getMonth() === currentMonth) {
        thisMonthTotal += d.amount
      }
    })

    const uniqueDays = daySet.size || 1
    const averagePerDay = allTimeTotal / uniqueDays

    const sortedDays = Array.from(daySet).sort()
    let bestStreak = 0
    let currentStreak = 0
    let prevDate: Date | null = null

    sortedDays.forEach((key) => {
      const dt = new Date(key)
      if (!prevDate) {
        currentStreak = 1
      } else {
        const diffDays =
          (dt.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
        if (diffDays === 1) {
          currentStreak += 1
        } else if (diffDays > 1) {
          currentStreak = 1
        }
      }
      prevDate = dt
      if (currentStreak > bestStreak) bestStreak = currentStreak
    })

    return {
      thisMonthTotal,
      allTimeTotal,
      averagePerDay,
      bestStreak,
    }
  }, [deposits])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()

    return deposits.filter((d) => {
      const dt = new Date(d.createdAt)
      if (selectedMonth !== 'all') {
        if (Number.isNaN(dt.getTime())) return false
        const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(
          2,
          '0',
        )}`
        if (key !== selectedMonth) return false
      }

      if (typeFilter === 'tile' && !d.tileId) return false
      if (typeFilter === 'custom' && d.tileId) return false

      if (!query) return true

      const amountStr = d.amount.toString()
      const dayNumber =
        d.tileId && d.tileId.startsWith('tile-')
          ? Number(d.tileId.split('-')[1] ?? '0') + 1
          : undefined
      const dayStr = dayNumber ? `day ${dayNumber}` : ''

      return (
        amountStr.includes(query) ||
        dayStr.toLowerCase().includes(query) ||
        query === dayNumber?.toString()
      )
    })
  }, [deposits, selectedMonth, typeFilter, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPageSafe = Math.min(currentPage, totalPages)
  const paginated = filtered.slice(
    (currentPageSafe - 1) * pageSize,
    currentPageSafe * pageSize,
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedMonth, typeFilter, search])

  const handleEditNote = (id: string, currentNote?: string) => {
    const confirmed = window.confirm('Edit note for this deposit?')
    if (!confirmed) return
    // eslint-disable-next-line no-alert
    const next = window.prompt(
      'Update note (leave empty to clear):',
      currentNote ?? '',
    )
    if (next === null) return
    const trimmed = next.trim()
    updateDepositNote(id, trimmed || undefined)
  }

  const handleDelete = (id: string) => {
    const confirmed = window.confirm(
      'Delete this deposit? This will also reopen the day if it came from a tile.',
    )
    if (!confirmed) return
    deleteDeposit(id)
  }

  return (
    <Layout>
      <div className="space-y-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h1
              className={[
                'text-xl font-semibold',
                isDark ? 'text-slate-50' : 'text-slate-900',
              ].join(' ')}
            >
              Deposit history
            </h1>
            <p
              className={[
                'mt-1 text-xs sm:text-sm',
                isDark ? 'text-slate-400' : 'text-slate-600',
              ].join(' ')}
            >
              Every day completion and custom deposit, newest first.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 text-[0.7rem]">
              <label className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                Search
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Amount or day"
                className={[
                  'h-8 rounded-full border px-3 text-xs outline-none ring-0 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/70',
                  isDark
                    ? 'border-slate-800 bg-slate-950 text-slate-100'
                    : 'border-slate-300 bg-white text-slate-800',
                ].join(' ')}
              />
            </div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className={[
                'h-8 rounded-full border px-3 text-xs outline-none ring-0 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/70',
                isDark
                  ? 'border-slate-800 bg-slate-950 text-slate-100'
                  : 'border-slate-300 bg-white text-slate-800',
              ].join(' ')}
            >
              <option value="all">All months</option>
              {months.map((m) => {
                const [year, month] = m.split('-')
                const dt = new Date(Number(year), Number(month) - 1)
                const label = dt.toLocaleDateString(undefined, {
                  month: 'short',
                  year: 'numeric',
                })
                return (
                  <option key={m} value={m}>
                    {label}
                  </option>
                )
              })}
            </select>
            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as 'all' | 'tile' | 'custom')
              }
              className={[
                'h-8 rounded-full border px-3 text-xs outline-none ring-0 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/70',
                isDark
                  ? 'border-slate-800 bg-slate-950 text-slate-100'
                  : 'border-slate-300 bg-white text-slate-800',
              ].join(' ')}
            >
              <option value="all">All types</option>
              <option value="tile">Tile</option>
              <option value="custom">Custom</option>
            </select>
            <button
              type="button"
              onClick={() => {
                exportDepositsToCsv(filtered)
                showToast('CSV exported.', 'success')
              }}
              className={[
                'inline-flex items-center justify-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition',
                isDark
                  ? 'border-slate-700 bg-slate-900 text-slate-100 hover:border-emerald-500/70'
                  : 'border-slate-300 bg-slate-50 text-slate-800 hover:border-emerald-500/70',
              ].join(' ')}
            >
              <span className="text-[0.8rem]">⬇</span>
              Export CSV
            </button>
          </div>
        </div>

        <div
          className={[
            'grid gap-3 rounded-2xl border px-4 py-3 text-xs sm:grid-cols-4',
            isDark
              ? 'border-slate-900 bg-slate-950/60 text-slate-200'
              : 'border-slate-200 bg-white text-slate-800',
          ].join(' ')}
        >
          <div>
            <div className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">
              This month
            </div>
            <div className="mt-1 text-sm font-semibold text-emerald-400">
              {stats.thisMonthTotal.toLocaleString()} $
            </div>
          </div>
          <div>
            <div className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">
              All time total
            </div>
            <div className="mt-1 text-sm font-semibold">
              {stats.allTimeTotal.toLocaleString()} $
            </div>
          </div>
          <div>
            <div className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">
              Average per day
            </div>
            <div className="mt-1 text-sm font-semibold">
              {stats.averagePerDay.toFixed(2)} $
            </div>
          </div>
          <div>
            <div className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">
              Best streak
            </div>
            <div className="mt-1 text-sm font-semibold">
              {stats.bestStreak} day{stats.bestStreak === 1 ? '' : 's'}
            </div>
          </div>
        </div>

        <div
          className={[
            'rounded-2xl border',
            isDark
              ? 'border-slate-900 bg-slate-950/60'
              : 'border-slate-200 bg-white',
          ].join(' ')}
        >
          <div className="border-b border-slate-900/40 px-4 py-2 text-[0.7rem] uppercase tracking-[0.18em] text-slate-500">
            Deposits
          </div>
          {deposits.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs">
              <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                You don&apos;t have any deposits yet.
              </p>
              <button
                type="button"
                onClick={() => navigate('/board')}
                className="mt-4 inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-black shadow shadow-emerald-500/40 transition hover:bg-emerald-400"
              >
                Go to Board
              </button>
              <p className="mt-2 text-[0.7rem] text-slate-500">
                Start your first challenge day on the board to see your history
                grow here.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-slate-500">
              No deposits match your filters or search.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-xs">
                  <thead
                    className={
                      isDark ? 'bg-slate-900 text-slate-300' : 'bg-slate-50'
                    }
                  >
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold">Date</th>
                      <th className="px-3 py-2 text-left font-semibold">Day</th>
                      <th className="px-3 py-2 text-left font-semibold">
                        Amount
                      </th>
                      <th className="px-3 py-2 text-left font-semibold">Type</th>
                      <th className="px-3 py-2 text-left font-semibold">Note</th>
                      <th className="px-3 py-2 text-right font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((d) => {
                      const dt = new Date(d.createdAt)
                      const dateLabel = Number.isNaN(dt.getTime())
                        ? 'Unknown date'
                        : dt.toLocaleString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                      const dayNumber =
                        d.tileId && d.tileId.startsWith('tile-')
                          ? Number(d.tileId.split('-')[1] ?? '0') + 1
                          : undefined
                      const typeLabel = d.tileId ? 'Tile' : 'Custom'

                      return (
                        <tr
                          key={d.id}
                          className={
                            isDark
                              ? 'border-t border-slate-900'
                              : 'border-t border-slate-200'
                          }
                        >
                          <td className="px-3 py-2 align-top">{dateLabel}</td>
                          <td className="px-3 py-2 align-top">
                            {dayNumber ? `Day ${dayNumber}` : '—'}
                          </td>
                          <td className="px-3 py-2 align-top font-semibold text-emerald-500">
                            {d.amount.toLocaleString()} $
                          </td>
                          <td className="px-3 py-2 align-top">
                            <span
                              className={[
                                'inline-flex rounded-full px-2 py-0.5 text-[0.65rem] font-medium',
                                d.tileId
                                  ? isDark
                                    ? 'bg-emerald-900/60 text-emerald-300'
                                    : 'bg-emerald-50 text-emerald-700'
                                  : isDark
                                    ? 'bg-slate-800 text-slate-200'
                                    : 'bg-slate-100 text-slate-700',
                              ].join(' ')}
                            >
                              {typeLabel}
                            </span>
                          </td>
                          <td className="px-3 py-2 align-top max-w-xs">
                            {d.note ? (
                              <span
                                className={
                                  isDark
                                    ? 'text-slate-200'
                                    : 'text-slate-700'
                                }
                              >
                                {d.note}
                              </span>
                            ) : (
                              <span className="text-slate-500">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2 align-top text-right">
                            <div className="inline-flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleEditNote(d.id, d.note)}
                                className="rounded-full border border-slate-300 px-2 py-0.5 text-[0.65rem] text-slate-700 hover:border-emerald-400 hover:text-emerald-600"
                              >
                                Edit note
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(d.id)}
                                className="rounded-full border border-red-300 px-2 py-0.5 text-[0.65rem] text-red-600 hover:border-red-500 hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {filtered.length > pageSize && (
                <div className="flex items-center justify-between px-4 py-3 text-[0.7rem] text-slate-500">
                  <span>
                    Page {currentPageSafe} of {totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={currentPageSafe <= 1}
                      onClick={() =>
                        setCurrentPage((p) => Math.max(1, p - 1))
                      }
                      className="rounded-full border border-slate-300 px-2 py-0.5 disabled:opacity-40"
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      disabled={currentPageSafe >= totalPages}
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      className="rounded-full border border-slate-300 px-2 py-0.5 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}

