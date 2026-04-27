import { Link, useNavigate } from 'react-router-dom'
import { Github, Instagram, Mail, X } from 'lucide-react'

type FooterLinkProps = {
  label: string
  to: string
  onClick?: () => void
}

function FooterLink({ label, to, onClick }: FooterLinkProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block text-sm text-slate-400 hover:text-emerald-300"
    >
      {label}
    </Link>
  )
}

export function Footer() {
  const navigate = useNavigate()

  const goHomeAndScroll = (hash: string) => {
    navigate(`/home${hash}`)
  }

  return (
    <footer className="mt-10 w-full border-t border-emerald-500/20 bg-slate-950">
      <div className="pointer-events-none h-0.5 w-full bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent shadow-[0_-8px_30px_rgba(16,185,129,0.25)]" />

      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="text-lg font-semibold text-slate-50">
              Challenge Board
            </div>
            <div className="mt-1 text-sm text-slate-400">
              Turn a big goal into daily wins.
            </div>
            <div className="mt-4 text-xs leading-relaxed text-slate-500">
              Guest mode saves on this device. Account syncs in the cloud.
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
              Product
            </div>
            <div className="mt-3 space-y-2">
              <FooterLink
                label="How it works"
                to="/home#how-it-works"
                onClick={() => goHomeAndScroll('#how-it-works')}
              />
              <FooterLink label="Rules" to="/rules" />
              <FooterLink
                label="Features"
                to="/home#features"
                onClick={() => goHomeAndScroll('#features')}
              />
              {/* Pricing link intentionally hidden until used */}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
              Tools
            </div>
            <div className="mt-3 space-y-2">
              <FooterLink label="Start a new challenge" to="/settings" />
              <FooterLink label="Random day" to="/board#random" />
              <FooterLink label="Export CSV" to="/history#export" />
              <FooterLink label="Reset board" to="/settings#reset" />
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
              Support
            </div>
            <div className="mt-3 space-y-2">
              <FooterLink label="Privacy Policy" to="/privacy" />
              <FooterLink label="Terms" to="/terms" />
              <FooterLink label="Contact" to="/contact" />
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-6 text-xs text-slate-500 sm:flex-row">
          <div>Copyright © 2026 Challenge Board</div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="text-slate-400 hover:text-emerald-300"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href="https://x.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="X"
              className="text-slate-400 hover:text-emerald-300"
            >
              <X className="h-4 w-4" />
            </a>
            <a
              href="https://instagram.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="text-slate-400 hover:text-emerald-300"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="mailto:challangeboard@gmail.com"
              aria-label="Email"
              className="text-slate-400 hover:text-emerald-300"
            >
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

