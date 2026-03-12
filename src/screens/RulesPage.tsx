import { Layout } from '../components/Layout'

export function RulesPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-3xl space-y-5">
        <div>
          <h1 className="text-xl font-semibold text-slate-50 sm:text-2xl">
            Challenge rules
          </h1>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            A simple way to use this board so the savings challenge stays fun and doable.
          </p>
        </div>
        <div className="space-y-4 rounded-2xl border border-slate-900 bg-slate-950/70 p-5 text-sm text-slate-200">
          <ol className="space-y-3 text-left text-xs sm:text-sm">
            <li>
              <span className="font-semibold text-emerald-400">1. Pick your goal and length.</span>{' '}
              Choose how much you want to save and whether you want a 6, 10, or 12 month challenge.
            </li>
            <li>
              <span className="font-semibold text-emerald-400">2. One day = one amount.</span>{' '}
              Each day on the board has a dollar value. When you save that amount in real life, mark the day as done.
            </li>
            <li>
              <span className="font-semibold text-emerald-400">3. No double‑counting.</span>{' '}
              You can only complete each day once. Extra savings can go into a future day or a custom deposit.
            </li>
            <li>
              <span className="font-semibold text-emerald-400">4. Use custom deposits when needed.</span>{' '}
              If you save money that doesn&apos;t match a day exactly, record it as a custom deposit.
            </li>
            <li>
              <span className="font-semibold text-emerald-400">5. Undo only the last action.</span>{' '}
              Made a mistake? You can undo the most recent tile completion or custom deposit.
            </li>
            <li>
              <span className="font-semibold text-emerald-400">6. Stay consistent, not perfect.</span>{' '}
              Miss a day? Just pick it up tomorrow. The board is a guide, not a punishment.
            </li>
          </ol>
        </div>
      </div>
    </Layout>
  )
}

