<template>
  <div
    class="content-area flex flex-col flex-1 min-h-0 w-full max-w-[1600px] mx-auto px-4 py-5 md:px-6 md:py-6 min-h-[400px]"
  >
    <header class="mb-6">
      <router-link
        to="/settings"
        class="inline-flex items-center gap-2 text-[var(--label-size)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] no-underline mb-4 transition-colors"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Settings
      </router-link>
      <h1
        class="text-[1.75rem] font-bold tracking-tight text-[var(--color-text)] md:text-[2rem]"
        style="letter-spacing: -0.025em; line-height: 1.2"
      >
        Activity Logs
      </h1>
      <p class="mt-1 text-[13px] text-[var(--color-text-muted)]">
        View audit trail of Created, Edited, Posted, Rejected, Approved, and Reposted events.
      </p>
    </header>

    <!-- Search and filter row -->
    <div
      v-if="!loading && !loadError && logList.length > 0"
      class="logs-toolbar"
    >
      <div class="tax-search-bar__row logs-toolbar__search">
        <div
          class="search-bar__wrap tax-search-bar__search"
          :class="{ 'search-bar__wrap--has-value': searchQuery }"
        >
          <span class="search-bar__icon" aria-hidden="true">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            v-model.trim="searchQuery"
            type="search"
            class="search-bar__input"
            placeholder="Search by TransRef, Actor…"
            autocomplete="off"
            aria-label="Search logs"
          />
          <button
            v-if="searchQuery"
            type="button"
            class="search-bar__clear"
            aria-label="Clear search"
            @click="searchQuery = ''"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="tax-search-bar__filter-wrap">
          <span class="tax-search-bar__filter-icon" aria-hidden="true">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </span>
          <select
            v-model="actionFilter"
            class="tax-search-bar__filter"
            aria-label="Filter by action"
          >
            <option value="">All actions</option>
            <option v-for="a in ACTION_OPTIONS" :key="a" :value="a">{{ a }}</option>
          </select>
          <span class="tax-search-bar__filter-chevron" aria-hidden="true">
            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>
        <div class="logs-date-range">
          <div class="logs-date-range__icon" aria-hidden="true">
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div class="logs-date-range__inputs">
            <label for="logs-date-from" class="logs-date-range__field">
              <span class="logs-date-range__label">From</span>
              <input
                id="logs-date-from"
                v-model="dateFrom"
                type="date"
                class="logs-date-range__input"
                aria-label="Filter by date from"
              />
            </label>
            <span class="logs-date-range__sep" aria-hidden="true">→</span>
            <label for="logs-date-to" class="logs-date-range__field">
              <span class="logs-date-range__label">To</span>
              <input
                id="logs-date-to"
                v-model="dateTo"
                type="date"
                class="logs-date-range__input"
                aria-label="Filter by date to"
              />
            </label>
          </div>
          <button
            v-if="dateFrom || dateTo"
            type="button"
            class="logs-date-range__clear"
            aria-label="Clear date range"
            @click="dateFrom = ''; dateTo = ''"
          >
            <svg
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="logs-toolbar__export">
          <button
            type="button"
            class="logs-export-btn"
            :disabled="filteredLogList.length === 0 || exporting"
            aria-label="Export to Excel"
            @click="exportToExcel"
          >
            <svg class="logs-export-btn__icon" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Excel
          </button>
          <button
            type="button"
            class="logs-export-btn"
            :disabled="filteredLogList.length === 0 || exporting"
            aria-label="Export to PDF"
            @click="exportToPdf"
          >
            <svg class="logs-export-btn__icon" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            PDF
          </button>
        </div>
      </div>
    </div>
    <p
      v-if="!loading && !loadError && logList.length > 0 && (searchQuery || actionFilter || dateFrom || dateTo)"
      class="tax-search-bar__hint mb-4"
    >
      {{ filteredLogList.length }} result{{ filteredLogList.length === 1 ? '' : 's' }}
    </p>

    <div class="logs-table-wrap">
      <template v-if="loading">
        <div class="tax-table-skeleton">
          <table class="tax-table">
            <thead>
              <tr>
                <th><Skeleton width="6rem" height="0.875rem" class="rounded" /></th>
                <th><Skeleton width="5rem" height="0.875rem" class="rounded" /></th>
                <th><Skeleton width="8rem" height="0.875rem" class="rounded" /></th>
                <th><Skeleton width="10rem" height="0.875rem" class="rounded" /></th>
                <th><Skeleton width="12rem" height="0.875rem" class="rounded" /></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="i in 8" :key="i" class="tax-table-skeleton__row">
                <td><Skeleton width="70%" height="0.875rem" class="rounded max-w-[8rem]" /></td>
                <td><Skeleton width="4rem" height="0.875rem" class="rounded" /></td>
                <td><Skeleton width="60%" height="0.875rem" class="rounded max-w-[10rem]" /></td>
                <td><Skeleton width="80%" height="0.875rem" class="rounded max-w-[12rem]" /></td>
                <td><Skeleton width="50%" height="0.875rem" class="rounded max-w-[14rem]" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
      <div v-else-if="loadError" class="tax-table-error">
        {{ loadError }}
      </div>
      <div v-else-if="!isConnected" class="tax-table-empty">
        <p>Connect to FileMaker to view activity logs.</p>
      </div>
      <div v-else-if="logList.length === 0" class="tax-table-empty">
        <p>No activity logs yet.</p>
      </div>
      <div v-else-if="filteredLogList.length === 0" class="tax-table-empty">
        <p>No matching logs.</p>
        <button
          type="button"
          class="pill-btn mt-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          @click="searchQuery = ''; actionFilter = ''; dateFrom = ''; dateTo = ''"
        >
          Clear filters
        </button>
      </div>
      <div v-else class="logs-table-body">
        <div class="tax-table-scroll logs-table-scroll">
          <table class="tax-table logs-table">
            <thead>
              <tr>
                <th>TransRef</th>
                <th>Action</th>
                <th>Actor</th>
                <th>Timestamp</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, index) in filteredLogList"
                :key="row.recordId || index"
              >
                <td>
                  <router-link
                    v-if="getField(row, 'TransRef')"
                    :to="{ name: 'entry', query: { transRef: getField(row, 'TransRef'), from: 'settings-logs' } }"
                    class="text-[var(--color-accent)] hover:underline no-underline"
                  >
                    {{ getField(row, 'TransRef') }}
                  </router-link>
                  <span v-else>—</span>
                </td>
                <td>
                  <span
                    class="action-badge"
                    :class="getActionBadgeClass(getField(row, 'Action'))"
                    :title="getField(row, 'Action')"
                  >
                    {{ getField(row, 'Action') || '—' }}
                  </span>
                </td>
                <td>{{ getField(row, 'Actor') || '—' }}</td>
                <td>{{ formatTimestamp(getField(row, 'Timestamp')) }}</td>
                <td class="max-w-[200px] truncate" :title="getField(row, 'Reason')">
                  {{ getField(row, 'Reason') || '—' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useFileMaker } from "../composables/useFileMaker";
import { LAYOUTS } from "../utils/filemakerApi";
import type {
  PayablesActivityLogFieldData,
  PayablesUsersFieldData,
} from "../utils/filemakerApi";
import type { FindRecordWithId } from "../composables/useFileMaker";
import Skeleton from "../components/Skeleton.vue";
import { useToastStore } from "../stores/toastStore";
import { useActivityLogOverviewStore } from "../stores/activityLogOverviewStore";

const ACTION_OPTIONS = [
  "Created",
  "Edited",
  "Posted",
  "Rejected",
  "Approved",
  "Reposted",
  "EditRequested",
  "EditAllowed",
] as const;

const router = useRouter();
const toast = useToastStore();
const activityLogOverview = useActivityLogOverviewStore();
const {
  isConnected,
  loggedInEmail,
  findRecordsWithIds,
  findRecordsByQueryWithIds,
} = useFileMaker();

const logList = ref<FindRecordWithId<PayablesActivityLogFieldData>[]>([]);
const loading = ref(true);
const loadError = ref<string | null>(null);
const searchQuery = ref("");
const actionFilter = ref("");
const dateFrom = ref("");
const dateTo = ref("");
const exporting = ref(false);

function getField(
  row: PayablesActivityLogFieldData | { fieldData?: PayablesActivityLogFieldData },
  key: string
): string {
  const fd =
    "fieldData" in row ? row.fieldData : (row as PayablesActivityLogFieldData);
  if (!fd) return "";
  const v =
    (fd as Record<string, unknown>)[key] ??
    (fd as Record<string, unknown>)[
      key.replace(/([A-Z])/g, " $1").trim()
    ] ??
    (fd as Record<string, unknown>)[
      key.charAt(0).toLowerCase() + key.slice(1)
    ];
  if (v == null || v === "") return "";
  return String(v).trim();
}

function formatTimestamp(val: string): string {
  if (!val || val === "—") return "—";
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return val;
  return d.toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function getActionBadgeClass(action: string): string {
  const a = action.toLowerCase();
  if (a === "created") return "action-badge--created";
  if (a === "edited") return "action-badge--edited";
  if (a === "posted" || a === "reposted") return "action-badge--posted";
  if (a === "rejected") return "action-badge--rejected";
  if (a === "approved") return "action-badge--approved";
  if (a === "editrequested") return "action-badge--posted";
  if (a === "editallowed") return "action-badge--approved";
  return "";
}

function parseTimestampToDate(val: string): Date | null {
  if (!val || val === "—") return null;
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? null : d;
}

const filteredLogList = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  const action = actionFilter.value.trim();
  const from = dateFrom.value.trim();
  const to = dateTo.value.trim();
  let list = logList.value;
  if (action) {
    list = list.filter((r) => {
      const a = getField(r, "Action").toLowerCase();
      return a === action.toLowerCase();
    });
  }
  if (q) {
    list = list.filter((r) => {
      const transRef = getField(r, "TransRef").toLowerCase();
      const actor = getField(r, "Actor").toLowerCase();
      return transRef.includes(q) || actor.includes(q);
    });
  }
  if (from || to) {
    list = list.filter((r) => {
      const ts = parseTimestampToDate(getField(r, "Timestamp"));
      if (!ts) return false;
      const t = ts.getTime();
      if (from) {
        const fromDate = new Date(from);
        fromDate.setHours(0, 0, 0, 0);
        if (t < fromDate.getTime()) return false;
      }
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        if (t > toDate.getTime()) return false;
      }
      return true;
    });
  }
  return list;
});

function getExportRows(): string[][] {
  const headers = ["TransRef", "Action", "Actor", "Timestamp", "Reason"];
  const rows = filteredLogList.value.map((r) => [
    getField(r, "TransRef") || "—",
    getField(r, "Action") || "—",
    getField(r, "Actor") || "—",
    formatTimestamp(getField(r, "Timestamp")),
    getField(r, "Reason") || "—",
  ]);
  return [headers, ...rows];
}

async function exportToExcel() {
  if (filteredLogList.value.length === 0) return;
  exporting.value = true;
  try {
    const XLSX = await import("xlsx");
    const rows = getExportRows();
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Activity Logs");
    const filename = `activity-logs-${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, filename);
    toast.success("Excel file downloaded.");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Excel export failed.";
    toast.error(msg);
  } finally {
    exporting.value = false;
  }
}

async function exportToPdf() {
  if (filteredLogList.value.length === 0) return;
  exporting.value = true;
  try {
    const [pdfMakeModule, vfsModule] = await Promise.all([
      import("pdfmake/build/pdfmake"),
      import("pdfmake/build/vfs_fonts"),
    ]);
    const pdfMake = (pdfMakeModule as { default: unknown }).default as {
      createPdf: (def: unknown) => { download: (name: string) => void };
      addVirtualFileSystem?: (vfs: Record<string, string>) => void;
    };
    const vfs = (vfsModule as { default: Record<string, string> }).default;
    if (pdfMake.addVirtualFileSystem && vfs) {
      pdfMake.addVirtualFileSystem(vfs);
    }
    const rows = getExportRows();
    const [headerRow, ...dataRows] = rows;
    const body = [
      headerRow.map((cell) => ({ text: cell, style: "tableHeader", fillColor: "#1e293b" })),
      ...dataRows.map((row) => row.map((cell) => ({ text: cell, style: "tableCell" }))),
    ];
    const docDefinition = {
      pageSize: "A4" as const,
      pageOrientation: "landscape" as const,
      pageMargins: [40, 40, 40, 60],
      defaultStyle: { fontSize: 9 },
      styles: {
        tableHeader: { bold: true, color: "#f1f5f9" },
        tableCell: {},
      },
      content: [
        { text: "Activity Logs", fontSize: 16, bold: true, margin: [0, 0, 0, 12] },
        {
          table: {
            headerRows: 1,
            widths: ["*", "auto", "*", "auto", "*"],
            body,
          },
          layout: "lightHorizontalLines",
        },
      ],
      footer: (currentPage: number, pageCount: number) => ({
        margin: [40, 8, 40, 0],
        text: `Page ${currentPage} of ${pageCount}`,
        fontSize: 8,
        alignment: "center" as const,
      }),
    };
    const filename = `activity-logs-${new Date().toISOString().slice(0, 10)}.pdf`;
    pdfMake.createPdf(docDefinition).download(filename);
    toast.success("PDF downloaded.");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "PDF export failed.";
    toast.error(msg);
  } finally {
    exporting.value = false;
  }
}

async function loadLogs() {
  if (!isConnected.value) {
    loading.value = false;
    activityLogOverview.setLogCount(0);
    return;
  }
  loading.value = true;
  loadError.value = null;
  try {
    const { data, error } = await findRecordsWithIds<PayablesActivityLogFieldData>(
      LAYOUTS.PAYABLES_ACTIVITY_LOG,
      {
        limit: 500,
        sort: JSON.stringify([
          { fieldName: "Timestamp", sortOrder: "descend" },
        ]),
      }
    );
    if (error) {
      loadError.value = error;
      logList.value = [];
      activityLogOverview.setLogCount(0);
    } else {
      logList.value = (data ?? []).map((r) => ({
        recordId: r.recordId,
        fieldData: r.fieldData,
      }));
      activityLogOverview.setLogCount(logList.value.length);
    }
  } catch (e) {
    loadError.value =
      e instanceof Error ? e.message : "Failed to load activity logs.";
    logList.value = [];
    activityLogOverview.setLogCount(0);
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  const email = loggedInEmail.value;
  if (email && isConnected.value) {
    const { data } = await findRecordsByQueryWithIds<PayablesUsersFieldData>(
      LAYOUTS.PAYABLES_USERS,
      { Email: email },
      1
    );
    const role = (data?.[0]?.fieldData?.Role ?? "")
      .toString()
      .trim()
      .toLowerCase();
    if (role === "officer") {
      router.replace("/settings");
      return;
    }
  }
  loadLogs();
});

watch(isConnected, (connected) => {
  if (connected) loadLogs();
});
</script>

<style scoped>
.action-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.625rem;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  border-radius: 9999px;
  border: 1px solid transparent;
  white-space: nowrap;
}

.action-badge--created {
  background: rgba(59, 130, 246, 0.15);
  color: #93c5fd;
  border-color: rgba(59, 130, 246, 0.35);
}

.action-badge--edited {
  background: rgba(251, 191, 36, 0.12);
  color: #fde047;
  border-color: rgba(251, 191, 36, 0.3);
}

.action-badge--posted {
  background: rgba(34, 197, 94, 0.12);
  color: #86efac;
  border-color: rgba(34, 197, 94, 0.3);
}

.action-badge--rejected {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
  border-color: rgba(239, 68, 68, 0.35);
}

.action-badge--approved {
  background: rgba(34, 197, 94, 0.18);
  color: #86efac;
  border-color: rgba(34, 197, 94, 0.45);
  font-weight: 700;
}

.action-badge:not([class*="action-badge--"]) {
  background: rgba(148, 163, 184, 0.1);
  color: var(--color-text-muted);
  border-color: rgba(148, 163, 184, 0.2);
}

.logs-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem 1rem;
  margin-bottom: 1rem;
}

.logs-toolbar__search {
  flex: 1 1 auto;
  min-width: 0;
}

/* Date range: same design as InvoicesView */
.logs-date-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  background: rgba(30, 41, 59, 0.5);
  backdrop-filter: blur(var(--blur-glass));
  -webkit-backdrop-filter: blur(var(--blur-glass));
  min-width: 280px;
  transition:
    border-color 0.2s var(--ease),
    box-shadow 0.2s var(--ease);
}

.logs-date-range:focus-within {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-soft);
}

.logs-date-range__icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
}

.logs-date-range__inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
}

.logs-date-range__field {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  cursor: pointer;
}

.logs-date-range__label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.logs-date-range__input {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  border-radius: 8px;
  border: 1px solid transparent;
  background: rgba(15, 23, 42, 0.4);
  color: var(--color-text);
  min-width: 110px;
  color-scheme: dark;
  transition:
    border-color 0.2s var(--ease),
    background 0.2s var(--ease);
}

.logs-date-range__input:hover {
  background: rgba(15, 23, 42, 0.6);
}

.logs-date-range__input:focus {
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(15, 23, 42, 0.6);
  outline: none;
}

.logs-date-range__sep {
  flex-shrink: 0;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.logs-date-range__clear {
  flex-shrink: 0;
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

.logs-date-range__clear:hover {
  color: var(--color-text);
  background: rgba(255, 255, 255, 0.08);
}

.logs-toolbar__export {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.logs-export-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: var(--label-size);
  font-weight: 500;
  color: var(--color-text);
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.logs-export-btn:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.15);
  border-color: var(--color-accent);
}

.logs-export-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.logs-export-btn__icon {
  flex-shrink: 0;
}

.logs-table-wrap {
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border-radius: 14px;
  overflow: hidden;
  background: var(--color-bg-card);
  backdrop-filter: blur(var(--blur-glass));
  -webkit-backdrop-filter: blur(var(--blur-glass));
  border: 1px solid var(--color-border);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.logs-table-body {
  flex: 1 1 0;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.logs-table-scroll {
  overflow: auto;
  flex: 1 1 0;
  min-height: 0;
}

/* Sticky table header - opaque so content doesn't show through when scrolling */
.logs-table thead th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: rgb(30, 41, 59);
  border-bottom: 1px solid var(--color-border);
  box-shadow: 0 1px 0 var(--color-border);
}
</style>
