import type { Tile } from '../store/boardStore'
import { useBoardStore } from '../store/boardStore'

interface TileCardProps {
  tile: Tile
  label: string
  onClick: () => void
  disabled?: boolean
  highlight?: boolean
}

export function TileCard({
  tile,
  label,
  onClick,
  disabled,
  highlight,
}: TileCardProps) {
  const theme = useBoardStore((s) => s.theme)
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled ?? tile.isDone}
      className={[
        'group relative flex aspect-[4/3] w-full flex-col items-center justify-center rounded-xl border text-xs font-medium tabular-nums transition',
        tile.isDone
          ? isDark
            ? 'border-emerald-500/40 bg-emerald-900/20 text-emerald-300'
            : 'border-emerald-400/70 bg-emerald-50 text-emerald-700'
          : isDark
            ? 'border-slate-800 bg-slate-900/40 text-slate-100 hover:-translate-y-0.5 hover:border-emerald-500/50 hover:bg-slate-900'
            : 'border-emerald-100 bg-white text-slate-900 hover:-translate-y-0.5 hover:border-emerald-400 hover:bg-emerald-50/60 shadow-sm',
        highlight ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-950' : '',
      ].join(' ')}
    >
      <span className="mb-1 text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">
        {label}
      </span>
      <span className="text-base font-semibold">
        {tile.amount.toLocaleString()} $
      </span>
      {tile.isDone && (
        <>
          <span className="mt-1 inline-flex items-center gap-1 text-[0.65rem] text-emerald-400">
            {tile.completedOutOfOrder ? 'Done early' : 'Done'}
          </span>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="text-red-300/60 text-2xl drop-shadow-[0_0_4px_rgba(248,113,113,0.5)]">
              ❌
            </span>
          </div>
        </>
      )}
    </button>
  )
}

