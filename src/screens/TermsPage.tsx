import { Layout } from '../components/Layout'

export function TermsPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-3xl space-y-4">
        <h1 className="text-xl font-semibold text-slate-50">Terms</h1>
        <p className="text-sm text-slate-400">
          By using Challenge Board, you agree this app is provided “as is”.
        </p>
        <div className="space-y-3 text-sm text-slate-400">
          <p>
            Challenge Board is a tracker only. You’re responsible for any real
            money transfers you make in your banking app.
          </p>
          <p>
            Do not rely on this app as a banking statement. Always verify your
            balance in your bank.
          </p>
        </div>
      </div>
    </Layout>
  )
}

