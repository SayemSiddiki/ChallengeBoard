import { useEffect, useMemo, useState } from 'react'
import { useBoardStore } from '../store/boardStore'

const STEPS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]

export function FooterProgress() {
  const goalAmount = useBoardStore((s) => s.goalAmount)
  const [stepIndex, setStepIndex] = useState(0)
  const [displayAmount, setDisplayAmount] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)

  const percent = STEPS[stepIndex]

  const targetAmount = useMemo(() => {
    if (!goalAmount || goalAmount <= 0) {
      return percent * 10
    }
    return Math.round((goalAmount * percent) / 100)
  }, [goalAmount, percent])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handle = (event: MediaQueryListEvent | MediaQueryList) => {
      setReducedMotion(event.matches)
    }

    handle(mq)
    if ('addEventListener' in mq) {
      mq.addEventListener('change', handle)
      return () => mq.removeEventListener('change', handle)
    }
    // Fallback for older browsers
    mq.addListener(handle)
    return () => mq.removeListener(handle)
  }, [])

  useEffect(() => {
    if (reducedMotion) {
      setStepIndex(STEPS.length - 1)
      setDisplayAmount(targetAmount)
      return
    }

    let cancelled = false

    const tick = () => {
      setStepIndex((prev) => {
        const nextIndex = prev + 1
        if (nextIndex >= STEPS.length) {
          return 0
        }
        return nextIndex
      })
      const currentStep = STEPS[stepIndex]
      const delay = currentStep === 100 ? 1800 : 900
      if (!cancelled) {
        setTimeout(tick, delay)
      }
    }

    const initialDelay = 900
    const id = setTimeout(tick, initialDelay)

    return () => {
      cancelled = true
      clearTimeout(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion])

  useEffect(() => {
    if (reducedMotion) return
    let frameId: number | null = null
    const start = performance.now()
    const duration = 450
    const from = displayAmount
    const to = targetAmount

    const animate = (now: number) => {
      const elapsed = now - start
      const t = Math.min(1, elapsed / duration)
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
      const value = Math.round(from + (to - from) * eased)
      setDisplayAmount(value)
      if (t < 1) {
        frameId = requestAnimationFrame(animate)
      }
    }

    frameId = requestAnimationFrame(animate)
    return () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetAmount, reducedMotion])

  const clampedPercent = Math.min(100, Math.max(0, percent))
  const truckLeft = clampedPercent === 0 ? 0 : clampedPercent

  return (
    <section className="full-bleed mt-8 w-screen">
      <div className="mx-auto w-full max-w-6xl rounded-2xl border border-emerald-100 bg-emerald-50/80 px-4 py-4 text-xs text-slate-700 shadow-sm shadow-emerald-500/10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="font-medium text-slate-800">
            Journey preview
            <span className="ml-2 text-[0.7rem] font-normal text-slate-500">
              Truck delivers your savings across the board.
            </span>
          </div>
          <div className="flex items-center gap-3 text-[0.7rem]">
            <span className="font-semibold text-emerald-600">
              {clampedPercent}%
            </span>
            <span className="text-slate-500">
              ≈ {displayAmount.toLocaleString()} $
            </span>
          </div>
        </div>
        <div
          className="relative mt-3 h-3 w-full overflow-hidden rounded-full bg-emerald-100/60"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={clampedPercent}
          aria-label="Animated savings journey preview"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-cyan-400"
            style={{
              width: `${clampedPercent}%`,
              transition: 'width 700ms ease-out',
            }}
          />
          <span
            className="pointer-events-none absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-lg"
            style={{
              left: `${truckLeft}%`,
              transition: 'left 700ms ease-out, transform 700ms ease-out',
            }}
            aria-hidden="true"
          >
            🚚
          </span>
        </div>
      </div>
    </section>
  )
}

