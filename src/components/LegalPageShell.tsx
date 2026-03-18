import type { ReactNode } from 'react'

type LegalPageShellProps = {
  badge?: string
  title: string
  subtitle?: ReactNode
  children: ReactNode
}

export function LegalPageShell({
  badge = 'Legal',
  title,
  subtitle,
  children,
}: LegalPageShellProps) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent p-6 md:p-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-20 h-64 w-64 animate-pulse rounded-full bg-emerald-500/18 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-80 w-80 animate-pulse rounded-full bg-sky-500/14 blur-3xl [animation-delay:900ms]" />
          <svg
            className="absolute right-6 top-6 h-32 w-32 opacity-40"
            viewBox="0 0 200 200"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="cb-legal-ring" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="rgb(16 185 129)" stopOpacity="0.6" />
                <stop offset="1" stopColor="rgb(56 189 248)" stopOpacity="0.35" />
              </linearGradient>
            </defs>
            <circle
              cx="100"
              cy="100"
              r="72"
              fill="none"
              stroke="url(#cb-legal-ring)"
              strokeWidth="10"
              strokeDasharray="10 14"
            />
            <path
              d="M56 104c0 10 10 22 44 22s44-12 44-22-10-18-44-18-44 8-44 18Z"
              fill="rgb(16 185 129 / 0.18)"
            />
          </svg>
        </div>

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-emerald-200">
            {badge}
            <span className="inline-flex h-1.5 w-1.5 animate-ping rounded-full bg-emerald-400" />
          </div>

          <div className="mt-4 space-y-3">
            <h1 className="text-balance text-2xl font-semibold text-slate-50 md:text-3xl">
              {title}
            </h1>
            {subtitle ? (
              <div className="max-w-3xl text-sm text-slate-300 md:text-base">
                {subtitle}
              </div>
            ) : null}
          </div>

          <div className="mt-7">{children}</div>
        </div>
      </div>
    </div>
  )
}

