import { Layout } from '../components/Layout'
import { LegalPageShell } from '../components/LegalPageShell'
import { useBoardStore } from '../store/boardStore'

export function PrivacyPage() {
  const theme = useBoardStore((s) => s.theme)
  const isDark = theme === 'dark'
  const bodyText = isDark ? 'text-slate-400' : 'text-slate-700'
  const headingText = isDark ? 'text-slate-200' : 'text-slate-900'
  const codePill = isDark
    ? 'bg-slate-900 text-slate-200'
    : 'bg-slate-100 text-slate-800'

  return (
    <Layout>
      <LegalPageShell
        badge="Privacy"
        title="Privacy Policy"
        subtitle={
          <>
            Last updated: <span className="font-semibold">March 18, 2026</span>.
          </>
        }
      >
        <article
          className={[
            'space-y-6 rounded-2xl border p-5',
            isDark
              ? 'border-slate-800 bg-black/30'
              : 'border-slate-200 bg-white/75 shadow-sm',
          ].join(' ')}
        >

        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            1. Introduction
          </h2>
          <p className={['text-sm', bodyText].join(' ')}>
            Challenge Board (“we”, “us”) provides a website that helps you track a
            savings challenge by completing tiles and recording deposits. This
            Privacy Policy explains what data we collect, how we use it, how we
            share it, and the choices you have.
          </p>
          <p className={['text-sm', bodyText].join(' ')}>
            This policy applies to:
          </p>
          <ul
            className={[
              'list-disc space-y-1 pl-5 text-sm',
              bodyText,
            ].join(' ')}
          >
            <li>Our website and any pages that link to this policy</li>
            <li>Features that let you create an account, sign in, or sync your board</li>
            <li>Guest mode features that save your progress on your device</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            2. What data we collect
          </h2>

          <div className="space-y-2">
            <h3 className={['text-sm font-semibold', headingText].join(' ')}>
              2.1 Data you provide
            </h3>
            <p className={['text-sm', bodyText].join(' ')}>
              <span className={['font-semibold', headingText].join(' ')}>
                Account details
              </span>
              <br />
              If you create an account, we collect:
            </p>
            <ol className={['list-decimal space-y-1 pl-5 text-sm', bodyText].join(' ')}>
              <li>Email address</li>
              <li>First name and last name, if you enter it</li>
            </ol>

            <p className={['mt-3 text-sm', bodyText].join(' ')}>
              <span className={['font-semibold', headingText].join(' ')}>
                Sign in with Google
              </span>
              <br />
              If you choose Google sign in, we may receive:
            </p>
            <ol className={['list-decimal space-y-1 pl-5 text-sm', bodyText].join(' ')}>
              <li>Email address</li>
              <li>Name</li>
              <li>Basic profile information, depending on your Google settings</li>
            </ol>

            <p className={['mt-3 text-sm', bodyText].join(' ')}>
              <span className={['font-semibold', headingText].join(' ')}>
                Challenge data you enter
              </span>
              <br />
              We collect what you save inside the product, such as:
            </p>
            <ol className={['list-decimal space-y-1 pl-5 text-sm', bodyText].join(' ')}>
              <li>Goal amount and settings</li>
              <li>Tile amounts and completion status</li>
              <li>Deposit history, including amounts, dates, and notes you type</li>
            </ol>
          </div>

          <div className="space-y-2">
            <h3 className={['text-sm font-semibold', headingText].join(' ')}>
              2.2 Data stored on your device
            </h3>
            <p className={['text-sm', bodyText].join(' ')}>
              Guest mode stores your progress in your browser using local storage.
              <br />
              Key used:{' '}
              <code
                className={[
                  'rounded px-1.5 py-0.5 text-xs',
                  codePill,
                ].join(' ')}
              >
                challenge-board-state-v1
              </code>
            </p>
            <p className={['text-sm', bodyText].join(' ')}>
              Our auth provider may store sign in session data in local storage to
              keep you signed in.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className={['text-sm font-semibold', headingText].join(' ')}>
              2.3 Automatically collected technical data
            </h3>
            <p className={['text-sm', bodyText].join(' ')}>
              Our hosting and authentication providers may log basic technical data
              when you use the site, such as:
            </p>
            <ol className={['list-decimal space-y-1 pl-5 text-sm', bodyText].join(' ')}>
              <li>IP address</li>
              <li>Browser type</li>
              <li>Device type</li>
              <li>Date and time of requests</li>
              <li>Basic error logs</li>
            </ol>
            <p className={['text-sm', bodyText].join(' ')}>
              We do not use this data to build advertising profiles.
            </p>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            3. How we use your data
          </h2>
          <p className={['text-sm', bodyText].join(' ')}>We use your data to:</p>
          <ol className={['list-decimal space-y-1 pl-5 text-sm', bodyText].join(' ')}>
            <li>Provide the website and core features</li>
            <li>Save your board, tiles, and deposit history</li>
            <li>Sync your progress across devices when you are signed in</li>
            <li>Keep the site secure and prevent abuse</li>
            <li>Respond to support messages</li>
            <li>Fix bugs and improve reliability</li>
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            4. How we store your data
          </h2>
          <div className="space-y-2">
            <h3 className={['text-sm font-semibold', headingText].join(' ')}>
              4.1 Guest mode
            </h3>
            <p className={['text-sm', bodyText].join(' ')}>
              If you use guest mode, your challenge data stays on your device in
              local storage. If you clear browser data, switch browsers, or switch
              devices, your guest progress may be removed.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className={['text-sm font-semibold', headingText].join(' ')}>
              4.2 Account mode
            </h3>
            <p className={['text-sm', bodyText].join(' ')}>
              If you sign in, we store your data in our database so it can sync
              across devices. This may include:
            </p>
            <ol className={['list-decimal space-y-1 pl-5 text-sm', bodyText].join(' ')}>
              <li>Profile information (first name, last name, full name)</li>
              <li>Board progress and challenge state</li>
            </ol>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            5. Sharing your data
          </h2>
          <p className={['text-sm', bodyText].join(' ')}>
            We do not sell your personal information.
          </p>
          <p className={['text-sm', bodyText].join(' ')}>
            We share data only when needed to operate the service, such as:
          </p>
          <ol className={['list-decimal space-y-1 pl-5 text-sm', bodyText].join(' ')}>
            <li>Hosting services used to deliver the website</li>
            <li>Authentication and database services used to sign you in and sync your progress</li>
            <li>Email services used for sign in links, if enabled</li>
          </ol>
          <p className={['text-sm', bodyText].join(' ')}>
            These providers process data under their own privacy policies.
          </p>
          <p className={['text-sm', bodyText].join(' ')}>
            We may also share information if required by law or to protect the
            safety and security of users.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            6. Data retention
          </h2>
          <p className={['text-sm', bodyText].join(' ')}>
            We keep account data while your account is active. If you request
            deletion, we will delete or anonymize your account data within a
            reasonable time, unless we must keep certain data for legal or security
            reasons.
          </p>
          <p className={['text-sm', bodyText].join(' ')}>
            Guest mode data stays on your device until you remove it.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            7. Your choices
          </h2>
          <p className={['text-sm', bodyText].join(' ')}>You can:</p>
          <ol className={['list-decimal space-y-1 pl-5 text-sm', bodyText].join(' ')}>
            <li>Use guest mode without creating an account</li>
            <li>Clear local storage in your browser to remove guest progress</li>
            <li>Sign out on shared devices</li>
            <li>Contact us to request access, correction, or deletion of your account data</li>
          </ol>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            12. Analytics
          </h2>
          <p className={['text-sm', bodyText].join(' ')}>
            We do not currently use third party analytics. If we add analytics
            later, we will update this policy.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            13. Security
          </h2>
          <p className={['text-sm', bodyText].join(' ')}>
            We use reasonable safeguards to protect your data. No online service
            can guarantee perfect security. Use a secure email account and sign
            out on shared devices.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            14. Children
          </h2>
          <p className={['text-sm', bodyText].join(' ')}>
            The service is not intended for children under 13. If a child provided
            personal information, contact us and we will delete it.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            15. Third party links
          </h2>
          <p className={['text-sm', bodyText].join(' ')}>
            Our site may link to third party websites. Their privacy practices are
            not controlled by us.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            16. Changes to this policy
          </h2>
          <p className={['text-sm', bodyText].join(' ')}>
            We may update this policy from time to time. We will post the updated
            version and change the Last updated date.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            17. Emails
          </h2>
          <p className={['text-sm', bodyText].join(' ')}>
            If we send emails for magic link sign in, we use your email address
            only for authentication. We do not use your email for marketing unless
            you explicitly opt in.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            18. Contact
          </h2>
          <p className={['text-sm', bodyText].join(' ')}>
            If you have questions or requests about privacy, email us at{' '}
            <a
              className={[
                'underline underline-offset-2',
                isDark
                  ? 'text-emerald-300 hover:text-emerald-200'
                  : 'text-emerald-800 hover:text-emerald-700',
              ].join(' ')}
              href="mailto:challangeboard@gmail.com"
            >
              challangeboard@gmail.com
            </a>
            .
          </p>
        </section>
        </article>
      </LegalPageShell>
    </Layout>
  )
}

