<template>
  <div class="data-grid-wrapper flex flex-col flex-1 min-h-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-sm overflow-hidden">
    <div
      ref="gridRef"
      class="data-grid-scroll flex-1 min-h-0 overflow-auto outline-none focus:outline-none focus:ring-0"
      tabindex="0"
      @keydown="onKeydown"
      @contextmenu.prevent="onContextMenu"
    >
      <table
        class="data-grid-table border-collapse font-mono text-[var(--input-size)]"
        :style="{ ...tableStyle, '--row-header-width': ROW_HEADER_WIDTH + 'px' }"
      >
        <!-- Child header row -->
        <thead class="sticky top-0 z-10 bg-[var(--color-bg-dark)]">
          <tr>
            <th
              class="row-header-th sticky left-0 z-20 border-b border-r border-[var(--color-border)] px-3 py-2 text-[var(--label-size)] font-medium text-[var(--color-text-muted)]"
            >
              #
            </th>
            <th
              v-for="(key, colIndex) in COLUMN_KEYS"
              :key="key"
              class="border-b border-r border-[var(--color-border)] px-3 py-2 text-left text-[var(--label-size)] font-medium text-[var(--color-text-muted)] whitespace-nowrap"
              :style="colMinWidthStyle(key)"
            >
              {{ childHeaderLabel(key) }}
            </th>
            <th class="data-grid-actions-th border-b border-[var(--color-border)] px-2 py-2 text-[var(--label-size)] font-medium text-[var(--color-text-muted)] w-14">
              <span class="sr-only">Options</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="realIndex in displayedRowIndices"
            :key="realIndex"
            class="data-grid-row hover:bg-white/[0.04] transition-colors"
          >
            <td
              class="row-header-td sticky left-0 z-10 border-b border-r border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-2 text-center text-[var(--color-text-muted)] tabular-nums"
              :class="{ 'bg-[var(--color-accent-soft)]': selectedRow === realIndex }"
              @click="selectCell(realIndex, 0)"
            >
              {{ realIndex + 1 }}
            </td>
            <td
              v-for="(key, colIndex) in COLUMN_KEYS"
              :key="`${realIndex}-${key}`"
              class="border-b border-r border-[var(--color-border)] px-3 py-2 text-left whitespace-nowrap"
              :class="cellClass(realIndex, colIndex)"
              :style="colMinWidthStyle(key)"
              @click="onCellClick(realIndex, colIndex)"
            >
              <template v-if="readOnly">
                <span class="cell-display">{{ displayValue(realIndex, colIndex) }}</span>
              </template>
              <template v-else-if="isStatusCol(key)">
                <select
                  :value="getCellValue(realIndex, colIndex)"
                  class="cell-select w-full min-w-0 border-0 bg-transparent text-[var(--color-text)] focus:ring-0 focus:outline-none"
                  @click.stop
                  @change="setCellValue(realIndex, colIndex, ($event.target as HTMLSelectElement).value)"
                >
                  <option v-for="opt in STATUS_OPTIONS" :key="opt" :value="opt">{{ opt }}</option>
                </select>
              </template>
              <template v-else-if="isTaxCol(key)">
                <div class="cell-tax-wrap flex items-center gap-1 min-w-0">
                  <span class="cell-display flex-1 min-w-0">{{ displayValue(realIndex, colIndex) }}</span>
                  <button
                    v-if="hasTaxValue(realIndex)"
                    type="button"
                    class="cell-tax-breakdown-trigger shrink-0 p-0.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    aria-label="Show tax breakdown"
                    @click.stop="openTaxBreakdown(realIndex, $event)"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </button>
                </div>
                <div
                  v-if="taxBreakdownRow === realIndex"
                  ref="taxBreakdownPopoverRef"
                  class="cell-tax-breakdown-popover"
                  role="tooltip"
                >
                  <div v-if="taxBreakdownLoading" class="cell-tax-breakdown-loading">Loading…</div>
                  <template v-else>
                    <div class="cell-tax-breakdown-title">Tax breakdown</div>
                    <ul v-if="taxBreakdownList.length" class="cell-tax-breakdown-list">
                      <li v-for="(item, i) in taxBreakdownList" :key="i">{{ item.TaxName }} — {{ item.Rate != null ? item.Rate + '%' : '' }}</li>
                    </ul>
                    <div v-else class="cell-tax-breakdown-empty">{{ taxBreakdownEmptyReason || 'No taxes recorded for this invoice. Use row menu (⋯) to add tax.' }}</div>
                  </template>
                </div>
              </template>
              <template v-else-if="isTotalCol(key)">
                <span class="cell-display">{{ displayValue(realIndex, colIndex) }}</span>
              </template>
              <template v-else-if="isTaxAmountCol(key)">
                <span class="cell-display">{{ displayValue(realIndex, colIndex) }}</span>
              </template>
              <template v-else>
                <input
                  v-if="isSelected(realIndex, colIndex)"
                  :key="`input-${realIndex}-${colIndex}`"
                  ref="cellInputRef"
                  :value="editingValue"
                  type="text"
                  :class="[
                    'cell-input w-full min-w-0 px-1.5 py-0.5 border-0 rounded bg-transparent text-[var(--color-text)] focus:ring-2 focus:ring-inset focus:outline-none',
                    key === 'invoice_number' && duplicateInvoiceNumbers.has(realIndex)
                      ? 'focus:ring-red-500 border-red-500/50'
                      : 'focus:ring-[var(--color-accent)]'
                  ]"
                  @input="onCellInput(realIndex, colIndex, ($event.target as HTMLInputElement).value)"
                  @blur="commitEdit"
                  @keydown.enter.prevent="commitAndMove('enter')"
                  @keydown.tab.prevent="commitAndMove('tab')"
                  @keydown.escape="cancelEdit"
                  @keydown.down.prevent="commitAndMove('enter')"
                  @keydown.up.prevent="commitAndMove('enterReverse')"
                  @keydown.left.prevent="commitAndMove('left')"
                  @keydown.right.prevent="commitAndMove('right')"
                >
                <span v-else class="cell-display" :class="{ 'cell-display--duplicate': key === 'invoice_number' && duplicateInvoiceNumbers.has(realIndex) }">{{ displayValue(realIndex, colIndex) }}</span>
              </template>
            </td>
            <td class="data-grid-actions-td border-b border-[var(--color-border)] px-2 py-2 w-14 align-middle" @click.stop>
              <div v-if="!readOnly" class="data-grid-row-actions">
                <button
                  type="button"
                  class="data-grid-row-actions__trigger"
                  :class="{ 'data-grid-row-actions__trigger--open': rowMenuOpen === realIndex }"
                  :aria-expanded="rowMenuOpen === realIndex"
                  aria-haspopup="true"
                  aria-label="Row options"
                  @click="toggleRowMenu(realIndex)"
                >
                  <svg class="data-grid-row-actions__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 10.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 4.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 16.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
                  </svg>
                </button>
                <Transition name="row-menu">
                  <div
                    v-if="rowMenuOpen === realIndex"
                    class="data-grid-row-actions__dropdown"
                    role="menu"
                    @click.stop
                  >
                    <div class="data-grid-row-actions__panel">
                      <div v-if="expandedTaxType" class="data-grid-row-actions__header">
                        <span class="data-grid-row-actions__header-title">Tax</span>
                        <span v-if="currentRowTaxDisplay(realIndex)" class="data-grid-row-actions__header-badge">{{ currentRowTaxDisplay(realIndex) }}</span>
                      </div>
                      <template v-if="expandedTaxType === null">
                        <div v-if="taxListLoading" class="data-grid-row-actions__state">
                          <span class="data-grid-row-actions__state-text">Loading…</span>
                        </div>
                        <div v-else-if="taxTypesForMenu.length === 0" class="data-grid-row-actions__state">
                          <span class="data-grid-row-actions__state-text">No tax types</span>
                        </div>
                        <div v-else>
                          <div class="data-grid-row-actions__group">
                            <div class="data-grid-row-actions__group-label">Set tax</div>
                            <div class="data-grid-row-actions__list">
                              <button
                                v-for="entry in taxTypesForMenu"
                                :key="entry.typeKey"
                                type="button"
                                class="data-grid-row-actions__option"
                                :class="{
                                  'data-grid-row-actions__option--expandable': entry.items.length > 1,
                                  'data-grid-row-actions__option--selected': entry.items.length === 1 && isTaxSelectedForRow(realIndex, entry.items[0].Tax_Name ?? '', entry.items[0].Tax_Rate)
                                }"
                                role="menuitem"
                                @click="onTaxTypeClick(realIndex, entry)"
                              >
                                <svg
                                  v-if="entry.items.length === 1 && isTaxSelectedForRow(realIndex, entry.items[0].Tax_Name ?? '', entry.items[0].Tax_Rate)"
                                  class="data-grid-row-actions__checkmark"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  aria-hidden="true"
                                >
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                                </svg>
                                <span v-else class="data-grid-row-actions__checkmark-placeholder"></span>
                                <span class="data-grid-row-actions__option-label">{{ entry.typeLabel }}</span>
                                <span v-if="entry.items.length === 1" class="data-grid-row-actions__option-meta">
                                  {{ formatTaxRate(entry.items[0].Tax_Rate) }}
                                </span>
                                <svg v-else class="data-grid-row-actions__chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </template>
                      <template v-else>
                        <button
                          type="button"
                          class="data-grid-row-actions__back"
                          @click="expandedTaxType = null"
                        >
                          <svg class="data-grid-row-actions__back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
                          <span>{{ expandedTaxType }}</span>
                        </button>
                        <div class="data-grid-row-actions__group">
                          <div class="data-grid-row-actions__list">
                            <button
                              v-for="(item, idx) in expandedTaxTypeItems"
                              :key="idx"
                              type="button"
                              class="data-grid-row-actions__option"
                              :class="{ 'data-grid-row-actions__option--selected': isTaxSelectedForRow(realIndex, item.Tax_Name ?? '', item.Tax_Rate) }"
                              role="menuitem"
                              @click="applyTaxToRow(realIndex, item.Tax_Rate, item.Tax_Name ?? '')"
                            >
                              <svg
                                v-if="isTaxSelectedForRow(realIndex, item.Tax_Name ?? '', item.Tax_Rate)"
                                class="data-grid-row-actions__checkmark"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                              </svg>
                              <span v-else class="data-grid-row-actions__checkmark-placeholder"></span>
                              <span class="data-grid-row-actions__option-label">{{ item.Tax_Name ?? '—' }}</span>
                              <span class="data-grid-row-actions__option-meta">
                                {{ formatTaxRate(item.Tax_Rate) }}
                              </span>
                            </button>
                          </div>
                        </div>
                      </template>
                    </div>
                  </div>
                </Transition>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div
      v-if="totalRows > 0"
      class="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-[var(--color-border)] bg-[var(--color-bg-dark)]/50 text-[var(--label-size)]"
    >
      <div class="flex items-center gap-4">
        <span class="text-[var(--color-text-muted)]">
          Showing {{ rangeStart }}–{{ rangeEnd }} of {{ totalRows }} row{{ totalRows !== 1 ? 's' : '' }}
        </span>
        <label class="flex items-center gap-2 text-[var(--color-text-muted)]">
          <span>Rows per page</span>
          <select
            :value="pageSize"
            class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] px-2 py-1.5 text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
            @change="pageSize = Number(($event.target as HTMLSelectElement).value)"
          >
            <option v-for="n in PAGE_SIZE_OPTIONS" :key="n" :value="n">{{ n }}</option>
          </select>
        </label>
      </div>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="pagination-btn rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-1.5 text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-text)] disabled:opacity-40 disabled:pointer-events-none transition-colors"
          :disabled="currentPage <= 1"
          aria-label="Previous page"
          @click="currentPage = Math.max(1, currentPage - 1)"
        >
          Prev
        </button>
        <span class="px-2 py-1.5 text-[var(--color-text-muted)]">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        <button
          type="button"
          class="pagination-btn rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-1.5 text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-text)] disabled:opacity-40 disabled:pointer-events-none transition-colors"
          :disabled="currentPage >= totalPages"
          aria-label="Next page"
          @click="currentPage = Math.min(totalPages, currentPage + 1)"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Entry total (from Payables_Main) -->
    <div
      class="entry-total-row flex flex-wrap items-end justify-between gap-6 px-4 py-4 border-t-2 border-[var(--color-border)] bg-[var(--color-bg-dark)]"
    >
      <div class="entry-total-row__left flex flex-col items-start gap-0.5">
        <span class="entry-total-row__label text-[var(--color-text-muted)] font-medium">Entry total</span>
        <span class="entry-total-row__words">
          {{ entryTotalInWords }}
        </span>
      </div>
      <span class="entry-total-row__value text-xl font-bold text-[var(--color-text)] tabular-nums tracking-tight">
        {{ vendorStore.vendor.currency }} {{ formatEntryTotal(payableStore.entryTotal) }}
      </span>
    </div>

    <ContextMenu
      :visible="contextMenu.visible"
      :x="contextMenu.x"
      :y="contextMenu.y"
      @copy="handleCopy"
      @paste="handlePaste"
      @cut="handleCut"
      @clear="handleClear"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useSpreadsheet } from '../composables/useSpreadsheet'
import { usePayableStore } from '../stores/payableStore'
import { useVendorStore } from '../stores/vendorStore'
import { useToastStore } from '../stores/toastStore'
import { useFileMaker } from '../composables/useFileMaker'
import { LAYOUTS } from '../utils/filemakerApi'
import { numberToWords } from '../utils/numberToWords'
import { formatNumberDisplay } from '../utils/formatNumber'
import type { TaxValueFieldData, PayableInvoiceFieldData } from '../utils/filemakerApi'
import type { FindRecordWithId } from '../composables/useFileMaker'
import { isFormula } from '../composables/useFormulas'
import type { ColumnKey } from '../composables/useSpreadsheet'
import ContextMenu from './ContextMenu.vue'

const spreadsheet = useSpreadsheet()
const payableStore = usePayableStore()
const vendorStore = useVendorStore()
const toast = useToastStore()

function formatEntryTotal(value: number): string {
  return formatNumberDisplay(value) || '0.00'
}

const entryTotalInWords = computed(() =>
  numberToWords(payableStore.entryTotal),
)
const { findRecordsWithIds, findRecordsByQuery, findRecordsByQueryWithIds, createRecord, deleteRecord, isConnected } = useFileMaker()
const {
  COLUMN_KEYS,
  ROW_HEADER_WIDTH,
  rows,
  selectedRow,
  selectedCol,
  getCellValue,
  setCellValue,
  evaluateCellFormula,
  selectCell,
  moveSelection,
  ensureRowForEnter,
  copy,
  cut,
  paste,
  clearCell,
} = spreadsheet

const PAGE_SIZE_OPTIONS = [10, 15, 25, 50]
const pageSize = ref(15)
const currentPage = ref(1)

const totalRows = computed(() => rows.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(totalRows.value / pageSize.value)))

const displayedRowIndices = computed(() => {
  const total = totalRows.value
  if (total === 0) return []
  const start = (currentPage.value - 1) * pageSize.value
  const end = Math.min(start + pageSize.value, total)
  const indices: number[] = []
  for (let i = start; i < end; i++) indices.push(i)
  return indices
})

const rangeStart = computed(() => {
  if (totalRows.value === 0) return 0
  return (currentPage.value - 1) * pageSize.value + 1
})
const rangeEnd = computed(() => {
  return Math.min(currentPage.value * pageSize.value, totalRows.value)
})

watch(selectedRow, (row) => {
  const page = Math.floor(row / pageSize.value) + 1
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    currentPage.value = page
  }
})

watch(totalRows, () => {
  if (currentPage.value > totalPages.value) currentPage.value = Math.max(1, totalPages.value)
})

const STATUS_OPTIONS = payableStore.STATUS_OPTIONS
/** Editable except when Posted (Rejected entries stay editable; Tax, Tax Amount, Total cols are always read-only). */
const readOnly = computed(() => payableStore.mainPosted && payableStore.mainStatus !== "Rejected")

const TAX_COL_INDEX = COLUMN_KEYS.indexOf('tax')
const REF_COL_INDEX = COLUMN_KEYS.indexOf('reference')
const AMOUNT_COL_INDEX = COLUMN_KEYS.indexOf('amount')
const INV_COL_INDEX = COLUMN_KEYS.indexOf('invoice_number')
const rowMenuOpen = ref<number | null>(null)
const expandedTaxType = ref<string | null>(null)

// Duplicate detection state
const duplicateInvoiceNumbers = ref<Set<number>>(new Set())
const fileMakerDuplicateCheckCache = ref<Map<string, boolean>>(new Map())
const fileMakerCheckTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

const taxList = ref<FindRecordWithId<TaxValueFieldData>[]>([])
const taxListLoading = ref(false)

const taxBreakdownRow = ref<number | null>(null)
const taxBreakdownList = ref<{ TaxName?: string; Rate?: number }[]>([])
const taxBreakdownLoading = ref(false)
const taxBreakdownEmptyReason = ref<string | null>(null)
const taxBreakdownPopoverRef = ref<HTMLElement | null>(null)

/** Cache Payable_Invoice records per row (for showing checkmarks). */
const rowPayableInvoiceCache = ref<Map<number, PayableInvoiceFieldData[]>>(new Map())

async function loadTaxList(): Promise<void> {
  if (!isConnected.value) return
  taxListLoading.value = true
  const { data } = await findRecordsWithIds<TaxValueFieldData>(LAYOUTS.TAX_VALUE, { limit: 500 })
  taxList.value = data
  taxListLoading.value = false
}

function closeTaxBreakdown(): void {
  taxBreakdownRow.value = null
  taxBreakdownList.value = []
  taxBreakdownEmptyReason.value = null
}

async function openTaxBreakdown(rowIndex: number, event: MouseEvent): void {
  const inv = getCellValue(rowIndex, INV_COL_INDEX)
  const invStr = inv != null && String(inv).trim() !== '' ? String(inv).trim() : ''
  if (taxBreakdownRow.value === rowIndex) {
    closeTaxBreakdown()
    return
  }
  taxBreakdownRow.value = rowIndex
  taxBreakdownList.value = []
  taxBreakdownEmptyReason.value = null
  if (!invStr) {
    taxBreakdownEmptyReason.value = 'Enter invoice number first, then add tax via row menu (⋯).'
    taxBreakdownLoading.value = false
    nextTick(() => positionTaxBreakdownPopover(event))
    return
  }
  taxBreakdownLoading.value = true
  const { data, error } = await findRecordsByQuery<PayableInvoiceFieldData>(
    LAYOUTS.PAYABLE_INVOICE,
    { invoiceNumber: invStr },
    100
  )
  taxBreakdownLoading.value = false
  if (error) {
    taxBreakdownList.value = [{ TaxName: `Error: ${error}`, Rate: undefined }]
  } else {
    taxBreakdownList.value = data.map((r) => ({ TaxName: r.TaxName ?? '—', Rate: r.Rate }))
  }
  nextTick(() => positionTaxBreakdownPopover(event))
}

function positionTaxBreakdownPopover(event: MouseEvent): void {
  const popover = taxBreakdownPopoverRef.value
  const btn = (event.target as HTMLElement)?.closest('.cell-tax-breakdown-trigger')
  if (popover && btn) {
    const rect = btn.getBoundingClientRect()
    popover.style.position = 'fixed'
    popover.style.left = `${rect.left}px`
    popover.style.top = `${rect.bottom + 4}px`
    popover.style.zIndex = '50'
  }
}

/** Parse date string (MM/dd/yyyy or yyyy-MM-dd) to Date; return null if invalid. */
function parseTaxDate(s: string | undefined): Date | null {
  const raw = (s ?? '').trim()
  if (!raw) return null
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw)
  if (iso) {
    const d = new Date(parseInt(iso[1], 10), parseInt(iso[2], 10) - 1, parseInt(iso[3], 10))
    return Number.isNaN(d.getTime()) ? null : d
  }
  const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(raw)
  if (us) {
    const d = new Date(parseInt(us[3], 10), parseInt(us[1], 10) - 1, parseInt(us[2], 10))
    return Number.isNaN(d.getTime()) ? null : d
  }
  const fallback = new Date(raw)
  return Number.isNaN(fallback.getTime()) ? null : fallback
}

/** True if tax is currently valid: today is between Start_Date and End_Date (inclusive). Missing date = no bound. */
function isTaxRecordCurrentlyValid(record: FindRecordWithId<TaxValueFieldData>, today: Date): boolean {
  const { fieldData } = record
  const start = parseTaxDate(fieldData.Start_Date)
  const end = parseTaxDate(fieldData.End_Date)
  if (start !== null && start > today) return false
  if (end !== null && end < today) return false
  return true
}

/** Tax list filtered to only records with valid Start/End date (currently in effect). */
const validTaxList = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return taxList.value.filter((r) => isTaxRecordCurrentlyValid(r, today))
})

/** Group tax records by Tax_Type for the menu. Only includes records with valid dates. */
interface TaxTypeMenuEntry {
  typeKey: string
  typeLabel: string
  items: TaxValueFieldData[]
}
const taxTypesForMenu = computed<TaxTypeMenuEntry[]>(() => {
  const list = validTaxList.value
  const byType = new Map<string, TaxValueFieldData[]>()
  for (const { fieldData } of list) {
    const typeLabel = (fieldData.Tax_Type ?? '').trim() || '—'
    if (!byType.has(typeLabel)) byType.set(typeLabel, [])
    byType.get(typeLabel)!.push(fieldData)
  }
  return Array.from(byType.entries()).map(([typeLabel, items]) => ({
    typeKey: typeLabel,
    typeLabel,
    items,
  }))
})

const expandedTaxTypeItems = computed(() => {
  const type = expandedTaxType.value
  if (!type) return []
  const entry = taxTypesForMenu.value.find((e) => e.typeLabel === type)
  return entry?.items ?? []
})

function formatTaxRate(rate: number | string | undefined): string {
  if (rate == null || rate === '') return '—'
  const n = Number(rate)
  if (Number.isNaN(n)) return '—'
  return `${n}%`
}

/** Display string for current row tax (e.g. "10%" or "" if empty). Used in row menu header/badge. */
function currentRowTaxDisplay(rowIndex: number): string {
  const v = getCellValue(rowIndex, TAX_COL_INDEX)
  if (v == null || String(v).trim() === '') return ''
  const n = Number(v)
  if (Number.isNaN(n)) return String(v).trim()
  return `${n}%`
}

/** True if this rate matches the row’s current tax value (so we can show “Current”). */
function isCurrentTaxForRow(rowIndex: number, rate: number | string | undefined): boolean {
  const v = getCellValue(rowIndex, TAX_COL_INDEX)
  const cellNum = Number(v)
  if (Number.isNaN(cellNum)) return false
  const rateNum = rate != null && rate !== '' ? Number(rate) : NaN
  if (Number.isNaN(rateNum)) return false
  return cellNum === rateNum
}

async function loadRowPayableInvoiceCache(rowIndex: number): Promise<void> {
  if (!isConnected.value) return
  const inv = getCellValue(rowIndex, INV_COL_INDEX)
  const invStr = inv != null && String(inv).trim() !== '' ? String(inv).trim() : ''
  if (invStr === '') {
    rowPayableInvoiceCache.value.set(rowIndex, [])
    return
  }
  const { data } = await findRecordsByQueryWithIds<PayableInvoiceFieldData>(
    LAYOUTS.PAYABLE_INVOICE,
    { invoiceNumber: invStr },
    100
  )
  rowPayableInvoiceCache.value.set(
    rowIndex,
    data.map((r) => r.fieldData)
  )
}

function toggleRowMenu(rowIndex: number): void {
  if (rowMenuOpen.value === rowIndex) {
    rowMenuOpen.value = null
    expandedTaxType.value = null
  } else {
    rowMenuOpen.value = rowIndex
    expandedTaxType.value = null
    loadRowPayableInvoiceCache(rowIndex)
  }
}

/** True if this tax (TaxName + Rate) is already in Payable_Invoice for this row. */
function isTaxSelectedForRow(rowIndex: number, taxName: string, rate: number | string | undefined): boolean {
  const cache = rowPayableInvoiceCache.value.get(rowIndex)
  if (!cache || cache.length === 0) return false
  const rateNum = rate != null && rate !== '' ? Number(rate) : 0
  const nameMatch = String(taxName ?? '').trim()
  return cache.some(
    (r) =>
      String(r.TaxName ?? '').trim() === nameMatch &&
      Number(r.Rate) === (Number.isNaN(rateNum) ? 0 : rateNum)
  )
}

function onTaxTypeClick(rowIndex: number, entry: TaxTypeMenuEntry): void {
  if (entry.items.length === 1) {
    const item = entry.items[0]
    const rate = item.Tax_Rate
    const taxName = item.Tax_Name ?? ''
    applyTaxToRow(rowIndex, rate, taxName)
  } else {
    expandedTaxType.value = entry.typeLabel
  }
}

/**
 * Toggle tax in Payable_Invoice: if a record exists for this invoice + TaxName + Rate, delete it and return true (removed).
 * Otherwise create the record and return false (added). If no invoice number or not connected, returns null (no change in FM).
 */
async function toggleTaxInPayableInvoice(
  rowIndex: number,
  taxName: string,
  rate: number | string | undefined
): Promise<boolean | null> {
  if (!isConnected.value || !taxName.trim()) return null
  const inv = getCellValue(rowIndex, INV_COL_INDEX)
  const invStr = inv != null && String(inv).trim() !== '' ? String(inv).trim() : ''
  if (invStr === '') return null
  const rateNum = rate != null && rate !== '' ? Number(rate) : 0
  const { data: existing } = await findRecordsByQueryWithIds<PayableInvoiceFieldData>(
    LAYOUTS.PAYABLE_INVOICE,
    { invoiceNumber: invStr },
    100
  )
  const match = existing.find(
    (r) =>
      String(r.fieldData?.TaxName ?? '').trim() === taxName.trim() &&
      Number(r.fieldData?.Rate) === (Number.isNaN(rateNum) ? 0 : rateNum)
  )
  if (match?.recordId) {
    await deleteRecord(LAYOUTS.PAYABLE_INVOICE, match.recordId)
    // Update cache: remove this tax
    const cache = rowPayableInvoiceCache.value.get(rowIndex) ?? []
    rowPayableInvoiceCache.value.set(
      rowIndex,
      cache.filter(
        (r) =>
          !(String(r.TaxName ?? '').trim() === taxName.trim() && Number(r.Rate) === (Number.isNaN(rateNum) ? 0 : rateNum))
      )
    )
    return true
  }
  const fieldData: PayableInvoiceFieldData = {
    invoiceNumber: invStr,
    TaxName: taxName.trim(),
    Rate: Number.isNaN(rateNum) ? 0 : rateNum,
  }
  await createRecord(LAYOUTS.PAYABLE_INVOICE, fieldData)
  // Update cache: add this tax
  const cache = rowPayableInvoiceCache.value.get(rowIndex) ?? []
  rowPayableInvoiceCache.value.set(rowIndex, [...cache, fieldData])
  return false
}

async function applyTaxToRow(rowIndex: number, rate: number | string | undefined, taxName?: string): Promise<void> {
  const rateNum = rate != null && rate !== '' ? Number(rate) : 0
  const transRef = payableStore.currentTransRef

  // If there are unsaved changes and we have a saved entry, save first so refetch doesn't overwrite edits
  if (transRef && isConnected.value && payableStore.isDirty) {
    const result = await payableStore.syncToFileMaker({ markPosted: false })
    if (result.error) {
      toast.error('Save failed: ' + result.error + '. Save your changes before selecting a tax.')
      rowMenuOpen.value = null
      expandedTaxType.value = null
      return
    }
  }

  const removed = taxName && isConnected.value ? await toggleTaxInPayableInvoice(rowIndex, taxName, rate) : null
  // Refetch data from FileMaker to get updated calculated Tax value (whether added or removed)
  if (transRef && taxName && isConnected.value) {
    await payableStore.fetchDetailsByTransRef(transRef)
  } else {
    // Fallback: update manually if no transRef (new entry) or not connected
    if (removed === true) {
      setCellValue(rowIndex, TAX_COL_INDEX, '0')
      setCellValue(rowIndex, REF_COL_INDEX, '')
    } else {
      // Compute tax amount from row amount * (rate/100); set both Tax and Tax Amount (reference)
      const amountRaw = getCellValue(rowIndex, AMOUNT_COL_INDEX)
      const amountNum = typeof amountRaw === 'number' ? amountRaw : parseFloat(String(amountRaw))
      const taxAmount = !Number.isNaN(amountNum) && rateNum !== 0
        ? amountNum * (rateNum / 100)
        : rateNum
      const taxValue = rateNum !== 0 ? String(taxAmount) : ''
      setCellValue(rowIndex, TAX_COL_INDEX, taxValue)
      setCellValue(rowIndex, REF_COL_INDEX, taxValue)
    }
  }
  rowMenuOpen.value = null
  expandedTaxType.value = null
  nextTick(() => {
    selectCell(rowIndex, TAX_COL_INDEX)
    cellInputRef.value?.focus()
  })
}

function closeRowMenu(): void {
  rowMenuOpen.value = null
  expandedTaxType.value = null
}

onMounted(() => {
  document.addEventListener('click', closeRowMenu)
  loadTaxList()
  checkDuplicatesInGrid()
})
onUnmounted(() => {
  document.removeEventListener('click', closeRowMenu)
  if (fileMakerCheckTimeout.value) {
    clearTimeout(fileMakerCheckTimeout.value)
  }
})
watch(isConnected, (connected) => {
  if (connected) loadTaxList()
})

// Watch for changes in rows to re-check duplicates
watch(rows, () => {
  checkDuplicatesInGrid()
}, { deep: true })

const gridRef = ref<HTMLDivElement | null>(null)
const cellInputRef = ref<HTMLInputElement | null>(null)
const editingValue = ref('')

function isSelected(rowIndex: number, colIndex: number): boolean {
  return selectedRow.value === rowIndex && selectedCol.value === colIndex
}

const selectedCellStoreValue = computed(() =>
  String(getCellValue(selectedRow.value, selectedCol.value) ?? '')
)

// Sync editing value when selection changes (flush: 'sync' so value is set before template re-renders)
watch(
  [selectedRow, selectedCol],
  () => {
    editingValue.value = selectedCellStoreValue.value
    nextTick(() => {
      cellInputRef.value?.focus()
      if (cellInputRef.value) {
        cellInputRef.value.value = editingValue.value
      }
    })
  },
  { immediate: true, flush: 'sync' }
)

// When underlying data loads (e.g. after refresh), sync selected cell value into the input
watch(selectedCellStoreValue, (val) => {
  if (editingValue.value !== val) {
    editingValue.value = val
    nextTick(() => {
      if (cellInputRef.value) {
        cellInputRef.value.value = val
      }
    })
  }
})

function commitEdit(): void {
  const val = editingValue.value.trim()
  setCellValue(selectedRow.value, selectedCol.value, val)
  // Re-check duplicates after commit
  checkDuplicatesInGrid()
}

function onCellInput(rowIndex: number, colIndex: number, value: string): void {
  editingValue.value = value
  // Check for duplicates in real-time if this is invoice_number column
  if (COLUMN_KEYS[colIndex] === 'invoice_number') {
    checkDuplicatesInGrid()
    // Debounced FileMaker check
    debouncedFileMakerDuplicateCheck(value.trim(), rowIndex)
  }
}

/** Check for duplicate invoice numbers within the grid */
function checkDuplicatesInGrid(): void {
  const duplicates = new Set<number>()
  const seen = new Map<string, number>()
  
  for (let i = 0; i < rows.value.length; i++) {
    // Use editingValue if this is the currently selected cell being edited
    let inv: string | number
    if (i === selectedRow.value && selectedCol.value === INV_COL_INDEX && editingValue.value !== undefined) {
      inv = editingValue.value
    } else {
      inv = getCellValue(i, INV_COL_INDEX)
    }
    
    const invStr = inv != null && String(inv).trim() !== '' ? String(inv).trim() : ''
    if (invStr === '') continue
    
    const key = invStr.toLowerCase()
    if (seen.has(key)) {
      // Mark both rows as duplicates
      duplicates.add(seen.get(key)!)
      duplicates.add(i)
    } else {
      seen.set(key, i)
    }
  }
  
  duplicateInvoiceNumbers.value = duplicates
}

/** Debounced check against FileMaker for duplicate invoice numbers */
function debouncedFileMakerDuplicateCheck(invStr: string, rowIndex: number): void {
  if (fileMakerCheckTimeout.value) {
    clearTimeout(fileMakerCheckTimeout.value)
  }
  
  if (!invStr || !isConnected.value) {
    return
  }
  
  fileMakerCheckTimeout.value = setTimeout(async () => {
    await checkFileMakerDuplicate(invStr, rowIndex)
  }, 500) // 500ms debounce
}

/** Check if invoice number exists in FileMaker */
async function checkFileMakerDuplicate(invStr: string, rowIndex: number): Promise<void> {
  if (!invStr || !isConnected.value) {
    // If empty, remove from duplicates (but keep grid duplicates if any)
    return
  }
  
  // Get the current row's recordId (if it exists) to exclude it from duplicate check
  const currentRow = rows.value[rowIndex]
  const currentRecordId = currentRow?.recordId
  
  // Check cache first (but note: cache doesn't account for current record exclusion)
  // So we'll still need to do the actual check if there's a currentRecordId
  if (fileMakerDuplicateCheckCache.value.has(invStr) && !currentRecordId) {
    const isDuplicate = fileMakerDuplicateCheckCache.value.get(invStr)
    if (isDuplicate) {
      duplicateInvoiceNumbers.value.add(rowIndex)
    } else {
      // Only remove if not a grid duplicate
      const currentInv = getCellValue(rowIndex, INV_COL_INDEX)
      const currentInvStr = currentInv != null && String(currentInv).trim() !== '' ? String(currentInv).trim().toLowerCase() : ''
      // Re-check grid duplicates to see if this is still a duplicate within grid
      checkDuplicatesInGrid()
    }
    return
  }
  
  const invNum = Number(invStr)
  const invForFind = Number.isNaN(invNum) ? invStr : invNum
  
  // Check Payables_Details - use findRecordsByQueryWithIds to get recordIds and exclude current record
  const { data: detailsDataWithIds } = await findRecordsByQueryWithIds<Record<string, unknown>>(
    LAYOUTS.PAYABLES_DETAILS,
    { InvoiceNumber: invForFind },
    100
  )
  
  // Filter out the current record being edited (if it exists)
  const otherDetailsWithSameInvoice = currentRecordId
    ? detailsDataWithIds.filter((r) => r.recordId !== currentRecordId)
    : detailsDataWithIds
  
  const existsInFileMaker = otherDetailsWithSameInvoice.length > 0
  
  // Only cache if there's no currentRecordId (to avoid caching incorrect results)
  if (!currentRecordId) {
    fileMakerDuplicateCheckCache.value.set(invStr, existsInFileMaker)
  }
  
  if (existsInFileMaker) {
    duplicateInvoiceNumbers.value.add(rowIndex)
  } else {
    // Re-check grid duplicates - this might still be a duplicate within the grid
    checkDuplicatesInGrid()
  }
}

function commitAndMove(
  direction: 'enter' | 'tab' | 'enterReverse' | 'left' | 'right'
): void {
  const val = editingValue.value.trim()
  setCellValue(selectedRow.value, selectedCol.value, val)
  moveSelection(direction)
  if (direction === 'enter') ensureRowForEnter()
  nextTick(() => cellInputRef.value?.focus())
}

function cancelEdit(): void {
  editingValue.value = String(getCellValue(selectedRow.value, selectedCol.value) ?? '')
  cellInputRef.value?.blur()
}


const REQUIRED_COLUMN_KEYS: ColumnKey[] = ['invoice_number', 'amount', 'total']

function childHeaderLabel(key: ColumnKey): string {
  // Custom label for amount
  if (key === 'amount') {
    return REQUIRED_COLUMN_KEYS.includes(key) ? 'Amount before VAT *' : 'Amount before VAT'
  }
  // Custom label for reference (maps to Tax Amount in FileMaker)
  if (key === 'reference') {
    return 'Tax Amount'
  }
  const label = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return REQUIRED_COLUMN_KEYS.includes(key) ? `${label} *` : label
}

function isStatusCol(key: ColumnKey): boolean {
  return key === 'status'
}

function isTaxCol(key: ColumnKey): boolean {
  return key === 'tax'
}

/** True when this row has a non-zero tax value (so we show the breakdown button). */
function hasTaxValue(rowIndex: number): boolean {
  const raw = getCellValue(rowIndex, TAX_COL_INDEX)
  if (raw === undefined || raw === null || raw === '') return false
  const n = Number(raw)
  return !Number.isNaN(n) && n > 0
}

function isTotalCol(key: ColumnKey): boolean {
  return key === 'total'
}

function isTaxAmountCol(key: ColumnKey): boolean {
  return key === 'reference'
}

const NUMERIC_COL_KEYS: ColumnKey[] = ['amount', 'tax', 'reference', 'total']

function displayValue(rowIndex: number, colIndex: number): string | number {
  const raw = getCellValue(rowIndex, colIndex)
  if (raw === undefined || raw === null || raw === '') return ''
  if (isFormula(raw)) {
    const evaluated = evaluateCellFormula(String(raw))
    return typeof evaluated === 'number' ? formatNumberDisplay(evaluated) : String(evaluated)
  }
  const key = COLUMN_KEYS[colIndex]
  if (NUMERIC_COL_KEYS.includes(key)) {
    const formatted = formatNumberDisplay(raw)
    return formatted !== '' ? formatted : raw
  }
  return raw
}

const COL_MIN_WIDTHS: Partial<Record<ColumnKey, string>> = {
  invoice_number: '12ch',
  amount: '12ch',
  tax: '10ch',
  reference: '12ch',
  total: '12ch',
}

function colMinWidthStyle(key: ColumnKey) {
  const min = COL_MIN_WIDTHS[key] ?? '10ch'
  return { minWidth: min }
}

const tableStyle = computed(() => ({
  tableLayout: 'auto' as const,
  minWidth: '100%',
}))

function cellClass(rowIndex: number, colIndex: number): Record<string, boolean> {
  const selected = selectedRow.value === rowIndex && selectedCol.value === colIndex
  const isInvoiceCol = COLUMN_KEYS[colIndex] === 'invoice_number'
  const isDuplicate = isInvoiceCol && duplicateInvoiceNumbers.value.has(rowIndex)
  return {
    'bg-[var(--color-accent-soft)] ring-2 ring-[var(--color-accent)] ring-inset': selected,
    'bg-[var(--color-bg-card)]': !selected,
    'cell-duplicate': isDuplicate,
  }
}

function onCellClick(rowIndex: number, colIndex: number): void {
  editingValue.value = String(getCellValue(rowIndex, colIndex) ?? '')
  selectCell(rowIndex, colIndex)
  if (!isStatusCol(COLUMN_KEYS[colIndex]) && !isTaxCol(COLUMN_KEYS[colIndex]) && !isTotalCol(COLUMN_KEYS[colIndex]) && !isTaxAmountCol(COLUMN_KEYS[colIndex])) {
    nextTick(() => cellInputRef.value?.focus())
  }
}

const contextMenu = ref<{ visible: boolean; x: number; y: number }>({ visible: false, x: 0, y: 0 })

function onContextMenu(e: MouseEvent): void {
  if (payableStore.mainPosted) return
  contextMenu.value = { visible: true, x: e.clientX, y: e.clientY }
}

function closeContextMenu(e?: MouseEvent) {
  contextMenu.value = { ...contextMenu.value, visible: false }
  if (taxBreakdownRow.value !== null && e?.target) {
    const target = e.target as HTMLElement
    if (!target.closest?.('.cell-tax-breakdown-popover') && !target.closest?.('.cell-tax-breakdown-trigger')) {
      closeTaxBreakdown()
    }
  }
}

function handleCopy() {
  copy()
  closeContextMenu()
}
function handlePaste() {
  paste()
  closeContextMenu()
}
function handleCut() {
  cut()
  closeContextMenu()
}
function handleClear() {
  clearCell()
  closeContextMenu()
}

function onKeydown(e: KeyboardEvent): void {
  if (contextMenu.value.visible) {
    closeContextMenu()
    return
  }
  switch (e.key) {
    case 'ArrowUp':
      e.preventDefault()
      moveSelection('up')
      break
    case 'ArrowDown':
      e.preventDefault()
      moveSelection('down')
      ensureRowForEnter()
      break
    case 'ArrowLeft':
      e.preventDefault()
      moveSelection('left')
      break
    case 'ArrowRight':
      e.preventDefault()
      moveSelection('right')
      break
    case 'Tab':
      e.preventDefault()
      moveSelection(e.shiftKey ? 'tabReverse' : 'tab')
      break
    case 'Enter':
      e.preventDefault()
      moveSelection('enter')
      ensureRowForEnter()
      break
    default:
      break
  }
}

onMounted(() => {
  window.addEventListener('click', closeContextMenu)
  gridRef.value?.focus()
})
onUnmounted(() => {
  window.removeEventListener('click', closeContextMenu)
})
</script>

<style scoped>
.data-grid-scroll:focus {
  outline: none;
}
.data-grid-table {
  width: max-content;
  min-width: 100%;
}
.row-header-th,
.row-header-td {
  width: var(--row-header-width, 52px);
  min-width: var(--row-header-width, 52px);
  max-width: var(--row-header-width, 52px);
}
.cell-input {
  font: inherit;
  font-family: var(--font-mono);
}
.cell-input::placeholder {
  color: var(--color-text-muted);
  opacity: 0.7;
}
.cell-display {
  display: block;
  min-height: 1.5em;
}
.cell-select {
  font: inherit;
  font-family: var(--font-mono);
  cursor: pointer;
}
.cell-tax-wrap {
  width: 100%;
}
.cell-tax-breakdown-popover {
  position: fixed;
  min-width: 14rem;
  max-width: 22rem;
  padding: 0.75rem 1rem;
  font-size: 0.9375rem;
  line-height: 1.45;
  background: rgba(30, 41, 59, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  z-index: 50;
  color: rgba(248, 250, 252, 0.95);
}
.cell-tax-breakdown-title {
  font-weight: 600;
  color: rgba(203, 213, 225, 0.95);
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.cell-tax-breakdown-list {
  margin: 0;
  padding-left: 1.25rem;
  color: rgba(248, 250, 252, 0.95);
  font-size: 0.9375rem;
}
.cell-tax-breakdown-list li {
  margin-bottom: 0.25rem;
}
.cell-tax-breakdown-loading,
.cell-tax-breakdown-empty {
  color: rgba(203, 213, 225, 0.9);
  font-size: 0.9375rem;
}

.entry-total-row {
  background: rgba(15, 23, 42, 0.85);
}
.entry-total-row__label {
  font-size: 0.9375rem;
}
.entry-total-row__left {
  min-width: 0;
  overflow-x: auto;
}
.entry-total-row__value {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: 0.02em;
}
.entry-total-row__words {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  line-height: 1.4;
  word-spacing: 0.03em;
  letter-spacing: 0.01em;
  text-align: left;
  white-space: nowrap;
}
</style>
