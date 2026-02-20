<template>
  <div
    class="content-area flex flex-col flex-1 min-h-0 w-full max-w-[1600px] mx-auto px-4 py-5 md:px-6 md:py-6 min-h-[400px]"
  >
    <header
      class="invoices-header sticky top-0 z-10 -mx-4 -mt-5 px-4 pt-5 pb-4 md:-mx-6 md:-mt-6 md:px-6 md:pt-6 md:pb-4 mb-6 bg-[#0f172a] border-b border-[var(--color-border)]"
    >
      <h1
        class="text-[1.75rem] font-bold tracking-tight text-[var(--color-text)] md:text-[2rem]"
        style="letter-spacing: -0.025em; line-height: 1.2"
      >
        Invoices
      </h1>
      <p class="mt-1.5 text-[13px] text-[var(--color-text-muted)]">
        All payable entries as PDF-style thumbnails. Click any thumbnail to open
        the entry.
      </p>
      <div class="invoices-toolbar">
        <div class="invoice-search-wrap">
          <label for="invoice-search" class="sr-only">Search invoices</label>
          <div class="invoice-search relative">
            <svg
              class="invoice-search__icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              id="invoice-search"
              v-model="searchQuery"
              type="search"
              autocomplete="off"
              placeholder="Search by ref, vendor…"
              class="invoice-search__input glass-input"
            />
            <button
              v-if="searchQuery"
              type="button"
              class="invoice-search__clear"
              aria-label="Clear search"
              @click="searchQuery = ''"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
        <div class="status-filters">
          <span class="status-filters__label">Status</span>
          <button
            type="button"
            class="status-filter-pill"
            :class="{ 'status-filter-pill--active': statusFilter === '' }"
            @click="statusFilter = ''"
          >
            All
          </button>
          <button
            type="button"
            class="status-filter-pill status-filter-pill--draft"
            :class="{ 'status-filter-pill--active': statusFilter === 'Draft' }"
            @click="statusFilter = 'Draft'"
          >
            Draft
          </button>
          <button
            type="button"
            class="status-filter-pill status-filter-pill--posted"
            :class="{ 'status-filter-pill--active': statusFilter === 'Posted' }"
            @click="statusFilter = 'Posted'"
          >
            Posted
          </button>
          <button
            type="button"
            class="status-filter-pill status-filter-pill--rejected"
            :class="{
              'status-filter-pill--active': statusFilter === 'Rejected',
            }"
            @click="statusFilter = 'Rejected'"
          >
            Rejected
          </button>
          <button
            type="button"
            class="status-filter-pill status-filter-pill--approved"
            :class="{
              'status-filter-pill--active': statusFilter === 'Approved',
            }"
            @click="statusFilter = 'Approved'"
          >
            Approved
          </button>
          <span class="status-filters__divider" aria-hidden="true" />
          <button
            type="button"
            class="status-filter-pill status-filter-pill--cheque"
            :class="{ 'status-filter-pill--active': chequeFilter === 'issued' }"
            @click="chequeFilter = chequeFilter === 'issued' ? '' : 'issued'"
          >
            Cheque issued
          </button>
          <button
            type="button"
            class="status-filter-pill status-filter-pill--cheque-not"
            :class="{ 'status-filter-pill--active': chequeFilter === 'not_issued' }"
            @click="chequeFilter = chequeFilter === 'not_issued' ? '' : 'not_issued'"
          >
            Not issued
          </button>
        </div>
      </div>
    </header>

    <div v-if="loading" class="pdf-grid">
      <div v-for="i in 12" :key="i" class="pdf-tile pdf-tile--skeleton">
        <div class="pdf-thumb">
          <div class="pdf-thumb__page animate-pulse">
            <div class="pdf-thumb__top">
              <span class="pdf-thumb__tag">PDF</span>
              <span class="pdf-thumb__dot pdf-thumb__dot--neutral" />
            </div>
            <div class="pdf-thumb__title-line" />
            <div class="pdf-thumb__sub-line" />
            <div class="pdf-thumb__line pdf-thumb__line--w1" />
            <div class="pdf-thumb__line pdf-thumb__line--w2" />
            <div class="pdf-thumb__line pdf-thumb__line--w3" />
            <div class="pdf-thumb__line pdf-thumb__line--w4" />
          </div>
        </div>
      </div>
    </div>

    <div
      v-else-if="error"
      class="rounded-2xl bg-red-500/10 border border-red-500/20 px-5 py-4 text-[var(--label-size)] text-red-300"
    >
      {{ error }}
    </div>

    <div
      v-else-if="list.length === 0"
      class="glass rounded-2xl p-12 text-center"
    >
      <p class="text-[var(--color-text-muted)]">
        {{
          isConnected
            ? "No invoices yet."
            : "Connect to FileMaker to load invoices."
        }}
      </p>
    </div>

    <template v-else>
      <p v-if="filteredList.length === 0" class="invoices-empty-msg">
        No invoices match your {{ hasActiveFilters ? "filters" : "search" }}.
      </p>
      <div v-else class="pdf-grid">
        <router-link
          v-for="item in filteredList"
          :key="item.recordId"
          :to="{
            name: 'entry',
            query: {
              transRef:
                (item.fieldData as PayablesMainFieldData).TransRef ?? '',
              from: 'invoices',
            },
          }"
          class="pdf-tile"
        >
          <div
            class="pdf-thumb"
            :aria-label="`Open invoice ${String((item.fieldData as PayablesMainFieldData).TransRef ?? '').trim()}`"
          >
            <div class="pdf-thumb__page">
              <div class="pdf-thumb__top">
                <span class="pdf-thumb__tag">PDF</span>
                <div class="pdf-thumb__top-right">
                  <button
                    v-if="
                      canShowDownload(
                        (item.fieldData as PayablesMainFieldData).Status,
                      )
                    "
                    type="button"
                    class="pdf-thumb__download"
                    title="Download PDF"
                    aria-label="Download PDF"
                    :disabled="downloadingTransRef !== null"
                    @click.stop="onDownloadPdf((item.fieldData as PayablesMainFieldData).TransRef)"
                  >
                    <svg
                      v-if="
                        downloadingTransRef !==
                        ((item.fieldData as PayablesMainFieldData).TransRef ?? '')
                      "
                      class="pdf-thumb__download-icon"
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
                    <span
                      v-else
                      class="pdf-thumb__download-spinner"
                      aria-hidden="true"
                    />
                  </button>
                  <span
                    class="pdf-thumb__dot"
                    :class="
                      statusDotClass(
                        (item.fieldData as PayablesMainFieldData).Status,
                      )
                    "
                  />
                </div>
              </div>

              <div class="pdf-thumb__main">
                <div class="pdf-thumb__title">
                  {{ (item.fieldData as PayablesMainFieldData).TransRef || "—" }}
                </div>
                <div class="pdf-thumb__sub">
                  {{
                    (item.fieldData as PayablesMainFieldData).VendorName || "—"
                  }}
                </div>
                <div class="pdf-thumb__total">
                  {{ formatAmount(item.fieldData as PayablesMainFieldData) }}
                </div>
              </div>

              <div class="pdf-thumb__meta">
                <span
                  class="pdf-thumb__status"
                  :class="
                    statusPillClass(
                      (item.fieldData as PayablesMainFieldData).Status,
                    )
                  "
                >
                  {{ (item.fieldData as PayablesMainFieldData).Status || "—" }}
                </span>
                <div
                  v-if="
                    getChequeIssued(item.fieldData as PayablesMainFieldData) ===
                      'Yes'
                  "
                  class="pdf-thumb__cheque"
                >
                  <span class="pdf-thumb__cheque-label">Cheque issued</span>
                  <span class="pdf-thumb__cheque-value">
                    {{ getChequeDisplay(item.fieldData as PayablesMainFieldData) }}
                  </span>
                  <span
                    v-if="getChequeIssuedDateFormatted(item.fieldData as PayablesMainFieldData)"
                    class="pdf-thumb__cheque-date"
                  >
                    Issued {{ getChequeIssuedDateFormatted(item.fieldData as PayablesMainFieldData) }}
                  </span>
                </div>
              </div>

              <div class="pdf-thumb__footer">
                <div
                  class="pdf-thumb__icon"
                  :class="
                    statusIconClass(
                      (item.fieldData as PayablesMainFieldData).Status,
                    )
                  "
                  aria-hidden="true"
                >
                  <svg
                    class="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div class="pdf-thumb__lines">
                  <div class="pdf-thumb__line pdf-thumb__line--w1" />
                  <div class="pdf-thumb__line pdf-thumb__line--w2" />
                  <div class="pdf-thumb__line pdf-thumb__line--w3" />
                  <div class="pdf-thumb__line pdf-thumb__line--w4" />
                </div>
              </div>
            </div>
          </div>
        </router-link>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useFileMaker } from "../composables/useFileMaker";
import { LAYOUTS } from "../utils/filemakerApi";
import type { PayablesMainFieldData } from "../utils/filemakerApi";
import type { FindRecordWithId } from "../composables/useFileMaker";
import { formatNumberDisplay } from "../utils/formatNumber";
import { useToastStore } from "../stores/toastStore";
import { useDocumentSettingsStore } from "../stores/documentSettingsStore";
import { usePayableStore } from "../stores/payableStore";
import { usePdfDownload } from "../composables/usePdfDownload";

const { findRecordsWithIds, isConnected } = useFileMaker();
const documentSettings = useDocumentSettingsStore();
const toast = useToastStore();
const payableStore = usePayableStore();
const { buildAndDownloadPdf } = usePdfDownload();

const list = ref<FindRecordWithId<PayablesMainFieldData>[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const searchQuery = ref("");
const statusFilter = ref<"" | "Draft" | "Posted" | "Rejected" | "Approved">("");
const chequeFilter = ref<"" | "issued" | "not_issued">("");
/** TransRef of the invoice whose PDF is currently being downloaded. */
const downloadingTransRef = ref<string | null>(null);

const filteredList = computed(() => {
  let result = list.value;
  const status = statusFilter.value;
  if (status) {
    result = result.filter((item) => {
      const s = String(
        (item.fieldData as PayablesMainFieldData).Status ?? "",
      ).trim();
      return s === status;
    });
  }
  const cheque = chequeFilter.value;
  if (cheque) {
    result = result.filter((item) => {
      const issued = getChequeIssued(item.fieldData as PayablesMainFieldData);
      if (cheque === "issued") return issued === "Yes";
      return issued !== "Yes";
    });
  }
  const q = searchQuery.value.trim().toLowerCase();
  if (q) {
    result = result.filter((item) => {
      const fd = item.fieldData as PayablesMainFieldData;
      const refStr = String(fd.TransRef ?? "").toLowerCase();
      const vendor = String(fd.VendorName ?? "").toLowerCase();
      const statusStr = String(fd.Status ?? "").toLowerCase();
      const date = formatDate(fd.Date).toLowerCase();
      const amount = formatAmount(fd).toLowerCase();
      const curr = String(fd.Currency ?? "").toLowerCase();
      return (
        refStr.includes(q) ||
        vendor.includes(q) ||
        statusStr.includes(q) ||
        date.includes(q) ||
        amount.includes(q) ||
        curr.includes(q)
      );
    });
  }
  // Sort latest first (CreationTimestamp, then Date)
  return [...result].sort((a, b) => {
    const tsA =
      (a.fieldData as PayablesMainFieldData).CreationTimestamp ??
      (a.fieldData as PayablesMainFieldData).Date ??
      "";
    const tsB =
      (b.fieldData as PayablesMainFieldData).CreationTimestamp ??
      (b.fieldData as PayablesMainFieldData).Date ??
      "";
    const tA = new Date(tsA).getTime();
    const tB = new Date(tsB).getTime();
    const timeA = Number.isNaN(tA) ? 0 : tA;
    const timeB = Number.isNaN(tB) ? 0 : tB;
    return timeB - timeA;
  });
});

const hasActiveFilters = computed(
  () =>
    statusFilter.value !== "" ||
    chequeFilter.value !== "" ||
    searchQuery.value.trim() !== "",
);

function formatDate(value: string | undefined): string {
  if (!value) return "—";
  try {
    const d = new Date(value);
    return Number.isNaN(d.getTime())
      ? value
      : d.toLocaleDateString(undefined, {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
  } catch {
    return value;
  }
}

function formatAmount(fd: PayablesMainFieldData): string {
  const curr = (fd.Currency ?? "").toString().trim();
  const total = fd.Total;
  const formatted = formatNumberDisplay(total);
  if (!formatted) return "—";
  return curr ? `${curr} ${formatted}` : formatted;
}

function statusBadgeClass(status: string | undefined): string {
  const s = (status ?? "").toLowerCase();
  if (s === "draft") return "bg-amber-500/20 text-amber-400";
  if (s === "posted") return "bg-blue-500/20 text-blue-400";
  if (s === "rejected") return "bg-red-500/20 text-red-400";
  if (s === "approved") return "bg-emerald-500/20 text-emerald-400";
  return "bg-white/10 text-[var(--color-text-muted)]";
}

/** Status pill on light PDF thumb background (readable colors). */
function statusPillClass(status: string | undefined): string {
  const s = (status ?? "").toLowerCase();
  if (s === "draft") return "pdf-thumb__status--draft";
  if (s === "posted") return "pdf-thumb__status--posted";
  if (s === "rejected") return "pdf-thumb__status--rejected";
  if (s === "approved") return "pdf-thumb__status--approved";
  return "pdf-thumb__status--neutral";
}

function statusIconClass(status: string | undefined): string {
  const s = (status ?? "").toLowerCase();
  if (s === "draft") return "bg-amber-500/15 text-amber-400";
  if (s === "posted") return "bg-blue-500/15 text-blue-400";
  if (s === "rejected") return "bg-red-500/15 text-red-400";
  if (s === "approved") return "bg-emerald-500/15 text-emerald-400";
  return "bg-white/10 text-[var(--color-text-muted)]";
}

function canShowDownload(status: string | undefined): boolean {
  const when = documentSettings.invoiceDownloadWhen;
  if (when === "none") return false;
  const s = (status ?? "").trim();
  if (when === "approved_only") return s === "Approved";
  if (when === "once_posted") return s === "Posted" || s === "Approved";
  return false;
}

/** Load entry and download PDF directly from Invoices (no navigation). */
async function onDownloadPdf(transRef: string | undefined) {
  const ref = (transRef ?? "").trim();
  if (!ref || !isConnected.value) return;
  downloadingTransRef.value = ref;
  try {
    await payableStore.fetchDetailsByTransRef(ref);
    if (payableStore.error) {
      toast.error(payableStore.error);
      return;
    }
    if (!payableStore.mainPosted) {
      toast.error("Entry not found or not available for PDF download.");
      return;
    }
    const status = payableStore.mainStatus;
    const when = documentSettings.invoiceDownloadWhen;
    const allowed =
      when === "approved_only"
        ? status === "Approved"
        : when === "once_posted"
          ? status === "Posted" || status === "Approved"
          : false;
    if (!allowed) {
      toast.error("This entry is not available for PDF download with current settings.");
      return;
    }
    await buildAndDownloadPdf();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Download failed.";
    toast.error(msg);
  } finally {
    downloadingTransRef.value = null;
  }
}

function statusDotClass(status: string | undefined): string {
  const s = (status ?? "").toLowerCase();
  if (s === "draft") return "pdf-thumb__dot--draft";
  if (s === "posted") return "pdf-thumb__dot--posted";
  if (s === "rejected") return "pdf-thumb__dot--rejected";
  if (s === "approved") return "pdf-thumb__dot--approved";
  return "pdf-thumb__dot--neutral";
}

function getChequeIssued(fd: PayablesMainFieldData | Record<string, unknown>): string {
  const v =
    (fd as Record<string, unknown>).ChequeIssued ??
    (fd as Record<string, unknown>)?.["Cheque Issued"];
  return v != null && String(v).trim() !== "" ? String(v).trim() : "";
}

function getChequeIssuedDateFormatted(
  fd: PayablesMainFieldData | Record<string, unknown>,
): string {
  const date =
    (fd as Record<string, unknown>).ChequeIssuedDate ??
    (fd as Record<string, unknown>)?.["Cheque Issued Date"];
  const s = date != null && String(date).trim() ? String(date).trim() : "";
  if (!s) return "";
  try {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return s;
    return d.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return s;
  }
}

function getChequeDisplay(fd: PayablesMainFieldData | Record<string, unknown>): string {
  const bank =
    (fd as Record<string, unknown>).BankName ??
    (fd as Record<string, unknown>)?.["Bank Name"];
  const no =
    (fd as Record<string, unknown>).ChequeNo ??
    (fd as Record<string, unknown>)?.["Cheque No"];
  const bankStr = bank != null && String(bank).trim() ? String(bank).trim() : "";
  const noStr = no != null && String(no).trim() ? String(no).trim() : "";
  const parts: string[] = [];
  if (bankStr) parts.push(bankStr);
  if (noStr) parts.push(`#${noStr}`);
  return parts.length > 0 ? parts.join(" · ") : "—";
}

async function load() {
  if (!isConnected.value) {
    list.value = [];
    return;
  }
  loading.value = true;
  error.value = null;
  try {
    const res = await findRecordsWithIds<PayablesMainFieldData>(
      LAYOUTS.PAYABLES_MAIN,
      { limit: 500 },
    );
    if (res.error) {
      toast.error(res.error);
      list.value = [];
    } else {
      list.value = res.data;
    }
  } finally {
    loading.value = false;
  }
}

onMounted(load);
watch(isConnected, (connected) => {
  if (connected) load();
});
</script>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.invoices-toolbar {
  margin-top: 1.25rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
}

.invoice-search-wrap {
  flex: 1;
  min-width: 200px;
  max-width: 360px;
}

.invoice-search {
  display: flex;
  align-items: center;
  position: relative;
}

.invoice-search__icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.125rem;
  height: 1.125rem;
  color: var(--color-text-muted);
  pointer-events: none;
}

.invoice-search__input {
  width: 100%;
  padding: 0.625rem 2.25rem 0.625rem 2.5rem;
  font-size: var(--input-size);
  color: var(--color-text);
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  outline: none;
  transition:
    border-color 0.2s var(--ease),
    box-shadow 0.2s var(--ease);
}

.invoice-search__input::placeholder {
  color: var(--color-text-muted);
}

.invoice-search__input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-soft);
}

.invoice-search__clear {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.375rem;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition:
    color 0.2s var(--ease),
    background 0.2s var(--ease);
}

.invoice-search__clear:hover {
  color: var(--color-text);
  background: rgba(255, 255, 255, 0.08);
}

.status-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.status-filters__label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text-muted);
  margin-right: 0.25rem;
}

.status-filters__divider {
  width: 1px;
  height: 1.25rem;
  background: rgba(148, 163, 184, 0.3);
  margin: 0 0.25rem;
}

.status-filter-pill {
  padding: 0.35rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 500;
  border-radius: 9999px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition:
    border-color 0.2s var(--ease),
    background 0.2s var(--ease),
    color 0.2s var(--ease);
}

.status-filter-pill:hover {
  border-color: rgba(148, 163, 184, 0.4);
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text);
}

.status-filter-pill--active {
  border-color: var(--color-accent);
  background: var(--color-accent-soft);
  color: var(--color-accent);
}

.status-filter-pill--draft.status-filter-pill--active {
  border-color: rgba(251, 191, 36, 0.8);
  background: rgba(251, 191, 36, 0.15);
  color: rgb(251, 191, 36);
}
.status-filter-pill--posted.status-filter-pill--active {
  border-color: rgba(59, 130, 246, 0.8);
  background: rgba(59, 130, 246, 0.15);
  color: rgb(147, 197, 253);
}
.status-filter-pill--rejected.status-filter-pill--active {
  border-color: rgba(239, 68, 68, 0.8);
  background: rgba(239, 68, 68, 0.15);
  color: rgb(248, 113, 113);
}
.status-filter-pill--approved.status-filter-pill--active {
  border-color: rgba(52, 211, 153, 0.8);
  background: rgba(52, 211, 153, 0.15);
  color: rgb(110, 231, 183);
}

.status-filter-pill--cheque.status-filter-pill--active {
  border-color: rgba(52, 211, 153, 0.8);
  background: rgba(52, 211, 153, 0.15);
  color: rgb(110, 231, 183);
}

.status-filter-pill--cheque-not.status-filter-pill--active {
  border-color: rgba(148, 163, 184, 0.5);
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-text-muted);
}

.invoices-empty-msg {
  margin: 0 0 1rem;
  font-size: 0.9375rem;
  color: var(--color-text-muted);
}

/* Thumbnail-only PDF grid */
.pdf-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
  align-items: start;
}

.pdf-tile {
  text-decoration: none;
  color: inherit;
  display: block;
}

/* PDF thumbnail-style preview (tile) */
.pdf-thumb {
  width: 100%;
  max-width: 340px;
  margin-inline: auto;
  aspect-ratio: 3 / 4;
  padding: 14px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(148, 163, 184, 0.14);
  backdrop-filter: blur(var(--blur-glass));
  -webkit-backdrop-filter: blur(var(--blur-glass));
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.22);
  transition:
    transform 0.2s var(--ease),
    box-shadow 0.2s var(--ease),
    border-color 0.2s var(--ease),
    background 0.2s var(--ease);
}

.pdf-tile:hover .pdf-thumb {
  transform: translateY(-3px);
  border-color: rgba(148, 163, 184, 0.22);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.28);
}

.pdf-tile:focus-visible .pdf-thumb {
  outline: none;
  box-shadow:
    var(--focus-ring),
    0 18px 44px rgba(0, 0, 0, 0.28);
}

.pdf-thumb__page {
  height: 100%;
  border-radius: 16px;
  background: rgba(248, 250, 252, 0.92);
  border: 1px solid rgba(15, 23, 42, 0.12);
  overflow: hidden;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pdf-thumb__main {
  flex: 0 0 auto;
  min-width: 0;
}

.pdf-thumb__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.pdf-thumb__top-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pdf-thumb__download {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  color: rgba(59, 130, 246, 0.9);
}

.pdf-thumb__download:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.pdf-thumb__download-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.pdf-thumb__download-spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-top-color: rgba(59, 130, 246, 0.9);
  border-radius: 50%;
  animation: pdf-thumb-spin 0.7s linear infinite;
}

@keyframes pdf-thumb-spin {
  to { transform: rotate(360deg); }
}

.pdf-thumb__tag {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: rgba(239, 68, 68, 0.95);
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.22);
  padding: 3px 8px;
  border-radius: 9999px;
}

.pdf-thumb__dot {
  width: 10px;
  height: 10px;
  border-radius: 9999px;
  box-shadow: 0 0 0 2px rgba(15, 23, 42, 0.06);
}
.pdf-thumb__dot--draft {
  background: rgb(251, 191, 36);
}
.pdf-thumb__dot--posted {
  background: rgb(59, 130, 246);
}
.pdf-thumb__dot--rejected {
  background: rgb(239, 68, 68);
}
.pdf-thumb__dot--approved {
  background: rgb(52, 211, 153);
}
.pdf-thumb__dot--neutral {
  background: rgb(148, 163, 184);
}

.pdf-thumb__icon {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pdf-thumb__icon svg {
  width: 1.375rem;
  height: 1.375rem;
}

.pdf-thumb__title {
  font-size: 1.0625rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.25;
  color: rgba(15, 23, 42, 0.94);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pdf-thumb__sub {
  font-size: 0.9375rem;
  font-weight: 500;
  color: rgba(15, 23, 42, 0.65);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}

.pdf-thumb__total {
  font-size: 1rem;
  font-weight: 700;
  color: rgba(15, 23, 42, 0.9);
  margin-top: 6px;
  letter-spacing: -0.01em;
}

.pdf-thumb__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px 10px;
  margin-top: 2px;
}

.pdf-thumb__footer {
  margin-top: auto;
  padding-top: 8px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-height: 0;
}

.pdf-thumb__lines {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  justify-content: center;
}

.pdf-thumb__status {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
}
.pdf-thumb__status--draft {
  background: rgba(251, 191, 36, 0.2);
  color: rgb(180, 83, 9);
}
.pdf-thumb__status--posted {
  background: rgba(59, 130, 246, 0.2);
  color: rgb(29, 78, 216);
}
.pdf-thumb__status--rejected {
  background: rgba(239, 68, 68, 0.2);
  color: rgb(185, 28, 28);
}
.pdf-thumb__status--approved {
  background: rgba(52, 211, 153, 0.2);
  color: rgb(6, 95, 70);
}
.pdf-thumb__status--neutral {
  background: rgba(15, 23, 42, 0.08);
  color: rgba(15, 23, 42, 0.6);
}

.pdf-thumb__cheque {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
  padding: 3px 6px;
  border-radius: 6px;
  background: rgba(52, 211, 153, 0.15);
  border: 1px solid rgba(52, 211, 153, 0.3);
}
.pdf-thumb__cheque-label {
  font-size: 0.5625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgb(6, 95, 70);
}
.pdf-thumb__cheque-value {
  font-size: 0.6875rem;
  font-weight: 600;
  color: rgba(15, 23, 42, 0.85);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 8rem;
}
.pdf-thumb__cheque-date {
  display: block;
  font-size: 0.5625rem;
  font-weight: 500;
  color: rgb(6, 95, 70);
  margin-top: 2px;
}

.pdf-thumb__title-line,
.pdf-thumb__sub-line {
  height: 12px;
  border-radius: 9999px;
  background: rgba(15, 23, 42, 0.1);
}
.pdf-thumb__title-line {
  width: 86%;
}
.pdf-thumb__sub-line {
  width: 68%;
}

.pdf-thumb__line {
  height: 8px;
  border-radius: 9999px;
  background: rgba(15, 23, 42, 0.1);
}
.pdf-thumb__line--w1 {
  width: 92%;
}
.pdf-thumb__line--w2 {
  width: 78%;
}
.pdf-thumb__line--w3 {
  width: 88%;
}
.pdf-thumb__line--w4 {
  width: 64%;
}
.pdf-tile--skeleton {
  pointer-events: none;
}
</style>
