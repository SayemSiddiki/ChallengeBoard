import { useEffect, useMemo, useRef } from 'react'
import type { MouseEventHandler } from 'react'
import { useBoardStore } from '../store/boardStore'

type CompletionCardModalProps = {
  isOpen: boolean
  amount: number
  percent: number
  dayNumber: number
  streakDays: number | null
  totalSaved: number
  onClose: () => void
  onNextTile?: () => void
}

export function CompletionCardModal({
  isOpen,
  amount,
  percent,
  dayNumber,
  streakDays,
  totalSaved,
  onClose,
  onNextTile,
}: CompletionCardModalProps) {
  const cardRef = useRef<HTMLDivElement | null>(null)
  const showToast = useBoardStore((s) => s.showToast)

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  const clampedPercent = useMemo(
    () => Math.min(100, Math.max(0, Math.round(percent))),
    [percent],
  )

  const motivationalLine = useMemo(() => {
    const options = [
      'Small steps build big savings.',
      'One more step toward your goal.',
      'Consistency wins.',
    ]
    const index = dayNumber % options.length
    return options[index]
  }, [dayNumber])

  const handleBackdropClick: MouseEventHandler<HTMLDivElement> = (event) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  const handleShare = async () => {
    const text = `Day ${dayNumber} complete. I saved $${amount}. ${clampedPercent}% done on my Challenge Board.`
    const shareData = {
      title: 'Challenge Board',
      text,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // user cancelled; no-op
      }
    } else {
      showToast('Sharing is not supported on this device.', 'info')
    }
  }

  const handleDownload = async () => {
    if (!cardRef.current) return
    try {
      const html2canvasModule = await import('html2canvas')
      const html2canvas = html2canvasModule.default
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: window.devicePixelRatio || 2,
      })
      const dataUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `challenge-board-day-${dayNumber}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      showToast('Card downloaded.', 'success')
    } catch (error) {
      console.error('Error generating PNG card', error)
      showToast('Could not download card.', 'error')
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4"
      onClick={handleBackdropClick}
    >
      {/* Confetti */}
      <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden">
        {Array.from({ length: 35 }).map((_, i) => {
          const left = Math.random() * 100
          const duration = 4 + Math.random() * 2
          const delay = Math.random() * 1.2
          const size = 6 + Math.random() * 6
          const colors = ['#22c55e', '#06b6d4', '#facc15', '#a5b4fc']
          const color = colors[i % colors.length]
          return (
            <span
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              className="completion-confetti"
              style={{
                left: `${left}%`,
                animationDuration: `${duration}s`,
                animationDelay: `${delay}s`,
                width: `${size}px`,
                height: `${size * 0.4}px`,
                backgroundColor: color,
              }}
            />
          )
        })}
      </div>

      <div
        ref={cardRef}
        className="completion-modal-card relative w-full max-w-md rounded-3xl border border-emerald-100 bg-slate-950/95 p-6 text-center text-slate-50 shadow-2xl shadow-emerald-500/25 sm:p-7"
      >
        <div className="mb-3 inline-flex items-center justify-center rounded-full bg-emerald-500/10 px-4 py-1 text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-emerald-300">
          🎉 Day {dayNumber || '?'} Complete
        </div>
        <div className="relative mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-2xl text-black completion-check-glow">
          ✓
        </div>
        <p className="mt-1 text-sm text-slate-300">
          You saved{' '}
          <span className="font-semibold text-emerald-300">
            <span className="mr-1 inline-block align-middle">🪙</span>
            ${amount.toLocaleString()}
          </span>{' '}
          today.
        </p>
        <p className="mt-1 text-xs text-slate-400 sm:text-sm">
          {clampedPercent}% of your goal completed.
          {typeof streakDays === 'number' && streakDays > 0 && (
            <div className="mt-1 text-[0.8rem] font-semibold text-emerald-300">
              <span className="mr-1">🔥</span>
              Streak: {streakDays} day{streakDays === 1 ? '' : 's'}
            </div>
          )}
        </p>
        <p className="mt-1 text-[0.75rem] text-emerald-200">
          {motivationalLine}
        </p>
        <p className="mt-1 text-[0.7rem] text-slate-400">
          Total saved:{' '}
          <span className="font-semibold text-emerald-300">
            ${totalSaved.toLocaleString()}
          </span>
        </p>

        <div className="mt-4">
          <div className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-emerald-400">
            Savings Progress
          </div>
          <div className="flex items-center justify-between text-[0.7rem] text-slate-400">
            <span>Today&apos;s day</span>
            <span className="font-medium text-emerald-300">
              {clampedPercent}%
            </span>
          </div>
          <div
            className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={clampedPercent}
            aria-label="Day completion progress"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-cyan-400"
              style={{ width: `${clampedPercent}%` }}
            />
          </div>
        </div>

        {/* Share preview */}
        <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-slate-900/70 px-4 py-3 text-left text-[0.75rem] text-slate-100 shadow-inner shadow-emerald-500/20">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[0.7rem] uppercase tracking-[0.18em] text-emerald-300">
                Share preview
              </div>
              <div className="mt-1 font-semibold">
                Day {dayNumber || '?'} • ${amount.toLocaleString()}
              </div>
              <div className="mt-0.5 text-[0.7rem] text-slate-400">
                {clampedPercent}% of goal · Total {totalSaved.toLocaleString()} $
              </div>
            </div>
            <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-lg text-emerald-300 sm:flex">
              ✓
            </div>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-2 text-xs sm:gap-3">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center justify-center gap-1 rounded-full border border-emerald-400/80 bg-emerald-500/20 px-4 py-1.5 font-semibold text-emerald-200 hover:bg-emerald-500/30"
          >
            Share
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center justify-center gap-1 rounded-full border border-sky-400/80 bg-sky-500/20 px-4 py-1.5 font-semibold text-sky-100 hover:bg-sky-500/30"
          >
            Download
          </button>
          {onNextTile && (
            <button
              type="button"
              onClick={onNextTile}
              className="inline-flex items-center justify-center gap-1 rounded-full border border-emerald-400/70 bg-emerald-500 px-4 py-1.5 font-semibold text-black shadow shadow-emerald-500/40 hover:bg-emerald-400"
            >
              Next Tile
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full border border-slate-600 bg-slate-900 px-4 py-1.5 font-medium text-slate-200 hover:border-slate-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

