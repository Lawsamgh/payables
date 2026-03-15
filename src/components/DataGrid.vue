<template>
  <div
    class="data-grid-wrapper flex flex-col flex-1 min-h-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-sm"
  >
    <div
      ref="gridRef"
      class="data-grid-scroll flex-1 min-h-0 overflow-auto outline-none focus:outline-none focus:ring-0"
      tabindex="0"
      @keydown="onKeydown"
      @contextmenu.prevent="onContextMenu"
    >
      <table
        class="data-grid-table font-mono text-[var(--input-size)]"
        :style="{
          ...tableStyle,
          '--checkbox-col-width': '44px',
          '--row-header-width': ROW_HEADER_WIDTH + 'px',
        }"
      >
        <!-- Child header row -->
        <thead
          class="data-grid-thead-sticky sticky top-0 z-10 bg-[var(--color-bg-dark)] shadow-[0_1px_0_0_var(--color-border)]"
        >
          <tr>
            <th
              class="row-delete-th sticky left-0 top-0 z-20 border-r border-[var(--color-border)] px-2 py-2 bg-[var(--color-bg-dark)]"
            >
              <span class="sr-only">Delete</span>
            </th>
            <th
              class="row-header-th sticky top-0 z-20 border-r border-[var(--color-border)] px-2 py-2 text-[var(--label-size)] font-medium text-[var(--color-text-muted)] bg-[var(--color-bg-dark)]"
            >
              #
            </th>
            <th
              v-for="(key, _colIndex) in COLUMN_KEYS"
              :key="key"
              class="border-r border-[var(--color-border)] px-3 py-2 text-[var(--label-size)] font-medium text-[var(--color-text-muted)] whitespace-nowrap bg-[var(--color-bg-dark)]"
              :class="NUMERIC_COL_KEYS.includes(key) ? 'text-right tabular-nums' : 'text-left'"
              :style="colMinWidthStyle(key)"
            >
              {{ childHeaderLabel(key) }}
            </th>
            <th
              class="data-grid-actions-th sticky right-0 border-l border-[var(--color-border)] px-2 py-2 text-[var(--label-size)] font-medium text-[var(--color-text-muted)] w-14 bg-[var(--color-bg-dark)]"
            >
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
              class="row-delete-td sticky left-0 z-10 border-b border-r border-[var(--color-border)] bg-[var(--color-bg-card)] px-2 py-2"
            >
              <div
                v-if="!readOnly && totalRows > 1"
                class="flex items-center justify-center"
              >
                <button
                  type="button"
                  class="row-delete-btn"
                  aria-label="Delete row"
                  @click.stop="emit('delete-row', realIndex)"
                >
                  <svg class="row-delete-btn__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
            <td
              class="row-header-td sticky z-10 border-b border-r border-[var(--color-border)] bg-[var(--color-bg-card)] px-2 py-2 text-center text-[var(--color-text-muted)] tabular-nums"
              :class="{
                'bg-[var(--color-accent-soft)]': selectedRow === realIndex,
              }"
              @click="selectCell(realIndex, 0)"
            >
              <span class="row-header-number cursor-pointer select-none">{{
                realIndex + 1
              }}</span>
            </td>
            <td
              v-for="(key, colIndex) in COLUMN_KEYS"
              :key="`${realIndex}-${key}`"
              class="border-b border-r border-[var(--color-border)] px-3 py-2 whitespace-nowrap"
              :class="[
                cellClass(realIndex, colIndex),
                NUMERIC_COL_KEYS.includes(key) ? 'text-right tabular-nums' : 'text-left',
              ]"
              :style="colMinWidthStyle(key)"
              @click="onCellClick(realIndex, colIndex)"
            >
              <template v-if="isTaxCol(key)">
                <div class="cell-tax-wrap flex items-center justify-end gap-1 min-w-0">
                  <span class="cell-display flex-1 min-w-0">{{
                    getCombinedTaxRateDisplay(realIndex)
                  }}</span>
                  <button
                    v-if="hasTaxValue(realIndex)"
                    type="button"
                    class="cell-tax-breakdown-trigger shrink-0 p-0.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    aria-label="Show tax breakdown"
                    @click.stop="openTaxBreakdown(realIndex, $event, 'Add')"
                  >
                    <svg
                      class="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </button>
                </div>
                <div
                  v-if="
                    taxBreakdownRow === realIndex && taxBreakdownType === 'Add'
                  "
                  ref="taxBreakdownPopoverRef"
                  class="cell-tax-breakdown-popover"
                  role="tooltip"
                >
                  <div
                    v-if="taxBreakdownLoading"
                    class="cell-tax-breakdown-loading"
                  >
                    Loading…
                  </div>
                  <template v-else>
                    <div class="cell-tax-breakdown-title">Tax breakdown</div>
                    <ul
                      v-if="taxBreakdownList.length"
                      class="cell-tax-breakdown-list"
                    >
                      <li v-for="(item, i) in taxBreakdownList" :key="i">
                        {{ item.TaxName }} —
                        {{ item.Rate != null ? item.Rate + "%" : "" }}
                      </li>
                      <li
                        v-if="taxBreakdownList.length"
                        class="cell-tax-breakdown-sum"
                      >
                        Total rate:
                        {{
                          taxBreakdownList.reduce(
                            (s, r) => s + (r.Rate != null ? Number(r.Rate) : 0),
                            0,
                          )
                        }}%
                      </li>
                    </ul>
                    <div v-else class="cell-tax-breakdown-empty">
                      {{
                        taxBreakdownEmptyReason ||
                        "No taxes recorded for this invoice. Use row menu (⋯) to add tax."
                      }}
                    </div>
                  </template>
                </div>
              </template>
              <template v-else-if="key === 'wht_tax'">
                <div class="cell-tax-wrap flex items-center justify-end gap-1 min-w-0">
                  <span class="cell-display flex-1 min-w-0">{{
                    displayValue(realIndex, colIndex)
                  }}</span>
                  <button
                    v-if="hasWhtTaxValue(realIndex)"
                    type="button"
                    class="cell-tax-breakdown-trigger shrink-0 p-0.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    aria-label="Show WHT tax breakdown"
                    @click.stop="openTaxBreakdown(realIndex, $event, 'Sub')"
                  >
                    <svg
                      class="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </button>
                </div>
                <div
                  v-if="
                    taxBreakdownRow === realIndex && taxBreakdownType === 'Sub'
                  "
                  ref="whtTaxBreakdownPopoverRef"
                  class="cell-tax-breakdown-popover"
                  role="tooltip"
                >
                  <div
                    v-if="taxBreakdownLoading"
                    class="cell-tax-breakdown-loading"
                  >
                    Loading…
                  </div>
                  <template v-else>
                    <div class="cell-tax-breakdown-title">
                      WHT Tax breakdown
                    </div>
                    <ul
                      v-if="taxBreakdownList.length"
                      class="cell-tax-breakdown-list"
                    >
                      <li v-for="(item, i) in taxBreakdownList" :key="i">
                        {{ item.TaxName }} —
                        {{ item.Rate != null ? item.Rate + "%" : "" }}
                      </li>
                      <li
                        v-if="taxBreakdownList.length"
                        class="cell-tax-breakdown-sum"
                      >
                        Total rate:
                        {{
                          taxBreakdownList.reduce(
                            (s, r) => s + (r.Rate != null ? Number(r.Rate) : 0),
                            0,
                          )
                        }}%
                      </li>
                    </ul>
                    <div v-else class="cell-tax-breakdown-empty">
                      {{
                        taxBreakdownEmptyReason ||
                        "No WHT taxes recorded for this invoice. Use row menu (⋯) to add tax."
                      }}
                    </div>
                  </template>
                </div>
              </template>
              <template v-else-if="readOnly">
                <span class="cell-display">{{
                  displayValue(realIndex, colIndex)
                }}</span>
              </template>
              <template v-else-if="isStatusCol(key)">
                <select
                  :value="getCellValue(realIndex, colIndex)"
                  class="cell-select w-full min-w-0 border-0 bg-transparent text-[var(--color-text)] focus:ring-0 focus:outline-none"
                  @click.stop
                  @change="
                    setCellValue(
                      realIndex,
                      colIndex,
                      ($event.target as HTMLSelectElement).value,
                    )
                  "
                >
                  <option v-for="opt in STATUS_OPTIONS" :key="opt" :value="opt">
                    {{ opt }}
                  </option>
                </select>
              </template>
              <template v-else-if="isTotalCol(key)">
                <span class="cell-display">{{
                  displayValue(realIndex, colIndex)
                }}</span>
              </template>
              <template v-else-if="isTaxAmountCol(key)">
                <span class="cell-display">{{
                  displayValue(realIndex, colIndex)
                }}</span>
              </template>
              <template v-else-if="key === 'wht_tax_amount'">
                <span class="cell-display">{{
                  displayValue(realIndex, colIndex)
                }}</span>
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
                    NUMERIC_COL_KEYS.includes(key)
                      ? 'text-right tabular-nums'
                      : 'text-left',
                    key === 'invoice_number' &&
                    duplicateInvoiceNumbers.has(realIndex)
                      ? 'focus:ring-red-500 border-red-500/50'
                      : 'focus:ring-[var(--color-accent)]',
                  ]"
                  @input="
                    onCellInput(
                      realIndex,
                      colIndex,
                      ($event.target as HTMLInputElement).value,
                    )
                  "
                  @blur="commitEdit"
                  @keydown.enter.prevent="commitAndMove('enter')"
                  @keydown.tab.prevent="commitAndMove('tab')"
                  @keydown.escape="cancelEdit"
                  @keydown.down.prevent="commitAndMove('enter')"
                  @keydown.up.prevent="commitAndMove('enterReverse')"
                  @keydown.left.prevent="commitAndMove('left')"
                  @keydown.right.prevent="commitAndMove('right')"
                />
                <span
                  v-else
                  class="cell-display"
                  :class="{
                    'cell-display--duplicate':
                      key === 'invoice_number' &&
                      duplicateInvoiceNumbers.has(realIndex),
                  }"
                  >{{ displayValue(realIndex, colIndex) }}</span
                >
              </template>
            </td>
            <td
              class="data-grid-actions-td sticky right-0 border-b border-l border-[var(--color-border)] px-2 py-2 w-14 align-middle bg-[var(--color-bg-card)]"
              @click.stop
            >
              <div v-if="!readOnly" class="data-grid-row-actions">
                <button
                  type="button"
                  class="data-grid-row-actions__trigger"
                  :class="{
                    'data-grid-row-actions__trigger--open':
                      rowMenuOpen === realIndex,
                  }"
                  :aria-expanded="rowMenuOpen === realIndex"
                  aria-haspopup="true"
                  aria-label="Row options"
                  @click="toggleRowMenu(realIndex, $event)"
                >
                  <svg
                    class="data-grid-row-actions__icon"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 10.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 4.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 16.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z"
                    />
                  </svg>
                </button>
                <Transition name="row-menu">
                  <Teleport to="body">
                    <div
                      v-if="rowMenuOpen === realIndex && rowMenuDropdownStyle"
                      class="data-grid-row-actions__dropdown data-grid-row-actions__dropdown--fixed"
                      role="menu"
                      :style="rowMenuDropdownStyle"
                      @click.stop
                    >
                      <div class="data-grid-row-actions__panel">
                      <div
                        v-if="expandedTaxType"
                        class="data-grid-row-actions__header"
                      >
                        <span class="data-grid-row-actions__header-title"
                          >Tax</span
                        >
                        <span
                          v-if="currentRowTaxDisplay(realIndex)"
                          class="data-grid-row-actions__header-badge"
                          >{{ currentRowTaxDisplay(realIndex) }}</span
                        >
                      </div>
                      <template v-if="expandedTaxType === null">
                        <div
                          v-if="!hasAmountForRow(realIndex)"
                          class="data-grid-row-actions__state"
                        >
                          <span class="data-grid-row-actions__state-text"
                            >Enter amount before VAT to set tax</span
                          >
                        </div>
                        <div
                          v-else-if="taxListLoading"
                          class="data-grid-row-actions__state"
                        >
                          <span class="data-grid-row-actions__state-text"
                            >Loading…</span
                          >
                        </div>
                        <div
                          v-else-if="taxTypesForMenu.length === 0"
                          class="data-grid-row-actions__state"
                        >
                          <span class="data-grid-row-actions__state-text"
                            >No tax types</span
                          >
                        </div>
                        <div v-else>
                          <div class="data-grid-row-actions__group">
                            <div class="data-grid-row-actions__group-label">
                              Set tax
                            </div>
                            <div class="data-grid-row-actions__list">
                              <button
                                v-for="entry in taxTypesForMenu"
                                :key="entry.typeKey"
                                type="button"
                                class="data-grid-row-actions__option"
                                :class="{
                                  'data-grid-row-actions__option--expandable':
                                    entry.items.length > 1,
                                  'data-grid-row-actions__option--selected':
                                    entry.items.length === 1 &&
                                    isTaxSelectedForRow(
                                      realIndex,
                                      entry.items[0].Tax_Name ?? '',
                                      entry.items[0].Tax_Rate,
                                    ),
                                }"
                                role="menuitem"
                                @click="onTaxTypeClick(realIndex, entry)"
                              >
                                <svg
                                  v-if="
                                    entry.items.length === 1 &&
                                    isTaxSelectedForRow(
                                      realIndex,
                                      entry.items[0].Tax_Name ?? '',
                                      entry.items[0].Tax_Rate,
                                    )
                                  "
                                  class="data-grid-row-actions__checkmark"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  aria-hidden="true"
                                >
                                  <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2.5"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                <span
                                  v-else
                                  class="data-grid-row-actions__checkmark-placeholder"
                                ></span>
                                <span
                                  class="data-grid-row-actions__option-label"
                                  >{{ entry.typeLabel }}</span
                                >
                                <span
                                  v-if="entry.items.length === 1"
                                  class="data-grid-row-actions__option-meta"
                                >
                                  {{ formatTaxRate(entry.items[0].Tax_Rate) }}
                                </span>
                                <svg
                                  v-else
                                  class="data-grid-row-actions__chevron"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  aria-hidden="true"
                                >
                                  <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </template>
                      <template v-else>
                        <div
                          v-if="!hasAmountForRow(realIndex)"
                          class="data-grid-row-actions__state"
                        >
                          <span class="data-grid-row-actions__state-text"
                            >Enter amount before VAT to set tax</span
                          >
                        </div>
                        <template v-else>
                          <button
                            type="button"
                            class="data-grid-row-actions__back"
                            @click="expandedTaxType = null"
                          >
                            <svg
                              class="data-grid-row-actions__back-icon"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M15 19l-7-7 7-7"
                              />
                            </svg>
                            <span>{{ expandedTaxType }}</span>
                          </button>
                          <div class="data-grid-row-actions__group">
                            <div class="data-grid-row-actions__list">
                              <button
                                v-for="(item, idx) in expandedTaxTypeItems"
                                :key="idx"
                                type="button"
                                class="data-grid-row-actions__option"
                                :class="{
                                  'data-grid-row-actions__option--selected':
                                    isTaxSelectedForRow(
                                      realIndex,
                                      item.Tax_Name ?? '',
                                      item.Tax_Rate,
                                    ),
                                }"
                                role="menuitem"
                                @click="
                                  applyTaxToRow(
                                    realIndex,
                                    item.Tax_Rate,
                                    item.Tax_Name ?? '',
                                    item.Tax_Type ?? '',
                                  )
                                "
                              >
                                <svg
                                  v-if="
                                    isTaxSelectedForRow(
                                      realIndex,
                                      item.Tax_Name ?? '',
                                      item.Tax_Rate,
                                    )
                                  "
                                  class="data-grid-row-actions__checkmark"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  aria-hidden="true"
                                >
                                  <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2.5"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                <span
                                  v-else
                                  class="data-grid-row-actions__checkmark-placeholder"
                                ></span>
                                <span
                                  class="data-grid-row-actions__option-label"
                                  >{{ item.Tax_Name ?? "—" }}</span
                                >
                                <span
                                  class="data-grid-row-actions__option-meta"
                                >
                                  {{ formatTaxRate(item.Tax_Rate) }}
                                </span>
                              </button>
                            </div>
                          </div>
                        </template>
                      </template>
                    </div>
                    </div>
                  </Teleport>
                </Transition>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <!-- Amount to Pay (from Payables_Main) -->
    <div
      class="entry-total-row amount-to-pay-row flex flex-wrap items-end justify-between gap-6 px-4 py-4 border-t-2 border-[var(--color-accent)]/40 bg-[var(--color-accent-soft)]"
    >
      <div class="entry-total-row__left flex flex-col items-start gap-0.5">
        <span
          class="entry-total-row__label text-[var(--color-accent)] font-semibold"
          >Amount to Pay</span
        >
        <span class="entry-total-row__words">
          {{ entryTotalInWords }}
        </span>
      </div>
      <span
        class="entry-total-row__value text-2xl font-bold text-[var(--color-accent)] tabular-nums tracking-tight"
      >
        {{ vendorStore.vendor.currency }}
        {{ formatEntryTotal(payableStore.amountToPay) }}
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
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from "vue";
import { useSpreadsheet } from "../composables/useSpreadsheet";
import { usePayableStore } from "../stores/payableStore";
import { useVendorStore } from "../stores/vendorStore";
import { useToastStore } from "../stores/toastStore";
import { useFileMaker } from "../composables/useFileMaker";
import { LAYOUTS } from "../utils/filemakerApi";
import { numberToWords } from "../utils/numberToWords";
import { formatNumberDisplay } from "../utils/formatNumber";
import { evaluateSimpleExpression } from "../utils/evaluateExpression";
import type {
  TaxValueFieldData,
  PayableInvoiceFieldData,
} from "../utils/filemakerApi";
import type { FindRecordWithId } from "../composables/useFileMaker";
import { isFormula } from "../composables/useFormulas";
import type { ColumnKey } from "../composables/useSpreadsheet";
import { useUserRole } from "../composables/useUserRole";
import { useDocumentSettingsStore } from "../stores/documentSettingsStore";
import { useSessionPayableInvoiceStore } from "../stores/sessionPayableInvoiceStore";
import ContextMenu from "./ContextMenu.vue";

const emit = defineEmits<{ "delete-row": [rowIndex: number] }>();
function recalculateTaxAmountsForRow(rowIndex: number): void {
  const amountRaw = getCellValue(rowIndex, AMOUNT_COL_INDEX);
  const amountNum =
    typeof amountRaw === "number"
      ? amountRaw
      : parseFloat(String(amountRaw ?? "").replace(/,/g, ""));
  const amount = !Number.isNaN(amountNum) ? amountNum : 0;

  const cached = getEffectiveTaxCacheForRow(rowIndex);
  let addAmount = 0;
  let subAmount = 0;
  let subRate = 0;
  for (const r of cached) {
    const rRate = r.Rate != null ? Number(r.Rate) : 0;
    const amt = (amount * (Number.isNaN(rRate) ? 0 : rRate)) / 100;
    if ((r.Action ?? "Add") === "Sub") {
      subAmount += amt;
      subRate += rRate;
    } else {
      addAmount += amt;
    }
  }
  const hasTax = cached.length > 0;
  setCellValue(rowIndex, TAX_COL_INDEX, hasTax ? String(addAmount) : "");
  setCellValue(rowIndex, REF_COL_INDEX, hasTax ? String(addAmount) : "");
  setCellValue(
    rowIndex,
    WHT_TAX_COL_INDEX,
    subRate > 0 ? String(subRate) : "",
  );
  setCellValue(
    rowIndex,
    WHT_TAX_AMOUNT_COL_INDEX,
    subAmount > 0 ? String(subAmount) : "",
  );
}

const spreadsheet = useSpreadsheet({
  afterSetCell: (row, col, _value) => {
    if (COLUMN_KEYS[col] === "amount") recalculateTaxAmountsForRow(row);
  },
});
const { isManager } = useUserRole();
const documentSettings = useDocumentSettingsStore();
const payableStore = usePayableStore();
const vendorStore = useVendorStore();
const toast = useToastStore();
const sessionPayableInvoice = useSessionPayableInvoiceStore();

function formatEntryTotal(value: number): string {
  return formatNumberDisplay(value) || "0.00";
}

const entryTotalInWords = computed(() =>
  numberToWords(payableStore.amountToPay),
);
const {
  findRecordsWithIds,
  findRecordsByQuery,
  findRecordsByQueryWithIds,
  createRecord,
  deleteRecord,
  isConnected,
} = useFileMaker();
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
} = spreadsheet;

const totalRows = computed(() => rows.value.length);

const displayedRowIndices = computed(() => {
  const total = totalRows.value;
  if (total === 0) return [];
  return Array.from({ length: total }, (_, i) => i);
});

const STATUS_OPTIONS = payableStore.STATUS_OPTIONS;
/** Editable except when Posted (Rejected stay editable for Officer). Manager cannot edit Draft/Rejected unless ManagerEditDraft is enabled. */
const readOnly = computed(
  () =>
    (isManager.value && !documentSettings.managerEditDraftEnabled) ||
    (payableStore.mainPosted && payableStore.mainStatus !== "Rejected"),
);

const TAX_COL_INDEX = COLUMN_KEYS.indexOf("tax");
const REF_COL_INDEX = COLUMN_KEYS.indexOf("reference");
const WHT_TAX_COL_INDEX = COLUMN_KEYS.indexOf("wht_tax");
const WHT_TAX_AMOUNT_COL_INDEX = COLUMN_KEYS.indexOf("wht_tax_amount");
const AMOUNT_COL_INDEX = COLUMN_KEYS.indexOf("amount");
const INV_COL_INDEX = COLUMN_KEYS.indexOf("invoice_number");
const rowMenuOpen = ref<number | null>(null);
const expandedTaxType = ref<string | null>(null);
const rowMenuTriggerRef = ref<HTMLElement | null>(null);
const rowMenuDropdownStyle = ref<{ top: string; right: string } | null>(null);

// Duplicate detection state
const duplicateInvoiceNumbers = ref<Set<number>>(new Set());
const fileMakerDuplicateCheckCache = ref<Map<string, boolean>>(new Map());
const fileMakerCheckTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

const taxList = ref<FindRecordWithId<TaxValueFieldData>[]>([]);
const taxListLoading = ref(false);

const taxBreakdownRow = ref<number | null>(null);
const taxBreakdownType = ref<"Add" | "Sub">("Add");
const taxBreakdownList = ref<
  { TaxName?: string; Rate?: number; Action?: string }[]
>([]);
const taxBreakdownLoading = ref(false);
const taxBreakdownEmptyReason = ref<string | null>(null);
const taxBreakdownPopoverRef = ref<HTMLElement | null>(null);
const whtTaxBreakdownPopoverRef = ref<HTMLElement | null>(null);

/** Cache Payable_Invoice records per row (for showing checkmarks). */
const rowPayableInvoiceCache = ref<Map<number, PayableInvoiceFieldData[]>>(
  new Map(),
);
/** Local tax selection per row when we cannot persist to Payable_Invoice (new entry, no invoice number, or not connected). */
const rowLocalTaxCache = ref<
  Map<number, { TaxName: string; Rate: number; Action?: string }[]>
>(new Map());

async function loadTaxList(): Promise<void> {
  if (!isConnected.value) return;
  taxListLoading.value = true;
  const { data } = await findRecordsWithIds<TaxValueFieldData>(
    LAYOUTS.TAX_VALUE,
    { limit: 500 },
  );
  taxList.value = data;
  taxListLoading.value = false;
}

function closeTaxBreakdown(): void {
  taxBreakdownRow.value = null;
  taxBreakdownType.value = "Add";
  taxBreakdownList.value = [];
  taxBreakdownEmptyReason.value = null;
}

async function openTaxBreakdown(
  rowIndex: number,
  event: MouseEvent,
  type: "Add" | "Sub",
): Promise<void> {
  const inv = getCellValue(rowIndex, INV_COL_INDEX);
  const invStr =
    inv != null && String(inv).trim() !== "" ? String(inv).trim() : "";
  if (taxBreakdownRow.value === rowIndex && taxBreakdownType.value === type) {
    closeTaxBreakdown();
    return;
  }
  taxBreakdownRow.value = rowIndex;
  taxBreakdownType.value = type;
  taxBreakdownList.value = [];
  taxBreakdownEmptyReason.value = null;
  if (!invStr) {
    const cached = getEffectiveTaxCacheForRow(rowIndex).filter(
      (r) => (r.Action ?? "Add") === type,
    );
    if (cached.length > 0) {
      taxBreakdownList.value = cached.map((r) => ({
        TaxName: r.TaxName,
        Rate: r.Rate,
        Action: r.Action,
      }));
    } else {
      taxBreakdownEmptyReason.value =
        "Enter invoice number first, then add tax via row menu (⋯).";
    }
    taxBreakdownLoading.value = false;
    nextTick(() => positionTaxBreakdownPopover(event));
    return;
  }
  taxBreakdownLoading.value = true;
  const { data, error } = await findRecordsByQuery<PayableInvoiceFieldData>(
    LAYOUTS.PAYABLE_INVOICE,
    { invoiceNumber: invStr },
    100,
  );
  taxBreakdownLoading.value = false;
  if (error) {
    taxBreakdownList.value = [{ TaxName: `Error: ${error}`, Rate: undefined }];
  } else {
    const withAction = data.map((r) => {
      const rate = r.Rate ?? 0;
      const name = r.TaxName ?? "—";
      const action = getActionForTax(name, rate, r.Tax_Type);
      return { TaxName: name, Rate: r.Rate, Action: action };
    });
    taxBreakdownList.value = withAction.filter(
      (r) => (r.Action ?? "Add") === type,
    );
  }
  nextTick(() => positionTaxBreakdownPopover(event));
}

function positionTaxBreakdownPopover(event: MouseEvent): void {
  const popover =
    taxBreakdownType.value === "Add"
      ? taxBreakdownPopoverRef.value
      : whtTaxBreakdownPopoverRef.value;
  const btn = (event.target as HTMLElement)?.closest(
    ".cell-tax-breakdown-trigger",
  );
  if (popover && btn) {
    const rect = btn.getBoundingClientRect();
    popover.style.position = "fixed";
    popover.style.left = `${rect.left}px`;
    popover.style.top = `${rect.bottom + 4}px`;
    popover.style.zIndex = "50";
  }
}

/** Parse date string (MM/dd/yyyy or yyyy-MM-dd) to Date; return null if invalid. */
function parseTaxDate(s: string | undefined): Date | null {
  const raw = (s ?? "").trim();
  if (!raw) return null;
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (iso) {
    const d = new Date(
      parseInt(iso[1], 10),
      parseInt(iso[2], 10) - 1,
      parseInt(iso[3], 10),
    );
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(raw);
  if (us) {
    const d = new Date(
      parseInt(us[3], 10),
      parseInt(us[1], 10) - 1,
      parseInt(us[2], 10),
    );
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const fallback = new Date(raw);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

/** True if tax is currently valid: today is between Start_Date and End_Date (inclusive). Missing date = no bound. */
function isTaxRecordCurrentlyValid(
  record: FindRecordWithId<TaxValueFieldData>,
  today: Date,
): boolean {
  const { fieldData } = record;
  const start = parseTaxDate(fieldData.Start_Date);
  const end = parseTaxDate(fieldData.End_Date);
  if (start !== null && start > today) return false;
  if (end !== null && end < today) return false;
  return true;
}

/** Tax list filtered to only records with valid Start/End date (currently in effect). */
const validTaxList = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return taxList.value.filter((r) => isTaxRecordCurrentlyValid(r, today));
});

/** Group tax records by Tax_Type for the menu. Only includes records with valid dates. */
interface TaxTypeMenuEntry {
  typeKey: string;
  typeLabel: string;
  items: TaxValueFieldData[];
}
const taxTypesForMenu = computed<TaxTypeMenuEntry[]>(() => {
  const list = validTaxList.value;
  const byType = new Map<string, TaxValueFieldData[]>();
  for (const { fieldData } of list) {
    const typeLabel = (fieldData.Tax_Type ?? "").trim() || "—";
    if (!byType.has(typeLabel)) byType.set(typeLabel, []);
    byType.get(typeLabel)!.push(fieldData);
  }
  return Array.from(byType.entries()).map(([typeLabel, items]) => ({
    typeKey: typeLabel,
    typeLabel,
    items,
  }));
});

const expandedTaxTypeItems = computed(() => {
  const type = expandedTaxType.value;
  if (!type) return [];
  const entry = taxTypesForMenu.value.find((e) => e.typeLabel === type);
  return entry?.items ?? [];
});

function formatTaxRate(rate: number | string | undefined): string {
  if (rate == null || rate === "") return "—";
  const n = Number(rate);
  if (Number.isNaN(n)) return "—";
  return `${n}%`;
}

/** Display string for current row tax rate (e.g. "10%" or "" if empty). Used in row menu header/badge. */
function currentRowTaxDisplay(rowIndex: number): string {
  return getCombinedTaxRateDisplay(rowIndex);
}

/** True if this rate matches the row’s current tax value (so we can show “Current”). */
function _isCurrentTaxForRow(
  rowIndex: number,
  rate: number | string | undefined,
): boolean {
  const combined = getCombinedTaxRateForRow(rowIndex);
  const rateNum = rate != null && rate !== "" ? Number(rate) : NaN;
  if (Number.isNaN(rateNum)) return false;
  return combined === rateNum;
}

async function loadRowPayableInvoiceCache(rowIndex: number): Promise<void> {
  if (!isConnected.value) return;
  const inv = getCellValue(rowIndex, INV_COL_INDEX);
  const invStr =
    inv != null && String(inv).trim() !== "" ? String(inv).trim() : "";
  if (invStr === "") {
    rowPayableInvoiceCache.value.set(rowIndex, []);
    return;
  }
  const { data } = await findRecordsByQueryWithIds<PayableInvoiceFieldData>(
    LAYOUTS.PAYABLE_INVOICE,
    { invoiceNumber: invStr },
    100,
  );
  rowPayableInvoiceCache.value.set(
    rowIndex,
    data.map((r) => r.fieldData),
  );
}

function toggleRowMenu(rowIndex: number, event?: Event): void {
  if (rowMenuOpen.value === rowIndex) {
    rowMenuOpen.value = null;
    expandedTaxType.value = null;
    rowMenuTriggerRef.value = null;
    rowMenuDropdownStyle.value = null;
  } else {
    const trigger = event?.currentTarget as HTMLElement | undefined;
    rowMenuTriggerRef.value = trigger ?? null;
    rowMenuOpen.value = rowIndex;
    expandedTaxType.value = null;
    loadRowPayableInvoiceCache(rowIndex);
    nextTick(() => updateRowMenuDropdownPosition());
  }
}

function updateRowMenuDropdownPosition(): void {
  const trigger = rowMenuTriggerRef.value;
  if (!trigger) return;
  const rect = trigger.getBoundingClientRect();
  rowMenuDropdownStyle.value = {
    top: `${rect.bottom + 4}px`,
    right: `${window.innerWidth - rect.right}px`,
  };
}

/** Resolve Action for a tax from Tax_Value by matching TaxName and Rate. */
function getActionForTax(
  taxName: string,
  rate: number,
  taxType?: string,
): "Add" | "Sub" | undefined {
  const nameMatch = String(taxName ?? "").trim();
  for (const { fieldData } of taxList.value) {
    const fd = fieldData;
    const matchName = String(fd.Tax_Name ?? "").trim() === nameMatch;
    const matchRate = Number(fd.Tax_Rate) === rate;
    const matchType =
      !taxType || String(fd.Tax_Type ?? "").trim() === String(taxType).trim();
    if (matchName && matchRate && matchType) {
      const action = (fd.Action ?? "").trim();
      return action === "Sub" ? "Sub" : "Add";
    }
  }
  return "Add"; // default when not found
}

/** Get effective tax cache for a row: FM cache + local cache. Each item includes Action (Add/Sub) for filtering. */
function getEffectiveTaxCacheForRow(
  rowIndex: number,
): { TaxName?: string; Rate?: number; Action?: "Add" | "Sub" }[] {
  void taxCacheVersion.value; // ensure re-eval when cache shifts after row delete
  const fmCache = rowPayableInvoiceCache.value.get(rowIndex) ?? [];
  const localCache = rowLocalTaxCache.value.get(rowIndex) ?? [];
  const fromFm = fmCache.map((r) => {
    const rate = r.Rate ?? 0;
    const name = r.TaxName ?? "";
    const action = getActionForTax(name, rate, r.Tax_Type);
    return {
      TaxName: name,
      Rate: rate,
      Action: action,
    };
  });
  const fromLocal = localCache.map((r) => ({
    TaxName: r.TaxName,
    Rate: r.Rate,
    Action: (r.Action?.trim() === "Sub" ? "Sub" : "Add") as "Add" | "Sub",
  }));
  return [...fromFm, ...fromLocal];
}

/** Normalize rate: FileMaker may return as percentage (1, 12.5) or decimal (0.01, 0.125). Return percentage. */
function normalizeRate(value: number): number {
  if (Number.isNaN(value)) return 0;
  if (value > 0 && value < 1) return value * 100;
  return value;
}

/** Combined rate (sum of tax rates with Action "Add" only) for a row. Falls back to derived rate from tax/amount when cache empty. */
function getCombinedTaxRateForRow(rowIndex: number): number {
  const cached = getEffectiveTaxCacheForRow(rowIndex);
  if (cached.length > 0) {
    const raw = cached
      .filter((r) => (r.Action ?? "Add") === "Add")
      .reduce((sum, r) => {
        const rRate = r.Rate != null ? Number(r.Rate) : 0;
        return sum + (Number.isNaN(rRate) ? 0 : normalizeRate(rRate));
      }, 0);
    return Math.round(raw * 100) / 100;
  }
  // Fallback: derive rate from Tax Amount (reference) and amount. Prefer reference
  // since FileMaker's Tax field may return rate (12.5) in some layouts, causing
  // wrong display (0.21% when tax=12.5, amount=6000).
  const refRaw = getCellValue(rowIndex, REF_COL_INDEX);
  const taxRaw = getCellValue(rowIndex, TAX_COL_INDEX);
  const amountRaw = getCellValue(rowIndex, AMOUNT_COL_INDEX);
  const amountNum =
    typeof amountRaw === "number"
      ? amountRaw
      : parseFloat(String(amountRaw ?? "").replace(/,/g, ""));
  if (Number.isNaN(amountNum) || amountNum <= 0) return 0;
  // Use reference (Tax Amount) first - it's always the amount
  const taxAmountRaw = refRaw ?? taxRaw;
  const taxAmountNum =
    typeof taxAmountRaw === "number"
      ? taxAmountRaw
      : parseFloat(String(taxAmountRaw ?? "").replace(/,/g, ""));
  if (!Number.isNaN(taxAmountNum) && taxAmountNum > 0) {
    const ratio = taxAmountNum / amountNum;
    if (ratio >= 0.01 && ratio <= 1) {
      return Math.round(ratio * 10000) / 100;
    }
    if (taxAmountNum > 0 && taxAmountNum <= 100 && ratio < 0.01) {
      return Math.round(taxAmountNum * 100) / 100;
    }
  }
  return 0;
}

/** Display string for combined Add rate (e.g. "15%" or "12.5%"). Rounded to avoid percentage decimals. */
function getCombinedTaxRateDisplay(rowIndex: number): string {
  const rate = getCombinedTaxRateForRow(rowIndex);
  if (rate === 0) return "";
  return `${Math.round(rate * 100) / 100}%`;
}

/** Combined rate (sum of tax rates with Action "Sub" only) for a row. */
function getCombinedWhtTaxRateForRow(rowIndex: number): number {
  const cached = getEffectiveTaxCacheForRow(rowIndex);
  const raw = cached
    .filter((r) => r.Action === "Sub")
    .reduce((sum, r) => {
      const rRate = r.Rate != null ? Number(r.Rate) : 0;
      return sum + (Number.isNaN(rRate) ? 0 : normalizeRate(rRate));
    }, 0);
  return Math.round(raw * 100) / 100;
}

/** Display string for combined WHT (Sub) rate (e.g. "10%" or "7.5%"). Rounded to avoid percentage decimals. */
function _getCombinedWhtTaxRateDisplay(rowIndex: number): string {
  const rate = getCombinedWhtTaxRateForRow(rowIndex);
  if (rate === 0) return "";
  return `${Math.round(rate * 100) / 100}%`;
}

/** True if this tax (TaxName + Rate) is already selected for this row (FM or local cache). */
function isTaxSelectedForRow(
  rowIndex: number,
  taxName: string,
  rate: number | string | undefined,
): boolean {
  const cache = getEffectiveTaxCacheForRow(rowIndex);
  if (cache.length === 0) return false;
  const rateNum = rate != null && rate !== "" ? Number(rate) : 0;
  const nameMatch = String(taxName ?? "").trim();
  return cache.some(
    (r) =>
      String(r.TaxName ?? "").trim() === nameMatch &&
      Number(r.Rate) === (Number.isNaN(rateNum) ? 0 : rateNum),
  );
}

function onTaxTypeClick(rowIndex: number, entry: TaxTypeMenuEntry): void {
  if (entry.items.length === 1) {
    const item = entry.items[0];
    const rate = item.Tax_Rate;
    const taxName = item.Tax_Name ?? "";
    const taxType = item.Tax_Type ?? "";
    applyTaxToRow(rowIndex, rate, taxName, taxType);
  } else {
    expandedTaxType.value = entry.typeLabel;
  }
}

/**
 * Toggle tax in Payable_Invoice: if a record exists for this invoice + TaxName + Rate, delete it and return true (removed).
 * Otherwise create the record and return false (added). If no invoice number or not connected, returns null (no change in FM).
 */
async function toggleTaxInPayableInvoice(
  rowIndex: number,
  taxName: string,
  rate: number | string | undefined,
  taxType?: string,
): Promise<boolean | null> {
  if (!isConnected.value || !taxName.trim()) return null;
  const inv = getCellValue(rowIndex, INV_COL_INDEX);
  const invStr =
    inv != null && String(inv).trim() !== "" ? String(inv).trim() : "";
  if (invStr === "") return null;
  const rateNum = rate != null && rate !== "" ? Number(rate) : 0;
  const { data: existing } =
    await findRecordsByQueryWithIds<PayableInvoiceFieldData>(
      LAYOUTS.PAYABLE_INVOICE,
      { invoiceNumber: invStr },
      100,
    );
  const match = existing.find(
    (r) =>
      String(r.fieldData?.TaxName ?? "").trim() === taxName.trim() &&
      Number(r.fieldData?.Rate) === (Number.isNaN(rateNum) ? 0 : rateNum),
  );
  if (match?.recordId) {
    await deleteRecord(LAYOUTS.PAYABLE_INVOICE, match.recordId);
    // Update cache: remove this tax
    const cache = rowPayableInvoiceCache.value.get(rowIndex) ?? [];
    rowPayableInvoiceCache.value.set(
      rowIndex,
      cache.filter(
        (r) =>
          !(
            String(r.TaxName ?? "").trim() === taxName.trim() &&
            Number(r.Rate) === (Number.isNaN(rateNum) ? 0 : rateNum)
          ),
      ),
    );
    return true;
  }
  const fieldData: PayableInvoiceFieldData = {
    invoiceNumber: invStr,
    Tax_Type: taxType?.trim() || undefined,
    TaxName: taxName.trim(),
    Rate: Number.isNaN(rateNum) ? 0 : rateNum,
  };
  const { id } = await createRecord(LAYOUTS.PAYABLE_INVOICE, fieldData);
  if (id) sessionPayableInvoice.addCreatedId(id);
  // Update cache: add this tax
  const cache = rowPayableInvoiceCache.value.get(rowIndex) ?? [];
  rowPayableInvoiceCache.value.set(rowIndex, [...cache, fieldData]);
  return false;
}

async function applyTaxToRow(
  rowIndex: number,
  rate: number | string | undefined,
  taxName?: string,
  taxType?: string,
): Promise<void> {
  const _rateNum = rate != null && rate !== "" ? Number(rate) : 0;
  const transRef = payableStore.currentTransRef;

  // If there are unsaved changes and we have a saved entry, save first so refetch doesn't overwrite edits
  if (transRef && isConnected.value && payableStore.isDirty) {
    const result = await payableStore.syncToFileMaker({ markPosted: false });
    if (result.error) {
      toast.error(
        "Save failed: " +
          result.error +
          ". Save your changes before selecting a tax.",
      );
      rowMenuOpen.value = null;
      expandedTaxType.value = null;
      return;
    }
  }

  if (taxName && isConnected.value) {
    const inv = getCellValue(rowIndex, INV_COL_INDEX);
    const invStr =
      inv != null && String(inv).trim() !== "" ? String(inv).trim() : "";
    const persisted = await toggleTaxInPayableInvoice(
      rowIndex,
      taxName,
      rate,
      taxType,
    );
    if (persisted === null && invStr === "") {
      // Could not persist (no invoice number): toggle in local cache
      const rateNum = Number(rate);
      const nameMatch = String(taxName).trim();
      const action = getActionForTax(
        nameMatch,
        Number.isNaN(rateNum) ? 0 : rateNum,
        taxType,
      );
      const local = rowLocalTaxCache.value.get(rowIndex) ?? [];
      const idx = local.findIndex(
        (r) =>
          r.TaxName.trim() === nameMatch &&
          r.Rate === (Number.isNaN(rateNum) ? 0 : rateNum),
      );
      if (idx >= 0) {
        const next = local.filter((_, i) => i !== idx);
        if (next.length) rowLocalTaxCache.value.set(rowIndex, next);
        else rowLocalTaxCache.value.delete(rowIndex);
      } else {
        rowLocalTaxCache.value.set(rowIndex, [
          ...local,
          {
            TaxName: nameMatch,
            Rate: Number.isNaN(rateNum) ? 0 : rateNum,
            Action: action,
          },
        ]);
      }
    }
  } else if (taxName && rate != null && rate !== "") {
    // Not connected: toggle in local cache
    const rateNum = Number(rate);
    const nameMatch = String(taxName).trim();
    const action = getActionForTax(
      nameMatch,
      Number.isNaN(rateNum) ? 0 : rateNum,
      taxType,
    );
    const local = rowLocalTaxCache.value.get(rowIndex) ?? [];
    const idx = local.findIndex(
      (r) =>
        r.TaxName.trim() === nameMatch &&
        r.Rate === (Number.isNaN(rateNum) ? 0 : rateNum),
    );
    if (idx >= 0) {
      const next = local.filter((_, i) => i !== idx);
      if (next.length) rowLocalTaxCache.value.set(rowIndex, next);
      else rowLocalTaxCache.value.delete(rowIndex);
    } else {
      rowLocalTaxCache.value.set(rowIndex, [
        ...local,
        {
          TaxName: nameMatch,
          Rate: Number.isNaN(rateNum) ? 0 : rateNum,
          Action: action,
        },
      ]);
    }
  }

  // Refetch data from FileMaker to get updated calculated Tax value (whether added or removed)
  if (transRef && taxName && isConnected.value) {
    await payableStore.fetchDetailsByTransRef(transRef);
  } else {
    // Fallback: update manually if no transRef (new entry), not connected, or using local cache
    const amountRaw = getCellValue(rowIndex, AMOUNT_COL_INDEX);
    const amountNum =
      typeof amountRaw === "number"
        ? amountRaw
        : parseFloat(String(amountRaw ?? ""));
    const amount = !Number.isNaN(amountNum) ? amountNum : 0;

    const cached = getEffectiveTaxCacheForRow(rowIndex);
    let addAmount = 0;
    let subAmount = 0;
    let subRate = 0;
    for (const r of cached) {
      const rRate = r.Rate != null ? Number(r.Rate) : 0;
      const amt = (amount * (Number.isNaN(rRate) ? 0 : rRate)) / 100;
      if ((r.Action ?? "Add") === "Sub") {
        subAmount += amt;
        subRate += rRate;
      } else {
        addAmount += amt;
      }
    }
    const hasTax = cached.length > 0;
    setCellValue(rowIndex, TAX_COL_INDEX, hasTax ? String(addAmount) : "");
    setCellValue(rowIndex, REF_COL_INDEX, hasTax ? String(addAmount) : "");
    setCellValue(
      rowIndex,
      WHT_TAX_COL_INDEX,
      subRate > 0 ? String(subRate) : "",
    );
    setCellValue(
      rowIndex,
      WHT_TAX_AMOUNT_COL_INDEX,
      subAmount > 0 ? String(subAmount) : "",
    );
  }
  rowMenuOpen.value = null;
  expandedTaxType.value = null;
  nextTick(() => {
    selectCell(rowIndex, TAX_COL_INDEX);
    cellInputRef.value?.focus();
  });
}

function closeRowMenu(): void {
  rowMenuOpen.value = null;
  expandedTaxType.value = null;
  rowMenuTriggerRef.value = null;
  rowMenuDropdownStyle.value = null;
}

watch(
  () => payableStore.currentTransRef,
  (transRef, prevRef) => {
    if (transRef !== prevRef) {
      rowLocalTaxCache.value.clear();
      rowPayableInvoiceCache.value.clear();
    }
  },
  { immediate: true },
);

/** Cache version bumped after row delete/undo to force template re-evaluation of tax display. */
const taxCacheVersion = ref(0);

/** Saved tax cache for the last deleted row, restored on Undo. */
const lastDeletedPayableInvoiceCache = ref<PayableInvoiceFieldData[]>([]);
const lastDeletedLocalTaxCache = ref<
  { TaxName: string; Rate: number; Action?: string }[]
>([]);

/** When a row is deleted, save its tax cache, then shift remaining entries. Run synchronously so cache is correct before any render. */
watch(
  () => payableStore.lastDeletedRowIndex,
  (deletedIndex) => {
    if (deletedIndex == null || deletedIndex < 0) return;
    lastDeletedPayableInvoiceCache.value =
      rowPayableInvoiceCache.value.get(deletedIndex) ?? [];
    lastDeletedLocalTaxCache.value =
      rowLocalTaxCache.value.get(deletedIndex) ?? [];
    const shiftMap = <V>(m: Map<number, V>): Map<number, V> => {
      const next = new Map<number, V>();
      for (const [k, v] of m) {
        if (k < deletedIndex) next.set(k, v);
        else if (k > deletedIndex) next.set(k - 1, v);
      }
      return next;
    };
    rowPayableInvoiceCache.value = shiftMap(rowPayableInvoiceCache.value);
    rowLocalTaxCache.value = shiftMap(rowLocalTaxCache.value);
    taxCacheVersion.value++;
    if (taxBreakdownRow.value === deletedIndex) {
      closeTaxBreakdown();
    } else if (taxBreakdownRow.value != null && taxBreakdownRow.value > deletedIndex) {
      taxBreakdownRow.value = taxBreakdownRow.value - 1;
    }
    if (rowMenuOpen.value === deletedIndex) {
      rowMenuOpen.value = null;
    } else if (rowMenuOpen.value != null && rowMenuOpen.value > deletedIndex) {
      rowMenuOpen.value = rowMenuOpen.value - 1;
    }
    payableStore.clearLastDeletedRowIndex();
    nextTick().then(async () => {
      if (isConnected.value) {
        const list = rows.value;
        for (let i = 0; i < list.length; i++) {
          const inv =
            list[i]?.invoice_number != null
              ? String(list[i]?.invoice_number ?? "").trim()
              : "";
          if (inv) await loadRowPayableInvoiceCache(i);
        }
        taxCacheVersion.value++;
      }
    });
  },
  { flush: "sync" },
);

/** When Undo Delete restores a row, unshift caches, restore the saved tax data, and re-create Payable_Invoice records in FileMaker for new unsaved entries. */
watch(
  () => payableStore.lastUndoneRowIndex,
  (restoredIndex) => {
    if (restoredIndex == null || restoredIndex < 0) return;
    const savedPayable = lastDeletedPayableInvoiceCache.value;
    const savedLocal = lastDeletedLocalTaxCache.value;
    const unshiftAndRestore = <T>(
      m: Map<number, T>,
      saved: T,
    ): Map<number, T> => {
      const next = new Map<number, T>();
      for (const [k, v] of m) {
        if (k < restoredIndex) next.set(k, v);
        else next.set(k + 1, v);
      }
      next.set(restoredIndex, saved);
      return next;
    };
    rowPayableInvoiceCache.value = unshiftAndRestore(
      rowPayableInvoiceCache.value,
      savedPayable,
    );
    rowLocalTaxCache.value = unshiftAndRestore(
      rowLocalTaxCache.value,
      savedLocal,
    );
    taxCacheVersion.value++;
    if (
      taxBreakdownRow.value != null &&
      taxBreakdownRow.value >= restoredIndex
    ) {
      taxBreakdownRow.value = taxBreakdownRow.value + 1;
    }
    if (rowMenuOpen.value != null && rowMenuOpen.value >= restoredIndex) {
      rowMenuOpen.value = rowMenuOpen.value + 1;
    }
    payableStore.clearLastUndoneRowIndex();
    if (isConnected.value && savedPayable.length > 0) {
      nextTick().then(async () => {
        for (const fd of savedPayable) {
          const inv = (fd.invoiceNumber ?? "").trim();
          if (!inv) continue;
          const fieldData: PayableInvoiceFieldData = {
            invoiceNumber: inv,
            Tax_Type: fd.Tax_Type,
            TaxName: fd.TaxName ?? "",
            Rate: fd.Rate ?? 0,
          };
          const { id } = await createRecord(
            LAYOUTS.PAYABLE_INVOICE,
            fieldData,
          );
          if (id) sessionPayableInvoice.addCreatedId(id);
        }
      });
    }
  },
  { flush: "sync" },
);

/** Populate Payable Invoice cache when entry loads so Tax Rate and breakdown use correct data. */
async function loadPayableInvoiceCacheForAllRows(): Promise<void> {
  if (!isConnected.value || !payableStore.currentTransRef) return;
  const list = rows.value;
  for (let i = 0; i < list.length; i++) {
    const inv =
      list[i]?.invoice_number != null
        ? String(list[i]?.invoice_number).trim()
        : "";
    if (inv) await loadRowPayableInvoiceCache(i);
  }
}

watch(
  () => [
    payableStore.loading,
    rows.value.length,
    payableStore.currentTransRef,
    isConnected.value,
  ],
  async ([loading]) => {
    if (!loading && payableStore.currentTransRef && isConnected.value) {
      await nextTick();
      loadPayableInvoiceCacheForAllRows();
    }
  },
  { immediate: true },
);

onMounted(() => {
  document.addEventListener("click", closeRowMenu);
  loadTaxList();
  checkDuplicatesInGrid();
});
onUnmounted(() => {
  document.removeEventListener("click", closeRowMenu);
  if (fileMakerCheckTimeout.value) {
    clearTimeout(fileMakerCheckTimeout.value);
  }
});
watch(isConnected, (connected) => {
  if (connected) loadTaxList();
});

// Watch for changes in rows to re-check duplicates
watch(
  rows,
  () => {
    checkDuplicatesInGrid();
  },
  { deep: true },
);

const gridRef = ref<HTMLDivElement | null>(null);
const cellInputRef = ref<HTMLInputElement | null>(null);
const editingValue = ref("");

function isSelected(rowIndex: number, colIndex: number): boolean {
  return selectedRow.value === rowIndex && selectedCol.value === colIndex;
}

const selectedCellStoreValue = computed(() =>
  String(getCellValue(selectedRow.value, selectedCol.value) ?? ""),
);

// Sync editing value when selection changes (flush: 'sync' so value is set before template re-renders)
watch(
  [selectedRow, selectedCol],
  () => {
    editingValue.value = selectedCellStoreValue.value;
    nextTick(() => {
      cellInputRef.value?.focus();
      if (cellInputRef.value) {
        cellInputRef.value.value = editingValue.value;
      }
    });
  },
  { immediate: true, flush: "sync" },
);

// When underlying data loads (e.g. after refresh), sync selected cell value into the input
watch(selectedCellStoreValue, (val) => {
  if (editingValue.value !== val) {
    editingValue.value = val;
    nextTick(() => {
      if (cellInputRef.value) {
        cellInputRef.value.value = val;
      }
    });
  }
});

function sanitizeNumericInput(raw: string): string {
  let value = raw.replace(/[^\d.,-]/g, "");
  if (value.includes("-")) {
    value = value.replace(/-/g, "");
    value = "-" + value;
  }
  const parts = value.split(".");
  if (parts.length > 2) {
    value = parts[0] + "." + parts.slice(1).join("");
  }
  return value;
}

function commitEdit(): void {
  let val = editingValue.value.trim();
  const colKey = COLUMN_KEYS[selectedCol.value];
  if (colKey === "amount" || colKey === "tax" || colKey === "total") {
    const evaluated = evaluateSimpleExpression(val);
    if (evaluated !== null) val = String(evaluated);
  }
  setCellValue(selectedRow.value, selectedCol.value, val);
  // Re-check duplicates after commit
  checkDuplicatesInGrid();
}

function onCellInput(rowIndex: number, colIndex: number, value: string): void {
  if (COLUMN_KEYS[colIndex] === "amount") {
    editingValue.value = sanitizeNumericInput(value);
  } else {
    editingValue.value = value;
  }
  // Check for duplicates in real-time if this is invoice_number column
  if (COLUMN_KEYS[colIndex] === "invoice_number") {
    checkDuplicatesInGrid();
    // Debounced FileMaker check
    debouncedFileMakerDuplicateCheck(value.trim(), rowIndex);
  }
}

/** Check for duplicate invoice numbers within the grid */
function checkDuplicatesInGrid(): void {
  const duplicates = new Set<number>();
  const seen = new Map<string, number>();

  for (let i = 0; i < rows.value.length; i++) {
    // Use editingValue if this is the currently selected cell being edited
    let inv: string | number;
    if (
      i === selectedRow.value &&
      selectedCol.value === INV_COL_INDEX &&
      editingValue.value !== undefined
    ) {
      inv = editingValue.value;
    } else {
      inv = getCellValue(i, INV_COL_INDEX);
    }

    const invStr =
      inv != null && String(inv).trim() !== "" ? String(inv).trim() : "";
    if (invStr === "") continue;

    const key = invStr.toLowerCase();
    if (seen.has(key)) {
      // Mark both rows as duplicates
      duplicates.add(seen.get(key)!);
      duplicates.add(i);
    } else {
      seen.set(key, i);
    }
  }

  duplicateInvoiceNumbers.value = duplicates;
}

/** Debounced check against FileMaker for duplicate invoice numbers */
function debouncedFileMakerDuplicateCheck(
  invStr: string,
  rowIndex: number,
): void {
  if (fileMakerCheckTimeout.value) {
    clearTimeout(fileMakerCheckTimeout.value);
  }

  if (!invStr || !isConnected.value) {
    return;
  }

  fileMakerCheckTimeout.value = setTimeout(async () => {
    await checkFileMakerDuplicate(invStr, rowIndex);
  }, 500); // 500ms debounce
}

/** Check if invoice number exists in FileMaker */
async function checkFileMakerDuplicate(
  invStr: string,
  rowIndex: number,
): Promise<void> {
  if (!invStr || !isConnected.value) {
    // If empty, remove from duplicates (but keep grid duplicates if any)
    return;
  }

  // Get the current row's recordId (if it exists) to exclude it from duplicate check
  const currentRow = rows.value[rowIndex];
  const currentRecordId = currentRow?.recordId;

  // Check cache first (but note: cache doesn't account for current record exclusion)
  // So we'll still need to do the actual check if there's a currentRecordId
  if (fileMakerDuplicateCheckCache.value.has(invStr) && !currentRecordId) {
    const isDuplicate = fileMakerDuplicateCheckCache.value.get(invStr);
    if (isDuplicate) {
      duplicateInvoiceNumbers.value.add(rowIndex);
    } else {
      // Only remove if not a grid duplicate
      const _currentInv = getCellValue(rowIndex, INV_COL_INDEX);
      void (_currentInv != null && String(_currentInv).trim() !== ""
        ? String(_currentInv).trim().toLowerCase()
        : "");
      // Re-check grid duplicates to see if this is still a duplicate within grid
      checkDuplicatesInGrid();
    }
    return;
  }

  const invNum = Number(invStr);
  const invForFind = Number.isNaN(invNum) ? invStr : invNum;

  // Check Payables_Details - use findRecordsByQueryWithIds to get recordIds and exclude current record
  const { data: detailsDataWithIds } = await findRecordsByQueryWithIds<
    Record<string, unknown>
  >(LAYOUTS.PAYABLES_DETAILS, { InvoiceNumber: invForFind }, 100);

  // Filter out the current record being edited (if it exists)
  const otherDetailsWithSameInvoice = currentRecordId
    ? detailsDataWithIds.filter((r) => r.recordId !== currentRecordId)
    : detailsDataWithIds;

  const existsInFileMaker = otherDetailsWithSameInvoice.length > 0;

  // Only cache if there's no currentRecordId (to avoid caching incorrect results)
  if (!currentRecordId) {
    fileMakerDuplicateCheckCache.value.set(invStr, existsInFileMaker);
  }

  if (existsInFileMaker) {
    duplicateInvoiceNumbers.value.add(rowIndex);
  } else {
    // Re-check grid duplicates - this might still be a duplicate within the grid
    checkDuplicatesInGrid();
  }
}

function commitAndMove(
  direction: "enter" | "tab" | "enterReverse" | "left" | "right",
): void {
  const val = editingValue.value.trim();
  setCellValue(selectedRow.value, selectedCol.value, val);
  moveSelection(direction);
  if (direction === "enter") ensureRowForEnter();
  nextTick(() => cellInputRef.value?.focus());
}

function cancelEdit(): void {
  editingValue.value = String(
    getCellValue(selectedRow.value, selectedCol.value) ?? "",
  );
  cellInputRef.value?.blur();
}

const REQUIRED_COLUMN_KEYS: ColumnKey[] = ["invoice_number", "amount", "total"];

function childHeaderLabel(key: ColumnKey): string {
  // Custom label for amount
  if (key === "amount") {
    return REQUIRED_COLUMN_KEYS.includes(key)
      ? "Amount before VAT *"
      : "Amount before VAT";
  }
  // Custom label for tax column
  if (key === "tax") {
    return REQUIRED_COLUMN_KEYS.includes(key) ? "Tax Rate *" : "Tax Rate";
  }
  // Custom label for reference (maps to Tax Amount in FileMaker)
  if (key === "reference") {
    return "Tax Amount";
  }
  if (key === "wht_tax") return "WHT Tax";
  if (key === "wht_tax_amount") return "WHT Tax Amount";
  const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return REQUIRED_COLUMN_KEYS.includes(key) ? `${label} *` : label;
}

function isStatusCol(key: ColumnKey): boolean {
  return (key as string) === "status";
}

function isTaxCol(key: ColumnKey): boolean {
  return key === "tax";
}

/** True when this row has a non-zero combined tax rate (so we show the breakdown button). */
function hasAmountForRow(rowIndex: number): boolean {
  const raw = getCellValue(rowIndex, AMOUNT_COL_INDEX);
  if (raw === undefined || raw === null) return false;
  const s = String(raw).trim();
  if (s === "") return false;
  const n = parseFloat(s.replace(/,/g, ""));
  return !Number.isNaN(n) && n > 0;
}

function hasTaxValue(rowIndex: number): boolean {
  return getCombinedTaxRateForRow(rowIndex) > 0;
}

function hasWhtTaxValue(rowIndex: number): boolean {
  return getCombinedWhtTaxRateForRow(rowIndex) > 0;
}

function isTotalCol(key: ColumnKey): boolean {
  return key === "total";
}

function isTaxAmountCol(key: ColumnKey): boolean {
  return key === "reference";
}

function isWhtTaxCol(key: ColumnKey): boolean {
  return key === "wht_tax" || key === "wht_tax_amount";
}

const NUMERIC_COL_KEYS: ColumnKey[] = [
  "amount",
  "tax",
  "reference",
  "wht_tax",
  "wht_tax_amount",
  "total",
];

function displayValue(rowIndex: number, colIndex: number): string | number {
  const raw = getCellValue(rowIndex, colIndex);
  if (raw === undefined || raw === null || raw === "") return "";
  if (isFormula(raw)) {
    const evaluated = evaluateCellFormula(String(raw));
    return typeof evaluated === "number"
      ? formatNumberDisplay(evaluated)
      : String(evaluated);
  }
  const key = COLUMN_KEYS[colIndex];
  if (NUMERIC_COL_KEYS.includes(key)) {
    const formatted = formatNumberDisplay(raw);
    return formatted !== "" ? formatted : raw;
  }
  return raw;
}

const COL_MIN_WIDTHS: Partial<Record<ColumnKey, string>> = {
  invoice_number: "12ch",
  amount: "12ch",
  tax: "10ch",
  reference: "12ch",
  wht_tax: "10ch",
  wht_tax_amount: "12ch",
  total: "12ch",
};

function colMinWidthStyle(key: ColumnKey) {
  const min = COL_MIN_WIDTHS[key] ?? "10ch";
  return { minWidth: min };
}

const tableStyle = computed(() => ({
  tableLayout: "auto" as const,
  minWidth: "max(100%, 1100px)", /* Ensure table overflows to trigger horizontal scroll + sticky */
}));

function cellClass(
  rowIndex: number,
  colIndex: number,
): Record<string, boolean> {
  const selected =
    selectedRow.value === rowIndex && selectedCol.value === colIndex;
  const isInvoiceCol = COLUMN_KEYS[colIndex] === "invoice_number";
  const isDuplicate =
    isInvoiceCol && duplicateInvoiceNumbers.value.has(rowIndex);
  return {
    "bg-[var(--color-accent-soft)] ring-2 ring-[var(--color-accent)] ring-inset":
      selected,
    "bg-[var(--color-bg-card)]": !selected,
    "cell-duplicate": isDuplicate,
  };
}

function onCellClick(rowIndex: number, colIndex: number): void {
  editingValue.value = String(getCellValue(rowIndex, colIndex) ?? "");
  selectCell(rowIndex, colIndex);
  if (
    !isStatusCol(COLUMN_KEYS[colIndex]) &&
    !isTaxCol(COLUMN_KEYS[colIndex]) &&
    !isTotalCol(COLUMN_KEYS[colIndex]) &&
    !isTaxAmountCol(COLUMN_KEYS[colIndex]) &&
    !isWhtTaxCol(COLUMN_KEYS[colIndex])
  ) {
    nextTick(() => cellInputRef.value?.focus());
  }
}

const contextMenu = ref<{ visible: boolean; x: number; y: number }>({
  visible: false,
  x: 0,
  y: 0,
});

function onContextMenu(e: MouseEvent): void {
  if (payableStore.mainPosted) return;
  contextMenu.value = { visible: true, x: e.clientX, y: e.clientY };
}

function closeContextMenu(e?: MouseEvent) {
  contextMenu.value = { ...contextMenu.value, visible: false };
  if (taxBreakdownRow.value !== null && e?.target) {
    const target = e.target as HTMLElement;
    if (
      !target.closest?.(".cell-tax-breakdown-popover") &&
      !target.closest?.(".cell-tax-breakdown-trigger")
    ) {
      closeTaxBreakdown();
    }
  }
}

function handleCopy() {
  copy();
  closeContextMenu();
}
function handlePaste() {
  paste();
  closeContextMenu();
}
function handleCut() {
  cut();
  closeContextMenu();
}
function handleClear() {
  clearCell();
  closeContextMenu();
}

function onKeydown(e: KeyboardEvent): void {
  if (contextMenu.value.visible) {
    closeContextMenu();
    return;
  }
  switch (e.key) {
    case "ArrowUp":
      e.preventDefault();
      moveSelection("up");
      break;
    case "ArrowDown":
      e.preventDefault();
      moveSelection("down");
      ensureRowForEnter();
      break;
    case "ArrowLeft":
      e.preventDefault();
      moveSelection("left");
      break;
    case "ArrowRight":
      e.preventDefault();
      moveSelection("right");
      break;
    case "Tab":
      e.preventDefault();
      moveSelection(e.shiftKey ? "tabReverse" : "tab");
      break;
    case "Enter":
      e.preventDefault();
      moveSelection("enter");
      ensureRowForEnter();
      break;
    default:
      break;
  }
}

onMounted(() => {
  window.addEventListener("click", closeContextMenu);
  gridRef.value?.focus();
});
onUnmounted(() => {
  window.removeEventListener("click", closeContextMenu);
});
</script>

<style scoped>
/* No overflow on wrapper - overflow-hidden/clip creates scroll context that breaks position:sticky */
.data-grid-scroll {
  border-radius: 12px;
  overflow: auto;
}

.data-grid-scroll:focus {
  outline: none;
}
.data-grid-table {
  width: max-content;
  min-width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

/* Ensure tbody paints below sticky header so body borders don't overlay header during scroll */
.data-grid-table tbody {
  position: relative;
  z-index: 0;
}
.row-delete-th,
.row-delete-td {
  position: sticky;
  left: 0;
  z-index: 10;
  width: var(--checkbox-col-width, 44px);
  min-width: var(--checkbox-col-width, 44px);
  max-width: var(--checkbox-col-width, 44px);
}

.row-delete-th {
  background: var(--color-bg-dark) !important;
}

.row-delete-td {
  background: var(--color-bg-card) !important;
}

.row-header-th,
.row-header-td {
  position: sticky;
  left: var(--checkbox-col-width, 44px);
  z-index: 10;
  width: var(--row-header-width, 44px);
  min-width: var(--row-header-width, 44px);
  max-width: var(--row-header-width, 44px);
  box-shadow: 1px 0 0 0 var(--color-border);
}

.row-header-th {
  background: var(--color-bg-dark) !important;
}

.row-header-td {
  background: var(--color-bg-card) !important;
}

.row-delete-th,
.row-header-th {
  z-index: 20;
}

.data-grid-actions-th,
.data-grid-actions-td {
  position: sticky;
  right: 0;
  z-index: 10;
  box-shadow: -1px 0 0 0 var(--color-border);
}

.data-grid-actions-th {
  z-index: 20;
  background: var(--color-bg-dark) !important;
}

.data-grid-actions-td {
  background: var(--color-bg-card) !important;
}

.row-delete-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: rgb(239 68 68);
  cursor: pointer;
  transition: background 0.2s ease, opacity 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.row-delete-btn:hover {
  background: rgba(239, 68, 68, 0.15);
}

.row-delete-btn:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.row-delete-btn__icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.row-header-number {
  user-select: none;
  display: inline-block;
  min-width: 1.25rem;
  font-variant-numeric: tabular-nums;
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
.cell-tax-breakdown-sum {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  font-weight: 600;
  list-style: none;
  margin-left: -1.25rem;
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
