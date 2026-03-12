import type { ReactNode } from 'react'
import { useBoardStore } from '../store/boardStore'

interface ConfirmModalProps {
  title: string
  description?: string
  amountLabel?: string
  amountDisplay?: string
  notePlaceholder?: string
  note: string
  onNoteChange: (value: string) => void
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  footer?: ReactNode
}

export function ConfirmModal({
  title,
  description,
  amountLabel,
  amountDisplay,
  notePlaceholder = 'Optional note',
  note,
  onNoteChange,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  footer,
}: ConfirmModalProps) {
  const theme = useBoardStore((s) => s.theme)
  const isDark = theme === 'dark'

  return (
    <div
      className={[
        'fixed inset-0 z-40 flex items-center justify-center px-4 backdrop-blur',
        isDark ? 'bg-black/70' : 'bg-slate-200/70',
      ].join(' ')}
    >
      <div
        className={[
          'w-full max-w-md rounded-2xl border p-5 shadow-2xl shadow-emerald-500/20',
          isDark
            ? 'border-slate-800 bg-slate-950/95'
            : 'border-slate-200 bg-white',
        ].join(' ')}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2
              className={[
                'text-base font-semibold',
                isDark ? 'text-slate-50' : 'text-slate-900',
              ].join(' ')}
            >
              {title}
            </h2>
            {description && (
              <p
                className={[
                  'mt-1 text-xs',
                  isDark ? 'text-slate-400' : 'text-slate-600',
                ].join(' ')}
              >
                {description}
              </p>
            )}
          </div>
        </div>
        {amountLabel && amountDisplay && (
          <div
            className={[
              'mb-4 rounded-xl border px-3 py-2.5',
              isDark
                ? 'border-slate-800 bg-slate-900/60'
                : 'border-emerald-100 bg-emerald-50/80',
            ].join(' ')}
          >
            <div className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">
              {amountLabel}
            </div>
            <div className="mt-1 text-lg font-semibold tabular-nums text-emerald-500">
              {amountDisplay}
            </div>
          </div>
        )}
        <div className="mb-4 space-y-2">
          <label
            className={[
              'block text-[0.7rem] font-medium',
              isDark ? 'text-slate-300' : 'text-slate-700',
            ].join(' ')}
          >
            Note
          </label>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder={notePlaceholder}
            className={[
              'w-full rounded-xl border px-3 py-2 text-xs outline-none ring-0 transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/60',
              isDark
                ? 'border-slate-800 bg-slate-900/80 text-slate-100'
                : 'border-slate-200 bg-white text-slate-900',
            ].join(' ')}
          />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onConfirm}
              className="inline-flex flex-1 items-center justify-center rounded-xl bg-emerald-500 px-3 py-2 text-xs font-semibold text-black shadow shadow-emerald-500/40 transition hover:bg-emerald-400"
            >
              {confirmLabel}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className={[
                'inline-flex flex-1 items-center justify-center rounded-xl border px-3 py-2 text-xs font-medium transition',
                isDark
                  ? 'border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500'
                  : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-400',
              ].join(' ')}
            >
              {cancelLabel}
            </button>
          </div>
          {footer && <div className="text-[0.65rem] text-slate-500">{footer}</div>}
        </div>
      </div>
    </div>
  )
}

