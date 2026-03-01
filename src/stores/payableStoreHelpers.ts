/**
 * Pure helpers for payableStore. No store or Vue reactivity.
 */

import type { PayableRow } from '../types'

/** Get string from row trying snake_case, camelCase, and PascalCase keys. */
export function getRowStr(row: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    const v = row[k]
    if (v !== undefined && v !== null) {
      const s = String(v).trim()
      if (s !== '') return s
    }
  }
  return ''
}

/** Return a user-friendly message when the error is due to expired/invalid FileMaker session. */
export function normalizeFileMakerError(context: string, apiError: string): string {
  const lower = apiError.toLowerCase()
  if (
    lower.includes('token') ||
    lower.includes('unauthorized') ||
    lower.includes('401') ||
    lower.includes('session')
  ) {
    return 'Session expired. Please connect to FileMaker again (click Connect in the status bar).'
  }
  return `${context}: ${apiError}`
}

/** Check if row at index has data we send to FileMaker (read from current store state, same as grid). */
export function isRowEmptyByIndex(rowsSnapshot: PayableRow[], index: number): boolean {
  const row = rowsSnapshot[index]
  if (!row) return true
  const r = { ...row } as Record<string, unknown>
  const inv = getRowStr(r, 'invoice_number', 'invoiceNumber', 'InvoiceNumber')
  const amtStr = getRowStr(r, 'amount', 'Amount')
  const totalStr = getRowStr(r, 'total', 'Total')
  const hasInv = inv.length > 0
  const hasAmount = amtStr !== '' && !Number.isNaN(parseFloat(amtStr))
  const hasTotal = totalStr !== '' && !Number.isNaN(parseFloat(totalStr))
  return !hasInv && !hasAmount && !hasTotal
}

export function emptyRow(overrides: Partial<PayableRow> = {}): PayableRow {
  return {
    id: '',
    vendor_id: '',
    invoice_number: '',
    vendor_name: '',
    invoice_date: '',
    due_date: '',
    amount: '',
    tax: '',
    total: '',
    status: 'Pending',
    payment_date: '',
    reference: '',
    created_date: '',
    ...overrides,
  }
}
