import { Layout } from '../components/Layout'

export function ContactPage() {
  return (
    <Layout>
      <div className="mx-auto w-full max-w-5xl px-4 py-6">
        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/25 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent p-6 md:p-10">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-16 -top-16 h-56 w-56 animate-pulse rounded-full bg-emerald-500/20 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-72 w-72 animate-pulse rounded-full bg-sky-500/15 blur-3xl [animation-delay:900ms]" />
            <svg
              className="absolute right-6 top-6 h-32 w-32 opacity-40"
              viewBox="0 0 200 200"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="cb-contact-ring" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="rgb(16 185 129)" stopOpacity="0.6" />
                  <stop offset="1" stopColor="rgb(56 189 248)" stopOpacity="0.35" />
                </linearGradient>
              </defs>
              <circle
                cx="100"
                cy="100"
                r="72"
                fill="none"
                stroke="url(#cb-contact-ring)"
                strokeWidth="10"
                strokeDasharray="10 14"
              />
              <path
                d="M56 104c0 10 10 22 44 22s44-12 44-22-10-18-44-18-44 8-44 18Z"
                fill="rgb(16 185 129 / 0.18)"
              />
            </svg>
          </div>

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-emerald-200">
              Support
              <span className="inline-flex h-1.5 w-1.5 animate-ping rounded-full bg-emerald-400" />
            </div>

            <div className="mt-4 grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-start">
              <div className="space-y-4">
                <h1 className="text-balance text-2xl font-semibold text-slate-50 md:text-3xl">
                  Contact Challenge Board
                </h1>
                <p className="max-w-2xl text-sm text-slate-300 md:text-base">
                  Need help, found a bug, or want to share feedback? Send us an
                  email and we’ll get back to you.
                </p>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <a
                    className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-black shadow shadow-emerald-500/35 transition-transform hover:-translate-y-0.5 hover:bg-emerald-400"
                    href="mailto:challangeboard@gmail.com"
                  >
                    Email us
                  </a>
                  <a
                    className="inline-flex items-center justify-center rounded-full border border-emerald-500/30 bg-black/20 px-4 py-2 text-sm font-semibold text-emerald-200 transition-colors hover:bg-black/35"
                    href="mailto:challangeboard@gmail.com"
                  >
                    challangeboard@gmail.com
                  </a>
                </div>

                <div className="grid gap-3 pt-2 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-800 bg-black/30 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Replies
                    </div>
                    <div className="mt-1 text-sm font-semibold text-slate-100">
                      Within 24–48 hours
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-black/30 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Best for
                    </div>
                    <div className="mt-1 text-sm font-semibold text-slate-100">
                      Support & feedback
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-black/30 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Include
                    </div>
                    <div className="mt-1 text-sm font-semibold text-slate-100">
                      Screenshot + device
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-2xl border border-slate-800 bg-black/30 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Quick tips
                    </div>
                    <span className="text-xs font-semibold text-emerald-200">
                      Helps us respond faster
                    </span>
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-slate-300">
                    <li className="flex gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400/80" />
                      What you were trying to do
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-sky-400/70" />
                      What happened instead (error text)
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400/50" />
                      Browser + device (ex: Chrome on Android)
                    </li>
                  </ul>
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-black/30 p-4">
                  <div className="pointer-events-none absolute inset-0 opacity-60">
                    <svg
                      className="absolute -right-8 -top-8 h-40 w-40 animate-[spin_16s_linear_infinite]"
                      viewBox="0 0 200 200"
                      aria-hidden="true"
                    >
                      <path
                        d="M100 20c44.2 0 80 35.8 80 80s-35.8 80-80 80-80-35.8-80-80 35.8-80 80-80Zm0 18c-34.2 0-62 27.8-62 62s27.8 62 62 62 62-27.8 62-62-27.8-62-62-62Z"
                        fill="rgb(16 185 129 / 0.14)"
                      />
                    </svg>
                    <svg
                      className="absolute -left-10 bottom-0 h-44 w-44 animate-[floaty_5s_ease-in-out_infinite]"
                      viewBox="0 0 200 200"
                      aria-hidden="true"
                    >
                      <defs>
                        <radialGradient id="cb-contact-blob" cx="50%" cy="50%" r="60%">
                          <stop offset="0" stopColor="rgb(56 189 248)" stopOpacity="0.35" />
                          <stop offset="1" stopColor="rgb(16 185 129)" stopOpacity="0.05" />
                        </radialGradient>
                      </defs>
                      <path
                        d="M42.4,-62.5C56.4,-55.7,70.3,-47.5,75.4,-35.6C80.5,-23.7,76.8,-8.1,71.6,5.3C66.3,18.6,59.6,29.8,50.7,40.1C41.8,50.4,30.6,59.9,17.9,67.1C5.2,74.3,-9.1,79.1,-23.7,77.7C-38.2,76.3,-53.1,68.7,-60.8,56.5C-68.6,44.4,-69.3,27.6,-71.5,11.1C-73.7,-5.3,-77.5,-21.4,-72.8,-34.5C-68.1,-47.6,-55,-57.6,-40.9,-64.8C-26.8,-72,-13.4,-76.4,-0.1,-76.2C13.1,-76,26.3,-71.2,42.4,-62.5Z"
                        transform="translate(100 100)"
                        fill="url(#cb-contact-blob)"
                      />
                    </svg>
                  </div>

                  <div className="relative">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      A note
                    </div>
                    <p className="mt-2 text-sm text-slate-300">
                      Challenge Board is a tracking tool only and doesn’t connect
                      to your bank. If something looks wrong, always confirm your
                      real balance inside your banking app.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

