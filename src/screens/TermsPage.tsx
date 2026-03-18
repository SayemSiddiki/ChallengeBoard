import { Layout } from '../components/Layout'
import { LegalPageShell } from '../components/LegalPageShell'

export function TermsPage() {
  return (
    <Layout>
      <LegalPageShell
        badge="Terms"
        title="Terms of Use"
        subtitle={
          <>
            By accessing or using <span className="font-semibold">Challenge Board</span>,
            you agree to these Terms of Use. If you do not agree, do not use the
            website.
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-[1fr_0.85fr] md:items-start">
          <div className="space-y-4">
            <section className="space-y-2 rounded-2xl border border-slate-800 bg-black/30 p-5 text-sm text-slate-300">
              <h2 className="text-sm font-semibold text-slate-100">
                1. AS IS SERVICE
              </h2>
              <p>
                Challenge Board is provided on an “as is” and “as available”
                basis. We do not guarantee the website will be uninterrupted,
                error free, or always available.
              </p>
            </section>

            <section className="space-y-2 rounded-2xl border border-slate-800 bg-black/30 p-5 text-sm text-slate-300">
              <h2 className="text-sm font-semibold text-slate-100">
                2. TRACKER ONLY
              </h2>
              <p>
                Challenge Board is a tracking tool. It does not move money,
                process payments, connect to your bank, or provide financial
                services. Any deposits or amounts you enter are for your personal
                tracking only.
              </p>
            </section>

            <section className="space-y-2 rounded-2xl border border-slate-800 bg-black/30 p-5 text-sm text-slate-300">
              <h2 className="text-sm font-semibold text-slate-100">
                3. YOUR RESPONSIBILITY
              </h2>
              <p>
                You are responsible for all decisions and actions related to your
                finances. Any real money transfers must be completed in your own
                banking app or through your bank. You should confirm all
                balances, transactions, and statements directly with your bank.
              </p>
            </section>

            <section className="space-y-2 rounded-2xl border border-slate-800 bg-black/30 p-5 text-sm text-slate-300">
              <h2 className="text-sm font-semibold text-slate-100">
                4. NO FINANCIAL ADVICE
              </h2>
              <p>
                Challenge Board does not provide financial, legal, or tax advice.
                If you need advice, consult a qualified professional.
              </p>
            </section>

            <section className="space-y-2 rounded-2xl border border-slate-800 bg-black/30 p-5 text-sm text-slate-300">
              <h2 className="text-sm font-semibold text-slate-100">
                5. ACCURACY OF INFORMATION
              </h2>
              <p>
                You are responsible for the accuracy of the information you
                enter. The website may show totals and progress based on your
                inputs. These outputs may not match your real bank activity.
              </p>
            </section>

            <section className="space-y-2 rounded-2xl border border-slate-800 bg-black/30 p-5 text-sm text-slate-300">
              <h2 className="text-sm font-semibold text-slate-100">
                6. LIMITATION OF LIABILITY
              </h2>
              <p>
                To the maximum extent allowed by law, Challenge Board and its
                owners will not be liable for any losses or damages arising from
                your use of the website, including financial loss, missed savings
                goals, incorrect entries, or service downtime.
              </p>
            </section>

            <section className="space-y-2 rounded-2xl border border-slate-800 bg-black/30 p-5 text-sm text-slate-300">
              <h2 className="text-sm font-semibold text-slate-100">7. CHANGES</h2>
              <p>
                We may update these Terms at any time. Continued use of the
                website after changes means you accept the updated Terms.
              </p>
            </section>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-black/30 p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Quick summary
              </div>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                <li className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400/80" />
                  Tracker only — no bank connection
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-sky-400/70" />
                  You’re responsible for real transfers
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400/50" />
                  Always verify in your banking app
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                Website
              </div>
              <a
                className="mt-2 inline-block text-sm font-semibold text-emerald-100 underline underline-offset-4 hover:text-emerald-50"
                href="https://challangeboard.com"
                target="_blank"
                rel="noreferrer"
              >
                challangeboard.com
              </a>
            </div>
          </aside>
        </div>
      </LegalPageShell>
    </Layout>
  )
}

