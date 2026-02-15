/**
 * Spreadsheet logic: selection, keyboard navigation, clipboard, row add/remove.
 */

import { ref, computed } from 'vue'
import { usePayableStore } from '../stores/payableStore'
import { evaluateFormula } from '../utils/formulaParser'
import type { PayableRow } from '../types'
import type { SelectionDirection } from '../types'

export const COLUMN_KEYS = [
  'invoice_number',
  'amount',
  'tax',
  'reference',
  'total',
] as const

export type ColumnKey = (typeof COLUMN_KEYS)[number]

const ROW_HEADER_WIDTH = 60
const COL_WIDTH = 150
const COL_COUNT = COLUMN_KEYS.length

interface SelectedCell {
  row: number
  col: number
}

const selectedCell = ref<SelectedCell>({ row: 0, col: 0 })
const clipboard = ref<string | number | null>(null)
const clipboardIsCut = ref(false)

export function useSpreadsheet() {
  const payableStore = usePayableStore()

  const rows = computed<PayableRow[]>(() => payableStore.rows)
  const rowCount = computed(() => rows.value.length)
  const colCount = computed(() => COL_COUNT)

  const selected = computed<SelectedCell>(() => selectedCell.value)
  const selectedRow = computed(() => selectedCell.value.row)
  const selectedCol = computed(() => selectedCell.value.col)

  const headerToCol = computed<Record<string, number>>(() => {
    const map: Record<string, number> = {}
    COLUMN_KEYS.forEach((k, i) => {
      const label = k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      map[label] = i
      map[k] = i
    })
    return map
  })

  function getCellValue(row: number, col: number): string | number {
    const rowData = rows.value[row]
    if (!rowData) return ''
    const key = COLUMN_KEYS[col]
    const raw = rowData[key]
    if (raw === undefined || raw === null) return ''
    return raw
  }

  function setCellValue(row: number, col: number, value: string | number): void {
    const key = COLUMN_KEYS[col]
    payableStore.updateCell(row, key, String(value))
  }

  function evaluateCellFormula(formula: string): number | string {
    return evaluateFormula(formula, getCellValue, headerToCol.value)
  }

  function selectCell(row: number, col: number): void {
    const r = Math.max(0, Math.min(row, rowCount.value - 1))
    const c = Math.max(0, Math.min(col, COL_COUNT - 1))
    selectedCell.value = { row: r, col: c }
  }

  function moveSelection(direction: SelectionDirection): void {
    const { row, col } = selectedCell.value
    switch (direction) {
      case 'up':
        selectCell(row - 1, col)
        break
      case 'down':
        selectCell(row + 1, col)
        break
      case 'left':
        selectCell(row, col - 1)
        break
      case 'right':
        selectCell(row, col + 1)
        break
      case 'tab':
        if (col < COL_COUNT - 1) selectCell(row, col + 1)
        else selectCell(row + 1, 0)
        break
      case 'tabReverse':
        if (col > 0) selectCell(row, col - 1)
        else selectCell(row - 1, COL_COUNT - 1)
        break
      case 'enter':
        selectCell(row + 1, col)
        break
      case 'enterReverse':
        selectCell(row - 1, col)
        break
      default:
        break
    }
  }

  function addRow(): void {
    payableStore.addRow()
    selectCell(rowCount.value - 1, 0)
  }

  function deleteRow(rowIndex: number): void {
    payableStore.removeRow(rowIndex)
    if (rowCount.value === 0) payableStore.addRow()
    const r = Math.min(rowIndex, rowCount.value - 1)
    if (r >= 0) selectCell(r, selectedCol.value)
  }

  function copy(): void {
    const { row, col } = selectedCell.value
    const val = getCellValue(row, col)
    clipboard.value = val
    clipboardIsCut.value = false
  }

  function cut(): void {
    copy()
    clipboardIsCut.value = true
  }

  function paste(): void {
    if (clipboard.value == null) return
    const { row, col } = selectedCell.value
    setCellValue(row, col, clipboard.value)
    if (clipboardIsCut.value) {
      setCellValue(selectedCell.value.row, selectedCell.value.col, '')
      clipboardIsCut.value = false
      clipboard.value = null
    }
  }

  function clearCell(): void {
    const { row, col } = selectedCell.value
    setCellValue(row, col, '')
  }

  function ensureRowForEnter(): void {
    const { row } = selectedCell.value
    if (row === rowCount.value - 1) addRow()
  }

  return {
    COLUMN_KEYS,
    ROW_HEADER_WIDTH,
    COL_WIDTH,
    COL_COUNT,
    rows,
    rowCount,
    colCount,
    selected,
    selectedRow,
    selectedCol,
    headerToCol,
    getCellValue,
    setCellValue,
    evaluateCellFormula,
    selectCell,
    moveSelection,
    addRow,
    deleteRow,
    copy,
    cut,
    paste,
    clearCell,
    ensureRowForEnter,
    hasClipboard: computed(() => clipboard.value != null),
  }
}
