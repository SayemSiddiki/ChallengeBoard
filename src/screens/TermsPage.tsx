import { Layout } from '../components/Layout'

export function TermsPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-3xl space-y-4">
        <h1 className="text-xl font-semibold text-slate-50">Terms of Use</h1>
        <p className="text-sm text-slate-400">
          By accessing or using Challenge Board, you agree to these Terms of
          Use. If you do not agree, do not use the website.
        </p>

        <div className="space-y-4 text-sm text-slate-400">
          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-200">
              1. AS IS SERVICE
            </h2>
            <p>
              Challenge Board is provided on an “as is” and “as available”
              basis. We do not guarantee the website will be uninterrupted,
              error free, or always available.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-200">
              2. TRACKER ONLY
            </h2>
            <p>
              Challenge Board is a tracking tool. It does not move money,
              process payments, connect to your bank, or provide financial
              services. Any deposits or amounts you enter are for your personal
              tracking only.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-200">
              3. YOUR RESPONSIBILITY
            </h2>
            <p>
              You are responsible for all decisions and actions related to your
              finances. Any real money transfers must be completed in your own
              banking app or through your bank. You should confirm all
              balances, transactions, and statements directly with your bank.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-200">
              4. NO FINANCIAL ADVICE
            </h2>
            <p>
              Challenge Board does not provide financial, legal, or tax advice.
              If you need advice, consult a qualified professional.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-200">
              5. ACCURACY OF INFORMATION
            </h2>
            <p>
              You are responsible for the accuracy of the information you
              enter. The website may show totals and progress based on your
              inputs. These outputs may not match your real bank activity.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-200">
              6. LIMITATION OF LIABILITY
            </h2>
            <p>
              To the maximum extent allowed by law, Challenge Board and its
              owners will not be liable for any losses or damages arising from
              your use of the website, including financial loss, missed savings
              goals, incorrect entries, or service downtime.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-200">7. CHANGES</h2>
            <p>
              We may update these Terms at any time. Continued use of the
              website after changes means you accept the updated Terms.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  )
}

