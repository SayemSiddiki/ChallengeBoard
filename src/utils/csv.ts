import type { Deposit } from '../store/boardStore'

export function exportDepositsToCsv(deposits: Deposit[]) {
  if (deposits.length === 0) return

  const headers = ['date', 'amount', 'note', 'type']
  const rows = deposits.map((d) => {
    const type = d.tileId ? 'tile' : 'custom'
    return [
      new Date(d.createdAt).toISOString(),
      d.amount.toString(),
      d.note ? d.note.replace(/"/g, '""') : '',
      type,
    ]
  })

  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      row
        .map((field) => (field.includes(',') || field.includes('"') ? `"${field}"` : field))
        .join(','),
    ),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `challenge-board-deposits-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}

