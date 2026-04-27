import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { useBoardStore } from '../store/boardStore'
import type {
  BudgetCategory,
  BudgetMonthData,
} from '../store/budgetStore'
import { useBudgetStore } from '../store/budgetStore'
import { exportBudgetMonthToCsv } from '../utils/budgetCsv'

const palette = {
  cashFlow: '#B4D7E8',
  bills: '#F5C7D4',
  expenses: '#F4D8C1',
  debt: '#B4D7E8',
  income: '#E8E4F3',
  savings: '#E8E4F3',
  log: '#F4D8C1',
  breakdown: '#F5C7D4',
}

function numberInput(value: number, onChange: (value: string) => void) {
  return (
    <input
      type="number"
      min={0}
      step="0.01"
      value={Number.isFinite(value) && value !== 0 ? value : ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder="--"
      className="h-8 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/60"
    />
  )
}

function sectionCard(
  children: React.ReactNode,
  title: string,
  color: string,
  options: {
    sectionId?: string
    cardId?: string
    expanded?: boolean
    onToggleExpand?: (cardId: string) => void
  } = {},
) {
  const { sectionId, cardId, expanded = false, onToggleExpand } = options
  return (
    <section
      id={sectionId}
      className={[
        'rounded-2xl border border-slate-200 bg-white shadow-sm transition',
        expanded ? 'lg:col-span-full lg:scale-[1.01]' : '',
      ].join(' ')}
    >
      <div
        className="flex items-center justify-between gap-2 rounded-t-2xl px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-slate-700"
        style={{ backgroundColor: color }}
      >
        <span className="truncate whitespace-nowrap">{title}</span>
        {cardId && onToggleExpand && (
          <button
            type="button"
            onClick={() => onToggleExpand(cardId)}
            className="rounded border border-slate-500/30 bg-white/60 px-2 py-0.5 text-[0.62rem] font-semibold text-slate-700"
          >
            {expanded ? 'Normal' : 'Expand'}
          </button>
        )}
      </div>
      <div className="p-3 text-slate-800 sm:p-4">{children}</div>
    </section>
  )
}

function formatMoney(amount: number, currency: string) {
  const normalized = currency.trim().toUpperCase()
  if (/^[A-Z]{3}$/.test(normalized)) {
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: normalized,
        maximumFractionDigits: 2,
      }).format(amount)
    } catch {
      // fall through to symbol formatting
    }
  }
  return `${currency}${amount.toFixed(2)}`
}

function categoryOptions(category: BudgetCategory, month: BudgetMonthData) {
  if (category === 'Income') return month.incomes.map((item) => item.source)
  if (category === 'Bills') return month.bills.map((item) => item.name)
  if (category === 'Expenses') return month.expenses.map((item) => item.name)
  if (category === 'Debt') return month.debts.map((item) => item.creditor)
  return month.savings.map((item) => item.name)
}

function CircularBudgetCard({
  leftActual,
  totalIncomeActual,
  currency,
}: {
  leftActual: number
  totalIncomeActual: number
  currency: string
}) {
  const safeMax = Math.max(totalIncomeActual, 1)
  const ratio = Math.max(0, Math.min(1, leftActual / safeMax))
  const radius = 38
  const circumference = 2 * Math.PI * radius
  const offset = circumference - ratio * circumference
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 100 100" className="h-24 w-24">
        <circle cx="50" cy="50" r={radius} stroke="#e2e8f0" strokeWidth="10" fill="none" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke={leftActual < 0 ? '#ef4444' : '#10b981'}
          strokeWidth="10"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div>
        <p className="text-xs text-slate-500">Remaining</p>
        <p className={['text-lg font-semibold', leftActual < 0 ? 'text-red-500' : 'text-emerald-600'].join(' ')}>
          {formatMoney(leftActual, currency)}
        </p>
      </div>
    </div>
  )
}

export function BudgetPage() {
  const navigate = useNavigate()
  const theme = useBoardStore((s) => s.theme)
  const showToast = useBoardStore((s) => s.showToast)
  const {
    initialized,
    saving,
    lastSavedAt,
    months,
    currentMonthId,
    initialize,
    selectMonth,
    updateMonthMeta,
    addIncome,
    updateIncome,
    deleteIncome,
    addBill,
    updateBill,
    deleteBill,
    addExpense,
    updateExpense,
    deleteExpense,
    addDebt,
    updateDebt,
    deleteDebt,
    addSavings,
    updateSavings,
    deleteSavings,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refreshSync,
  } = useBudgetStore()
  const isDark = theme === 'dark'
  const [showBreakdownLarge, setShowBreakdownLarge] = useState(false)
  const [breakdownSlide, setBreakdownSlide] = useState(0)
  const [breakdownAllInOne, setBreakdownAllInOne] = useState(false)
  const [breakdownAnimProgress, setBreakdownAnimProgress] = useState(1)
  const [breakdownNotes, setBreakdownNotes] = useState<
    Record<string, Array<{ id: string; text: string; createdAt: string }>>
  >({})
  const [noteCursorByMonth, setNoteCursorByMonth] = useState<Record<string, number>>({})
  const [openNote, setOpenNote] = useState<{ title: string; text: string; createdAt: string } | null>(null)
  const [noteDraft, setNoteDraft] = useState('')
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null)

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('budget-breakdown-notes-v2')
      if (!raw) return
      const parsed = JSON.parse(raw) as Record<
        string,
        Array<{ id: string; text: string; createdAt: string }>
      >
      setBreakdownNotes(parsed)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem('budget-breakdown-notes-v2', JSON.stringify(breakdownNotes))
    } catch {
      // ignore
    }
  }, [breakdownNotes])

  const activeMonth = useMemo(
    () => months.find((month) => month.meta.id === currentMonthId) ?? null,
    [months, currentMonthId],
  )

  const summary = useMemo(() => {
    if (!activeMonth) return null
    const totalIncomeBudget = activeMonth.incomes.reduce((sum, row) => sum + row.budgeted, 0)
    const totalIncomeActual = activeMonth.incomes.reduce((sum, row) => sum + row.actual, 0)
    const totalBillsBudget = activeMonth.bills.reduce((sum, row) => sum + row.budgeted, 0)
    const totalBillsActual = activeMonth.bills.reduce((sum, row) => sum + row.actual, 0)
    const totalExpensesBudget = activeMonth.expenses.reduce((sum, row) => sum + row.budgeted, 0)
    const totalExpensesActual = activeMonth.expenses.reduce((sum, row) => sum + row.actual, 0)
    const billsAndExpensesBudget = totalBillsBudget + totalExpensesBudget
    const billsAndExpensesActual = totalBillsActual + totalExpensesActual
    const totalDebtBudget = activeMonth.debts.reduce((sum, row) => sum + row.budgeted, 0)
    const totalDebtActual = activeMonth.debts.reduce((sum, row) => sum + row.actual, 0)
    const totalSavingsBudget = activeMonth.savings.reduce((sum, row) => sum + row.budgeted, 0)
    const totalSavingsActual = activeMonth.savings.reduce((sum, row) => sum + row.actual, 0)
    const challengeYourself = activeMonth.meta.challengeYourself ?? 0
    const leftBudget =
      totalIncomeBudget - (billsAndExpensesBudget + totalDebtBudget + totalSavingsBudget + challengeYourself)
    const leftActual =
      totalIncomeActual - (billsAndExpensesActual + totalDebtActual + totalSavingsActual + challengeYourself)
    const breakdownTotalBudget =
      billsAndExpensesBudget + totalDebtBudget + totalSavingsBudget + challengeYourself
    const breakdownTotalActual =
      billsAndExpensesActual + totalDebtActual + totalSavingsActual + challengeYourself
    const spendByDate = [...activeMonth.transactions]
      .filter((tx) => tx.type === 'expense')
      .sort((a, b) => a.date.localeCompare(b.date))
    return {
      totalIncomeBudget,
      totalIncomeActual,
      totalBillsBudget,
      totalBillsActual,
      totalExpensesBudget,
      totalExpensesActual,
      billsAndExpensesBudget,
      billsAndExpensesActual,
      totalDebtBudget,
      totalDebtActual,
      totalSavingsBudget,
      totalSavingsActual,
      challengeYourself,
      leftBudget,
      leftActual,
      breakdownTotalBudget,
      breakdownTotalActual,
      billsPercentBudget:
        breakdownTotalBudget > 0 ? (billsAndExpensesBudget / breakdownTotalBudget) * 100 : 0,
      debtPercentBudget:
        breakdownTotalBudget > 0 ? (totalDebtBudget / breakdownTotalBudget) * 100 : 0,
      savingsPercentBudget:
        breakdownTotalBudget > 0 ? (totalSavingsBudget / breakdownTotalBudget) * 100 : 0,
      challengePercentBudget:
        breakdownTotalBudget > 0 ? (challengeYourself / breakdownTotalBudget) * 100 : 0,
      billsPercentActual:
        breakdownTotalActual > 0 ? (billsAndExpensesActual / breakdownTotalActual) * 100 : 0,
      debtPercentActual:
        breakdownTotalActual > 0 ? (totalDebtActual / breakdownTotalActual) * 100 : 0,
      savingsPercentActual:
        breakdownTotalActual > 0 ? (totalSavingsActual / breakdownTotalActual) * 100 : 0,
      challengePercentActual:
        breakdownTotalActual > 0 ? (challengeYourself / breakdownTotalActual) * 100 : 0,
      spendByDate,
    }
  }, [activeMonth])

  const saveBreakdownNote = () => {
    if (!activeMonth) return
    const text = noteDraft.trim()
    if (!text) return
    const entry = {
      id: crypto.randomUUID(),
      text,
      createdAt: new Date().toISOString(),
    }
    setBreakdownNotes((prev) => ({
      ...prev,
      [activeMonth.meta.id]: [entry, ...(prev[activeMonth.meta.id] ?? [])],
    }))
    setNoteCursorByMonth((prev) => ({
      ...prev,
      [activeMonth.meta.id]: 0,
    }))
    setNoteDraft('')
  }

  useEffect(() => {
    if (!showBreakdownLarge || !breakdownAllInOne) {
      setBreakdownAnimProgress(1)
      return
    }
    setBreakdownAnimProgress(0)
    let progress = 0
    const id = window.setInterval(() => {
      progress += 0.04
      if (progress >= 1) {
        setBreakdownAnimProgress(1)
        window.clearInterval(id)
      } else {
        setBreakdownAnimProgress(progress)
      }
    }, 60)
    return () => window.clearInterval(id)
  }, [showBreakdownLarge, breakdownAllInOne])

  if (!initialized) {
    return (
      <Layout>
        <p className="text-sm text-slate-400">Loading budget tracker…</p>
      </Layout>
    )
  }

  if (!activeMonth || !summary) {
    return (
      <Layout>
        <p className="text-sm text-slate-400">No budget month available.</p>
      </Layout>
    )
  }

  const barRows = [
    { label: 'Income', budget: summary.totalIncomeBudget, actual: summary.totalIncomeActual },
    { label: 'Savings', budget: summary.totalSavingsBudget, actual: summary.totalSavingsActual },
    { label: 'Bills', budget: summary.totalBillsBudget, actual: summary.totalBillsActual },
    { label: 'Expenses', budget: summary.totalExpensesBudget, actual: summary.totalExpensesActual },
    { label: 'Debt', budget: summary.totalDebtBudget, actual: summary.totalDebtActual },
    { label: 'Challenge', budget: summary.challengeYourself, actual: summary.challengeYourself },
  ]
  const maxBar = Math.max(...barRows.flatMap((item) => [item.budget, item.actual]), 1)
  const toggleCardExpand = (cardId: string) => {
    setExpandedCardId((prev) => (prev === cardId ? null : cardId))
  }

  return (
    <Layout>
      <div className="space-y-5">
        <div
          className={[
            'flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-end sm:justify-between',
            isDark
              ? 'bg-transparent'
              : 'bg-white/70 shadow-sm',
          ].join(' ')}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div>
              <div className="text-[0.7rem] uppercase tracking-[0.16em] text-slate-500">Month</div>
              <select
                value={activeMonth.meta.id}
                onChange={(e) => selectMonth(e.target.value)}
                className="mt-1 h-9 rounded-xl border border-slate-700 bg-slate-950 px-3 text-xs text-slate-100"
              >
                {months.map((month) => (
                  <option key={month.meta.id} value={month.meta.id}>
                    {month.meta.month}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="text-[0.7rem] uppercase tracking-[0.16em] text-slate-500">Challenge Yourself</div>
              <button
                type="button"
                onClick={() => navigate('/budget/challenge')}
                className="mt-1 inline-flex h-9 items-center justify-center rounded-xl border border-emerald-500/60 bg-emerald-500/10 px-3 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20"
              >
                Spinner
              </button>
            </div>
            <div className="min-w-[220px]">
              <div className="text-[0.7rem] uppercase tracking-[0.16em] text-slate-500">Notes</div>
              <div
                className={[
                  'mt-1 rounded-xl px-2 py-1 text-[0.7rem]',
                  isDark
                    ? 'border border-slate-700 bg-slate-950/70 text-slate-300'
                    : 'border border-slate-200 bg-white text-slate-700 shadow-sm',
                ].join(' ')}
              >
                {(breakdownNotes[activeMonth.meta.id] ?? []).length === 0 ? (
                  <span className="text-slate-500">No notes yet</span>
                ) : (
                  (() => {
                    const notes = breakdownNotes[activeMonth.meta.id] ?? []
                    const cursorRaw = noteCursorByMonth[activeMonth.meta.id] ?? 0
                    const cursor = Math.min(Math.max(cursorRaw, 0), notes.length - 1)
                    const current = notes[cursor]
                    return (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className={['font-semibold', isDark ? 'text-emerald-300' : 'text-emerald-600'].join(' ')}>
                            Note {cursor + 1} of {notes.length}
                          </div>
                          <div className="inline-flex gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                setNoteCursorByMonth((prev) => ({
                                  ...prev,
                                  [activeMonth.meta.id]: Math.max(0, cursor - 1),
                                }))
                              }
                              disabled={cursor === 0}
                              className={[
                                'rounded px-1.5 py-0 text-[0.65rem] disabled:opacity-40',
                                isDark
                                  ? 'border border-slate-600'
                                  : 'border border-slate-300 text-slate-600',
                              ].join(' ')}
                            >
                              {'<'}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setNoteCursorByMonth((prev) => ({
                                  ...prev,
                                  [activeMonth.meta.id]: Math.min(notes.length - 1, cursor + 1),
                                }))
                              }
                              disabled={cursor >= notes.length - 1}
                              className={[
                                'rounded px-1.5 py-0 text-[0.65rem] disabled:opacity-40',
                                isDark
                                  ? 'border border-slate-600'
                                  : 'border border-slate-300 text-slate-600',
                              ].join(' ')}
                            >
                              {'>'}
                            </button>
                          </div>
                        </div>
                        <div className="line-clamp-2">{current.text}</div>
                        <div className="text-[0.62rem] text-slate-500">
                          {new Date(current.createdAt).toLocaleString()}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setOpenNote({
                              title: `Note ${cursor + 1} of ${notes.length}`,
                              text: current.text,
                              createdAt: current.createdAt,
                            })
                          }
                          className={[
                            'mt-1 rounded border px-2 py-0.5 text-[0.62rem] hover:bg-emerald-500/10',
                            isDark
                              ? 'border-emerald-500/60 text-emerald-300'
                              : 'border-emerald-500 text-emerald-600',
                          ].join(' ')}
                        >
                          Open
                        </button>
                      </div>
                    )
                  })()
                )}
              </div>
            </div>
          </div>
          <div className="text-right text-[0.7rem] text-slate-400">
            <button
              type="button"
              onClick={() => {
                exportBudgetMonthToCsv(activeMonth)
                showToast('Budget CSV exported.', 'success')
              }}
              className="mb-1 inline-flex h-8 items-center justify-center rounded-full border border-slate-700 px-3 text-[0.7rem] text-slate-200 hover:border-emerald-500"
            >
              Export CSV
            </button>
            <div>{saving ? 'Saving…' : lastSavedAt ? `Saved ${new Date(lastSavedAt).toLocaleTimeString()}` : 'Not saved yet'}</div>
            <button type="button" onClick={refreshSync} className="mt-1 underline decoration-dotted">
              Sync now
            </button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          {sectionCard(
            <CircularBudgetCard leftActual={summary.leftActual} totalIncomeActual={summary.totalIncomeActual} currency={activeMonth.meta.currency} />,
            'Left to Budget',
            palette.cashFlow,
            { cardId: 'left', expanded: expandedCardId === 'left', onToggleExpand: toggleCardExpand },
          )}
          {sectionCard(
            <div className="space-y-2">
              {barRows.map((row) => (
                <div key={row.label}>
                  <div className="mb-1 flex justify-between text-[0.7rem] text-slate-600">
                    <span>{row.label}</span>
                    <span>
                      B {activeMonth.meta.currency}
                      {row.budget.toFixed(0)} / A {activeMonth.meta.currency}
                      {row.actual.toFixed(0)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full bg-slate-500/70" style={{ width: `${(row.budget / maxBar) * 100}%` }} />
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full bg-emerald-500/80" style={{ width: `${(row.actual / maxBar) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>,
            'Budget vs Actual',
            palette.cashFlow,
            { cardId: 'bva', expanded: expandedCardId === 'bva', onToggleExpand: toggleCardExpand },
          )}
          {sectionCard(
            <button
              type="button"
              onClick={() => {
                setBreakdownSlide(0)
                setBreakdownAllInOne(false)
                setShowBreakdownLarge(true)
              }}
              className="w-full text-left"
            >
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="mb-1 text-center text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Budget
                    </div>
                    <div
                      className="mx-auto flex h-24 w-24 items-center justify-center rounded-full"
                      style={{
                        background: `conic-gradient(#facc15 0 ${summary.billsPercentBudget}%, #ef4444 ${summary.billsPercentBudget}% ${summary.billsPercentBudget + summary.debtPercentBudget}%, #22c55e ${summary.billsPercentBudget + summary.debtPercentBudget}% ${summary.billsPercentBudget + summary.debtPercentBudget + summary.savingsPercentBudget}%, #3b82f6 ${summary.billsPercentBudget + summary.debtPercentBudget + summary.savingsPercentBudget}% 100%)`,
                      }}
                    >
                      <div className="h-12 w-12 rounded-full bg-white" />
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 text-center text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Actual
                    </div>
                    <div
                      className="mx-auto flex h-24 w-24 items-center justify-center rounded-full"
                      style={{
                        background: `conic-gradient(#facc15 0 ${summary.billsPercentActual}%, #ef4444 ${summary.billsPercentActual}% ${summary.billsPercentActual + summary.debtPercentActual}%, #22c55e ${summary.billsPercentActual + summary.debtPercentActual}% ${summary.billsPercentActual + summary.debtPercentActual + summary.savingsPercentActual}%, #3b82f6 ${summary.billsPercentActual + summary.debtPercentActual + summary.savingsPercentActual}% 100%)`,
                      }}
                    >
                      <div className="h-12 w-12 rounded-full bg-white" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1 text-[0.75rem] text-slate-600">
                  <div>
                    Bills & Expenses: {summary.billsPercentBudget.toFixed(1)}% /{' '}
                    {summary.billsPercentActual.toFixed(1)}%
                  </div>
                  <div>
                    Debt: {summary.debtPercentBudget.toFixed(1)}% /{' '}
                    {summary.debtPercentActual.toFixed(1)}%
                  </div>
                  <div>
                    Savings: {summary.savingsPercentBudget.toFixed(1)}% /{' '}
                    {summary.savingsPercentActual.toFixed(1)}%
                  </div>
                  <div>
                    Challenge: {summary.challengePercentBudget.toFixed(1)}% /{' '}
                    {summary.challengePercentActual.toFixed(1)}%
                  </div>
                </div>
                <div className="text-[0.7rem] text-emerald-600">Tap to enlarge</div>
              </div>
            </button>,
            'Breakdown',
            palette.breakdown,
            { cardId: 'breakdown', expanded: expandedCardId === 'breakdown', onToggleExpand: toggleCardExpand },
          )}
          {sectionCard(
            <div className="space-y-1 text-xs text-slate-700">
              <div>Start Date: {activeMonth.meta.startDate}</div>
              <div>End Date: {activeMonth.meta.endDate}</div>
              <div>
                Currency:{' '}
                <select
                  value={activeMonth.meta.currency}
                  onChange={(e) => updateMonthMeta({ currency: e.target.value })}
                  className="ml-2 h-7 rounded-md border border-slate-300 px-2"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="BDT">BDT</option>
                  <option value="INR">INR</option>
                  <option value="AED">AED</option>
                  <option value="JPY">JPY</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                </select>
              </div>
              <div>
                Start Balance:{' '}
                <input
                  type="number"
                  value={activeMonth.meta.startBalance !== 0 ? activeMonth.meta.startBalance : ''}
                  onChange={(e) => updateMonthMeta({ startBalance: Number(e.target.value) || 0 })}
                  placeholder="--"
                  className="ml-2 h-7 w-28 rounded-md border border-slate-300 px-2"
                />
              </div>
              <div>
                Challenge Yourself:{' '}
                <input
                  type="number"
                  min={50}
                  max={300}
                  step={10}
                  value={summary.challengeYourself !== 0 ? summary.challengeYourself : ''}
                  onChange={(e) =>
                    updateMonthMeta({
                      challengeYourself: Number(e.target.value) || 0,
                    })
                  }
                  placeholder="--"
                  className="ml-2 h-7 w-24 rounded-md border border-slate-300 px-2"
                />
              </div>
            </div>,
            'Overview Stats',
            palette.cashFlow,
            { cardId: 'overview', expanded: expandedCardId === 'overview', onToggleExpand: toggleCardExpand },
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {sectionCard(
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="px-2 py-1">Item</th>
                    <th className="px-2 py-1">Budget</th>
                    <th className="px-2 py-1">Actual</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="px-2 py-1">Start Balance</td><td className="px-2 py-1">{formatMoney(activeMonth.meta.startBalance, activeMonth.meta.currency)}</td><td className="px-2 py-1">{formatMoney(activeMonth.meta.startBalance, activeMonth.meta.currency)}</td></tr>
                  <tr><td className="px-2 py-1">+ Income</td><td className="px-2 py-1">{formatMoney(summary.totalIncomeBudget, activeMonth.meta.currency)}</td><td className="px-2 py-1">{formatMoney(summary.totalIncomeActual, activeMonth.meta.currency)}</td></tr>
                  <tr><td className="px-2 py-1">- Savings</td><td className="px-2 py-1">{formatMoney(summary.totalSavingsBudget, activeMonth.meta.currency)}</td><td className="px-2 py-1">{formatMoney(summary.totalSavingsActual, activeMonth.meta.currency)}</td></tr>
                  <tr><td className="px-2 py-1">- Bills & Expenses</td><td className="px-2 py-1">{formatMoney(summary.billsAndExpensesBudget, activeMonth.meta.currency)}</td><td className="px-2 py-1">{formatMoney(summary.billsAndExpensesActual, activeMonth.meta.currency)}</td></tr>
                  <tr><td className="px-2 py-1">- Debt</td><td className="px-2 py-1">{formatMoney(summary.totalDebtBudget, activeMonth.meta.currency)}</td><td className="px-2 py-1">{formatMoney(summary.totalDebtActual, activeMonth.meta.currency)}</td></tr>
                  <tr><td className="px-2 py-1">- Challenge Yourself</td><td className="px-2 py-1">{formatMoney(summary.challengeYourself, activeMonth.meta.currency)}</td><td className="px-2 py-1">{formatMoney(summary.challengeYourself, activeMonth.meta.currency)}</td></tr>
                  <tr className="font-semibold"><td className="px-2 py-1">LEFT</td><td className="px-2 py-1">{formatMoney(summary.leftBudget, activeMonth.meta.currency)}</td><td className={['px-2 py-1', summary.leftActual < 0 ? 'text-red-500' : 'text-emerald-600'].join(' ')}>{formatMoney(summary.leftActual, activeMonth.meta.currency)}</td></tr>
                </tbody>
              </table>
            </div>,
            'Cash Flow',
            palette.cashFlow,
            { sectionId: 'cash-flow-section', cardId: 'cashflow', expanded: expandedCardId === 'cashflow', onToggleExpand: toggleCardExpand },
          )}

          {sectionCard(
            <div className="space-y-3">
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead><tr className="text-left text-slate-500"><th className="px-2 py-1">☑</th><th className="px-2 py-1">Name</th><th className="px-2 py-1">Due</th><th className="px-2 py-1">Budget</th><th className="px-2 py-1">Actual</th><th className="px-2 py-1">-</th></tr></thead>
                  <tbody>
                    {activeMonth.bills.map((bill) => (
                      <tr key={bill.id}>
                        <td className="px-2 py-1"><input type="checkbox" checked={bill.paid} onChange={(e) => updateBill(bill.id, 'paid', e.target.checked)} /></td>
                        <td className="px-2 py-1"><input value={bill.name} onChange={(e) => updateBill(bill.id, 'name', e.target.value)} className="h-8 w-36 rounded border border-slate-300 px-2" /></td>
                        <td className="px-2 py-1">{numberInput(bill.dueDate, (value) => updateBill(bill.id, 'dueDate', value))}</td>
                        <td className="px-2 py-1">{numberInput(bill.budgeted, (value) => updateBill(bill.id, 'budgeted', value))}</td>
                        <td className="px-2 py-1">{numberInput(bill.actual, (value) => updateBill(bill.id, 'actual', value))}</td>
                        <td className="px-2 py-1"><button type="button" onClick={() => deleteBill(bill.id)} className="text-red-500">✕</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button type="button" onClick={addBill} className="rounded-full border border-slate-300 px-3 py-1 text-xs hover:border-emerald-500">+ Add Bill</button>
            </div>,
            'Bills',
            palette.bills,
            { cardId: 'bills', expanded: expandedCardId === 'bills', onToggleExpand: toggleCardExpand },
          )}

          {sectionCard(
            <div className="space-y-3">
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead><tr className="text-left text-slate-500"><th className="px-2 py-1">Name</th><th className="px-2 py-1">Budget</th><th className="px-2 py-1">Actual</th><th className="px-2 py-1">Left</th><th className="px-2 py-1">-</th></tr></thead>
                  <tbody>
                    {activeMonth.expenses.map((expense) => {
                      const remaining = expense.budgeted - expense.actual
                      return (
                        <tr key={expense.id}>
                          <td className="px-2 py-1"><input value={expense.name} onChange={(e) => updateExpense(expense.id, 'name', e.target.value)} className="h-8 w-36 rounded border border-slate-300 px-2" /></td>
                          <td className="px-2 py-1">{numberInput(expense.budgeted, (value) => updateExpense(expense.id, 'budgeted', value))}</td>
                          <td className="px-2 py-1">{numberInput(expense.actual, (value) => updateExpense(expense.id, 'actual', value))}</td>
                          <td className={['px-2 py-1 font-medium', remaining < 0 ? 'text-red-500' : 'text-slate-700'].join(' ')}>{formatMoney(remaining, activeMonth.meta.currency)}</td>
                          <td className="px-2 py-1"><button type="button" onClick={() => deleteExpense(expense.id)} className="text-red-500">✕</button></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <button type="button" onClick={addExpense} className="rounded-full border border-slate-300 px-3 py-1 text-xs hover:border-emerald-500">+ Add Expense</button>
            </div>,
            'Expenses',
            palette.expenses,
            { cardId: 'expenses', expanded: expandedCardId === 'expenses', onToggleExpand: toggleCardExpand },
          )}

          {sectionCard(
            <div className="space-y-3">
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead><tr className="text-left text-slate-500"><th className="px-2 py-1">Creditor</th><th className="px-2 py-1">Due</th><th className="px-2 py-1">Budget</th><th className="px-2 py-1">Actual</th><th className="px-2 py-1">-</th></tr></thead>
                  <tbody>
                    {activeMonth.debts.map((debt) => (
                      <tr key={debt.id}>
                        <td className="px-2 py-1"><input value={debt.creditor} onChange={(e) => updateDebt(debt.id, 'creditor', e.target.value)} className="h-8 w-40 rounded border border-slate-300 px-2" /></td>
                        <td className="px-2 py-1">{numberInput(debt.dueDate, (value) => updateDebt(debt.id, 'dueDate', value))}</td>
                        <td className="px-2 py-1">{numberInput(debt.budgeted, (value) => updateDebt(debt.id, 'budgeted', value))}</td>
                        <td className="px-2 py-1">{numberInput(debt.actual, (value) => updateDebt(debt.id, 'actual', value))}</td>
                        <td className="px-2 py-1"><button type="button" onClick={() => deleteDebt(debt.id)} className="text-red-500">✕</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button type="button" onClick={addDebt} className="rounded-full border border-slate-300 px-3 py-1 text-xs hover:border-emerald-500">+ Add Debt</button>
            </div>,
            'Debt',
            palette.debt,
            { cardId: 'debt', expanded: expandedCardId === 'debt', onToggleExpand: toggleCardExpand },
          )}
        </div>

        {sectionCard(
          <div className="space-y-3">
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead><tr className="text-left text-slate-500"><th className="px-2 py-1">Source</th><th className="px-2 py-1">Budget</th><th className="px-2 py-1">Actual</th><th className="px-2 py-1">Date</th><th className="px-2 py-1">-</th></tr></thead>
                <tbody>
                  {activeMonth.incomes.map((row) => (
                    <tr key={row.id}>
                      <td className="px-2 py-1"><input value={row.source} onChange={(e) => updateIncome(row.id, 'source', e.target.value)} className="h-8 w-40 rounded border border-slate-300 px-2" /></td>
                      <td className="px-2 py-1">{numberInput(row.budgeted, (value) => updateIncome(row.id, 'budgeted', value))}</td>
                      <td className="px-2 py-1">{numberInput(row.actual, (value) => updateIncome(row.id, 'actual', value))}</td>
                      <td className="px-2 py-1"><input type="date" value={row.date} onChange={(e) => updateIncome(row.id, 'date', e.target.value)} className="h-8 rounded border border-slate-300 px-2" /></td>
                      <td className="px-2 py-1"><button type="button" onClick={() => deleteIncome(row.id)} className="text-red-500">✕</button></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-semibold">
                    <td className="px-2 py-1">TOTAL</td>
                    <td className="px-2 py-1">{formatMoney(summary.totalIncomeBudget, activeMonth.meta.currency)}</td>
                    <td className="px-2 py-1">{formatMoney(summary.totalIncomeActual, activeMonth.meta.currency)}</td>
                    <td />
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
            <button type="button" onClick={addIncome} className="rounded-full border border-slate-300 px-3 py-1 text-xs hover:border-emerald-500">+ Add Income Source</button>
          </div>,
          'Income',
          palette.income,
          { cardId: 'income', expanded: expandedCardId === 'income', onToggleExpand: toggleCardExpand },
        )}

        {sectionCard(
          <div className="space-y-3">
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead><tr className="text-left text-slate-500"><th className="px-2 py-1">Name</th><th className="px-2 py-1">Budget</th><th className="px-2 py-1">Actual</th><th className="px-2 py-1">-</th></tr></thead>
                <tbody>
                  {activeMonth.savings.map((row) => (
                    <tr key={row.id}>
                      <td className="px-2 py-1"><input value={row.name} onChange={(e) => updateSavings(row.id, 'name', e.target.value)} className="h-8 w-40 rounded border border-slate-300 px-2" /></td>
                      <td className="px-2 py-1">{numberInput(row.budgeted, (value) => updateSavings(row.id, 'budgeted', value))}</td>
                      <td className="px-2 py-1">{numberInput(row.actual, (value) => updateSavings(row.id, 'actual', value))}</td>
                      <td className="px-2 py-1"><button type="button" onClick={() => deleteSavings(row.id)} className="text-red-500">✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" onClick={addSavings} className="rounded-full border border-slate-300 px-3 py-1 text-xs hover:border-emerald-500">+ Add Savings</button>
          </div>,
          'Savings',
          palette.savings,
          { cardId: 'savings', expanded: expandedCardId === 'savings', onToggleExpand: toggleCardExpand },
        )}

        {sectionCard(
          <div className="space-y-3">
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead><tr className="text-left text-slate-500"><th className="px-2 py-1">Date</th><th className="px-2 py-1">Amount</th><th className="px-2 py-1">Category</th><th className="px-2 py-1">Subcategory</th><th className="px-2 py-1">Details</th><th className="px-2 py-1">Type</th><th className="px-2 py-1">-</th></tr></thead>
                <tbody>
                  {activeMonth.transactions.map((tx) => {
                    const subcategories = categoryOptions(tx.category, activeMonth)
                    return (
                      <tr key={tx.id}>
                        <td className="px-2 py-1"><input type="date" value={tx.date} onChange={(e) => updateTransaction(tx.id, 'date', e.target.value)} className="h-8 rounded border border-slate-300 px-2" /></td>
                        <td className="px-2 py-1">{numberInput(tx.amount, (value) => updateTransaction(tx.id, 'amount', value))}</td>
                        <td className="px-2 py-1">
                          <select value={tx.category} onChange={(e) => {
                            const category = e.target.value as BudgetCategory
                            updateTransaction(tx.id, 'category', category)
                            const firstSub = categoryOptions(category, activeMonth)[0] ?? ''
                            updateTransaction(tx.id, 'subcategory', firstSub)
                          }} className="h-8 rounded border border-slate-300 px-2">
                            <option>Income</option>
                            <option>Bills</option>
                            <option>Expenses</option>
                            <option>Debt</option>
                            <option>Savings</option>
                          </select>
                        </td>
                        <td className="px-2 py-1">
                          <select value={tx.subcategory} onChange={(e) => updateTransaction(tx.id, 'subcategory', e.target.value)} className="h-8 rounded border border-slate-300 px-2">
                            {subcategories.length === 0 && <option value="">--</option>}
                            {subcategories.map((item) => (
                              <option key={item} value={item}>
                                {item}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-2 py-1"><input value={tx.details} onChange={(e) => updateTransaction(tx.id, 'details', e.target.value)} className="h-8 w-52 rounded border border-slate-300 px-2" /></td>
                        <td className="px-2 py-1">
                          <select value={tx.type} onChange={(e) => updateTransaction(tx.id, 'type', e.target.value)} className="h-8 rounded border border-slate-300 px-2">
                            <option value="expense">expense</option>
                            <option value="income">income</option>
                          </select>
                        </td>
                        <td className="px-2 py-1"><button type="button" onClick={() => deleteTransaction(tx.id)} className="text-red-500">🗑</button></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <button type="button" onClick={addTransaction} className="rounded-full border border-slate-300 px-3 py-1 text-xs hover:border-emerald-500">+ Add Transaction</button>
          </div>,
          'Transaction Log',
          palette.log,
          { cardId: 'txlog', expanded: expandedCardId === 'txlog', onToggleExpand: toggleCardExpand },
        )}

        {sectionCard(
          <div className="space-y-3">
            <textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              placeholder="Add notes..."
              className="min-h-28 w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 outline-none focus:border-emerald-500"
            />
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={saveBreakdownNote}
                className="rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-black hover:bg-emerald-400"
              >
                Save Note
              </button>
              <span className="text-[0.72rem] text-slate-500">
                Saved notes appear in the top Notes panel.
              </span>
            </div>
            <div className="max-h-44 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2">
              {(breakdownNotes[activeMonth.meta.id] ?? []).length === 0 ? (
                <div className="text-xs text-slate-500">No saved notes yet.</div>
              ) : (
                (breakdownNotes[activeMonth.meta.id] ?? []).map((entry, index) => (
                  <div
                    key={entry.id}
                    className="mb-2 rounded-lg bg-white p-2 text-xs text-slate-700 shadow-sm last:mb-0"
                  >
                    <div className="font-semibold text-emerald-600">
                      Note {index + 1}
                    </div>
                    <div>{entry.text}</div>
                    <div className="mt-1 text-[0.65rem] text-slate-500">
                      {new Date(entry.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>,
          'Add Notes',
          palette.breakdown,
          { cardId: 'notes', expanded: expandedCardId === 'notes', onToggleExpand: toggleCardExpand },
        )}
      </div>
      {showBreakdownLarge && (
        <div
          className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/60 px-4 pt-16 pb-6"
          onClick={() => setShowBreakdownLarge(false)}
        >
          <div
            className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Spending Breakdown</h2>
              <button
                type="button"
                onClick={() => setShowBreakdownLarge(false)}
                className="rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-700"
              >
                Close
              </button>
            </div>
            <div className="mb-4 flex items-center justify-between">
              <div className="text-xs text-slate-600">
                {breakdownAllInOne
                  ? 'All in one'
                  : ['Budget Breakdown', 'Actual Breakdown', 'Compare', 'Add Notes'][breakdownSlide]}
              </div>
              <div className="inline-flex items-center gap-2">
                {!breakdownAllInOne && (
                  <>
                    <button
                      type="button"
                      onClick={() => setBreakdownSlide((s) => Math.max(0, s - 1))}
                      disabled={breakdownSlide === 0}
                      className="rounded-full border border-slate-300 px-2 py-1 text-xs text-slate-700 disabled:opacity-40"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={() => setBreakdownSlide((s) => Math.min(3, s + 1))}
                      disabled={breakdownSlide === 3}
                      className="rounded-full border border-slate-300 px-2 py-1 text-xs text-slate-700 disabled:opacity-40"
                    >
                      ›
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setBreakdownAllInOne((v) => !v)}
                  className="rounded-full border border-emerald-400 px-3 py-1 text-xs font-semibold text-emerald-600"
                >
                  All in one
                </button>
              </div>
            </div>

            {breakdownAllInOne && (
              <div className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <div className="mb-2 text-center text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Budget Breakdown
                    </div>
                    <div
                      className="mx-auto flex h-52 w-52 items-center justify-center rounded-full transition-transform duration-700"
                      style={{
                        transform: `rotate(${(1 - breakdownAnimProgress) * 240}deg)`,
                        background: `conic-gradient(#facc15 0 ${summary.billsPercentBudget * breakdownAnimProgress}%, #ef4444 ${summary.billsPercentBudget * breakdownAnimProgress}% ${(summary.billsPercentBudget + summary.debtPercentBudget) * breakdownAnimProgress}%, #22c55e ${(summary.billsPercentBudget + summary.debtPercentBudget) * breakdownAnimProgress}% ${(summary.billsPercentBudget + summary.debtPercentBudget + summary.savingsPercentBudget) * breakdownAnimProgress}%, #3b82f6 ${(summary.billsPercentBudget + summary.debtPercentBudget + summary.savingsPercentBudget) * breakdownAnimProgress}% 100%)`,
                      }}
                    >
                      <div className="h-24 w-24 rounded-full bg-white" />
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 text-center text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Actual Breakdown
                    </div>
                    <div
                      className="mx-auto flex h-52 w-52 items-center justify-center rounded-full transition-transform duration-700"
                      style={{
                        transform: `rotate(${(1 - breakdownAnimProgress) * 240}deg)`,
                        background: `conic-gradient(#facc15 0 ${summary.billsPercentActual * breakdownAnimProgress}%, #ef4444 ${summary.billsPercentActual * breakdownAnimProgress}% ${(summary.billsPercentActual + summary.debtPercentActual) * breakdownAnimProgress}%, #22c55e ${(summary.billsPercentActual + summary.debtPercentActual) * breakdownAnimProgress}% ${(summary.billsPercentActual + summary.debtPercentActual + summary.savingsPercentActual) * breakdownAnimProgress}%, #3b82f6 ${(summary.billsPercentActual + summary.debtPercentActual + summary.savingsPercentActual) * breakdownAnimProgress}% 100%)`,
                      }}
                    >
                      <div className="h-24 w-24 rounded-full bg-white" />
                    </div>
                  </div>
                </div>
                <div className="grid gap-2 text-sm text-slate-700">
                  <div className="grid grid-cols-3 gap-2 font-semibold text-slate-500">
                    <span>Category</span>
                    <span>Budget</span>
                    <span>Actual</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2"><span>Bills & Expenses</span><span>{(summary.billsPercentBudget * breakdownAnimProgress).toFixed(1)}%</span><span>{(summary.billsPercentActual * breakdownAnimProgress).toFixed(1)}%</span></div>
                  <div className="grid grid-cols-3 gap-2"><span>Debt</span><span>{(summary.debtPercentBudget * breakdownAnimProgress).toFixed(1)}%</span><span>{(summary.debtPercentActual * breakdownAnimProgress).toFixed(1)}%</span></div>
                  <div className="grid grid-cols-3 gap-2"><span>Savings</span><span>{(summary.savingsPercentBudget * breakdownAnimProgress).toFixed(1)}%</span><span>{(summary.savingsPercentActual * breakdownAnimProgress).toFixed(1)}%</span></div>
                  <div className="grid grid-cols-3 gap-2"><span>Challenge</span><span>{(summary.challengePercentBudget * breakdownAnimProgress).toFixed(1)}%</span><span>{(summary.challengePercentActual * breakdownAnimProgress).toFixed(1)}%</span></div>
                </div>
                <textarea
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  placeholder="Add notes..."
                  className="min-h-28 w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={saveBreakdownNote}
                  className="rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-black hover:bg-emerald-400"
                >
                  Save
                </button>
              </div>
            )}

            {!breakdownAllInOne && breakdownSlide === 0 && (
              <div className="space-y-4">
                <div
                  className="mx-auto mb-2 flex h-64 w-64 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(#facc15 0 ${summary.billsPercentBudget}%, #ef4444 ${summary.billsPercentBudget}% ${summary.billsPercentBudget + summary.debtPercentBudget}%, #22c55e ${summary.billsPercentBudget + summary.debtPercentBudget}% ${summary.billsPercentBudget + summary.debtPercentBudget + summary.savingsPercentBudget}%, #3b82f6 ${summary.billsPercentBudget + summary.debtPercentBudget + summary.savingsPercentBudget}% 100%)`,
                  }}
                >
                  <div className="h-32 w-32 rounded-full bg-white" />
                </div>
                <div className="grid gap-2 text-sm text-slate-700">
                  <div className="flex items-center justify-between"><span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-yellow-400" />Bills & Expenses</span><span>{formatMoney(summary.billsAndExpensesBudget, activeMonth.meta.currency)} ({summary.billsPercentBudget.toFixed(1)}%)</span></div>
                  <div className="flex items-center justify-between"><span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-red-500" />Debt</span><span>{formatMoney(summary.totalDebtBudget, activeMonth.meta.currency)} ({summary.debtPercentBudget.toFixed(1)}%)</span></div>
                  <div className="flex items-center justify-between"><span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-green-500" />Savings</span><span>{formatMoney(summary.totalSavingsBudget, activeMonth.meta.currency)} ({summary.savingsPercentBudget.toFixed(1)}%)</span></div>
                  <div className="flex items-center justify-between"><span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-blue-500" />Challenge</span><span>{formatMoney(summary.challengeYourself, activeMonth.meta.currency)} ({summary.challengePercentBudget.toFixed(1)}%)</span></div>
                </div>
              </div>
            )}

            {!breakdownAllInOne && breakdownSlide === 1 && (
              <div className="space-y-4">
                <div
                  className="mx-auto mb-2 flex h-64 w-64 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(#facc15 0 ${summary.billsPercentActual}%, #ef4444 ${summary.billsPercentActual}% ${summary.billsPercentActual + summary.debtPercentActual}%, #22c55e ${summary.billsPercentActual + summary.debtPercentActual}% ${summary.billsPercentActual + summary.debtPercentActual + summary.savingsPercentActual}%, #3b82f6 ${summary.billsPercentActual + summary.debtPercentActual + summary.savingsPercentActual}% 100%)`,
                  }}
                >
                  <div className="h-32 w-32 rounded-full bg-white" />
                </div>
                <div className="grid gap-2 text-sm text-slate-700">
                  <div className="flex items-center justify-between"><span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-yellow-400" />Bills & Expenses</span><span>{formatMoney(summary.billsAndExpensesActual, activeMonth.meta.currency)} ({summary.billsPercentActual.toFixed(1)}%)</span></div>
                  <div className="flex items-center justify-between"><span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-red-500" />Debt</span><span>{formatMoney(summary.totalDebtActual, activeMonth.meta.currency)} ({summary.debtPercentActual.toFixed(1)}%)</span></div>
                  <div className="flex items-center justify-between"><span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-green-500" />Savings</span><span>{formatMoney(summary.totalSavingsActual, activeMonth.meta.currency)} ({summary.savingsPercentActual.toFixed(1)}%)</span></div>
                  <div className="flex items-center justify-between"><span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-blue-500" />Challenge</span><span>{formatMoney(summary.challengeYourself, activeMonth.meta.currency)} ({summary.challengePercentActual.toFixed(1)}%)</span></div>
                </div>
              </div>
            )}

            {!breakdownAllInOne && breakdownSlide === 2 && (
              <div className="grid gap-2 text-sm text-slate-700">
                <div className="grid grid-cols-3 gap-2 font-semibold text-slate-500">
                  <span>Category</span>
                  <span>Budget</span>
                  <span>Actual</span>
                </div>
                <div className="grid grid-cols-3 gap-2"><span>Bills & Expenses</span><span>{summary.billsPercentBudget.toFixed(1)}%</span><span>{summary.billsPercentActual.toFixed(1)}%</span></div>
                <div className="grid grid-cols-3 gap-2"><span>Debt</span><span>{summary.debtPercentBudget.toFixed(1)}%</span><span>{summary.debtPercentActual.toFixed(1)}%</span></div>
                <div className="grid grid-cols-3 gap-2"><span>Savings</span><span>{summary.savingsPercentBudget.toFixed(1)}%</span><span>{summary.savingsPercentActual.toFixed(1)}%</span></div>
                <div className="grid grid-cols-3 gap-2"><span>Challenge</span><span>{summary.challengePercentBudget.toFixed(1)}%</span><span>{summary.challengePercentActual.toFixed(1)}%</span></div>
              </div>
            )}

            {!breakdownAllInOne && breakdownSlide === 3 && (
              <div className="space-y-2">
                <textarea
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  placeholder="Add notes..."
                  className="min-h-32 w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={saveBreakdownNote}
                  className="rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-black hover:bg-emerald-400"
                >
                  Save
                </button>
              </div>
            )}

            {!breakdownAllInOne && <div className="mt-4 flex justify-center gap-2">
              {[0, 1, 2, 3].map((step) => (
                <span
                  key={step}
                  className={['h-2.5 w-2.5 rounded-full', step === breakdownSlide ? 'bg-emerald-500' : 'bg-slate-300'].join(' ')}
                />
              ))}
            </div>}
          </div>
        </div>
      )}
      {openNote && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={() => setOpenNote(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">{openNote.title}</h3>
                <div className="mt-0.5 text-xs text-slate-500">
                  {new Date(openNote.createdAt).toLocaleString()}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpenNote(null)}
                className="rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-700"
              >
                Close
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 whitespace-pre-wrap">
              {openNote.text}
            </div>
          </div>
        </div>
      )}
      <div className={['mt-4 text-[0.7rem]', isDark ? 'text-slate-500' : 'text-slate-600'].join(' ')}>
        Budget updates are auto-calculated in real time. Tables support horizontal scroll on smaller screens.
      </div>
    </Layout>
  )
}
