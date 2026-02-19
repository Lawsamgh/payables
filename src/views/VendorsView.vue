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
          Vendors
        </h1>
      </div>
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
        Add Vendor
      </button>
    </header>

    <p class="text-[var(--label-size)] text-[var(--color-text-muted)] mb-4">
      Manage vendors here. View, add, and edit vendor details.
    </p>

    <!-- Search -->
    <div
      v-if="!loading && !loadError && vendorList.length > 0"
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
            placeholder="Search vendors…"
            autocomplete="off"
            aria-label="Search vendors"
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
        {{ filteredVendorList.length }} result{{
          filteredVendorList.length === 1 ? "" : "s"
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
                <th>
                  <Skeleton width="5rem" height="0.875rem" class="rounded" />
                </th>
                <th>
                  <Skeleton width="6rem" height="0.875rem" class="rounded" />
                </th>
                <th>
                  <Skeleton width="4rem" height="0.875rem" class="rounded" />
                </th>
                <th>
                  <Skeleton width="4.5rem" height="0.875rem" class="rounded" />
                </th>
                <th>
                  <Skeleton width="4rem" height="0.875rem" class="rounded" />
                </th>
                <th>
                  <Skeleton width="4rem" height="0.875rem" class="rounded" />
                </th>
                <th class="tax-table__actions-th">
                  <Skeleton width="2.5rem" height="0.875rem" class="rounded" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="i in 6" :key="i" class="tax-table-skeleton__row">
                <td>
                  <Skeleton width="4rem" height="0.875rem" class="rounded" />
                </td>
                <td>
                  <Skeleton
                    width="70%"
                    height="0.875rem"
                    class="rounded max-w-[8rem]"
                  />
                </td>
                <td>
                  <Skeleton width="5rem" height="0.875rem" class="rounded" />
                </td>
                <td>
                  <Skeleton width="4rem" height="0.875rem" class="rounded" />
                </td>
                <td>
                  <Skeleton width="3rem" height="0.875rem" class="rounded" />
                </td>
                <td>
                  <Skeleton width="3rem" height="0.875rem" class="rounded" />
                </td>
                <td class="tax-table__actions-td">
                  <Skeleton
                    width="3.5rem"
                    height="1.75rem"
                    class="rounded-lg"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
      <div v-else-if="loadError" class="tax-table-error">
        {{ loadError }}
      </div>
      <div v-else-if="vendorList.length === 0" class="tax-table-empty">
        <p>No vendors yet.</p>
        <button
          type="button"
          class="pill-btn mt-2 inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2.5 text-[var(--label-size)] font-semibold text-white shadow-md hover:bg-orange-600 transition-colors"
          @click="showAddModal = true"
        >
          Add your first vendor
        </button>
      </div>
      <div v-else-if="filteredVendorList.length === 0" class="tax-table-empty">
        <p>{{ searchQuery ? "No matching vendors." : "No vendors yet." }}</p>
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
                <th>Vendor ID</th>
                <th>Vendor Name</th>
                <th>Location</th>
                <th>Email</th>
                <th>Tin Number</th>
                <th>GRA Expiry</th>
                <th>Expiry Check</th>
                <th>WHT Expiry</th>
                <th>WHT Expiry Check</th>
                <th class="tax-table__actions-th"></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, index) in vendorListToShow"
                :key="row.recordId || index"
              >
              <td>{{ getField(row, "Vendor_ID") }}</td>
              <td>{{ getField(row, "Vendor_Name") }}</td>
              <td>{{ getField(row, "Vendor_Location") }}</td>
              <td>{{ getField(row, "Vendor_Email") }}</td>
              <td>{{ getField(row, "Tin_Number") }}</td>
              <td>{{ formatDate(getField(row, "GRA_Expiry_Date")) }}</td>
              <td>
                <span
                  class="tax-table__status tax-table__status--with-icon"
                  :class="expiryCheckStatusClass(getField(row, 'Expiry_Check'))"
                >
                  <svg
                    v-if="expiryCheckStatusClass(getField(row, 'Expiry_Check')) === 'tax-table__status--valid'"
                    class="tax-table__status-icon"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <svg
                    v-else-if="expiryCheckStatusClass(getField(row, 'Expiry_Check')) === 'tax-table__status--expired'"
                    class="tax-table__status-icon"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 9l-6 6M9 9l6 6" />
                  </svg>
                  <span class="tax-table__status-badge">{{
                    getField(row, "Expiry_Check")
                  }}</span>
                </span>
              </td>
              <td>{{ formatDate(getField(row, "WHT_Expiry_Date")) }}</td>
              <td>
                <span
                  class="tax-table__status tax-table__status--with-icon"
                  :class="expiryCheckStatusClass(getField(row, 'WHT_Expiry_Check'))"
                >
                  <svg
                    v-if="expiryCheckStatusClass(getField(row, 'WHT_Expiry_Check')) === 'tax-table__status--valid'"
                    class="tax-table__status-icon"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <svg
                    v-else-if="expiryCheckStatusClass(getField(row, 'WHT_Expiry_Check')) === 'tax-table__status--expired'"
                    class="tax-table__status-icon"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 9l-6 6M9 9l6 6" />
                  </svg>
                  <span class="tax-table__status-badge">{{
                    getField(row, "WHT_Expiry_Check")
                  }}</span>
                </span>
              </td>
              <td class="tax-table__actions-td">
                <button
                  type="button"
                  class="tax-table__edit-btn"
                  aria-label="Edit"
                  @click="openEdit(row)"
                >
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        </div>
        <div v-if="totalPagesVendor > 1" class="pagination">
          <button
            type="button"
            class="pagination__btn"
            :disabled="currentPageVendor <= 1"
            aria-label="Previous page"
            @click="currentPageVendor = Math.max(1, currentPageVendor - 1)"
          >
            <svg class="pagination__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span class="pagination__label">
            Page {{ currentPageVendor }} of {{ totalPagesVendor }}
          </span>
          <button
            type="button"
            class="pagination__btn"
            :disabled="currentPageVendor >= totalPagesVendor"
            aria-label="Next page"
            @click="currentPageVendor = Math.min(totalPagesVendor, currentPageVendor + 1)"
          >
            <svg class="pagination__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Add / Edit Vendor modal -->
    <Teleport to="body">
      <div v-if="showAddModal" class="tax-modal-backdrop">
        <div
          class="tax-modal vendor-modal"
          role="dialog"
          :aria-labelledby="
            editingRecordId ? 'edit-vendor-title' : 'add-vendor-title'
          "
          aria-modal="true"
        >
          <header class="tax-modal__header">
            <h2
              :id="editingRecordId ? 'edit-vendor-title' : 'add-vendor-title'"
              class="tax-modal__title"
            >
              {{ editingRecordId ? "Edit Vendor" : "Add Vendor" }}
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
              <h3 class="tax-modal__section-title">Basic details</h3>
              <label class="tax-modal__label">
                <span>Vendor ID</span>
                <input
                  v-model="form.Vendor_ID"
                  type="text"
                  class="glass-input w-full px-3 py-2.5 rounded-lg"
                  placeholder="Vendor ID"
                />
              </label>
              <label class="tax-modal__label">
                <span>Vendor Name</span>
                <input
                  v-model="form.Vendor_Name"
                  type="text"
                  class="glass-input w-full px-3 py-2.5 rounded-lg"
                  placeholder="Vendor name"
                  required
                />
              </label>
              <label class="tax-modal__label">
                <span>Vendor Location</span>
                <input
                  v-model="form.Vendor_Location"
                  type="text"
                  class="glass-input w-full px-3 py-2.5 rounded-lg"
                  placeholder="Location"
                />
              </label>
              <label class="tax-modal__label">
                <span>Vendor Email</span>
                <input
                  v-model="form.Vendor_Email"
                  type="email"
                  class="glass-input w-full px-3 py-2.5 rounded-lg"
                  placeholder="email@example.com"
                />
              </label>
              <label class="tax-modal__label">
                <span>Tin Number</span>
                <input
                  v-model="form.Tin_Number"
                  type="text"
                  class="glass-input w-full px-3 py-2.5 rounded-lg"
                  placeholder="TIN"
                />
              </label>
            </section>
            <section class="tax-modal__section">
              <h3 class="tax-modal__section-title">Dates</h3>
              <div class="tax-modal__row">
                <label class="tax-modal__label">
                  <span>GRA Expiry Date</span>
                  <input
                    v-model="form.GRA_Expiry_Date"
                    type="date"
                    class="glass-input w-full px-3 py-2.5 rounded-lg"
                  />
                </label>
                <label class="tax-modal__label">
                  <span>Received Date</span>
                  <input
                    v-model="form.Received_Date"
                    type="date"
                    class="glass-input w-full px-3 py-2.5 rounded-lg"
                  />
                </label>
              </div>
              <div class="tax-modal__row">
                <label class="tax-modal__label">
                  <span>WHT Expiry Date</span>
                  <input
                    v-model="form.WHT_Expiry_Date"
                    type="date"
                    class="glass-input w-full px-3 py-2.5 rounded-lg"
                  />
                </label>
                <label class="tax-modal__label">
                  <span>Received WHT Date</span>
                  <input
                    v-model="form.Received_WHT_Date"
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
                {{
                  saving ? "Saving…" : editingRecordId ? "Save" : "Add Vendor"
                }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import Skeleton from "../components/Skeleton.vue";
import { useFileMaker } from "../composables/useFileMaker";
import { LAYOUTS } from "../utils/filemakerApi";
import type { VendorTblFieldData } from "../utils/filemakerApi";
import type { FindRecordWithId } from "../composables/useFileMaker";
import { useToastStore } from "../stores/toastStore";
import { useVendorOverviewStore } from "../stores/vendorOverviewStore";
import { formatDateForFileMaker } from "../utils/filemakerMappers";

const { createRecord, updateRecord, findRecordsWithIds, isConnected } =
  useFileMaker();
const toast = useToastStore();
const vendorOverview = useVendorOverviewStore();

const vendorList = ref<
  FindRecordWithId<VendorTblFieldData | Record<string, unknown>>[]
>([]);
const loading = ref(true);
const loadError = ref<string | null>(null);
const showAddModal = ref(false);
const searchQuery = ref("");
const editingRecordId = ref<string | null>(null);
const form = ref<VendorTblFieldData>({
  Vendor_ID: "",
  Vendor_Name: "",
  Vendor_Location: "",
  Vendor_Email: "",
  GRA_Expiry_Date: "",
  Received_Date: "",
  Tin_Number: "",
  WHT_Expiry_Date: "",
  Received_WHT_Date: "",
});
const formError = ref<string | null>(null);
const saving = ref(false);

function getField(
  row: FindRecordWithId<VendorTblFieldData | Record<string, unknown>>,
  key: string,
): string {
  const fd = row.fieldData as Record<string, unknown>;
  const v = fd[key] ?? fd[key.replace(/_/g, " ")];
  if (v == null || v === "") return "—";
  return String(v).trim();
}

function expiryCheckStatusClass(value: string): string {
  if (!value || value === "—") return "tax-table__status--other";
  const s = value.toLowerCase().trim();
  if (s === "valid" || s === "ok" || s === "yes" || s === "good")
    return "tax-table__status--valid";
  if (s === "expired" || s === "no" || s === "invalid")
    return "tax-table__status--expired";
  return "tax-table__status--other";
}

const filteredVendorList = computed(() => {
  const q = searchQuery.value.toLowerCase();
  if (!q) return vendorList.value;
  return vendorList.value.filter((r) => {
    const fd = r.fieldData as Record<string, unknown>;
    const id = String(fd.Vendor_ID ?? fd["Vendor ID"] ?? "").toLowerCase();
    const name = String(
      fd.Vendor_Name ?? fd["Vendor Name"] ?? "",
    ).toLowerCase();
    const loc = String(
      fd.Vendor_Location ?? fd["Vendor Location"] ?? "",
    ).toLowerCase();
    const email = String(
      fd.Vendor_Email ?? fd["Vendor Email"] ?? "",
    ).toLowerCase();
    const tin = String(fd.Tin_Number ?? fd["Tin Number"] ?? "").toLowerCase();
    return (
      id.includes(q) ||
      name.includes(q) ||
      loc.includes(q) ||
      email.includes(q) ||
      tin.includes(q)
    );
  });
});

const PAGE_SIZE = 10;
const currentPageVendor = ref(1);
const totalPagesVendor = computed(() =>
  Math.max(1, Math.ceil(filteredVendorList.value.length / PAGE_SIZE)),
);
const vendorListToShow = computed(() => {
  const start = (currentPageVendor.value - 1) * PAGE_SIZE;
  return filteredVendorList.value.slice(start, start + PAGE_SIZE);
});

watch(searchQuery, () => {
  currentPageVendor.value = 1;
});
watch(totalPagesVendor, (total) => {
  if (currentPageVendor.value > total)
    currentPageVendor.value = Math.max(1, total);
});

function formatDate(value: string | undefined): string {
  if (!value?.trim()) return "—";
  return value.trim();
}

function fileMakerDateToInput(value: string | undefined): string {
  if (!value?.trim()) return "";
  const raw = value.trim();
  const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(raw);
  if (us) {
    const m = us[1].padStart(2, "0");
    const d = us[2].padStart(2, "0");
    return `${us[3]}-${m}-${d}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  return "";
}

function toFileMakerDate(isoDate: string | undefined): string | undefined {
  return formatDateForFileMaker(isoDate);
}

function closeModal() {
  showAddModal.value = false;
  editingRecordId.value = null;
}

function resetForm() {
  editingRecordId.value = null;
  form.value = {
    Vendor_ID: "",
    Vendor_Name: "",
    Vendor_Location: "",
    Vendor_Email: "",
    GRA_Expiry_Date: "",
    Received_Date: "",
    Tin_Number: "",
    WHT_Expiry_Date: "",
    Received_WHT_Date: "",
  };
  formError.value = null;
}

function openEdit(
  row: FindRecordWithId<VendorTblFieldData | Record<string, unknown>>,
) {
  const fd = row.fieldData as Record<string, unknown>;
  form.value = {
    Vendor_ID: String(fd.Vendor_ID ?? fd["Vendor ID"] ?? ""),
    Vendor_Name: String(fd.Vendor_Name ?? fd["Vendor Name"] ?? ""),
    Vendor_Location: String(fd.Vendor_Location ?? fd["Vendor Location"] ?? ""),
    Vendor_Email: String(fd.Vendor_Email ?? fd["Vendor Email"] ?? ""),
    GRA_Expiry_Date: fileMakerDateToInput(
      fd.GRA_Expiry_Date ?? (fd["GRA Expiry Date"] as string | undefined),
    ),
    Received_Date: fileMakerDateToInput(
      fd.Received_Date ?? (fd["Received Date"] as string | undefined),
    ),
    Tin_Number: String(fd.Tin_Number ?? fd["Tin Number"] ?? ""),
    WHT_Expiry_Date: fileMakerDateToInput(
      fd.WHT_Expiry_Date ?? (fd["WHT Expiry Date"] as string | undefined),
    ),
    Received_WHT_Date: fileMakerDateToInput(
      fd.Received_WHT_Date ?? (fd["Received WHT Date"] as string | undefined),
    ),
  };
  editingRecordId.value = row.recordId;
  formError.value = null;
  showAddModal.value = true;
}

watch(showAddModal, (open) => {
  if (!open) editingRecordId.value = null;
});

function validateForm(): string | null {
  if (!form.value.Vendor_Name?.trim()) return "Vendor Name is required.";
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
  const idToUpdate = editingRecordId.value
    ? String(editingRecordId.value).trim()
    : null;
  try {
    const fieldData: VendorTblFieldData = {
      Vendor_ID: form.value.Vendor_ID?.trim() || undefined,
      Vendor_Name: form.value.Vendor_Name?.trim(),
      Vendor_Location: form.value.Vendor_Location?.trim() || undefined,
      Vendor_Email: form.value.Vendor_Email?.trim() || undefined,
      GRA_Expiry_Date: toFileMakerDate(form.value.GRA_Expiry_Date),
      Received_Date: toFileMakerDate(form.value.Received_Date),
      Tin_Number: form.value.Tin_Number?.trim() || undefined,
      WHT_Expiry_Date: toFileMakerDate(form.value.WHT_Expiry_Date),
      Received_WHT_Date: toFileMakerDate(form.value.Received_WHT_Date),
    };
    if (idToUpdate) {
      const { error } = await updateRecord(
        LAYOUTS.VENDOR_TBL,
        idToUpdate,
        fieldData,
      );
      if (error) {
        toast.error(error);
        formError.value = null;
        return;
      }
      toast.success("Vendor updated successfully.");
    } else {
      const { error } = await createRecord(LAYOUTS.VENDOR_TBL, fieldData);
      if (error) {
        toast.error(error);
        formError.value = null;
        return;
      }
      toast.success("Vendor added successfully.");
    }
    closeModal();
    resetForm();
    await loadVendors();
  } finally {
    saving.value = false;
  }
}

async function loadVendors() {
  if (!isConnected.value) {
    vendorList.value = [];
    loading.value = false;
    return;
  }
  loading.value = true;
  loadError.value = null;
  const { data, error } = await findRecordsWithIds<
    VendorTblFieldData | Record<string, unknown>
  >(LAYOUTS.VENDOR_TBL, { limit: 500 });
  loading.value = false;
  if (error) {
    toast.error(error);
    loadError.value = null;
    vendorList.value = [];
    vendorOverview.setVendorCount(0);
  } else {
    vendorList.value = data;
    vendorOverview.setVendorCount(data.length);
  }
}

onMounted(loadVendors);
watch(isConnected, (connected) => {
  if (connected) loadVendors();
});
</script>

<style scoped>
.vendor-modal {
  max-width: 720px;
}
</style>
