/**
 * Simple formula parser for spreadsheet-style expressions.
 * Supports: =SUM(A1:A5), =A1+A2, basic arithmetic (+, -, *, /), numbers.
 */

import type { GetCellValueFn, HeaderToColMap } from '../types'

const CELL_REF = /^([A-Z]+)(\d+)$/i

export function columnLetterToIndex(col: string): number {
  if (!col || !/^[A-Z]+$/i.test(col)) return -1
  let idx = 0
  const s = col.toUpperCase()
  for (let i = 0; i < s.length; i++) {
    idx = idx * 26 + (s.charCodeAt(i) - 64)
  }
  return idx - 1
}

export function columnIndexToLetter(index: number): string {
  if (index < 0) return ''
  let s = ''
  let n = index + 1
  while (n > 0) {
    const r = (n - 1) % 26
    s = String.fromCharCode(65 + r) + s
    n = Math.floor((n - 1) / 26)
  }
  return s
}

export interface CellRef {
  row: number
  col: number
}

export function parseCellRef(ref: string, headerToCol?: HeaderToColMap | null): CellRef | null {
  if (!ref || typeof ref !== 'string') return null
  const m = ref.trim().toUpperCase().match(CELL_REF)
  if (m) {
    const col = columnLetterToIndex(m[1])
    const row = parseInt(m[2], 10) - 1
    if (row >= 0 && col >= 0) return { row, col }
  }
  if (headerToCol && (ref in headerToCol)) {
    return { row: -1, col: headerToCol[ref] }
  }
  return null
}

function parseNamedRange(name: string, headerToCol?: HeaderToColMap | null): CellRef | null {
  const numMatch = name.match(/^([A-Za-z_]+)(\d+)$/)
  if (numMatch && headerToCol) {
    const col = headerToCol[numMatch[1]]
    const row = parseInt(numMatch[2], 10) - 1
    if (col !== undefined && row >= 0) return { row, col }
  }
  return null
}

export function evaluateFormula(
  formula: string,
  getCellValue: GetCellValueFn,
  headerToCol: HeaderToColMap = {}
): number | string {
  if (!formula || typeof formula !== 'string') return formula as unknown as string
  const trimmed = formula.trim()
  if (!trimmed.startsWith('=')) return formula

  const expr = trimmed.slice(1).trim()

  const sumMatch = expr.match(/^SUM\s*\(\s*([A-Za-z0-9]+)\s*:\s*([A-Za-z0-9]+)\s*\)$/i)
  if (sumMatch) {
    const start = sumMatch[1]
    const end = sumMatch[2]
    const startRef = parseCellRef(start, headerToCol) ?? parseNamedRange(start, headerToCol)
    const endRef = parseCellRef(end, headerToCol) ?? parseNamedRange(end, headerToCol)
    if (startRef && endRef) {
      const minR = Math.min(startRef.row, endRef.row)
      const maxR = Math.max(startRef.row, endRef.row)
      const minC = Math.min(startRef.col, endRef.col)
      const maxC = Math.max(startRef.col, endRef.col)
      let sum = 0
      for (let r = minR; r <= maxR; r++) {
        for (let c = minC; c <= maxC; c++) {
          const v = getCellValue(r, c)
          const n = parseFloat(String(v))
          if (!Number.isNaN(n)) sum += n
        }
      }
      return sum
    }
  }

  let arithmetic = expr
  const refs = expr.match(/\b[A-Z]+\d+\b/gi) ?? []
  const seen = new Set<string>()
  for (const ref of refs) {
    if (seen.has(ref)) continue
    seen.add(ref)
    const parsed = parseCellRef(ref, headerToCol)
    if (parsed && parsed.row >= 0) {
      const v = getCellValue(parsed.row, parsed.col)
      const n = parseFloat(String(v))
      const repl = Number.isNaN(n) ? '0' : String(n)
      arithmetic = arithmetic.replace(
        new RegExp(ref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
        repl
      )
    }
  }

  const safeExpr = arithmetic.replace(/\s/g, '')
  if (/^[\d.\s+\-*/()]+$/.test(safeExpr)) {
    try {
      return Function(`"use strict"; return (${safeExpr})`)() as number
    } catch {
      return formula
    }
  }

  return formula
}
