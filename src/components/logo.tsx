export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <svg
        aria-hidden="true"
        viewBox="0 0 64 64"
        className="h-9 w-9 drop-shadow-sm"
      >
        <defs>
          <linearGradient id="cb-board-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="cb-coin" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>
        </defs>

        {/* Board background */}
        <rect
          x="4"
          y="6"
          width="40"
          height="40"
          rx="10"
          fill="url(#cb-board-bg)"
        />
        {/* Board inner panel */}
        <rect
          x="8"
          y="10"
          width="32"
          height="32"
          rx="7"
          fill="#022c22"
          opacity="0.3"
        />

        {/* Grid squares */}
        {Array.from({ length: 4 }).map((_, row) =>
          Array.from({ length: 4 }).map((__, col) => {
            const baseX = 10 + col * 8
            const baseY = 12 + row * 8
            const isTop = row === 0
            const isHighlight = row === 2 && col === 3
            const fill = isHighlight
              ? '#22c55e'
              : isTop
                ? '#4ade80'
                : '#38bdf8'
            return (
              <rect
                key={`${row}-${col}`}
                x={baseX}
                y={baseY}
                width="6"
                height="6"
                rx="1.4"
                fill={fill}
              />
            )
          }),
        )}

        {/* Flag mast */}
        <rect x="40" y="4" width="3" height="16" rx="1" fill="#f97316" />
        {/* Flag */}
        <path
          d="M43 6 L53 9 L43 12 Z"
          fill="#fb923c"
          stroke="#ea580c"
          strokeWidth="0.7"
        />

        {/* Coin stack base */}
        <ellipse
          cx="22"
          cy="44"
          rx="8"
          ry="3"
          fill="#facc15"
          opacity="0.25"
        />

        {/* Front coin */}
        <circle cx="22" cy="38" r="8" fill="url(#cb-coin)" />
        <circle cx="22" cy="38" r="6" fill="#fefce8" opacity="0.3" />
        <path
          d="M22 33.5c-2.2 0-3.8 1.3-3.8 3 0 1.6 1.1 2.5 2.6 2.9l1.1.3c0.9.2 1.4.5 1.4 1 0 .6-.6 1-1.5 1-0.9 0-1.7-.3-2.3-.9l-1.1 1.7c.8.8 2 1.3 3.4 1.3 2.4 0 4.1-1.3 4.1-3.3 0-1.7-1.1-2.6-2.7-3l-1.1-.3c-.8-.2-1.3-.4-1.3-.9 0-.5.5-.9 1.3-.9.8 0 1.6.3 2.1.8l1.1-1.7c-.7-.8-1.9-1.2-3.3-1.2Z"
          fill="#92400e"
        />

        {/* Check badge */}
        <rect
          x="28"
          y="32"
          width="10"
          height="10"
          rx="2"
          fill="#22c55e"
          stroke="#16a34a"
          strokeWidth="1"
        />
        <path
          d="M30.5 37.5l2.2 2.2 4-4"
          fill="none"
          stroke="#ecfdf5"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <div className="leading-tight">
        <div className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-emerald-500">
          Challenge
        </div>
        <div className="text-sm font-semibold text-slate-900">
          Board
        </div>
      </div>
    </div>
  )
}


