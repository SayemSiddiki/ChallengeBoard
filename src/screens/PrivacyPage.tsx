import { Layout } from '../components/Layout'

export function PrivacyPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-3xl space-y-4">
        <h1 className="text-xl font-semibold text-slate-50">Privacy Policy</h1>
        <p className="text-sm text-slate-400">
          Challenge Board is a savings tracker. We don’t connect to your bank and
          we don’t move money for you.
        </p>
        <div className="space-y-3 text-sm text-slate-400">
          <p>
            <span className="font-semibold text-slate-200">What we store:</span>{' '}
            your board progress (tiles, deposits) and your profile (name) if you
            sign in.
          </p>
          <p>
            <span className="font-semibold text-slate-200">Guest mode:</span>{' '}
            saves data on your device only.
          </p>
          <p>
            <span className="font-semibold text-slate-200">Account mode:</span>{' '}
            syncs your data in the cloud so you can use multiple devices.
          </p>
          <p>
            If you have questions, use the Contact page.
          </p>
        </div>
      </div>
    </Layout>
  )
}

