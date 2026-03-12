interface GoalBadgeProps {
  goalAmount: number
  mode?: 'dark' | 'light'
}

export function GoalBadge({ goalAmount, mode = 'dark' }: GoalBadgeProps) {
  const isDark = mode === 'dark'

  return (
    <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/15 via-emerald-400/5 to-emerald-500/10 px-4 py-2 text-right shadow-lg shadow-emerald-500/20">
      <div className="flex flex-col text-xs text-emerald-600">
        <span className="font-semibold uppercase tracking-[0.2em]">
          Goal
        </span>
        <span className="text-[0.7rem] text-emerald-500/90">Saved challenge</span>
      </div>
      <div className="flex flex-col items-end">
        <span
          className={[
            'text-[0.7rem] uppercase tracking-[0.18em]',
            isDark ? 'text-slate-300' : 'text-slate-600',
          ].join(' ')}
        >
          Target
        </span>
        <span className="text-lg font-semibold tabular-nums text-emerald-500">
          {goalAmount.toLocaleString()} $
        </span>
      </div>
    </div>
  )
}

