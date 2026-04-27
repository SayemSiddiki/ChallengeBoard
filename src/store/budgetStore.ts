import { create } from 'zustand'
import { getSupabaseClient } from '../supabaseClient'

export type BudgetCategory = 'Income' | 'Bills' | 'Expenses' | 'Debt' | 'Savings'
export type TransactionType = 'income' | 'expense'

export interface BudgetMonth {
  id: string
  userId: string
  month: string
  startDate: string
  endDate: string
  currency: string
  startBalance: number
  challengeYourself: number
  createdAt: string
}

export interface Income {
  id: string
  budgetMonthId: string
  source: string
  budgeted: number
  actual: number
  date: string
}

export interface Bill {
  id: string
  budgetMonthId: string
  name: string
  dueDate: number
  budgeted: number
  actual: number
  paid: boolean
}

export interface Expense {
  id: string
  budgetMonthId: string
  name: string
  budgeted: number
  actual: number
}

export interface Debt {
  id: string
  budgetMonthId: string
  creditor: string
  dueDate: number
  budgeted: number
  actual: number
}

export interface Savings {
  id: string
  budgetMonthId: string
  name: string
  budgeted: number
  actual: number
}

export interface Transaction {
  id: string
  budgetMonthId: string
  date: string
  amount: number
  category: BudgetCategory
  subcategory: string
  details: string
  type: TransactionType
}

export interface BudgetMonthData {
  meta: BudgetMonth
  incomes: Income[]
  bills: Bill[]
  expenses: Expense[]
  debts: Debt[]
  savings: Savings[]
  transactions: Transaction[]
}

interface PersistedBudgetState {
  currentMonthId: string | null
  months: BudgetMonthData[]
}

interface BudgetStoreState extends PersistedBudgetState {
  initialized: boolean
  saving: boolean
  lastSavedAt: string | null
}

interface BudgetStoreActions {
  initialize: () => Promise<void>
  selectMonth: (monthId: string) => void
  createMonthFromCurrent: () => void
  updateMonthMeta: (
    payload: Partial<Pick<BudgetMonth, 'currency' | 'startBalance' | 'challengeYourself'>>,
  ) => void
  addIncome: () => void
  updateIncome: (id: string, field: 'source' | 'budgeted' | 'actual' | 'date', value: string | number) => void
  deleteIncome: (id: string) => void
  addBill: () => void
  updateBill: (
    id: string,
    field: 'name' | 'dueDate' | 'budgeted' | 'actual' | 'paid',
    value: string | number | boolean,
  ) => void
  deleteBill: (id: string) => void
  addExpense: () => void
  updateExpense: (id: string, field: 'name' | 'budgeted' | 'actual', value: string | number) => void
  deleteExpense: (id: string) => void
  addDebt: () => void
  updateDebt: (id: string, field: 'creditor' | 'dueDate' | 'budgeted' | 'actual', value: string | number) => void
  deleteDebt: (id: string) => void
  addSavings: () => void
  updateSavings: (id: string, field: 'name' | 'budgeted' | 'actual', value: string | number) => void
  deleteSavings: (id: string) => void
  addTransaction: () => void
  updateTransaction: (
    id: string,
    field: 'date' | 'amount' | 'category' | 'subcategory' | 'details' | 'type',
    value: string | number,
  ) => void
  deleteTransaction: (id: string) => void
  refreshSync: () => Promise<void>
}

export type BudgetStore = BudgetStoreState & BudgetStoreActions

const STORAGE_KEY = 'challenge-board-budget-v1'
const SAVE_DEBOUNCE_MS = 700
let syncTimer: number | null = null

function monthLabel(date = new Date()) {
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

function monthRange(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  }
}

function parseDateOnlyLocal(dateText: string) {
  const [year, month, day] = dateText.split('-').map((part) => Number(part))
  if (!year || !month || !day) return new Date()
  return new Date(year, month - 1, day)
}

function toMonthKey(dateText: string) {
  const dt = parseDateOnlyLocal(dateText)
  const year = dt.getFullYear()
  const month = String(dt.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

function normalizeMonthLabel(dateText: string) {
  return monthLabel(parseDateOnlyLocal(dateText))
}

function parseNumber(value: string | number) {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : 0
}

function asNumber(value: unknown) {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const n = Number(value)
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function makeId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`
}

function monthDataForDate(date: Date, userId = ''): BudgetMonthData {
  const range = monthRange(date)
  const monthId = makeId('month')
  const base: BudgetMonthData = {
    meta: {
      id: monthId,
      userId,
      month: monthLabel(date),
      startDate: range.startDate,
      endDate: range.endDate,
      currency: 'USD',
      startBalance: 0,
      challengeYourself: 0,
      createdAt: new Date().toISOString(),
    },
    incomes: [
      {
        id: makeId('income'),
        budgetMonthId: monthId,
        source: 'Paycheck 1',
        budgeted: 0,
        actual: 0,
        date: todayIso(),
      },
    ],
    bills: [],
    expenses: [],
    debts: [],
    savings: [
      {
        id: makeId('saving'),
        budgetMonthId: monthId,
        name: 'Save',
        budgeted: 0,
        actual: 0,
      },
    ],
    transactions: [],
  }
  return base
}

function defaultYearMonths(userId = '') {
  const now = new Date()
  const year = now.getFullYear()
  const months = Array.from({ length: 12 }).map((_, index) =>
    monthDataForDate(new Date(year, index, 1), userId),
  )
  const currentLabel = monthLabel(now)
  const currentMonth = months.find((month) => month.meta.month === currentLabel)
  return {
    months,
    currentMonthId: currentMonth?.meta.id ?? months[0]?.meta.id ?? null,
  }
}

function cloneBudgetedForNewMonth(current: BudgetMonthData, userId: string): BudgetMonthData {
  const nextDate = parseDateOnlyLocal(current.meta.startDate)
  nextDate.setMonth(nextDate.getMonth() + 1)
  const range = monthRange(nextDate)
  const monthId = makeId('month')
  return {
    meta: {
      id: monthId,
      userId,
      month: monthLabel(nextDate),
      startDate: range.startDate,
      endDate: range.endDate,
      currency: current.meta.currency,
      startBalance: 0,
      challengeYourself: 0,
      createdAt: new Date().toISOString(),
    },
    incomes: current.incomes.map((item, index) => ({
      ...item,
      id: makeId('income'),
      budgetMonthId: monthId,
      source: item.source || `Paycheck ${index + 1}`,
      actual: 0,
      date: todayIso(),
    })),
    bills: current.bills.map((item) => ({
      ...item,
      id: makeId('bill'),
      budgetMonthId: monthId,
      actual: 0,
      paid: false,
    })),
    expenses: current.expenses.map((item) => ({
      ...item,
      id: makeId('expense'),
      budgetMonthId: monthId,
      actual: 0,
    })),
    debts: current.debts.map((item) => ({
      ...item,
      id: makeId('debt'),
      budgetMonthId: monthId,
      actual: 0,
    })),
    savings: current.savings.map((item) => ({
      ...item,
      id: makeId('saving'),
      budgetMonthId: monthId,
      actual: 0,
    })),
    transactions: [],
  }
}

function sanitizeMonths(rawMonths: BudgetMonthData[]) {
  const deduped = new Map<string, BudgetMonthData>()
  rawMonths.forEach((month) => {
    const normalized: BudgetMonthData = {
      ...month,
      meta: {
        ...month.meta,
        month: normalizeMonthLabel(month.meta.startDate),
        challengeYourself: asNumber((month.meta as { challengeYourself?: unknown }).challengeYourself),
      },
    }
    const key = toMonthKey(normalized.meta.startDate)
    if (!deduped.has(key)) {
      deduped.set(key, normalized)
    }
  })
  return Array.from(deduped.values()).sort((a, b) =>
    a.meta.startDate.localeCompare(b.meta.startDate),
  )
}

function ensureCurrentYearMonths(rawMonths: BudgetMonthData[]) {
  const now = new Date()
  const year = now.getFullYear()
  const normalized = sanitizeMonths(rawMonths)
  const fallbackUserId = normalized[0]?.meta.userId ?? ''
  const monthMap = new Map<string, BudgetMonthData>()
  normalized.forEach((month) => {
    monthMap.set(toMonthKey(month.meta.startDate), month)
  })
  const full = Array.from({ length: 12 }).map((_, idx) => {
    const dt = new Date(year, idx, 1)
    const key = toMonthKey(dt.toISOString().slice(0, 10))
    return monthMap.get(key) ?? monthDataForDate(dt, fallbackUserId)
  })
  return full
}

function persistLocal(state: BudgetStoreState) {
  if (typeof window === 'undefined') return
  try {
    const payload: PersistedBudgetState = {
      currentMonthId: state.currentMonthId,
      months: state.months,
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // ignore
  }
}

function loadLocal(): PersistedBudgetState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedBudgetState
    if (!Array.isArray(parsed.months) || parsed.months.length === 0) return null
    return parsed
  } catch {
    return null
  }
}

function applyTransactionSync(month: BudgetMonthData): BudgetMonthData {
  const groups = new Map<string, number>()
  month.transactions.forEach((tx) => {
    const key = `${tx.category}::${tx.subcategory}`
    const current = groups.get(key) ?? 0
    const signed = tx.type === 'income' ? tx.amount : tx.amount
    groups.set(key, current + signed)
  })

  const synced = { ...month }
  synced.incomes = month.incomes.map((item) => ({
    ...item,
    actual: groups.get(`Income::${item.source}`) ?? item.actual,
  }))
  synced.bills = month.bills.map((item) => ({
    ...item,
    actual: groups.get(`Bills::${item.name}`) ?? item.actual,
  }))
  synced.expenses = month.expenses.map((item) => ({
    ...item,
    actual: groups.get(`Expenses::${item.name}`) ?? item.actual,
  }))
  synced.debts = month.debts.map((item) => ({
    ...item,
    actual: groups.get(`Debt::${item.creditor}`) ?? item.actual,
  }))
  synced.savings = month.savings.map((item) => ({
    ...item,
    actual: groups.get(`Savings::${item.name}`) ?? item.actual,
  }))
  return synced
}

async function loadFromSupabase(): Promise<BudgetMonthData[] | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: monthRows, error: monthError } = await supabase
    .from('budget_months')
    .select('*')
    .eq('user_id', user.id)
    .order('start_date', { ascending: false })

  if (monthError || !monthRows || monthRows.length === 0) return null

  const ids = monthRows.map((row: any) => String(row.id))
  const [incomeRes, billRes, expenseRes, debtRes, savingRes, transactionRes] = await Promise.all([
    supabase.from('incomes').select('*').in('budget_month_id', ids),
    supabase.from('bills').select('*').in('budget_month_id', ids),
    supabase.from('expenses').select('*').in('budget_month_id', ids),
    supabase.from('debts').select('*').in('budget_month_id', ids),
    supabase.from('savings').select('*').in('budget_month_id', ids),
    supabase.from('transactions').select('*').in('budget_month_id', ids),
  ])
  const incomes = incomeRes.data ?? []
  const bills = billRes.data ?? []
  const expenses = expenseRes.data ?? []
  const debts = debtRes.data ?? []
  const savings = savingRes.data ?? []
  const transactions = transactionRes.data ?? []

  return monthRows.map((row: any) => {
    const monthId = String(row.id)
    const monthData: BudgetMonthData = {
      meta: {
        id: monthId,
        userId: String(row.user_id),
        month: String(row.month),
        startDate: String(row.start_date),
        endDate: String(row.end_date),
        currency: String(row.currency ?? 'USD'),
        startBalance: asNumber(row.start_balance),
        challengeYourself: asNumber((row as { challenge_yourself?: unknown }).challenge_yourself),
        createdAt: String(row.created_at ?? new Date().toISOString()),
      },
      incomes: incomes
        .filter((item: any) => String(item.budget_month_id) === monthId)
        .map((item: any) => ({
          id: String(item.id),
          budgetMonthId: monthId,
          source: String(item.source ?? 'Income'),
          budgeted: asNumber(item.budgeted),
          actual: asNumber(item.actual),
          date: String(item.date ?? todayIso()),
        })),
      bills: bills
        .filter((item: any) => String(item.budget_month_id) === monthId)
        .map((item: any) => ({
          id: String(item.id),
          budgetMonthId: monthId,
          name: String(item.name ?? 'Bill'),
          dueDate: asNumber(item.due_date),
          budgeted: asNumber(item.budgeted),
          actual: asNumber(item.actual),
          paid: Boolean(item.paid),
        })),
      expenses: expenses
        .filter((item: any) => String(item.budget_month_id) === monthId)
        .map((item: any) => ({
          id: String(item.id),
          budgetMonthId: monthId,
          name: String(item.name ?? 'Expense'),
          budgeted: asNumber(item.budgeted),
          actual: asNumber(item.actual),
        })),
      debts: debts
        .filter((item: any) => String(item.budget_month_id) === monthId)
        .map((item: any) => ({
          id: String(item.id),
          budgetMonthId: monthId,
          creditor: String(item.creditor ?? 'Debt'),
          dueDate: asNumber(item.due_date),
          budgeted: asNumber(item.budgeted),
          actual: asNumber(item.actual),
        })),
      savings: savings
        .filter((item: any) => String(item.budget_month_id) === monthId)
        .map((item: any) => ({
          id: String(item.id),
          budgetMonthId: monthId,
          name: String(item.name ?? 'Save'),
          budgeted: asNumber(item.budgeted),
          actual: asNumber(item.actual),
        })),
      transactions: transactions
        .filter((item: any) => String(item.budget_month_id) === monthId)
        .map((item: any) => ({
          id: String(item.id),
          budgetMonthId: monthId,
          date: String(item.date ?? todayIso()),
          amount: asNumber(item.amount),
          category: String(item.category ?? 'Expenses') as BudgetCategory,
          subcategory: String(item.subcategory ?? ''),
          details: String(item.details ?? ''),
          type: String(item.type ?? 'expense') as TransactionType,
        })),
    }
    return applyTransactionSync(monthData)
  })
}

async function syncMonthToSupabase(month: BudgetMonthData) {
  const supabase = getSupabaseClient()
  if (!supabase) return
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const monthId = month.meta.id
  const base = {
    id: monthId,
    user_id: user.id,
    month: month.meta.month,
    start_date: month.meta.startDate,
    end_date: month.meta.endDate,
    currency: month.meta.currency,
    start_balance: month.meta.startBalance,
    challenge_yourself: month.meta.challengeYourself,
  }

  await supabase.from('budget_months').upsert(base)

  await Promise.all([
    supabase.from('incomes').delete().eq('budget_month_id', monthId),
    supabase.from('bills').delete().eq('budget_month_id', monthId),
    supabase.from('expenses').delete().eq('budget_month_id', monthId),
    supabase.from('debts').delete().eq('budget_month_id', monthId),
    supabase.from('savings').delete().eq('budget_month_id', monthId),
    supabase.from('transactions').delete().eq('budget_month_id', monthId),
  ])

  if (month.incomes.length) {
    await supabase.from('incomes').insert(
      month.incomes.map((item) => ({
        id: item.id,
        budget_month_id: monthId,
        source: item.source,
        budgeted: item.budgeted,
        actual: item.actual,
        date: item.date,
      })),
    )
  }
  if (month.bills.length) {
    await supabase.from('bills').insert(
      month.bills.map((item) => ({
        id: item.id,
        budget_month_id: monthId,
        name: item.name,
        due_date: item.dueDate,
        budgeted: item.budgeted,
        actual: item.actual,
        paid: item.paid,
      })),
    )
  }
  if (month.expenses.length) {
    await supabase.from('expenses').insert(
      month.expenses.map((item) => ({
        id: item.id,
        budget_month_id: monthId,
        name: item.name,
        budgeted: item.budgeted,
        actual: item.actual,
      })),
    )
  }
  if (month.debts.length) {
    await supabase.from('debts').insert(
      month.debts.map((item) => ({
        id: item.id,
        budget_month_id: monthId,
        creditor: item.creditor,
        due_date: item.dueDate,
        budgeted: item.budgeted,
        actual: item.actual,
      })),
    )
  }
  if (month.savings.length) {
    await supabase.from('savings').insert(
      month.savings.map((item) => ({
        id: item.id,
        budget_month_id: monthId,
        name: item.name,
        budgeted: item.budgeted,
        actual: item.actual,
      })),
    )
  }
  if (month.transactions.length) {
    await supabase.from('transactions').insert(
      month.transactions.map((item) => ({
        id: item.id,
        budget_month_id: monthId,
        date: item.date,
        amount: item.amount,
        category: item.category,
        subcategory: item.subcategory,
        details: item.details,
        type: item.type,
      })),
    )
  }
}

function currentMonth(state: BudgetStoreState) {
  if (!state.currentMonthId) return null
  return state.months.find((month) => month.meta.id === state.currentMonthId) ?? null
}

export const useBudgetStore = create<BudgetStore>((set, get) => {
  const scheduleSave = () => {
    const now = get()
    persistLocal(now)
    if (syncTimer !== null) {
      window.clearTimeout(syncTimer)
    }
    syncTimer = window.setTimeout(async () => {
      const state = get()
      const month = currentMonth(state)
      if (!month) return
      set({ saving: true })
      try {
        await syncMonthToSupabase(month)
        set({ saving: false, lastSavedAt: new Date().toISOString() })
      } catch {
        set({ saving: false })
      }
    }, SAVE_DEBOUNCE_MS)
  }

  return {
    initialized: false,
    saving: false,
    lastSavedAt: null,
    currentMonthId: null,
    months: [],

    initialize: async () => {
      if (get().initialized) return
      const local = loadLocal()
      if (local) {
        const sanitized = ensureCurrentYearMonths(local.months)
        const currentMonthId =
          local.currentMonthId && sanitized.some((month) => month.meta.id === local.currentMonthId)
            ? local.currentMonthId
            : sanitized[0]?.meta.id ?? null
        set({
          initialized: true,
          months: sanitized,
          currentMonthId,
        })
        persistLocal(get())
      }
      try {
        const remote = await loadFromSupabase()
        if (remote && remote.length > 0) {
          const sanitized = ensureCurrentYearMonths(remote)
          set((state) => ({
            ...state,
            initialized: true,
            months: sanitized,
            currentMonthId: state.currentMonthId && sanitized.some((m) => m.meta.id === state.currentMonthId)
              ? state.currentMonthId
              : sanitized[0].meta.id,
          }))
          persistLocal(get())
          return
        }
      } catch {
        // ignore
      }
      if (!get().initialized) {
        const starter = defaultYearMonths()
        set({
          initialized: true,
          months: starter.months,
          currentMonthId: starter.currentMonthId,
        })
        persistLocal(get())
      }
    },

    selectMonth: (monthId) => {
      set({ currentMonthId: monthId })
      scheduleSave()
    },

    createMonthFromCurrent: () => {
      set((state) => {
        const active = currentMonth(state)
        const userId = active?.meta.userId ?? ''
        const next = active ? cloneBudgetedForNewMonth(active, userId) : monthDataForDate(new Date(), userId)
        const existing = state.months.find((month) => month.meta.month === next.meta.month)
        if (existing) {
          return {
            ...state,
            currentMonthId: existing.meta.id,
          }
        }
        return {
          ...state,
          months: [next, ...state.months],
          currentMonthId: next.meta.id,
        }
      })
      scheduleSave()
    },

    updateMonthMeta: (payload) => {
      set((state) => {
        const activeId = state.currentMonthId
        if (!activeId) return state
        return {
          ...state,
          months: state.months.map((month) =>
            month.meta.id === activeId
              ? {
                  ...month,
                  meta: {
                    ...month.meta,
                    ...payload,
                  },
                }
              : month,
          ),
        }
      })
      scheduleSave()
    },

    addIncome: () => {
      set((state) => {
        const active = currentMonth(state)
        if (!active) return state
        const nextIncome: Income = {
          id: makeId('income'),
          budgetMonthId: active.meta.id,
          source: `Paycheck ${active.incomes.length + 1}`,
          budgeted: 0,
          actual: 0,
          date: todayIso(),
        }
        return {
          ...state,
          months: state.months.map((month) =>
            month.meta.id === active.meta.id ? { ...month, incomes: [...month.incomes, nextIncome] } : month,
          ),
        }
      })
      scheduleSave()
    },

    updateIncome: (id, field, value) => {
      set((state) => ({
        ...state,
        months: state.months.map((month) => ({
          ...month,
          incomes: month.incomes.map((item) =>
            item.id === id
              ? {
                  ...item,
                  [field]:
                    field === 'source' || field === 'date'
                      ? String(value)
                      : parseNumber(value as number | string),
                }
              : item,
          ),
        })),
      }))
      scheduleSave()
    },

    deleteIncome: (id) => {
      set((state) => ({
        ...state,
        months: state.months.map((month) => ({
          ...month,
          incomes: month.incomes.filter((item) => item.id !== id),
        })),
      }))
      scheduleSave()
    },

    addBill: () => {
      set((state) => {
        const active = currentMonth(state)
        if (!active) return state
        const nextItem: Bill = {
          id: makeId('bill'),
          budgetMonthId: active.meta.id,
          name: 'New bill',
          dueDate: 1,
          budgeted: 0,
          actual: 0,
          paid: false,
        }
        return {
          ...state,
          months: state.months.map((month) =>
            month.meta.id === active.meta.id ? { ...month, bills: [...month.bills, nextItem] } : month,
          ),
        }
      })
      scheduleSave()
    },

    updateBill: (id, field, value) => {
      set((state) => ({
        ...state,
        months: state.months.map((month) => ({
          ...month,
          bills: month.bills.map((item) =>
            item.id === id
              ? {
                  ...item,
                  [field]:
                    field === 'name'
                      ? String(value)
                      : field === 'paid'
                        ? Boolean(value)
                        : parseNumber(value as number | string),
                }
              : item,
          ),
        })),
      }))
      scheduleSave()
    },

    deleteBill: (id) => {
      set((state) => ({
        ...state,
        months: state.months.map((month) => ({
          ...month,
          bills: month.bills.filter((item) => item.id !== id),
        })),
      }))
      scheduleSave()
    },

    addExpense: () => {
      set((state) => {
        const active = currentMonth(state)
        if (!active) return state
        const nextItem: Expense = {
          id: makeId('expense'),
          budgetMonthId: active.meta.id,
          name: 'New expense',
          budgeted: 0,
          actual: 0,
        }
        return {
          ...state,
          months: state.months.map((month) =>
            month.meta.id === active.meta.id ? { ...month, expenses: [...month.expenses, nextItem] } : month,
          ),
        }
      })
      scheduleSave()
    },

    updateExpense: (id, field, value) => {
      set((state) => ({
        ...state,
        months: state.months.map((month) => ({
          ...month,
          expenses: month.expenses.map((item) =>
            item.id === id
              ? {
                  ...item,
                  [field]:
                    field === 'name'
                      ? String(value)
                      : parseNumber(value as number | string),
                }
              : item,
          ),
        })),
      }))
      scheduleSave()
    },

    deleteExpense: (id) => {
      set((state) => ({
        ...state,
        months: state.months.map((month) => ({
          ...month,
          expenses: month.expenses.filter((item) => item.id !== id),
        })),
      }))
      scheduleSave()
    },

    addDebt: () => {
      set((state) => {
        const active = currentMonth(state)
        if (!active) return state
        const nextItem: Debt = {
          id: makeId('debt'),
          budgetMonthId: active.meta.id,
          creditor: 'New debt',
          dueDate: 1,
          budgeted: 0,
          actual: 0,
        }
        return {
          ...state,
          months: state.months.map((month) =>
            month.meta.id === active.meta.id ? { ...month, debts: [...month.debts, nextItem] } : month,
          ),
        }
      })
      scheduleSave()
    },

    updateDebt: (id, field, value) => {
      set((state) => ({
        ...state,
        months: state.months.map((month) => ({
          ...month,
          debts: month.debts.map((item) =>
            item.id === id
              ? {
                  ...item,
                  [field]:
                    field === 'creditor'
                      ? String(value)
                      : parseNumber(value as number | string),
                }
              : item,
          ),
        })),
      }))
      scheduleSave()
    },

    deleteDebt: (id) => {
      set((state) => ({
        ...state,
        months: state.months.map((month) => ({
          ...month,
          debts: month.debts.filter((item) => item.id !== id),
        })),
      }))
      scheduleSave()
    },

    addSavings: () => {
      set((state) => {
        const active = currentMonth(state)
        if (!active) return state
        const nextItem: Savings = {
          id: makeId('saving'),
          budgetMonthId: active.meta.id,
          name: 'Save',
          budgeted: 0,
          actual: 0,
        }
        return {
          ...state,
          months: state.months.map((month) =>
            month.meta.id === active.meta.id ? { ...month, savings: [...month.savings, nextItem] } : month,
          ),
        }
      })
      scheduleSave()
    },

    updateSavings: (id, field, value) => {
      set((state) => ({
        ...state,
        months: state.months.map((month) => ({
          ...month,
          savings: month.savings.map((item) =>
            item.id === id
              ? {
                  ...item,
                  [field]:
                    field === 'name'
                      ? String(value)
                      : parseNumber(value as number | string),
                }
              : item,
          ),
        })),
      }))
      scheduleSave()
    },

    deleteSavings: (id) => {
      set((state) => ({
        ...state,
        months: state.months.map((month) => ({
          ...month,
          savings: month.savings.filter((item) => item.id !== id),
        })),
      }))
      scheduleSave()
    },

    addTransaction: () => {
      set((state) => {
        const active = currentMonth(state)
        if (!active) return state
        const nextTx: Transaction = {
          id: makeId('tx'),
          budgetMonthId: active.meta.id,
          date: todayIso(),
          amount: 0,
          category: 'Expenses',
          subcategory: active.expenses[0]?.name ?? '',
          details: '',
          type: 'expense',
        }
        const updated = applyTransactionSync({
          ...active,
          transactions: [nextTx, ...active.transactions],
        })
        return {
          ...state,
          months: state.months.map((month) => (month.meta.id === active.meta.id ? updated : month)),
        }
      })
      scheduleSave()
    },

    updateTransaction: (id, field, value) => {
      set((state) => {
        const active = currentMonth(state)
        if (!active) return state
        const updatedTransactions = active.transactions.map((tx) => {
          if (tx.id !== id) return tx
          if (field === 'amount') return { ...tx, amount: parseNumber(value as number | string) }
          if (field === 'type') return { ...tx, type: String(value) as TransactionType }
          if (field === 'category') return { ...tx, category: String(value) as BudgetCategory }
          return { ...tx, [field]: String(value) }
        })
        const updatedMonth = applyTransactionSync({ ...active, transactions: updatedTransactions })
        return {
          ...state,
          months: state.months.map((month) => (month.meta.id === active.meta.id ? updatedMonth : month)),
        }
      })
      scheduleSave()
    },

    deleteTransaction: (id) => {
      set((state) => {
        const active = currentMonth(state)
        if (!active) return state
        const updatedMonth = applyTransactionSync({
          ...active,
          transactions: active.transactions.filter((tx) => tx.id !== id),
        })
        return {
          ...state,
          months: state.months.map((month) => (month.meta.id === active.meta.id ? updatedMonth : month)),
        }
      })
      scheduleSave()
    },

    refreshSync: async () => {
      const state = get()
      const month = currentMonth(state)
      if (!month) return
      set({ saving: true })
      try {
        await syncMonthToSupabase(month)
        set({ saving: false, lastSavedAt: new Date().toISOString() })
      } catch {
        set({ saving: false })
      }
    },
  }
})
