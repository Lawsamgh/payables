<template>
  <section
    class="vendor-details glass rounded-2xl border border-[var(--color-border)] shadow-sm"
    :class="{
      'vendor-details--dropdown-open': vendorDropdownOpen && !readOnly,
    }"
  >
    <button
      type="button"
      class="vendor-details__header"
      :aria-expanded="!collapsed"
      @click="collapsed = !collapsed"
    >
      <span class="vendor-details__title">Vendor details</span>
      <svg
        class="vendor-details__chevron"
        :class="{ 'vendor-details__chevron--open': !collapsed }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>

    <Transition name="vendor-details-body">
      <div v-show="!collapsed" class="vendor-details__body">
        <div class="vendor-details__top-row">
          <div
            v-if="showExpiryCheck"
            class="vendor-details__expiry-alert"
            role="status"
          >
            <div
              v-if="displayExpiryCheck"
              class="vendor-details__expiry-item"
              :class="{
                'vendor-details__expiry-item--invalid': isExpiryCheckInvalid(
                  displayExpiryCheckStatus,
                ),
                'vendor-details__expiry-item--valid':
                  displayExpiryCheckStatus &&
                  !isExpiryCheckInvalid(displayExpiryCheckStatus),
              }"
            >
              <span class="vendor-details__expiry-icon" aria-hidden="true">
                <svg
                  v-if="
                    displayExpiryCheckStatus &&
                    isExpiryCheckInvalid(displayExpiryCheckStatus)
                  "
                  class="vendor-details__expiry-icon-svg"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 9l-6 6M9 9l6 6"
                  />
                </svg>
                <svg
                  v-else-if="displayExpiryCheckStatus"
                  class="vendor-details__expiry-icon-svg"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span v-else class="vendor-details__expiry-icon-placeholder" />
              </span>
              <strong class="vendor-details__expiry-label">GRA Expiry:</strong>
              <span class="vendor-details__expiry-value">{{
                displayExpiryCheck
              }}</span>
            </div>
            <div
              v-if="displayWhtExpiryCheck"
              class="vendor-details__expiry-item"
              :class="{
                'vendor-details__expiry-item--invalid': isExpiryCheckInvalid(
                  displayWhtExpiryCheckStatus,
                ),
                'vendor-details__expiry-item--valid':
                  displayWhtExpiryCheckStatus &&
                  !isExpiryCheckInvalid(displayWhtExpiryCheckStatus),
              }"
            >
              <span class="vendor-details__expiry-icon" aria-hidden="true">
                <svg
                  v-if="
                    displayWhtExpiryCheckStatus &&
                    isExpiryCheckInvalid(displayWhtExpiryCheckStatus)
                  "
                  class="vendor-details__expiry-icon-svg"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 9l-6 6M9 9l6 6"
                  />
                </svg>
                <svg
                  v-else-if="displayWhtExpiryCheckStatus"
                  class="vendor-details__expiry-icon-svg"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span v-else class="vendor-details__expiry-icon-placeholder" />
              </span>
              <strong class="vendor-details__expiry-label">WHT Expiry:</strong>
              <span class="vendor-details__expiry-value">{{
                displayWhtExpiryCheck
              }}</span>
            </div>
          </div>
          <div
            v-if="vendor.vendor_id?.trim() && !payableStore.currentTransRef"
            class="vendor-details__balance-wrap"
          >
            <VendorBalanceBanner
              :loading="vendorStore.vendorBalanceLoading"
              :display-value="vendorBalanceDisplay"
              :zero-or-less="isVendorBalanceZeroOrLess"
            />
          </div>
        </div>
        <div class="vendor-details__grid">
          <label class="vendor-details__field">
            <span class="vendor-details__label"
              >Purchase order
              <span class="vendor-details__required">Required</span></span
            >
            <input
              :value="vendor.purchase_order"
              type="text"
              class="vendor-details__input"
              :class="{
                'vendor-details__input--duplicate': purchaseOrderDuplicate,
              }"
              placeholder="Purchase order"
              :readonly="readOnly"
              required
              @input="
                onVendorFieldChange(
                  'purchase_order',
                  ($event.target as HTMLInputElement).value,
                )
              "
            />
            <p
              v-if="purchaseOrderDuplicate"
              class="vendor-details__field-error"
              role="alert"
            >
              Purchase order already exists. Use a unique value.
            </p>
          </label>
          <label class="vendor-details__field">
            <span class="vendor-details__label"
              >Vendor ID
              <span class="vendor-details__required">Required</span></span
            >
            <div ref="vendorDropdownRef" class="tax-modal__search-dropdown">
              <div class="tax-modal__search-dropdown-input-wrap">
                <input
                  :value="vendor.vendor_id"
                  type="text"
                  class="tax-modal__search-dropdown-input"
                  placeholder="Search or select vendor…"
                  :readonly="readOnly"
                  autocomplete="off"
                  @focus="readOnly ? null : (vendorDropdownOpen = true)"
                  @input="
                    onVendorIdInput(($event.target as HTMLInputElement).value)
                  "
                />
                <span
                  class="tax-modal__search-dropdown-chevron"
                  :class="{
                    'tax-modal__search-dropdown-chevron--open':
                      vendorDropdownOpen,
                  }"
                  aria-hidden="true"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
              </div>
              <Transition name="search-dropdown">
                <div
                  v-if="vendorDropdownOpen && !readOnly"
                  class="tax-modal__search-dropdown-list"
                  role="listbox"
                >
                  <button
                    v-for="(v, idx) in filteredVendorOptions"
                    :key="v.recordId || idx"
                    type="button"
                    role="option"
                    class="tax-modal__search-dropdown-item"
                    :class="{
                      'tax-modal__search-dropdown-item--highlight':
                        isVendorSelected(v),
                    }"
                    @mousedown.prevent="onVendorSelect(v)"
                  >
                    <span class="font-semibold text-[var(--color-accent)]">{{
                      getVendorId(v)
                    }}</span>
                    <span
                      v-if="getVendorName(v)"
                      class="ml-2 text-[var(--color-text-muted)] text-[0.8125rem]"
                      >{{ getVendorName(v) }}</span
                    >
                  </button>
                  <p
                    v-if="
                      vendorList.length > 0 &&
                      filteredVendorOptions.length === 0
                    "
                    class="px-4 py-3 text-[0.8125rem] text-[var(--color-text-muted)] m-0"
                  >
                    No matching vendors
                  </p>
                  <p
                    v-else-if="vendorList.length === 0 && !vendorListLoading"
                    class="px-4 py-3 text-[0.8125rem] text-[var(--color-text-muted)] m-0"
                  >
                    No vendors yet
                  </p>
                  <p
                    v-else-if="vendorListLoading"
                    class="px-4 py-3 text-[0.8125rem] text-[var(--color-text-muted)] m-0"
                  >
                    Loading…
                  </p>
                </div>
              </Transition>
            </div>
          </label>
          <label class="vendor-details__field">
            <span class="vendor-details__label"
              >Vendor name
              <span class="vendor-details__required">Required</span></span
            >
            <input
              :value="vendor.vendor_name"
              type="text"
              class="vendor-details__input opacity-75 cursor-not-allowed"
              placeholder="Select vendor id to populate vendor name"
              readonly
              @input="
                onVendorFieldChange(
                  'vendor_name',
                  ($event.target as HTMLInputElement).value,
                )
              "
            />
          </label>
          <label class="vendor-details__field">
            <span class="vendor-details__label">Date</span>
            <input
              :value="vendor.payment_terms"
              type="date"
              class="vendor-details__input vendor-details__input--date"
              :readonly="readOnly"
              @input="
                onVendorFieldChange(
                  'payment_terms',
                  ($event.target as HTMLInputElement).value,
                )
              "
            />
          </label>
          <label class="vendor-details__field">
            <span class="vendor-details__label">Contact email</span>
            <input
              :value="vendor.contact_email"
              type="email"
              class="vendor-details__input opacity-75 cursor-not-allowed"
              placeholder="vendor@example.com"
              readonly
            />
          </label>
          <label class="vendor-details__field">
            <span class="vendor-details__label">Advance Payment</span>
            <input
              :value="advancePaymentDisplay"
              type="text"
              inputmode="decimal"
              class="vendor-details__input"
              placeholder="0"
              :readonly="readOnly"
              @focus="advancePaymentFocused = true"
              @blur="onAdvancePaymentBlur"
              @input="
                onAdvancePaymentInput(($event.target as HTMLInputElement).value)
              "
            />
          </label>
          <label class="vendor-details__field">
            <span class="vendor-details__label">Currency</span>
            <div class="vendor-details__select-wrap">
              <select
                :value="vendor.currency"
                class="vendor-details__input vendor-details__select"
                :disabled="readOnly"
                @change="
                  onVendorFieldChange(
                    'currency',
                    ($event.target as HTMLSelectElement).value,
                  )
                "
              >
                <option value="GHS">GHS</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="USD">USD</option>
                <option value="CAD">CAD</option>
              </select>
              <svg
                class="vendor-details__select-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-6 6-6-6"
                />
              </svg>
            </div>
          </label>
        </div>
        <p v-if="vendorStore.error" class="vendor-details__error" role="alert">
          {{ vendorStore.error }}
        </p>
      </div>
    </Transition>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useVendorStore } from "../stores/vendorStore";
import { usePayableStore } from "../stores/payableStore";
import { useFileMaker } from "../composables/useFileMaker";
import { useUserRole } from "../composables/useUserRole";
import { useDocumentSettingsStore } from "../stores/documentSettingsStore";
import VendorBalanceBanner from "./VendorBalanceBanner.vue";
import { LAYOUTS } from "../utils/filemakerApi";
import { formatNumberDisplay } from "../utils/formatNumber";
import type { Vendor } from "../types";
import type { VendorTblFieldData } from "../utils/filemakerApi";
import type { FindRecordWithId } from "../composables/useFileMaker";

const vendorStore = useVendorStore();
const payableStore = usePayableStore();
const { isManager } = useUserRole();
const documentSettings = useDocumentSettingsStore();
const { findRecordsWithIds, isConnected } = useFileMaker();
const purchaseOrderDuplicate = ref(false);
const purchaseOrderCheckTimeout = ref<ReturnType<typeof setTimeout> | null>(
  null,
);
const vendor = computed(() => vendorStore.vendor);
const advancePaymentFocused = ref(false);
/** When focused: raw value for editing. When blurred: formatted with thousand separators. */
const advancePaymentDisplay = computed(() => {
  const v = payableStore.mainAdvancePayment;
  if (v == null) return "";
  if (advancePaymentFocused.value) {
    return typeof v === "number"
      ? String(v)
      : String(v).replace(/,/g, "").trim();
  }
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(/,/g, ""));
  return Number.isNaN(n) ? String(v).trim() : formatNumberDisplay(n) || "";
});
const vendorBalanceDisplay = computed(() => {
  const raw = vendor.value.vendor_balance ?? "";
  if (!raw.trim()) return "";
  const n = parseFloat(String(raw).replace(/,/g, "").trim());
  return Number.isNaN(n) ? raw : formatNumberDisplay(n) || "";
});
const isVendorBalanceZeroOrLess = computed(() => {
  if (vendorStore.vendorBalanceLoading) return false;
  const raw = vendor.value.vendor_balance ?? "";
  if (!raw.trim()) return false;
  const n = parseFloat(String(raw).replace(/,/g, "").trim());
  return !Number.isNaN(n) && n <= 0;
});
const collapsed = ref(false);
const vendorDropdownRef = ref<HTMLElement | null>(null);
const vendorDropdownOpen = ref(false);
const vendorSearch = ref("");
/** Editable except when Posted (Rejected stay editable for Officer). Manager cannot edit Draft/Rejected unless ManagerEditDraft is enabled. */
const readOnly = computed(
  () =>
    (isManager.value && !documentSettings.managerEditDraftEnabled) ||
    (payableStore.mainPosted && payableStore.mainStatus !== "Rejected"),
);

/** Don't show expiry for Approved/Posted. New entry: VendorDetails. Existing Draft/Rejected: EntryView banner. */
const displayExpiryCheck = computed(() => {
  if (
    payableStore.mainStatus === "Approved" ||
    payableStore.mainStatus === "Posted"
  )
    return null;
  if (payableStore.currentTransRef) return null;
  return vendorStore.selectedVendorExpiryCheckDis;
});
const displayWhtExpiryCheck = computed(() => {
  if (
    payableStore.mainStatus === "Approved" ||
    payableStore.mainStatus === "Posted"
  )
    return null;
  if (payableStore.currentTransRef) return null;
  return vendorStore.selectedVendorWhtExpiryCheckDis;
});
const showExpiryCheck = computed(
  () => (displayExpiryCheck.value || displayWhtExpiryCheck.value) != null,
);

function isExpiryCheckInvalid(check: string | null): boolean {
  if (!check) return false;
  const s = check.toLowerCase().trim();
  return s === "invalid" || s === "expired" || s === "no";
}

const displayExpiryCheckStatus = computed(() => {
  if (!payableStore.currentTransRef)
    return vendorStore.selectedVendorExpiryCheck;
  return payableStore.mainExpiryCheck;
});
const displayWhtExpiryCheckStatus = computed(() => {
  if (!payableStore.currentTransRef)
    return vendorStore.selectedVendorWhtExpiryCheck;
  return payableStore.mainWhtExpiryCheck;
});

const vendorList = ref<
  FindRecordWithId<VendorTblFieldData | Record<string, unknown>>[]
>([]);
const vendorListLoading = ref(false);

function getVendorId(
  row: FindRecordWithId<VendorTblFieldData | Record<string, unknown>>,
): string {
  const fd = row.fieldData as Record<string, unknown>;
  return String(fd.Vendor_ID ?? fd["Vendor ID"] ?? "").trim();
}

function getVendorName(
  row: FindRecordWithId<VendorTblFieldData | Record<string, unknown>>,
): string {
  const fd = row.fieldData as Record<string, unknown>;
  return String(fd.Vendor_Name ?? fd["Vendor Name"] ?? "").trim();
}

function getVendorEmail(
  row: FindRecordWithId<VendorTblFieldData | Record<string, unknown>>,
): string {
  const fd = row.fieldData as Record<string, unknown>;
  return String(fd.Vendor_Email ?? fd["Vendor Email"] ?? "").trim();
}

function getVendorCurrency(
  row: FindRecordWithId<VendorTblFieldData | Record<string, unknown>>,
): string {
  const fd = row.fieldData as Record<string, unknown>;
  const c = String(fd.Currency ?? fd["Currency"] ?? "").trim();
  return c || "GHS";
}

function isVendorSelected(
  row: FindRecordWithId<VendorTblFieldData | Record<string, unknown>>,
): boolean {
  const id = getVendorId(row);
  return id !== "" && id === vendor.value.vendor_id;
}

const filteredVendorOptions = computed(() => {
  const q = vendorSearch.value.toLowerCase();
  if (!q) return vendorList.value;
  return vendorList.value.filter((r) => {
    const id = getVendorId(r).toLowerCase();
    const name = getVendorName(r).toLowerCase();
    return id.includes(q) || name.includes(q);
  });
});

async function loadVendors() {
  if (!isConnected.value) {
    vendorList.value = [];
    return;
  }
  vendorListLoading.value = true;
  const BATCH = 1000;
  let offset = 0;
  const all: typeof vendorList.value = [];
  try {
    while (true) {
      const options: { limit: number; offset?: number } = { limit: BATCH };
      if (offset > 0) options.offset = offset;
      const { data, error } = await findRecordsWithIds<
        VendorTblFieldData | Record<string, unknown>
      >(LAYOUTS.VENDOR_TBL, options);
      if (error) {
        vendorList.value = [];
        return;
      }
      all.push(...data);
      if (data.length < BATCH) break;
      offset += data.length;
    }
    vendorList.value = all;
  } finally {
    vendorListLoading.value = false;
  }
}

function onVendorIdInput(value: string) {
  vendorSearch.value = value;
  vendorStore.setField("vendor_id", value);
  if (!value?.trim()) {
    vendorStore.setExpiryFromVendorRecord(undefined);
    vendorStore.setField("vendor_balance", "");
    vendorStore.setField("vendor_name", "");
    vendorStore.setField("contact_email", "");
  }
  if (!readOnly.value) payableStore.markDirty();
  vendorDropdownOpen.value = true;
}

async function onVendorSelect(
  row: FindRecordWithId<VendorTblFieldData | Record<string, unknown>>,
) {
  const id = getVendorId(row);
  const name = getVendorName(row);
  const email = getVendorEmail(row);
  const currency = getVendorCurrency(row);
  if (id && isConnected.value) {
    vendorStore.startVendorBalanceLoad();
  }
  vendorStore.setField("vendor_id", id);
  vendorStore.setField("vendor_name", name);
  vendorStore.setField("contact_email", email);
  vendorStore.setField("currency", currency);
  vendorStore.setExpiryFromVendorRecord(
    row.fieldData as Record<string, unknown>,
  );
  vendorSearch.value = "";
  vendorDropdownOpen.value = false;
  if (!readOnly.value) payableStore.markDirty();

  if (id && isConnected.value) {
    await vendorStore.fetchAndSetVendorBalance(id);
  } else {
    vendorStore.setField("vendor_balance", "");
  }
}

function onAdvancePaymentInput(value: string): void {
  const s = value.replace(/,/g, "").trim();
  payableStore.setMainAdvancePayment(s === "" ? null : s);
}

function onAdvancePaymentBlur(): void {
  advancePaymentFocused.value = false;
  const v = payableStore.mainAdvancePayment;
  if (v == null) return;
  const s = String(v).replace(/,/g, "").trim();
  const n = parseFloat(s);
  if (!Number.isNaN(n)) {
    payableStore.setMainAdvancePayment(n);
  }
}

function onVendorFieldChange(field: keyof Vendor, value: string): void {
  vendorStore.setField(field, value);
  if (!readOnly.value) payableStore.markDirty();
  if (field === "purchase_order") {
    debouncedPurchaseOrderDuplicateCheck(value.trim().toUpperCase());
  }
}

function debouncedPurchaseOrderDuplicateCheck(val: string): void {
  if (purchaseOrderCheckTimeout.value) {
    clearTimeout(purchaseOrderCheckTimeout.value);
  }
  if (!val || !isConnected.value) {
    purchaseOrderDuplicate.value = false;
    return;
  }
  purchaseOrderDuplicate.value = false;
  purchaseOrderCheckTimeout.value = setTimeout(() => {
    purchaseOrderCheckTimeout.value = null;
    checkPurchaseOrderDuplicate(val);
  }, 500);
}

async function checkPurchaseOrderDuplicate(
  purchaseOrderVal: string,
): Promise<void> {
  if (!purchaseOrderVal || !isConnected.value) return;
  const { data } = await findRecordsWithIds<Record<string, unknown>>(
    LAYOUTS.PAYABLES_MAIN,
    { limit: 1000 },
  );
  const poVal = purchaseOrderVal.trim().toUpperCase();
  const matches = data.filter((r) => {
    const fd = r.fieldData as Record<string, unknown>;
    const po = String(fd?.PurchaseOrder ?? fd?.["Purchase Order"] ?? "")
      .trim()
      .toUpperCase();
    return po === poVal;
  });
  const currentMainId = payableStore.currentMainRecordId;
  const otherMatches = currentMainId
    ? matches.filter((r) => String(r.recordId) !== String(currentMainId))
    : matches;
  purchaseOrderDuplicate.value = otherMatches.length > 0;
}

function handleClickOutside(e: MouseEvent) {
  if (
    vendorDropdownRef.value &&
    !vendorDropdownRef.value.contains(e.target as Node)
  ) {
    vendorDropdownOpen.value = false;
  }
}

watch(
  () => vendor.value.purchase_order,
  (val) => {
    if (!val?.trim()) purchaseOrderDuplicate.value = false;
  },
);

onMounted(() => {
  loadVendors();
  document.addEventListener("click", handleClickOutside);
});
onUnmounted(() => {
  if (purchaseOrderCheckTimeout.value) {
    clearTimeout(purchaseOrderCheckTimeout.value);
    purchaseOrderCheckTimeout.value = null;
  }
  document.removeEventListener("click", handleClickOutside);
});
watch(isConnected, (connected) => {
  if (connected) loadVendors();
});
</script>

<style scoped>
.vendor-details {
  --vd-ease: cubic-bezier(0.4, 0, 0.2, 1);
}

.vendor-details--dropdown-open {
  position: relative;
  z-index: 100;
}

.vendor-details__header {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  text-align: left;
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  transition: background-color 0.2s var(--vd-ease);
}

.vendor-details__header:hover {
  background: rgba(255, 255, 255, 0.03);
}

.vendor-details__title {
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--color-text);
}

.vendor-details__chevron {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color-text-muted);
  transition: transform 0.25s var(--vd-ease);
}

.vendor-details__chevron--open {
  transform: rotate(180deg);
}

.vendor-details__body {
  border-top: 1px solid var(--color-border);
  padding: 1.25rem 1.25rem 1.5rem;
}

.vendor-details__top-row {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.vendor-details__expiry-alert {
  flex: 1;
  min-width: 0;
  padding: 1rem 1.25rem;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.2) 0%,
    rgba(59, 130, 246, 0.08) 100%
  );
  border: 1px solid rgba(59, 130, 246, 0.4);
}
.vendor-details__expiry-item {
  display: grid;
  grid-template-columns: 1.25rem 5.5rem 1fr;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 0.375rem;
  min-height: 1.5rem;
}
.vendor-details__expiry-item:last-child {
  margin-bottom: 0;
}
.vendor-details__expiry-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
}
.vendor-details__expiry-icon-svg {
  width: 1.25rem;
  height: 1.25rem;
}
.vendor-details__expiry-icon-placeholder {
  display: block;
  width: 1.25rem;
  height: 1.25rem;
}
.vendor-details__expiry-label {
  min-width: 5.5rem;
  color: var(--color-text-muted);
}
.vendor-details__expiry-item strong {
  font-size: 0.9375rem;
  white-space: nowrap;
}
.vendor-details__expiry-item--invalid {
  color: rgb(252, 165, 165);
}
.vendor-details__expiry-item--valid {
  color: rgb(134, 239, 172);
}
.vendor-details__expiry-item:not(.vendor-details__expiry-item--invalid):not(
    .vendor-details__expiry-item--valid
  )
  .vendor-details__expiry-label {
  color: rgb(191, 219, 254);
}
.vendor-details__expiry-item:not(.vendor-details__expiry-item--invalid):not(
    .vendor-details__expiry-item--valid
  )
  .vendor-details__expiry-value {
  color: var(--color-text);
}
.vendor-details__expiry-value {
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.4;
}

.vendor-details__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

@media (min-width: 640px) {
  .vendor-details__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .vendor-details__grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
}

.vendor-details__field {
  display: block;
}

.vendor-details__label {
  display: block;
  margin-bottom: 0.375rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text-muted);
  letter-spacing: 0.01em;
}

.vendor-details__required {
  margin-left: 0.25rem;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgba(248, 113, 113, 0.9);
}

.vendor-details__input {
  width: 100%;
  min-height: 2.75rem;
  padding: 0.75rem 1rem;
  font-size: 0.9375rem;
  color: var(--color-text);
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  outline: none;
  transition:
    border-color 0.2s var(--vd-ease),
    box-shadow 0.2s var(--vd-ease),
    background-color 0.2s var(--vd-ease);
}

.vendor-details__input::placeholder {
  color: var(--color-text-muted);
  opacity: 0.8;
}

.vendor-details__input:hover:not(:disabled):not([readonly]) {
  background: rgba(15, 23, 42, 0.65);
  border-color: rgba(148, 163, 184, 0.2);
}

.vendor-details__input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-soft);
}

.vendor-details__input--duplicate {
  border-color: rgb(248, 113, 113);
  background: rgba(248, 113, 113, 0.08);
}

.vendor-details__input--duplicate:focus {
  border-color: rgb(248, 113, 113);
  box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.25);
}

.vendor-details__input--skeleton-wrap {
  display: flex;
  align-items: center;
}

/* Vendor balance callout - top right, inline with GRA banner */
.vendor-details__balance-wrap {
  flex-shrink: 0;
  margin-left: auto;
}

.vendor-details__field-error {
  margin: 0.375rem 0 0;
  font-size: 0.8125rem;
  color: rgb(248, 113, 113);
}

.vendor-details__input:disabled,
.vendor-details__input[readonly] {
  opacity: 0.85;
  cursor: default;
}

.vendor-details__input--date {
  color-scheme: dark;
}

.vendor-details__select-wrap {
  position: relative;
}

.vendor-details__select {
  appearance: none;
  padding-right: 2.5rem;
  cursor: pointer;
}

.vendor-details__select-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  width: 1rem;
  height: 1rem;
  color: var(--color-text-muted);
  pointer-events: none;
  transform: translateY(-50%);
}

.vendor-details__error {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: rgb(248, 113, 113);
}

/* Expand/collapse transition */
.vendor-details-body-enter-active,
.vendor-details-body-leave-active {
  transition:
    opacity 0.2s var(--vd-ease),
    transform 0.2s var(--vd-ease);
}

.vendor-details-body-enter-from,
.vendor-details-body-leave-to {
  opacity: 0;
}

.vendor-details-body-enter-from {
  transform: translateY(-4px);
}

.vendor-details-body-leave-to {
  transform: translateY(-2px);
}
</style>
