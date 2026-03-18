import { Layout } from '../components/Layout'

export function ContactPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-3xl space-y-4">
        <h1 className="text-xl font-semibold text-slate-50">Contact</h1>
        <p className="text-sm text-slate-400">
          Need help or want to share feedback?
        </p>
        <div className="space-y-3 text-sm text-slate-400">
          <p>
            Email us at{' '}
            <a
              className="text-emerald-300 underline underline-offset-2 hover:text-emerald-200"
              href="mailto:hello@challengeboard.app"
            >
              hello@challengeboard.app
            </a>
            .
          </p>
        </div>
      </div>
    </Layout>
  )
}

