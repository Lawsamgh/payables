/**
 * Export payables grid and cheque collection to CSV (Excel-compatible UTF-8 with BOM).
 */

import type { PayableRow } from '../types'
import type { FindRecordWithId } from '../composables/useFileMaker'
import { COLUMN_KEYS } from '../composables/useSpreadsheet'
import { formatNumberDisplay } from './formatNumber'

function escapeCsvCell(value: unknown): string {
  if (value == null) return ''
  const s = String(value)
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

function headerLabel(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function toCsv(rows: PayableRow[]): string {
  const headers = COLUMN_KEYS.map(headerLabel)
  const line = (row: PayableRow) => COLUMN_KEYS.map((k) => escapeCsvCell(row[k as keyof PayableRow])).join(',')
  const lines = [headers.join(','), ...rows.map(line)]
  return lines.join('\r\n')
}

export function downloadCsv(filename: string, content: string): void {
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export type ExportFormat = 'csv' | 'excel'

export function exportPayables(rows: PayableRow[], format: ExportFormat = 'csv'): void {
  const ext = format === 'excel' ? 'csv' : 'csv'
  const name = `payables-${new Date().toISOString().slice(0, 10)}.${ext}`
  const content = toCsv(rows)
  downloadCsv(name, content)
}

/** Cheque collection columns for CSV export (all entered fields) */
const CHEQUE_COLUMNS = [
  { key: 'TransRef', label: 'TransRef' },
  { key: 'BankName', altKey: 'Bank Name', label: 'Bank' },
  { key: 'ChequeNo', altKey: 'Cheque No', label: 'Cheque No' },
  { key: 'Amount', label: 'Amount' },
  { key: 'ChequePayee', altKey: 'Cheque Payee', label: 'Cheque Payee' },
  { key: 'ReceivedBy', altKey: 'Received By', label: 'Received By' },
  { key: 'IDNo', altKey: 'ID No', label: 'ID No' },
  { key: 'Contact', label: 'Contact' },
  { key: 'TinNo', altKey: 'Tin No', label: 'Tin No' },
  { key: 'CollectionDate', altKey: 'Collection Date', label: 'Collection Date' },
  { key: 'IssuedBy', altKey: 'Issued By', label: 'Issued By' },
] as const

function getFieldValue(
  fd: Record<string, unknown>,
  key: string,
  altKey?: string,
): string {
  const v = fd[key] ?? fd[altKey ?? '']
  return v != null && v !== '' ? String(v).trim() : ''
}

function formatAmountForExport(value: string | number | undefined): string {
  if (value == null || value === '') return ''
  const n = typeof value === 'number' ? value : parseFloat(String(value))
  if (Number.isNaN(n)) return ''
  return formatNumberDisplay(n)
}

/** Prefix with tab so Excel treats as text (prevents scientific notation for long numbers). */
const TEXT_PRESERVE_KEYS = new Set(['IDNo', 'TinNo', 'ChequeNo'])

function formatForExport(
  col: (typeof CHEQUE_COLUMNS)[number],
  fd: Record<string, unknown>,
): string {
  if (col.key === 'Amount') {
    const raw = fd[col.key] ?? fd[col.altKey ?? '']
    return formatAmountForExport(raw)
  }
  const val = getFieldValue(fd, col.key, col.altKey)
  if (val && TEXT_PRESERVE_KEYS.has(col.key)) {
    return '\t' + val
  }
  return val
}

/** Export cheque collection records to CSV (Excel-compatible UTF-8 with BOM). */
export function exportChequeCollections(
  rows: FindRecordWithId<Record<string, unknown>>[],
  format: ExportFormat = 'csv',
): void {
  const headers = CHEQUE_COLUMNS.map((c) => c.label)
  const lines = rows.map((row) => {
    const fd = (row.fieldData ?? {}) as Record<string, unknown>
    return CHEQUE_COLUMNS.map((col) =>
      escapeCsvCell(formatForExport(col, fd)),
    ).join(',')
  })
  const content = [headers.join(','), ...lines].join('\r\n')
  const ext = format === 'excel' ? 'csv' : 'csv'
  const name = `cheque-collections-${new Date().toISOString().slice(0, 10)}.${ext}`
  downloadCsv(name, content)
}
