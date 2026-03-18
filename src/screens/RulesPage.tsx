import { Layout } from '../components/Layout'
import { LegalPageShell } from '../components/LegalPageShell'
import { useBoardStore } from '../store/boardStore'

export function RulesPage() {
  const theme = useBoardStore((s) => s.theme)
  const isDark = theme === 'dark'

  return (
    <Layout>
      <LegalPageShell
        badge="Rules"
        title="Challenge rules"
        subtitle={
          <>
            A simple way to use this board so the savings challenge stays fun and
            doable. Remember: Challenge Board is a tracker only — you move money
            in your own banking app.
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-[1fr_0.85fr] md:items-start">
          <div
            className={[
              'space-y-4 rounded-2xl border p-5 text-sm',
              isDark
                ? 'border-slate-800 bg-black/30 text-slate-300'
                : 'border-slate-200 bg-white/75 text-slate-700 shadow-sm',
            ].join(' ')}
          >
            <ol className="space-y-3 text-left">
              <li className="flex gap-3">
                <span className="mt-0.5 inline-flex h-7 w-7 flex-none items-center justify-center rounded-full bg-emerald-500/15 text-sm font-semibold text-emerald-200">
                  1
                </span>
                <div>
                  <div
                    className={[
                      'font-semibold',
                      isDark ? 'text-slate-100' : 'text-slate-900',
                    ].join(' ')}
                  >
                    Pick your goal and length.
                  </div>
                  <div className="mt-1">
                    Choose how much you want to save and whether you want a 6,
                    10, or 12 month challenge.
                  </div>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 inline-flex h-7 w-7 flex-none items-center justify-center rounded-full bg-sky-500/15 text-sm font-semibold text-sky-200">
                  2
                </span>
                <div>
                  <div
                    className={[
                      'font-semibold',
                      isDark ? 'text-slate-100' : 'text-slate-900',
                    ].join(' ')}
                  >
                    One day = one amount.
                  </div>
                  <div className="mt-1">
                    Each day on the board has a dollar value. When you save that
                    amount in real life, mark the day as done.
                  </div>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 inline-flex h-7 w-7 flex-none items-center justify-center rounded-full bg-emerald-500/15 text-sm font-semibold text-emerald-200">
                  3
                </span>
                <div>
                  <div
                    className={[
                      'font-semibold',
                      isDark ? 'text-slate-100' : 'text-slate-900',
                    ].join(' ')}
                  >
                    No double‑counting.
                  </div>
                  <div className="mt-1">
                    You can only complete each day once. Extra savings can go
                    into a future day or a custom deposit.
                  </div>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 inline-flex h-7 w-7 flex-none items-center justify-center rounded-full bg-sky-500/15 text-sm font-semibold text-sky-200">
                  4
                </span>
                <div>
                  <div
                    className={[
                      'font-semibold',
                      isDark ? 'text-slate-100' : 'text-slate-900',
                    ].join(' ')}
                  >
                    Use custom deposits when needed.
                  </div>
                  <div className="mt-1">
                    If you save money that doesn&apos;t match a day exactly, record
                    it as a custom deposit.
                  </div>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 inline-flex h-7 w-7 flex-none items-center justify-center rounded-full bg-emerald-500/15 text-sm font-semibold text-emerald-200">
                  5
                </span>
                <div>
                  <div
                    className={[
                      'font-semibold',
                      isDark ? 'text-slate-100' : 'text-slate-900',
                    ].join(' ')}
                  >
                    Undo only the last action.
                  </div>
                  <div className="mt-1">
                    Made a mistake? You can undo the most recent tile completion
                    or custom deposit.
                  </div>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 inline-flex h-7 w-7 flex-none items-center justify-center rounded-full bg-sky-500/15 text-sm font-semibold text-sky-200">
                  6
                </span>
                <div>
                  <div
                    className={[
                      'font-semibold',
                      isDark ? 'text-slate-100' : 'text-slate-900',
                    ].join(' ')}
                  >
                    Stay consistent, not perfect.
                  </div>
                  <div className="mt-1">
                    Miss a day? Just pick it up tomorrow. The board is a guide,
                    not a punishment.
                  </div>
                </div>
              </li>
            </ol>
          </div>

          <aside className="space-y-4">
            <div
              className={[
                'rounded-2xl border p-5',
                isDark
                  ? 'border-slate-800 bg-black/30'
                  : 'border-slate-200 bg-white/75 shadow-sm',
              ].join(' ')}
            >
              <div
                className={[
                  'text-xs font-semibold uppercase tracking-[0.2em]',
                  isDark ? 'text-slate-400' : 'text-slate-500',
                ].join(' ')}
              >
                Real money reminder
              </div>
              <p
                className={[
                  'mt-2 text-sm',
                  isDark ? 'text-slate-300' : 'text-slate-700',
                ].join(' ')}
              >
                Challenge Board doesn&apos;t move money or connect to your bank.
                When you complete a tile, make the real transfer in your own
                banking app.
              </p>
            </div>
            <div
              className={[
                'rounded-2xl border p-5',
                isDark
                  ? 'border-emerald-500/20 bg-emerald-500/10'
                  : 'border-emerald-600/25 bg-white/70 shadow-sm',
              ].join(' ')}
            >
              <div
                className={[
                  'text-xs font-semibold uppercase tracking-[0.2em]',
                  isDark ? 'text-emerald-200' : 'text-emerald-700',
                ].join(' ')}
              >
                Contact
              </div>
              <a
                className={[
                  'mt-2 inline-block text-sm font-semibold underline underline-offset-4',
                  isDark
                    ? 'text-emerald-100 hover:text-emerald-50'
                    : 'text-emerald-800 hover:text-emerald-700',
                ].join(' ')}
                href="mailto:challangeboard@gmail.com"
              >
                challangeboard@gmail.com
              </a>
            </div>
          </aside>
        </div>
      </LegalPageShell>
    </Layout>
  )
}

