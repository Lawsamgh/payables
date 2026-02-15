/**
 * Export payables grid to CSV (Excel-compatible UTF-8 with BOM).
 */

import type { PayableRow } from '../types'
import { COLUMN_KEYS } from '../composables/useSpreadsheet'

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
