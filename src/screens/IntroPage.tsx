import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

const pieceLayout = (row: number, col: number): string | null => {
  const rank = 7 - row
  const files = 'abcdefgh'
  const file = files[col]
  const pos = `${file}${rank + 1}`

  const map: Record<string, string> = {
    a1: 'R',
    b1: 'N',
    c1: 'B',
    d1: 'Q',
    e1: 'K',
    f1: 'B',
    g1: 'N',
    h1: 'R',
    a2: 'P',
    b2: 'P',
    c2: 'P',
    d2: 'P',
    e2: 'P',
    f2: 'P',
    g2: 'P',
    h2: 'P',
    a8: 'r',
    b8: 'n',
    c8: 'b',
    d8: 'q',
    e8: 'k',
    f8: 'b',
    g8: 'n',
    h8: 'r',
    a7: 'p',
    b7: 'p',
    c7: 'p',
    d7: 'p',
    e7: 'p',
    f7: 'p',
    g7: 'p',
    h7: 'p',
  }

  return map[pos] ?? null
}

const pieceSymbol: Record<string, string> = {
  p: '♟',
  r: '♜',
  n: '♞',
  b: '♝',
  q: '♛',
  k: '♚',
  P: '♙',
  R: '♖',
  N: '♘',
  B: '♗',
  Q: '♕',
  K: '♔',
}

export function IntroPage() {
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [amounts, setAmounts] = useState<number[]>(
    () => Array.from({ length: 64 }, () => 10 + Math.floor(Math.random() * 291)),
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setAmounts((prev) =>
        prev.map(() => 10 + Math.floor(Math.random() * 291)),
      )
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (event) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = (event.clientX - rect.left - rect.width / 2) / rect.width
    const y = (event.clientY - rect.top - rect.height / 2) / rect.height
    const maxTilt = 8
    setTilt({
      x: x * maxTilt,
      y: -y * maxTilt,
    })
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-gradient-to-b from-black via-slate-950 to-slate-900 px-4"
      onClick={() => navigate('/home', { replace: true })}
    >
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center text-slate-100">
        <p className="mb-6">
          <span
            className="quote-shimmer text-3xl sm:text-4xl md:text-5xl leading-tight whitespace-nowrap text-white"
            style={{ fontFamily: 'Rooster' }}
          >
            &ldquo;Protect your king and your pieces, protect your cash and your savings.&rdquo;
          </span>
        </p>

        <div className="relative mx-auto flex w-full justify-center">
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative w-full max-w-3xl rounded-3xl border border-emerald-400/60 bg-slate-950/95 p-5 shadow-[0_0_60px_rgba(16,185,129,0.6)] sm:p-8"
            style={{
              transform: `perspective(1400px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
              transition: 'transform 150ms ease-out',
              transformStyle: 'preserve-3d',
            }}
          >
            <div className="mx-auto grid w-full max-w-2xl grid-cols-8 gap-[3px] rounded-2xl border border-emerald-500/70 bg-emerald-900/70 p-3 shadow-inner sm:p-4">
              {Array.from({ length: 64 }).map((_, index) => {
                const row = Math.floor(index / 8)
                const col = index % 8
                const isDarkSquare = (row + col) % 2 === 0
                const piece = pieceLayout(row, col)
                const symbol = piece ? pieceSymbol[piece] : null
                const isWhite = piece ? piece === piece.toUpperCase() : false
                return (
                  // eslint-disable-next-line react/no-array-index-key
                  <div
                    key={index}
                    className={[
                      'aspect-square rounded-[5px] border border-emerald-900/40 flex items-center justify-center text-[0.7rem] sm:text-sm font-semibold',
                      isDarkSquare ? 'bg-emerald-700' : 'bg-emerald-300',
                    ].join(' ')}
                  >
                    {symbol ? (
                      <span
                        className={
                          isWhite
                            ? 'text-slate-50 drop-shadow-[0_0_4px_rgba(15,23,42,0.8)]'
                            : 'text-emerald-950'
                        }
                      >
                        {symbol}
                      </span>
                    ) : (
                      <span className="text-emerald-950/80">
                        ${amounts[index]}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}


