<template>
  <section
    class="vendor-details glass overflow-hidden rounded-2xl border border-[var(--color-border)] shadow-sm"
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
        <div class="vendor-details__grid">
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
                  @input="onVendorIdInput(($event.target as HTMLInputElement).value)"
                />
                <span class="tax-modal__search-dropdown-chevron" :class="{ 'tax-modal__search-dropdown-chevron--open': vendorDropdownOpen }" aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                </span>
              </div>
              <Transition name="search-dropdown">
                <div v-if="vendorDropdownOpen && !readOnly" class="tax-modal__search-dropdown-list" role="listbox">
                  <button
                    v-for="(v, idx) in filteredVendorOptions"
                    :key="v.recordId || idx"
                    type="button"
                    role="option"
                    class="tax-modal__search-dropdown-item"
                    :class="{ 'tax-modal__search-dropdown-item--highlight': isVendorSelected(v) }"
                    @mousedown.prevent="onVendorSelect(v)"
                  >
                    <span class="font-semibold text-[var(--color-accent)]">{{ getVendorId(v) }}</span>
                    <span v-if="getVendorName(v)" class="ml-2 text-[var(--color-text-muted)] text-[0.8125rem]">{{ getVendorName(v) }}</span>
                  </button>
                  <p v-if="vendorList.length > 0 && filteredVendorOptions.length === 0" class="px-4 py-3 text-[0.8125rem] text-[var(--color-text-muted)] m-0">
                    No matching vendors
                  </p>
                  <p v-else-if="vendorList.length === 0 && !vendorListLoading" class="px-4 py-3 text-[0.8125rem] text-[var(--color-text-muted)] m-0">
                    No vendors yet
                  </p>
                  <p v-else-if="vendorListLoading" class="px-4 py-3 text-[0.8125rem] text-[var(--color-text-muted)] m-0">
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
              class="vendor-details__input"
              placeholder="Acme Corp"
              :readonly="readOnly"
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
              class="vendor-details__input"
              placeholder="vendor@example.com"
              :readonly="readOnly"
              @input="
                onVendorFieldChange(
                  'contact_email',
                  ($event.target as HTMLInputElement).value,
                )
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
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useVendorStore } from "../stores/vendorStore";
import { usePayableStore } from "../stores/payableStore";
import { useFileMaker } from "../composables/useFileMaker";
import { LAYOUTS } from "../utils/filemakerApi";
import type { Vendor } from "../types";
import type { VendorTblFieldData } from "../utils/filemakerApi";
import type { FindRecordWithId } from "../composables/useFileMaker";

const vendorStore = useVendorStore();
const payableStore = usePayableStore();
const { findRecordsWithIds, isConnected } = useFileMaker();
const vendor = computed(() => vendorStore.vendor);
const collapsed = ref(false);
const vendorDropdownRef = ref<HTMLElement | null>(null);
const vendorDropdownOpen = ref(false);
const vendorSearch = ref("");
/** Editable except when Posted (Rejected entries stay editable). */
const readOnly = computed(() => payableStore.mainPosted && payableStore.mainStatus !== "Rejected");

const vendorList = ref<FindRecordWithId<VendorTblFieldData | Record<string, unknown>>[]>([]);
const vendorListLoading = ref(false);

function getVendorId(row: FindRecordWithId<VendorTblFieldData | Record<string, unknown>>): string {
  const fd = row.fieldData as Record<string, unknown>;
  return String(fd.Vendor_ID ?? fd["Vendor ID"] ?? "").trim();
}

function getVendorName(row: FindRecordWithId<VendorTblFieldData | Record<string, unknown>>): string {
  const fd = row.fieldData as Record<string, unknown>;
  return String(fd.Vendor_Name ?? fd["Vendor Name"] ?? "").trim();
}

function isVendorSelected(row: FindRecordWithId<VendorTblFieldData | Record<string, unknown>>): boolean {
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
  const { data, error } = await findRecordsWithIds<VendorTblFieldData | Record<string, unknown>>(
    LAYOUTS.VENDOR_TBL,
    { limit: 500 }
  );
  vendorListLoading.value = false;
  vendorList.value = error ? [] : data;
}

function onVendorIdInput(value: string) {
  vendorSearch.value = value;
  vendorStore.setField("vendor_id", value);
  if (!readOnly.value) payableStore.markDirty();
  vendorDropdownOpen.value = true;
}

function onVendorSelect(row: FindRecordWithId<VendorTblFieldData | Record<string, unknown>>) {
  const id = getVendorId(row);
  const name = getVendorName(row);
  vendorStore.setField("vendor_id", id);
  vendorStore.setField("vendor_name", name);
  vendorSearch.value = "";
  vendorDropdownOpen.value = false;
  if (!readOnly.value) payableStore.markDirty();
}

function onVendorFieldChange(field: keyof Vendor, value: string): void {
  vendorStore.setField(field, value);
  if (!readOnly.value) payableStore.markDirty();
}

function handleClickOutside(e: MouseEvent) {
  if (vendorDropdownRef.value && !vendorDropdownRef.value.contains(e.target as Node)) {
    vendorDropdownOpen.value = false;
  }
}

onMounted(() => {
  loadVendors();
  document.addEventListener("click", handleClickOutside);
});
onUnmounted(() => {
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
