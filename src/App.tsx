import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useBoardStore, loadBoardStateForCurrentUser } from './store/boardStore'
import { Logo } from './components/logo'
import { getSupabaseClient } from './supabaseClient'
import { useAuthStore } from './store/authStore'
import { useBudgetStore } from './store/budgetStore'
import { bestEffortNameFromMetadata, getProfile, upsertProfile } from './lib/profile'
import { ProfileNameModal } from './components/ProfileNameModal'
import { Footer } from './components/Footer'

function profileFlagKey(userId: string) {
  return `profile-name-set:${userId}`
}

function setSavedNameFlag(userId: string) {
  try {
    window.localStorage.setItem(profileFlagKey(userId), '1')
  } catch {
    // ignore
  }
}

function formatHeaderMoney(amount: number, currency: string) {
  const normalized = currency.trim().toUpperCase()
  if (/^[A-Z]{3}$/.test(normalized)) {
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: normalized,
        maximumFractionDigits: 0,
      }).format(amount)
    } catch {
      // fall through
    }
  }
  return `${currency}${amount.toFixed(0)}`
}

function App() {
  const theme = useBoardStore((s) => s.theme)
  const setTheme = useBoardStore((s) => s.setTheme)
  const budgetAlertBlinkEnabled = useBoardStore((s) => s.budgetAlertBlinkEnabled)
  const toast = useBoardStore((s) => s.toast)
  const clearToast = useBoardStore((s) => s.clearToast)
  const setGuestMode = useBoardStore((s) => s.setGuestMode)
  const location = useLocation()
  const navigate = useNavigate()

  const session = useAuthStore((s) => s.session)
  const setSession = useAuthStore((s) => s.setSession)
  const setIsSessionLoading = useAuthStore((s) => s.setIsSessionLoading)
  const setProfile = useAuthStore((s) => s.setProfile)
  const setIsProfileLoading = useAuthStore((s) => s.setIsProfileLoading)
  const budgetMonths = useBudgetStore((s) => s.months)
  const budgetCurrentMonthId = useBudgetStore((s) => s.currentMonthId)

  const isDark = theme === 'dark'
  const onBudgetPage = location.pathname.startsWith('/budget')
  const headerBudgetMonth = budgetMonths.find((month) => month.meta.id === budgetCurrentMonthId) ?? null
  const headerCurrency = headerBudgetMonth?.meta.currency ?? 'USD'
  const headerIncomeBudget = headerBudgetMonth?.incomes.reduce((sum, row) => sum + row.budgeted, 0) ?? 0
  const headerIncomeActual = headerBudgetMonth?.incomes.reduce((sum, row) => sum + row.actual, 0) ?? 0
  const headerBillsBudget = headerBudgetMonth?.bills.reduce((sum, row) => sum + row.budgeted, 0) ?? 0
  const headerBillsActual = headerBudgetMonth?.bills.reduce((sum, row) => sum + row.actual, 0) ?? 0
  const headerExpensesBudget = headerBudgetMonth?.expenses.reduce((sum, row) => sum + row.budgeted, 0) ?? 0
  const headerExpensesActual = headerBudgetMonth?.expenses.reduce((sum, row) => sum + row.actual, 0) ?? 0
  const headerDebtBudget = headerBudgetMonth?.debts.reduce((sum, row) => sum + row.budgeted, 0) ?? 0
  const headerDebtActual = headerBudgetMonth?.debts.reduce((sum, row) => sum + row.actual, 0) ?? 0
  const headerSavingsBudget = headerBudgetMonth?.savings.reduce((sum, row) => sum + row.budgeted, 0) ?? 0
  const headerSavingsActual = headerBudgetMonth?.savings.reduce((sum, row) => sum + row.actual, 0) ?? 0
  const headerChallenge = headerBudgetMonth?.meta.challengeYourself ?? 0
  const headerLeftBudget =
    headerIncomeBudget -
    (headerBillsBudget + headerExpensesBudget + headerDebtBudget + headerSavingsBudget + headerChallenge)
  const headerLeftActual =
    headerIncomeActual -
    (headerBillsActual + headerExpensesActual + headerDebtActual + headerSavingsActual + headerChallenge)
  const headerHasNegative = headerLeftBudget < 0 || headerLeftActual < 0
  const previousLeftRef = useRef({ budget: headerLeftBudget, actual: headerLeftActual })
  const [leftTrend, setLeftTrend] = useState({ budget: 0, actual: 0 })

  useEffect(() => {
    const supabase = getSupabaseClient()
    if (!supabase) {
      setGuestMode(true)
      setSession(null)
      setProfile(null)
      setIsSessionLoading(false)
      return
    }

    ;(async () => {
      setIsSessionLoading(true)
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      setGuestMode(!data.session)
      setIsSessionLoading(false)

      if (data.session) {
        await loadBoardStateForCurrentUser()

        setIsProfileLoading(true)
        const { profile } = await getProfile(data.session.user.id, supabase)
        if (profile) {
          setProfile(profile)
          if (profile.first_name && profile.last_name) {
            setSavedNameFlag(data.session.user.id)
          }
          setIsProfileLoading(false)
        } else {
          // Attempt to auto-fill from OAuth metadata
          const meta = bestEffortNameFromMetadata(data.session.user.user_metadata)
          if (meta.first_name && meta.last_name) {
            const { profile: saved } = await upsertProfile(
              data.session.user.id,
              {
                first_name: meta.first_name,
                last_name: meta.last_name,
                avatar_url: meta.avatar_url,
              },
              supabase,
            )
            setProfile(saved)
            setSavedNameFlag(data.session.user.id)
          } else {
            setProfile(null)
          }
          setIsProfileLoading(false)
        }
      } else {
        setProfile(null)
      }
    })()

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        setGuestMode(!session)
        if (session) {
          await loadBoardStateForCurrentUser()

          setIsProfileLoading(true)
          const { profile } = await getProfile(session.user.id, supabase)
          if (profile) {
            setProfile(profile)
            if (profile.first_name && profile.last_name) {
              setSavedNameFlag(session.user.id)
            }
            setIsProfileLoading(false)
          } else {
            const meta = bestEffortNameFromMetadata(session.user.user_metadata)
            if (meta.first_name && meta.last_name) {
              const { profile: saved } = await upsertProfile(
                session.user.id,
                {
                  first_name: meta.first_name,
                  last_name: meta.last_name,
                  avatar_url: meta.avatar_url,
                },
                supabase,
              )
              setProfile(saved)
              setSavedNameFlag(session.user.id)
            } else {
              setProfile(null)
            }
            setIsProfileLoading(false)
          }
        } else {
          setProfile(null)
        }
      },
    )

    return () => {
      sub.subscription.unsubscribe()
    }
  }, [setGuestMode, setIsProfileLoading, setIsSessionLoading, setProfile, setSession])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => {
      clearToast()
    }, 3000)
    return () => clearTimeout(t)
  }, [toast, clearToast])

  useEffect(() => {
    if (!onBudgetPage) return
    if (location.hash !== '#cash-flow-section') return
    const id = window.setTimeout(() => {
      const section = document.getElementById('cash-flow-section')
      section?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 120)
    return () => window.clearTimeout(id)
  }, [onBudgetPage, location.hash, location.pathname])

  useEffect(() => {
    const prev = previousLeftRef.current
    setLeftTrend({
      budget:
        headerLeftBudget > prev.budget ? 1 : headerLeftBudget < prev.budget ? -1 : 0,
      actual:
        headerLeftActual > prev.actual ? 1 : headerLeftActual < prev.actual ? -1 : 0,
    })
    previousLeftRef.current = {
      budget: headerLeftBudget,
      actual: headerLeftActual,
    }
  }, [headerLeftBudget, headerLeftActual])

  const handleCashFlowJump = () => {
    if (onBudgetPage) {
      const section = document.getElementById('cash-flow-section')
      section?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    navigate('/budget#cash-flow-section')
  }

  return (
    <div
      className={[
        'relative min-h-screen flex flex-col transition-colors',
        isDark ? 'bg-black text-slate-50' : 'bg-emerald-50 text-slate-900',
      ].join(' ')}
    >
      <ProfileNameModal />
      {!isDark && (
        <>
          <div className="app-bg-gradient-light" />
          <div className="app-bg-blobs-light" />
          <div className="app-bg-edges-light" />
          <div className="app-bg-grid-light" />
        </>
      )}
      {isDark && (
        <>
          <div className="app-bg-stars-dark" />
          <div className="app-bg-stars-dark app-bg-stars-dark--slow" />
        </>
      )}
      {toast && (
        <div className="pointer-events-none fixed inset-x-0 top-4 z-40 flex justify-center">
          <div
            className="pointer-events-auto flex max-w-md items-start gap-3 rounded-xl border border-emerald-500/60 bg-emerald-950/95 px-4 py-3 text-sm text-emerald-50 shadow-lg shadow-emerald-500/40"
            role="status"
            aria-live="polite"
          >
            <div className="mt-0.5 h-5 w-5 flex-shrink-0 rounded-full bg-emerald-500 text-center text-[0.7rem] font-bold text-black">
              ✓
            </div>
            <div className="flex-1">
              <p className="font-semibold">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={clearToast}
              className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs text-emerald-100 hover:bg-emerald-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1 focus:ring-offset-slate-900"
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        </div>
      )}
      <header
        className={[
          'sticky top-0 z-20 border-b backdrop-blur',
          isDark
            ? 'border-slate-800 bg-black/80'
            : 'border-slate-200 bg-white/80',
        ].join(' ')}
      >
        <div className="flex w-full flex-col gap-2 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <Logo />
            <div className="theme-toggle-uiverse flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/budget')}
                className={[
                  'inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold transition',
                  isDark
                    ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                    : 'border-emerald-500 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
                ].join(' ')}
              >
                Budget Plan
              </button>
              {onBudgetPage && (
                <button
                  type="button"
                  onClick={handleCashFlowJump}
                  className={[
                    'inline-flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-[0.65rem] leading-none transition',
                    headerHasNegative && budgetAlertBlinkEnabled
                      ? 'budget-negative-box-blink border-red-500/60 bg-red-500/15 text-red-100'
                      : isDark
                        ? 'border-slate-700 bg-slate-900/80 text-slate-200'
                        : 'border-slate-300 bg-white text-slate-700 hover:border-emerald-400',
                  ].join(' ')}
                  title="Open Cash Flow section"
                >
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-[0.65rem] font-bold text-emerald-400">
                    $
                  </span>
                  <span className="font-semibold text-slate-500">Cash Flow</span>
                  <span
                    className={[
                      headerLeftBudget < 0
                        ? 'text-red-500'
                        : isDark
                          ? 'text-slate-100'
                          : 'text-slate-900'
                    ].join(' ')}
                  >
                    B {formatHeaderMoney(headerLeftBudget, headerCurrency)}
                    <span className="ml-1 text-[0.55rem] align-middle opacity-80">
                      {leftTrend.budget > 0 ? '▲' : leftTrend.budget < 0 ? '▼' : '•'}
                    </span>
                  </span>
                  <span
                    className={[
                      headerLeftActual < 0
                        ? 'text-red-500'
                        : isDark
                          ? 'text-slate-100'
                          : 'text-slate-900'
                    ].join(' ')}
                  >
                    A {formatHeaderMoney(headerLeftActual, headerCurrency)}
                    <span className="ml-1 text-[0.55rem] align-middle opacity-80">
                      {leftTrend.actual > 0 ? '▲' : leftTrend.actual < 0 ? '▼' : '•'}
                    </span>
                  </span>
                </button>
              )}
              <label className="switch" title={isDark ? 'Dark mode' : 'Light mode'}>
                <input
                  type="checkbox"
                  checked={theme === 'light'}
                  onChange={(e) => setTheme(e.target.checked ? 'light' : 'dark')}
                  aria-label={
                    isDark ? 'Switch to light theme' : 'Switch to dark theme'
                  }
                />
                <span className="slider">
                  <span className="star star_1" aria-hidden />
                  <span className="star star_2" aria-hidden />
                  <span className="star star_3" aria-hidden />
                  <svg
                    className="cloud"
                    viewBox="0 0 24 14"
                    aria-hidden
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M18 10h.5A3.5 3.5 0 0 0 22 6.5 3.5 3.5 0 0 0 18.5 3 4 4 0 0 0 11 4.2 3 3 0 0 0 5 7a3 3 0 0 0 3 3h10a2 2 0 0 0 2-2 2 2 0 0 0-2-2z" />
                  </svg>
                </span>
              </label>
              {!session && (
                <button
                  type="button"
                  onClick={() => navigate('/auth')}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-black shadow shadow-emerald-500/40 hover:bg-emerald-400"
                >
                  Sign in
                </button>
              )}
            </div>
          </div>
          <div className="h-px w-full rounded-full border-t border-dotted border-emerald-500/20" />
        </div>
      </header>
      <main className="flex-1">
        <div key={location.pathname} className="page-transition">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default App
