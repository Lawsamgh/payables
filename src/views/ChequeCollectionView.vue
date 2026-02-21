<template>
  <div
    class="content-area flex flex-col flex-1 min-h-0 w-full max-w-[1600px] mx-auto px-4 py-5 md:px-6 md:py-6"
  >
    <header class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div class="flex flex-wrap items-center gap-3">
        <router-link
          to="/"
          class="pill-btn glass-input inline-flex items-center gap-1.5 px-3 py-2 text-[var(--label-size)] text-[var(--color-text-muted)] no-underline hover:text-[var(--color-text)]"
        >
          <svg
            class="h-4 w-4"
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
          Back
        </router-link>
        <h1 class="text-xl font-bold tracking-tight text-[var(--color-text)]">
          Cheque collection
        </h1>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          class="pill-btn glass-input inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-4 py-2.5 text-[var(--label-size)] font-medium text-[var(--color-text-muted)] transition-colors hover:bg-white/5 hover:text-[var(--color-text)]"
          :disabled="filteredCollectionList.length === 0"
          aria-label="Export cheque collections to CSV"
          @click="onExport"
        >
          <svg
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Export
        </button>
        <button
          type="button"
          class="pill-btn inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2.5 text-[var(--label-size)] font-semibold text-white shadow-md hover:bg-orange-600 transition-colors"
          @click="showAddModal = true"
        >
          <svg
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add collection
        </button>
      </div>
    </header>

    <p class="text-[var(--label-size)] text-[var(--color-text-muted)] mb-4">
      Record cheque handovers to vendors. Search by TransRef, ChequePayee, or
      Cheque No.
    </p>

    <!-- Search -->
    <div
      v-if="!loading && !loadError && collectionList.length > 0"
      class="tax-search-bar"
    >
      <div class="tax-search-bar__row">
        <div
          class="search-bar__wrap tax-search-bar__search"
          :class="{ 'search-bar__wrap--has-value': searchQuery }"
        >
          <span class="search-bar__icon" aria-hidden="true">
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            v-model.trim="searchQuery"
            type="search"
            class="search-bar__input"
            placeholder="Search TransRef, ChequePayee, Cheque No…"
            autocomplete="off"
            aria-label="Search collection records"
          />
          <button
            v-if="searchQuery"
            type="button"
            class="search-bar__clear"
            aria-label="Clear search"
            @click="searchQuery = ''"
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
      <p v-if="searchQuery" class="tax-search-bar__hint">
        {{ filteredCollectionList.length }} result{{
          filteredCollectionList.length === 1 ? "" : "s"
        }}
      </p>
    </div>

    <!-- Table -->
    <div class="tax-table-wrap">
      <template v-if="loading">
        <div class="tax-table-skeleton">
          <div class="tax-table-skeleton__search">
            <Skeleton width="100%" height="2.75rem" class="rounded-xl" />
          </div>
          <table class="tax-table">
            <thead>
              <tr>
                <th><Skeleton width="4rem" height="0.875rem" class="rounded" /></th>
                <th><Skeleton width="5rem" height="0.875rem" class="rounded" /></th>
                <th><Skeleton width="4rem" height="0.875rem" class="rounded" /></th>
                <th><Skeleton width="4rem" height="0.875rem" class="rounded" /></th>
                <th><Skeleton width="6rem" height="0.875rem" class="rounded" /></th>
                <th><Skeleton width="5rem" height="0.875rem" class="rounded" /></th>
                <th><Skeleton width="4rem" height="0.875rem" class="rounded" /></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="i in 6" :key="i" class="tax-table-skeleton__row">
                <td><Skeleton width="4rem" height="0.875rem" class="rounded" /></td>
                <td><Skeleton width="4rem" height="0.875rem" class="rounded" /></td>
                <td><Skeleton width="4rem" height="0.875rem" class="rounded" /></td>
                <td><Skeleton width="4rem" height="0.875rem" class="rounded" /></td>
                <td><Skeleton width="5rem" height="0.875rem" class="rounded" /></td>
                <td><Skeleton width="5rem" height="0.875rem" class="rounded" /></td>
                <td><Skeleton width="4rem" height="0.875rem" class="rounded" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
      <div v-else-if="loadError" class="tax-table-error">
        {{ loadError }}
      </div>
      <div v-else-if="collectionList.length === 0" class="tax-table-empty">
        <p>No collection records yet.</p>
        <button
          type="button"
          class="pill-btn mt-2 inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2.5 text-[var(--label-size)] font-semibold text-white shadow-md hover:bg-orange-600 transition-colors"
          @click="showAddModal = true"
        >
          Add your first record
        </button>
      </div>
      <div v-else-if="filteredCollectionList.length === 0" class="tax-table-empty">
        <p>
          {{ searchQuery ? "No matching records." : "No collection records yet." }}
        </p>
        <button
          v-if="searchQuery"
          type="button"
          class="pill-btn mt-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          @click="searchQuery = ''"
        >
          Clear search
        </button>
      </div>
      <div v-else>
        <div class="tax-table-scroll">
          <table class="tax-table">
            <thead>
              <tr>
                <th>TransRef</th>
                <th>Bank</th>
                <th>Cheque No</th>
                <th>Amount</th>
                <th>Cheque Payee</th>
                <th>Received By</th>
                <th>Collection Date</th>
                <th>Issued By</th>
                <th class="cheque-table-actions">View</th>
                <th class="cheque-table-actions">Edit</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, index) in collectionListToShow"
                :key="row.recordId || index"
              >
                <td>{{ getField(row, "TransRef") }}</td>
                <td>{{ getField(row, "BankName") }}</td>
                <td>{{ getField(row, "ChequeNo") }}</td>
                <td>{{ formatAmount(getField(row, "Amount")) }}</td>
                <td>{{ getField(row, "ChequePayee") }}</td>
                <td>{{ getField(row, "ReceivedBy") }}</td>
                <td>{{ formatDate(getField(row, "CollectionDate")) }}</td>
                <td>{{ getField(row, "IssuedBy") }}</td>
                <td class="cheque-table-actions">
                  <router-link
                    v-if="getFieldValue(row, 'TransRef')"
                    :to="{
                      name: 'entry',
                      query: {
                        transRef: getFieldValue(row, 'TransRef'),
                        from: 'cheque-collection',
                      },
                    }"
                    class="cheque-view-btn"
                    :title="`View payable ${getFieldValue(row, 'TransRef')}`"
                    aria-label="View record"
                  >
                    <svg
                      class="cheque-view-btn__icon"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </router-link>
                  <span v-else class="text-[var(--color-text-muted)]">—</span>
                </td>
                <td class="cheque-table-actions">
                  <button
                    v-if="isCollectionDateToday(row)"
                    type="button"
                    class="cheque-view-btn"
                    title="Edit record"
                    aria-label="Edit record"
                    @click="openEditModal(row)"
                  >
                    <svg
                      class="cheque-view-btn__icon"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <span v-else class="text-[var(--color-text-muted)]">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="totalPages > 1" class="pagination">
          <button
            type="button"
            class="pagination__btn"
            :disabled="currentPage <= 1"
            aria-label="Previous page"
            @click="currentPage = Math.max(1, currentPage - 1)"
          >
            <svg
              class="pagination__icon"
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
          </button>
          <span class="pagination__label">
            Page {{ currentPage }} of {{ totalPages }}
          </span>
          <button
            type="button"
            class="pagination__btn"
            :disabled="currentPage >= totalPages"
            aria-label="Next page"
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
          >
            <svg
              class="pagination__icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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

    <!-- Add collection modal -->
    <Teleport to="body">
      <div v-if="showAddModal" class="tax-modal-backdrop">
        <div
          class="tax-modal cheque-modal"
          role="dialog"
          aria-labelledby="add-collection-title"
          aria-modal="true"
        >
          <header class="tax-modal__header">
            <h2 id="add-collection-title" class="tax-modal__title">
              {{ editingRecordId ? "Edit collection record" : "Add collection record" }}
            </h2>
            <button
              type="button"
              class="tax-modal__close"
              aria-label="Close"
              @click="closeModal"
            >
              <svg
                class="tax-modal__close-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </header>
          <div v-if="formError" class="tax-modal__error" role="alert">
            <svg
              class="tax-modal__error-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span class="tax-modal__error-text">{{ formError }}</span>
          </div>
          <form class="tax-modal__form" @submit.prevent="submit">
            <section class="tax-modal__section">
              <h3 class="tax-modal__section-title">Cheque details</h3>
              <p
                v-if="form.TransRef"
                class="text-2xl font-semibold text-[var(--color-text)] mb-4"
              >
                {{ selectedPayableDisplay }}
              </p>
              <p
                v-if="editingRecordId"
                class="text-[var(--label-size)] text-[var(--color-text-muted)] mb-3"
              >
                TransRef: {{ form.TransRef }}
              </p>
              <label v-if="!editingRecordId" class="tax-modal__label">
                <span
                  >Select approved payable
                  <span class="text-[var(--color-text-muted)] font-normal"
                    >(only those not yet collected)</span
                  ></span
                >
                <div v-if="!editingRecordId" class="payable-select-wrap" ref="payableSelectWrapRef">
                  <div
                    class="payable-select-trigger glass-input flex items-center gap-2 w-full px-3 py-2.5 rounded-lg cursor-pointer"
                    :class="{ 'payable-select-trigger--focused': showPayableDropdown }"
                    @click="showPayableDropdown = !showPayableDropdown"
                  >
                    <span
                      v-if="form.TransRef"
                      class="flex-1 min-w-0 text-[var(--color-text)] truncate text-[var(--label-size)]"
                    >
                      <span class="font-semibold">{{ selectedPayableDisplay }}</span>
                    </span>
                    <span
                      v-else
                      class="flex-1 min-w-0 text-[var(--color-text-muted)]"
                    >
                      Search by vendor or TransRef…
                    </span>
                    <button
                      v-if="form.TransRef"
                      type="button"
                      class="payable-select-clear shrink-0 p-1 rounded hover:bg-white/10 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                      aria-label="Clear selection"
                      @click.stop="clearPayableSelection"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <svg
                      class="h-4 w-4 shrink-0 text-[var(--color-text-muted)] transition-transform"
                      :class="{ 'rotate-180': showPayableDropdown }"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                  <div
                    v-if="!editingRecordId && showPayableDropdown"
                    class="payable-select-dropdown"
                    @click.stop
                  >
                    <div class="payable-select-search">
                      <input
                        ref="payableSearchInputRef"
                        v-model="payableSearchQuery"
                        type="search"
                        class="glass-input w-full px-3 py-2.5 rounded-lg text-[var(--label-size)]"
                        placeholder="Search by vendor name or TransRef…"
                        autocomplete="off"
                        @keydown.escape="showPayableDropdown = false"
                      />
                      <p
                        v-if="
                          !loadingPayables &&
                          availablePayablesList.length > 0 &&
                          !payableSearchQuery
                        "
                        class="payable-select-hint"
                      >
                        {{ availablePayablesList.length }} approved
                        {{ availablePayablesList.length === 1 ? "payable" : "payables" }}
                        awaiting collection
                      </p>
                    </div>
                    <ul
                      class="payable-select-list"
                      role="listbox"
                      aria-label="Select payable"
                    >
                      <li
                        v-for="item in filteredPayablesForSelect"
                        :key="item.fieldData?.TransRef ?? item.recordId"
                        class="payable-select-item-wrapper"
                      >
                        <button
                          type="button"
                          class="payable-select-item"
                          role="option"
                          :aria-selected="form.TransRef === (item.fieldData?.TransRef ?? '')"
                          @click.stop.prevent="selectPayable(item)"
                        >
                          <span class="payable-select-item__ref">{{
                            item.fieldData?.TransRef ?? "—"
                          }}</span>
                          <span class="payable-select-item__vendor">{{
                            item.fieldData?.VendorName ?? item.fieldData?.["Vendor Name"] ?? item.fieldData?.Vendor_Name ?? "—"
                          }}</span>
                          <span class="payable-select-item__amount">
                            {{ (item.fieldData as Record<string, unknown>)?.Currency ?? "" }}
                            {{ formatAmount(item.fieldData?.Total) }}
                          </span>
                        </button>
                      </li>
                      <li
                        v-if="
                          payableSearchQuery &&
                          filteredPayablesForSelect.length === 0
                        "
                        class="payable-select-item payable-select-item--empty"
                      >
                        No matching approved payables
                      </li>
                      <li
                        v-else-if="
                          !payableSearchQuery &&
                          availablePayablesList.length === 0 &&
                          !loadingPayables
                        "
                        class="payable-select-item payable-select-item--empty"
                      >
                        {{
                          collectedTransRefs.size > 0 && approvedPayablesList.length > 0
                            ? "All approved payables have already been recorded"
                            : "No approved payables found"
                        }}
                      </li>
                      <li
                        v-else-if="loadingPayables"
                        class="payable-select-item payable-select-item--empty"
                      >
                        Loading approved payables…
                      </li>
                    </ul>
                  </div>
                </div>
              </label>
              <div class="tax-modal__row">
                <label class="tax-modal__label">
                  <span>Bank Name</span>
                  <input
                    v-model="form.BankName"
                    type="text"
                    class="glass-input w-full px-3 py-2.5 rounded-lg"
                    placeholder="Bank name"
                  />
                </label>
                <label class="tax-modal__label">
                  <span>Cheque No</span>
                  <input
                    v-model="form.ChequeNo"
                    type="text"
                    class="glass-input w-full px-3 py-2.5 rounded-lg"
                    placeholder="Cheque number"
                  />
                </label>
              </div>
              <div class="tax-modal__row">
                <label class="tax-modal__label">
                  <span>Amount</span>
                  <input
                    :value="formatNumberDisplay(form.Amount)"
                    type="text"
                    readonly
                    class="glass-input w-full px-3 py-2.5 rounded-lg"
                    placeholder="Auto-filled when payable selected"
                  />
                </label>
                <label class="tax-modal__label">
                  <span>Cheque Payee (Vendor Name)</span>
                  <input
                    v-model="form.ChequePayee"
                    type="text"
                    class="glass-input w-full px-3 py-2.5 rounded-lg"
                    placeholder="Vendor name"
                  />
                </label>
              </div>
            </section>
            <section class="tax-modal__section">
              <h3 class="tax-modal__section-title">Received by</h3>
              <div class="tax-modal__row">
                <label class="tax-modal__label">
                  <span>Received By</span>
                  <input
                    v-model="form.ReceivedBy"
                    type="text"
                    class="glass-input w-full px-3 py-2.5 rounded-lg"
                    placeholder="Person name"
                  />
                </label>
                <label class="tax-modal__label">
                  <span>ID No</span>
                  <input
                    v-model="form.IDNo"
                    type="text"
                    class="glass-input w-full px-3 py-2.5 rounded-lg"
                    placeholder="ID number"
                  />
                </label>
              </div>
              <label class="tax-modal__label">
                <span>Contact</span>
                <input
                  v-model="form.Contact"
                  type="text"
                  class="glass-input w-full px-3 py-2.5 rounded-lg"
                  placeholder="Phone / email"
                />
              </label>
            </section>
            <section class="tax-modal__section">
              <h3 class="tax-modal__section-title">Other</h3>
              <div class="tax-modal__row">
                <label class="tax-modal__label">
                  <span>Tin No</span>
                  <input
                    v-model="form.TinNo"
                    type="text"
                    class="glass-input w-full px-3 py-2.5 rounded-lg"
                    placeholder="TIN"
                  />
                </label>
                <label class="tax-modal__label">
                  <span>Collection Date</span>
                  <input
                    v-model="form.CollectionDate"
                    type="date"
                    class="glass-input w-full px-3 py-2.5 rounded-lg"
                  />
                </label>
              </div>
            </section>
            <div class="tax-modal__actions">
              <button
                type="button"
                class="tax-modal__btn-cancel"
                @click="closeModal"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="tax-modal__btn-submit"
                :disabled="saving"
              >
                {{ saving ? "Saving…" : (editingRecordId ? "Save" : "Add") }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted, nextTick } from "vue";
import Skeleton from "../components/Skeleton.vue";
import { useFileMaker } from "../composables/useFileMaker";
import { LAYOUTS } from "../utils/filemakerApi";
import type {
  ChequeCollectionFieldData,
  PayablesMainFieldData,
} from "../utils/filemakerApi";
import type { FindRecordWithId } from "../composables/useFileMaker";
import { useToastStore } from "../stores/toastStore";
import { useChequeOverviewStore } from "../stores/chequeOverviewStore";
import { formatDateForFileMaker } from "../utils/filemakerMappers";
import { formatNumberDisplay } from "../utils/formatNumber";
import { exportChequeCollections } from "../utils/exportData";

const {
    createRecord,
    findRecordsWithIds,
    findRecordsByQueryWithIds,
    updateRecord,
    isConnected,
    loggedInEmail,
  } = useFileMaker();
const toast = useToastStore();
const chequeOverview = useChequeOverviewStore();

const collectionList = ref<
  FindRecordWithId<ChequeCollectionFieldData | Record<string, unknown>>[]
>([]);
const loading = ref(true);
const loadError = ref<string | null>(null);
const showAddModal = ref(false);
const editingRecordId = ref<string | null>(null);
const searchQuery = ref("");
const formError = ref<string | null>(null);
const saving = ref(false);

// Payable search/select (for TransRef)
const approvedPayablesList = ref<
  FindRecordWithId<PayablesMainFieldData | Record<string, unknown>>[]
>([]);
const payableSearchQuery = ref("");
const showPayableDropdown = ref(false);
const loadingPayables = ref(false);
const payableSelectWrapRef = ref<HTMLElement | null>(null);
const payableSearchInputRef = ref<HTMLInputElement | null>(null);
const selectedPayableVendorName = ref("");
const selectedPayableVendorId = ref("");

function defaultCollectionDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** True if the row's CollectionDate is today (same calendar day). */
function isCollectionDateToday(
  row: FindRecordWithId<ChequeCollectionFieldData | Record<string, unknown>>,
): boolean {
  const dateStr = getFieldValue(row, "CollectionDate");
  if (!dateStr) return false;
  const today = defaultCollectionDate();
  const normalized = dateStr.replace(/\//g, "-");
  const match = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (match) {
    const [, y, m, d] = match;
    const rowDate = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    return rowDate === today;
  }
  const mmddyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mmddyy) {
    const [, m, d, y] = mmddyy;
    const rowDate = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    return rowDate === today;
  }
  return false;
}

const form = ref({
  TransRef: "",
  BankName: "",
  ChequeNo: "",
  Amount: "" as string | number,
  ChequePayee: "",
  ReceivedBy: "",
  IDNo: "",
  Contact: "",
  TinNo: "",
  CollectionDate: defaultCollectionDate(),
});

function getFieldValue(
  row: FindRecordWithId<ChequeCollectionFieldData | Record<string, unknown>>,
  key: string,
): string {
  const fd = row.fieldData as Record<string, unknown>;
  const v = fd[key] ?? fd[key.replace(/([A-Z])/g, " $1").trim()];
  return v != null && v !== "" ? String(v).trim() : "";
}

function getField(
  row: FindRecordWithId<ChequeCollectionFieldData | Record<string, unknown>>,
  key: string,
): string {
  const val = getFieldValue(row, key);
  return val || "—";
}

function formatDate(value: string | undefined): string {
  if (!value?.trim()) return "—";
  return value.trim();
}

function formatAmount(value: string | number | undefined): string {
  if (value == null || value === "") return "—";
  const n = typeof value === "number" ? value : parseFloat(String(value));
  if (Number.isNaN(n)) return "—";
  return formatNumberDisplay(n);
}

const filteredCollectionList = computed(() => {
  const q = searchQuery.value.toLowerCase();
  if (!q) return collectionList.value;
  return collectionList.value.filter((r) => {
    const fd = r.fieldData as Record<string, unknown>;
    const transRef = String(fd.TransRef ?? fd["TransRef"] ?? "").toLowerCase();
    const chequeNo = String(fd.ChequeNo ?? fd["Cheque No"] ?? "").toLowerCase();
    const payee = String(
      fd.ChequePayee ?? fd["Cheque Payee"] ?? "",
    ).toLowerCase();
    const bank = String(fd.BankName ?? fd["Bank Name"] ?? "").toLowerCase();
    return (
      transRef.includes(q) ||
      chequeNo.includes(q) ||
      payee.includes(q) ||
      bank.includes(q)
    );
  });
});

const PAGE_SIZE = 10;
const currentPage = ref(1);
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredCollectionList.value.length / PAGE_SIZE)),
);
const collectionListToShow = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return filteredCollectionList.value.slice(start, start + PAGE_SIZE);
});

watch(searchQuery, () => {
  currentPage.value = 1;
});
watch(totalPages, (total) => {
  if (currentPage.value > total) currentPage.value = Math.max(1, total);
});

function onExport() {
  exportChequeCollections(filteredCollectionList.value, "csv");
}

function getPayableStatus(
  fd: PayablesMainFieldData | Record<string, unknown> | undefined,
): string {
  if (!fd) return "";
  return String(
    (fd as Record<string, unknown>).Status ??
      (fd as Record<string, unknown>).status ??
      "",
  ).trim();
}

const filteredPayablesForSelect = computed(() => {
  const list = availablePayablesList.value;
  const q = payableSearchQuery.value.trim().toLowerCase();
  if (!q) return list;
  return list.filter((r) => {
    const fd = r.fieldData as Record<string, unknown>;
    const transRef = String(fd.TransRef ?? fd["TransRef"] ?? "").toLowerCase();
    const vendor = String(
      fd.VendorName ?? fd["Vendor Name"] ?? "",
    ).toLowerCase();
    const vendorId = String(
      fd.VendorID ?? fd["Vendor ID"] ?? "",
    ).toLowerCase();
    return (
      transRef.includes(q) || vendor.includes(q) || vendorId.includes(q)
    );
  });
});

function selectPayable(
  item: FindRecordWithId<PayablesMainFieldData | Record<string, unknown>>,
) {
  const fd = item.fieldData as Record<string, unknown>;
  const transRef = String(
    fd.TransRef ?? fd["TransRef"] ?? fd.Trans_Ref ?? "",
  ).trim();
  const vendorId = String(
    fd.VendorID ?? fd["Vendor ID"] ?? fd.Vendor_Id ?? "",
  ).trim();
  const vendorName = String(
    fd.VendorName ?? fd["Vendor Name"] ?? fd.Vendor_Name ?? "",
  ).trim();
  const total = fd.Total ?? fd.total ?? fd["Total"];
  const amount =
    typeof total === "number"
      ? total
      : total != null && total !== ""
        ? parseFloat(String(total))
        : undefined;
  form.value.TransRef = transRef;
  form.value.Amount = amount != null && !Number.isNaN(amount) ? amount : "";
  selectedPayableVendorId.value = vendorId;
  selectedPayableVendorName.value = vendorName;
  payableSearchQuery.value = "";
  // Defer close so the click doesn't bubble to trigger and reopen the dropdown
  setTimeout(() => {
    showPayableDropdown.value = false;
  }, 0);
}

async function loadApprovedPayables() {
  if (!isConnected.value) {
    approvedPayablesList.value = [];
    return;
  }
  loadingPayables.value = true;
  const { data, error } = await findRecordsWithIds<
    PayablesMainFieldData | Record<string, unknown>
  >(LAYOUTS.PAYABLES_MAIN, { limit: 500 });
  loadingPayables.value = false;
  if (error) {
    approvedPayablesList.value = [];
    return;
  }
  // Filter to Approved only
  approvedPayablesList.value = data.filter((r) => {
    const status = getPayableStatus(r.fieldData as PayablesMainFieldData);
    return status === "Approved";
  });
}

/** TransRefs that already have a collection record (cheque collected). */
const collectedTransRefs = computed(() => {
  const set = new Set<string>();
  for (const r of collectionList.value) {
    const fd = r.fieldData as Record<string, unknown>;
    const ref = fd?.TransRef ?? fd?.["TransRef"];
    if (ref != null && String(ref).trim()) {
      set.add(String(ref).trim());
    }
  }
  return set;
});

/** Approved payables that have NOT yet been recorded as collected. */
const availablePayablesList = computed(() => {
  return approvedPayablesList.value.filter((r) => {
    const fd = r.fieldData as Record<string, unknown>;
    const ref = String(fd?.TransRef ?? fd?.["TransRef"] ?? "").trim();
    return ref && !collectedTransRefs.value.has(ref);
  });
});

const selectedPayableDisplay = computed(() => {
  const id = selectedPayableVendorId.value.trim();
  const name = selectedPayableVendorName.value.trim();
  if (!id && !name) return form.value.TransRef ?? "";
  if (!id) return name;
  if (!name) return id;
  return `${id} · ${name}`;
});

function clearPayableSelection() {
  form.value.TransRef = "";
  form.value.Amount = "";
  selectedPayableVendorId.value = "";
  selectedPayableVendorName.value = "";
  showPayableDropdown.value = false;
  payableSearchQuery.value = "";
}

function handleClickOutsidePayableSelect(e: MouseEvent) {
  const wrap = payableSelectWrapRef.value;
  if (wrap && !wrap.contains(e.target as Node)) {
    showPayableDropdown.value = false;
  }
}

watch(showPayableDropdown, (open) => {
  if (open) {
    payableSearchQuery.value = "";
    nextTick(() => payableSearchInputRef.value?.focus());
  }
});

watch(showAddModal, (open) => {
  if (open && !editingRecordId.value) {
    loadApprovedPayables();
  }
  if (!open) {
    resetForm();
    editingRecordId.value = null;
  }
});

onMounted(() => {
  document.addEventListener("click", handleClickOutsidePayableSelect);
});
onUnmounted(() => {
  document.removeEventListener("click", handleClickOutsidePayableSelect);
});

function fileMakerDateToInput(dateStr: string | undefined): string {
  const s = String(dateStr ?? "").trim();
  if (!s) return defaultCollectionDate();
  const match = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    const [, month, day, year] = match;
    return `${year}-${month!.padStart(2, "0")}-${day!.padStart(2, "0")}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return defaultCollectionDate();
}

function openEditModal(
  row: FindRecordWithId<ChequeCollectionFieldData | Record<string, unknown>>,
) {
  const fd = row.fieldData as Record<string, unknown>;
  const get = (key: string) => {
    const v = fd[key] ?? fd[key.replace(/([A-Z])/g, " $1").trim()];
    return v != null && v !== "" ? String(v).trim() : "";
  };
  const transRef = get("TransRef");
  const chequePayee = get("ChequePayee");
  form.value = {
    TransRef: transRef,
    BankName: get("BankName"),
    ChequeNo: get("ChequeNo"),
    Amount: get("Amount") || "",
    ChequePayee: chequePayee,
    ReceivedBy: get("ReceivedBy"),
    IDNo: get("IDNo"),
    Contact: get("Contact"),
    TinNo: get("TinNo"),
    CollectionDate: fileMakerDateToInput(
      (fd.CollectionDate ?? fd["Collection Date"]) as string | undefined,
    ),
  };
  selectedPayableVendorId.value = transRef;
  selectedPayableVendorName.value = chequePayee;
  editingRecordId.value = row.recordId ? String(row.recordId) : null;
  formError.value = null;
  showPayableDropdown.value = false;
  showAddModal.value = true;
}

function closeModal() {
  showAddModal.value = false;
  editingRecordId.value = null;
}

function resetForm() {
  form.value = {
    TransRef: "",
    BankName: "",
    ChequeNo: "",
    Amount: "",
    ChequePayee: "",
    ReceivedBy: "",
    IDNo: "",
    Contact: "",
    TinNo: "",
    CollectionDate: defaultCollectionDate(),
  };
  formError.value = null;
  selectedPayableVendorId.value = "";
  selectedPayableVendorName.value = "";
  payableSearchQuery.value = "";
  showPayableDropdown.value = false;
}

function getFullNameFromUserRecord(
  fd: Record<string, unknown> | undefined,
): string {
  if (!fd) return "";
  const v =
    fd.FullName ??
    fd["Full Name"] ??
    fd.fullName ??
    fd.fullname;
  return v != null && String(v).trim() ? String(v).trim() : "";
}

function looksLikeEmail(s: string): boolean {
  return /^[^@]+@[^@]+\.[^@]+$/.test(s.trim());
}

/** Resolve officer FullName from Payables_Users by logged-in email. */
async function resolveOfficerName(): Promise<string | null> {
  const officerEmail = loggedInEmail.value?.trim();
  if (!officerEmail) return null;
  const normalizedEmail = officerEmail.toLowerCase();
  let posterFd: Record<string, unknown> | undefined;
  const { data: posterRecords } = await findRecordsByQueryWithIds<
    Record<string, unknown>
  >(LAYOUTS.PAYABLES_USERS, { Email: officerEmail }, 1);
  posterFd = posterRecords[0]?.fieldData as Record<string, unknown> | undefined;
  if (!posterRecords?.length) {
    const { data: byEmail } = await findRecordsByQueryWithIds<
      Record<string, unknown>
    >(LAYOUTS.PAYABLES_USERS, { email: officerEmail }, 1);
    if (byEmail?.length) {
      posterFd = byEmail[0]?.fieldData as Record<string, unknown> | undefined;
    }
  }
  if (!posterFd) {
    const { data: users } = await findRecordsWithIds<
      Record<string, unknown>
    >(LAYOUTS.PAYABLES_USERS, { limit: 500 });
    const match = users?.find((r) => {
      const fd = r?.fieldData as Record<string, unknown> | undefined;
      const rowEmail = (fd?.Email ?? fd?.email ?? "").toString().trim();
      return rowEmail.toLowerCase() === normalizedEmail;
    });
    posterFd = match?.fieldData as Record<string, unknown> | undefined;
  }
  const resolved = getFullNameFromUserRecord(posterFd);
  if (resolved && !looksLikeEmail(resolved)) return resolved;
  return null;
}

function validateForm(): string | null {
  if (!form.value.TransRef?.trim())
    return "Please select a payable from the list.";
  if (!form.value.ChequePayee?.trim())
    return "Cheque Payee (Vendor Name) is required.";
  return null;
}

async function submit() {
  if (saving.value) return;
  if (!isConnected.value) {
    toast.error("Not connected to FileMaker.");
    formError.value = null;
    return;
  }
  const err = validateForm();
  if (err) {
    toast.error(err);
    formError.value = null;
    return;
  }
  saving.value = true;
  formError.value = null;
  const recordId = editingRecordId.value;
  const isEdit = !!recordId;
  try {
    const amountNum =
      form.value.Amount === ""
        ? undefined
        : typeof form.value.Amount === "number"
          ? form.value.Amount
          : parseFloat(String(form.value.Amount));
    const fieldData: ChequeCollectionFieldData = {
      TransRef: form.value.TransRef?.trim() || undefined,
      BankName: form.value.BankName?.trim() || undefined,
      ChequeNo: form.value.ChequeNo?.trim() || undefined,
      Amount: amountNum,
      ChequePayee: form.value.ChequePayee?.trim(),
      ReceivedBy: form.value.ReceivedBy?.trim() || undefined,
      IDNo: form.value.IDNo?.trim() || undefined,
      Contact: form.value.Contact?.trim() || undefined,
      TinNo: form.value.TinNo?.trim() || undefined,
      CollectionDate: formatDateForFileMaker(form.value.CollectionDate),
    };
    if (!isEdit) {
      const issuedBy = await resolveOfficerName();
      fieldData.IssuedBy = issuedBy || undefined;
    }
    if (isEdit) {
      const { error } = await updateRecord(
        LAYOUTS.CHEQUE_COLLECTION,
        recordId,
        fieldData,
      );
      if (error) {
        toast.error(error);
        formError.value = null;
        return;
      }
      // Sync Payables_Main cheque details when collection is edited
      const transRef = form.value.TransRef?.trim();
      if (transRef) {
        const { data: mainRecords } = await findRecordsByQueryWithIds<
          PayablesMainFieldData | Record<string, unknown>
        >(LAYOUTS.PAYABLES_MAIN, { TransRef: transRef }, 1);
        const mainRecord = mainRecords[0];
        if (mainRecord?.recordId) {
          await updateRecord(LAYOUTS.PAYABLES_MAIN, mainRecord.recordId, {
            ChequeIssuedDate: formatDateForFileMaker(form.value.CollectionDate),
            BankName: form.value.BankName?.trim(),
            ChequeNo: form.value.ChequeNo?.trim(),
          });
        }
      }
      toast.success("Collection record updated.");
    } else {
      const { error } = await createRecord(
        LAYOUTS.CHEQUE_COLLECTION,
        fieldData,
      );
      if (error) {
        toast.error(error);
        formError.value = null;
        return;
      }
      // Update Payables_Main with cheque issued details (only on create)
      const transRef = form.value.TransRef?.trim();
      if (transRef) {
        const { data: mainRecords } = await findRecordsByQueryWithIds<
          PayablesMainFieldData | Record<string, unknown>
        >(LAYOUTS.PAYABLES_MAIN, { TransRef: transRef }, 1);
        const mainRecord = mainRecords[0];
        if (mainRecord?.recordId) {
          const { error: updateErr } = await updateRecord(
            LAYOUTS.PAYABLES_MAIN,
            mainRecord.recordId,
            {
              ChequeIssued: "Yes",
              ChequeIssuedDate: formatDateForFileMaker(form.value.CollectionDate),
              BankName: form.value.BankName?.trim(),
              ChequeNo: form.value.ChequeNo?.trim(),
            },
          );
          if (updateErr) {
            toast.error(
              "Collection saved but Payables_Main update failed: " + updateErr,
            );
          }
        }
      }
      toast.success("Collection record added.");
    }
    closeModal();
    await loadCollections();
  } finally {
    saving.value = false;
  }
}

async function loadCollections() {
  if (!isConnected.value) {
    collectionList.value = [];
    loading.value = false;
    return;
  }
  loading.value = true;
  loadError.value = null;
  const { data, error } = await findRecordsWithIds<
    ChequeCollectionFieldData | Record<string, unknown>
  >(LAYOUTS.CHEQUE_COLLECTION, { limit: 500 });
  loading.value = false;
  if (error) {
    toast.error(error);
    loadError.value = null;
    collectionList.value = [];
    chequeOverview.setCollectionCount(0);
  } else {
    collectionList.value = data;
    chequeOverview.setCollectionCount(data.length);
  }
}

onMounted(loadCollections);
watch(isConnected, (connected) => {
  if (connected) loadCollections();
});
</script>

<style scoped>
.cheque-modal {
  max-width: 920px;
}

.cheque-table-actions {
  width: 1%;
  white-space: nowrap;
  text-align: center;
}

.cheque-view-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.375rem;
  border-radius: 8px;
  color: var(--color-text-muted);
  transition: color 0.2s var(--ease), background 0.2s var(--ease);
  text-decoration: none;
}

.cheque-view-btn:hover {
  color: var(--color-accent);
  background: var(--color-accent-soft);
}

.cheque-view-btn__icon {
  width: 1.25rem;
  height: 1.25rem;
}

.payable-select-wrap {
  position: relative;
  width: 100%;
}

.payable-select-trigger {
  min-height: 2.75rem;
  font-size: 1rem;
}

.payable-select-trigger--focused {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-soft);
}

.payable-select-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 110;
  margin-top: 0.375rem;
  background: rgba(30, 41, 59, 0.98);
  backdrop-filter: blur(20px);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

.payable-select-search {
  padding: 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.payable-select-hint {
  margin: 0.5rem 0 0;
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.payable-select-clear {
  flex-shrink: 0;
}

.payable-select-list {
  list-style: none;
  margin: 0;
  padding: 0.375rem 0;
  max-height: 12rem;
  overflow-y: auto;
}

.payable-select-item-wrapper {
  list-style: none;
}

.payable-select-item {
  display: grid;
  grid-template-columns: 7.5rem 1fr auto;
  gap: 0.5rem 1rem;
  width: 100%;
  padding: 0.5rem 1rem;
  font-size: var(--label-size);
  font-family: inherit;
  color: var(--color-text);
  cursor: pointer;
  transition: background 0.15s var(--ease);
  text-align: left;
  align-items: baseline;
  background: transparent;
  border: none;
  border-radius: 0;
}

.payable-select-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.payable-select-item--empty {
  color: var(--color-text-muted);
  cursor: default;
  grid-template-columns: 1fr;
  pointer-events: none;
}

.payable-select-item__ref {
  font-weight: 600;
  min-width: 0;
}

.payable-select-item__vendor {
  color: var(--color-text-muted);
  min-width: 0;
}

.payable-select-item__amount {
  font-variant-numeric: tabular-nums;
  justify-self: end;
}
</style>
