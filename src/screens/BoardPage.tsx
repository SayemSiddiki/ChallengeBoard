import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { GoalBadge } from '../components/GoalBadge'
import { TileCard } from '../components/TileCard'
import { ConfirmModal } from '../components/ConfirmModal'
import type { Tile } from '../store/boardStore'
import { useBoardStore } from '../store/boardStore'
import { CompletionCardModal } from '../components/CompletionCardModal'

export function BoardPage() {
  const location = useLocation()
  const {
    goalAmount,
    tiles,
    deposits,
    guestMode,
    completeTile,
    addCustomDeposit,
    undoLastAction,
    resetBoard,
  } = useBoardStore()
  const showToast = useBoardStore((s) => s.showToast)

  const [selectedTile, setSelectedTile] = useState<Tile | null>(null)
  const [note, setNote] = useState('')
  const [customAmount, setCustomAmount] = useState('')
  const [customNote, setCustomNote] = useState('')
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [resetText, setResetText] = useState('')
  const [celebrateKey, setCelebrateKey] = useState(0)
  const [completionCard, setCompletionCard] = useState<{
    isOpen: boolean
    amount: number
    percent: number
    dayNumber: number
    streakDays: number | null
  }>({
    isOpen: false,
    amount: 0,
    percent: 0,
    dayNumber: 0,
    streakDays: null,
  })
  const [anyDayMode, setAnyDayMode] = useState(false)
  const [selectedDayNumber, setSelectedDayNumber] = useState<number | null>(
    null,
  )
  const [selectedOutOfOrder, setSelectedOutOfOrder] = useState(false)
  const [highlightTileId, setHighlightTileId] = useState<string | null>(null)

  useEffect(() => {
    if (location.hash !== '#random') return
    const el = document.getElementById(
      'random-tile-btn',
    ) as HTMLButtonElement | null
    el?.focus()
  }, [location.hash])

  useEffect(() => {
    if (!celebrateKey) return
    const t = setTimeout(() => setCelebrateKey(0), 1600)
    return () => clearTimeout(t)
  }, [celebrateKey])

  const totalSaved = useMemo(
    () => deposits.reduce((sum, d) => sum + d.amount, 0),
    [deposits],
  )

  const remaining = Math.max(0, goalAmount - totalSaved)
  const progress = Math.min(100, (totalSaved / goalAmount) * 100 || 0)

  const clampedProgress = Math.min(100, Math.max(0, progress))
  const todayIndex = tiles.findIndex((t) => !t.isDone)
  const allDone = tiles.length > 0 && todayIndex === -1

  const handleRandomTile = () => {
    if (allDone) {
      showToast('Challenge complete. All days are done.', 'info')
      return
    }
    const remainingTiles = tiles.filter((t) => !t.isDone)
    if (!remainingTiles.length) return
    const picked =
      remainingTiles[Math.floor(Math.random() * remainingTiles.length)]
    const tileIndex = tiles.findIndex((t) => t.id === picked.id)
    const dayNumber = tileIndex >= 0 ? tileIndex + 1 : null
    const outOfOrder =
      todayIndex >= 0 && tileIndex >= 0 && tileIndex !== todayIndex
    setSelectedTile(picked)
    setNote('')
    setSelectedDayNumber(dayNumber)
    setSelectedOutOfOrder(outOfOrder)
  }

  const handleConfirmTile = () => {
    if (!selectedTile) return
    const tileIndex = tiles.findIndex((t) => t.id === selectedTile.id)
    const dayNumber = tileIndex >= 0 ? tileIndex + 1 : 0

    const now = new Date()
    const nowKey = now.toISOString().slice(0, 10)
    const daySet = new Set<string>()
    deposits.forEach((d) => {
      const dt = new Date(d.createdAt)
      if (!Number.isNaN(dt.getTime())) {
        daySet.add(dt.toISOString().slice(0, 10))
      }
    })
    daySet.add(nowKey)

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

    const percentAfter = Math.min(
      100,
      ((totalSaved + selectedTile.amount) / goalAmount) * 100 || 0,
    )

    setCompletionCard({
      isOpen: true,
      amount: selectedTile.amount,
      percent: percentAfter,
      dayNumber,
      streakDays: bestStreak || null,
    })

    completeTile(selectedTile.id, note.trim() || undefined)
    setSelectedTile(null)
    setNote('')
    setCelebrateKey((k) => k + 1)
    showToast('Tile completed. Progress updated.', 'success')
  }

  const handleCustomConfirm = () => {
    const value = Number(customAmount)
    if (!Number.isFinite(value) || value <= 0) return
    addCustomDeposit(value, customNote.trim() || undefined)
    setShowCustomModal(false)
    setCustomAmount('')
    setCustomNote('')
    setCelebrateKey((k) => k + 1)
  }

  const handleReset = () => {
    if (resetText.toLowerCase() !== 'reset') return
    resetBoard()
    setShowResetConfirm(false)
    setResetText('')
  }

  return (
    <Layout>
      {celebrateKey > 0 && (
        <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => {
            const left = Math.random() * 100
            const duration = 1 + Math.random() * 0.8
            const delay = Math.random() * 0.2
            const size = 18 + Math.random() * 10
            const isMoney = i % 2 === 0
            const symbol = isMoney ? '$' : '🎉'
            return (
              <span
                key={`${celebrateKey}-${i}`}
                className="money-rain-item"
                style={{
                  left: `${left}%`,
                  animationDuration: `${duration}s`,
                  animationDelay: `${delay}s`,
                  fontSize: `${size}px`,
                }}
              >
                {symbol}
              </span>
            )
          })}
        </div>
      )}
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-slate-50 sm:text-2xl">
              Savings challenge board
            </h1>
            <p className="max-w-md text-xs text-slate-400 sm:text-sm">
              Tap tiles as you save money. Each tile is a mini win that moves
              you closer to your big goal.
            </p>
          </div>
          <div className="flex flex-col items-end gap-3 sm:items-end">
            <GoalBadge goalAmount={goalAmount} />
            {guestMode && (
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1 text-[0.7rem] text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Guest mode.{' '}
                <button
                  type="button"
                  className="underline-offset-2 hover:text-slate-50 hover:underline"
                >
                  Sign in to sync.
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-4 rounded-2xl border border-slate-900 bg-slate-950/60 p-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-6 sm:p-6">
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
              <div className="mb-3 flex items-center justify-between gap-4">
                <div>
                  <div className="text-[0.7rem] uppercase tracking-[0.18em] text-slate-400">
                    Total saved
                  </div>
                  <div className="mt-1 text-2xl font-semibold tabular-nums text-emerald-300">
                    {totalSaved.toLocaleString()} $
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[0.7rem] uppercase tracking-[0.18em] text-slate-500">
                    Remaining
                  </div>
                  <div className="mt-1 text-base font-medium tabular-nums text-slate-200">
                    {remaining.toLocaleString()} $
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <div
                  className="relative h-2 w-full overflow-hidden rounded-full bg-slate-800"
                  role="progressbar"
                  aria-valuenow={clampedProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Savings progress: ${clampedProgress.toFixed(1)}%`}
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-300 transition-all"
                    style={{ width: `${clampedProgress}%` }}
                  />
                  <span
                    className="pointer-events-none absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-[0.7rem] text-emerald-200"
                    style={{ left: `${clampedProgress}%` }}
                    aria-hidden="true"
                  >
                    💵
                  </span>
                </div>
                <div className="flex items-center justify-between text-[0.7rem] text-slate-500">
                  <span>{progress.toFixed(1)}% complete</span>
                  <span>
                    {tiles.filter((t) => t.isDone).length} / {tiles.length} days
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleRandomTile}
                id="random-tile-btn"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-100 transition hover:border-emerald-500 hover:bg-slate-900/90"
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-[0.7rem] text-emerald-300">
                  ?
                </span>
                Random tile
              </button>
              <button
                type="button"
                onClick={() => setShowCustomModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-100 transition hover:border-sky-500 hover:bg-slate-900/90"
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-sky-500/20 text-[0.7rem] text-sky-300">
                  +
                </span>
                Add custom deposit
              </button>
              <button
                type="button"
                onClick={undoLastAction}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-slate-600"
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[0.7rem]">
                  ↺
                </span>
                Undo last action
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-900/60 bg-red-950/60 px-3 py-2 text-xs font-medium text-red-200 transition hover:border-red-500 hover:bg-red-950"
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20 text-[0.7rem] text-red-300">
                  !
                </span>
                Reset board
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2 text-xs text-slate-500">
              <div className="flex items-center justify-between gap-2">
                <span>Tap a day to mark it as saved.</span>
                <span className="rounded-full border border-slate-800 bg-slate-900/80 px-2 py-0.5">
                  {tiles.length} days
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2">
                  <span>Any day mode</span>
                  <button
                    type="button"
                    onClick={() => setAnyDayMode((v) => !v)}
                    className={[
                      'inline-flex items-center rounded-full border px-3 py-1 text-[0.7rem] font-semibold transition',
                      anyDayMode
                        ? 'border-emerald-400 bg-emerald-500 text-black'
                        : 'border-slate-600 bg-slate-900 text-slate-300',
                    ].join(' ')}
                  >
                    {anyDayMode ? 'On' : 'Off'}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (allDone) {
                      showToast('Challenge complete. All days are done.', 'info')
                      return
                    }
                    const openTiles = tiles.filter((t) => !t.isDone)
                    if (!openTiles.length) return
                    const cheapest = openTiles.reduce((min, t) =>
                      t.amount < min.amount ? t : min,
                    openTiles[0])
                    setHighlightTileId(cheapest.id)
                    const el = document.querySelector<HTMLButtonElement>(
                      `[data-tile-id="${cheapest.id}"]`,
                    )
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
                    }
                  }}
                  className="inline-flex items-center rounded-full border border-emerald-400/70 bg-slate-900 px-3 py-1 text-[0.7rem] font-medium text-emerald-300 hover:border-emerald-300"
                >
                  Find cheapest open tile
                </button>
              </div>
              {allDone && (
                <p className="text-[0.75rem] text-emerald-300">
                  Challenge complete – all days are done.
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
              {tiles.map((tile, index) => {
                const isToday = todayIndex === index
                const disabled =
                  tile.isDone || (!anyDayMode && !isToday) || allDone
                return (
                  <TileCard
                    key={tile.id}
                    tile={tile}
                    label={`Day ${index + 1}`}
                    onClick={() => {
                      if (disabled) return
                      setSelectedTile(tile)
                      setNote('')
                      setSelectedDayNumber(index + 1)
                      const outOfOrder =
                        todayIndex >= 0 && index !== todayIndex
                      setSelectedOutOfOrder(outOfOrder)
                    }}
                    disabled={disabled}
                    highlight={highlightTileId === tile.id}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {selectedTile && (
        <ConfirmModal
          title={
            selectedDayNumber
              ? `Day ${selectedDayNumber}`
              : 'Complete this tile?'
          }
          description={
            selectedOutOfOrder
              ? 'You are completing this day out of order. We will add this amount to your saved total and lock this tile.'
              : 'We will add this amount to your saved total and lock this tile.'
          }
          amountLabel="Day amount"
          amountDisplay={`${selectedTile.amount.toLocaleString()} $`}
          note={note}
          onNoteChange={setNote}
          confirmLabel="Complete this tile"
          cancelLabel="Keep for later"
          onConfirm={handleConfirmTile}
          onCancel={() => setSelectedTile(null)}
          footer="You can always undo the most recent action."
        />
      )}

      {showCustomModal && (
        <ConfirmModal
          title="Add custom deposit"
          description="Record a manual deposit that does not come from a tile."
          amountLabel="Deposit amount"
          amountDisplay={
            customAmount && Number(customAmount) > 0
              ? `${Number(customAmount).toLocaleString()} $`
              : 'Enter an amount'
          }
          note={customNote}
          onNoteChange={setCustomNote}
          confirmLabel="Add deposit"
          cancelLabel="Cancel"
          onConfirm={handleCustomConfirm}
          onCancel={() => setShowCustomModal(false)}
          footer={
            <div className="flex items-center justify-between gap-2">
              <input
                type="number"
                min={1}
                step={1}
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Amount"
                className="w-28 rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 text-xs text-slate-100 outline-none ring-0 placeholder:text-slate-600 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/70"
              />
              <span>Does not affect tiles.</span>
            </div>
          }
        />
      )}

      {showResetConfirm && (
        <ConfirmModal
          title="Reset board and tiles?"
          description='Type "reset" to confirm. This will regenerate tile amounts and clear history.'
          note={resetText}
          notePlaceholder='Type "reset" to continue'
          onNoteChange={setResetText}
          confirmLabel="Reset board"
          cancelLabel="Cancel"
          onConfirm={handleReset}
          onCancel={() => setShowResetConfirm(false)}
        />
      )}

      <CompletionCardModal
        isOpen={completionCard.isOpen}
        amount={completionCard.amount}
        percent={completionCard.percent}
        dayNumber={completionCard.dayNumber}
        streakDays={completionCard.streakDays}
        totalSaved={totalSaved}
        onClose={() =>
          setCompletionCard((prev) => ({
            ...prev,
            isOpen: false,
          }))
        }
        onNextTile={() => {
          setCompletionCard((prev) => ({
            ...prev,
            isOpen: false,
          }))
          handleRandomTile()
        }}
      />
    </Layout>
  )
}

