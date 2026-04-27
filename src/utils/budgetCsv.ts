import type { BudgetMonthData } from '../store/budgetStore'

function esc(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined) return ''
  const text = String(value)
  return text.includes(',') || text.includes('"') || text.includes('\n')
    ? `"${text.replace(/"/g, '""')}"`
    : text
}

function sectionHeader(title: string) {
  return [`# ${title}`]
}

export function exportBudgetMonthToCsv(month: BudgetMonthData) {
  const rows: Array<Array<string | number | boolean>> = []

  rows.push(sectionHeader('Meta'))
  rows.push(['Month', month.meta.month])
  rows.push(['Start Date', month.meta.startDate])
  rows.push(['End Date', month.meta.endDate])
  rows.push(['Currency', month.meta.currency])
  rows.push(['Start Balance', month.meta.startBalance])
  rows.push(['Challenge Yourself', month.meta.challengeYourself ?? 0])
  rows.push([])

  rows.push(sectionHeader('Income'))
  rows.push(['Source', 'Budgeted', 'Actual', 'Date'])
  month.incomes.forEach((item) => {
    rows.push([item.source, item.budgeted, item.actual, item.date])
  })
  rows.push([])

  rows.push(sectionHeader('Bills'))
  rows.push(['Name', 'Due Date', 'Budgeted', 'Actual', 'Paid'])
  month.bills.forEach((item) => {
    rows.push([item.name, item.dueDate, item.budgeted, item.actual, item.paid])
  })
  rows.push([])

  rows.push(sectionHeader('Expenses'))
  rows.push(['Name', 'Budgeted', 'Actual', 'Remaining'])
  month.expenses.forEach((item) => {
    rows.push([item.name, item.budgeted, item.actual, item.budgeted - item.actual])
  })
  rows.push([])

  rows.push(sectionHeader('Debt'))
  rows.push(['Creditor', 'Due Date', 'Budgeted', 'Actual'])
  month.debts.forEach((item) => {
    rows.push([item.creditor, item.dueDate, item.budgeted, item.actual])
  })
  rows.push([])

  rows.push(sectionHeader('Savings'))
  rows.push(['Name', 'Budgeted', 'Actual'])
  month.savings.forEach((item) => {
    rows.push([item.name, item.budgeted, item.actual])
  })
  rows.push([])

  rows.push(sectionHeader('Transactions'))
  rows.push(['Date', 'Amount', 'Category', 'Subcategory', 'Details', 'Type'])
  month.transactions.forEach((item) => {
    rows.push([
      item.date,
      item.amount,
      item.category,
      item.subcategory,
      item.details,
      item.type,
    ])
  })

  const csv = rows.map((row) => row.map(esc).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const safeMonth = month.meta.month.replace(/\s+/g, '-').toLowerCase()
  a.download = `budget-${safeMonth}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}

