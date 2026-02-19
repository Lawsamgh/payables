/**
 * Vendor state: single vendor record for the VendorDetails section.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useFileMaker } from '../composables/useFileMaker'
import type { Vendor } from '../types'

const DEFAULT_VENDOR: Vendor = {
  id: '',
  vendor_name: '',
  vendor_id: '',
  payment_terms: '',
  contact_email: '',
  phone_number: '',
  currency: 'USD',
  created_date: '',
}

export const useVendorStore = defineStore('vendor', () => {
  const vendor = ref<Vendor>({ ...DEFAULT_VENDOR })
  const loading = ref(false)
  const error = ref<string | null>(null)
  /** Expiry check display from selected vendor (for new entry). */
  const selectedVendorExpiryCheckDis = ref<string | null>(null)
  const selectedVendorWhtExpiryCheckDis = ref<string | null>(null)
  /** Expiry check status (Valid/Invalid) for coloring. */
  const selectedVendorExpiryCheck = ref<string | null>(null)
  const selectedVendorWhtExpiryCheck = ref<string | null>(null)

  const isEmpty = computed(() => {
    const v = vendor.value
    return !v.vendor_name && !v.vendor_id && !v.contact_email && !v.phone_number
  })

  function reset(): void {
    vendor.value = { ...DEFAULT_VENDOR }
    error.value = null
    selectedVendorExpiryCheckDis.value = null
    selectedVendorWhtExpiryCheckDis.value = null
  }

  /** Set expiry check display from vendor record (when user selects vendor in new entry). */
  function setExpiryFromVendorRecord(fd: Record<string, unknown> | undefined): void {
    if (!fd) {
      selectedVendorExpiryCheckDis.value = null
      selectedVendorWhtExpiryCheckDis.value = null
      selectedVendorExpiryCheck.value = null
      selectedVendorWhtExpiryCheck.value = null
      return
    }
    const get = (...keys: string[]) => {
      for (const k of keys) {
        const v = fd[k]
        if (v != null && String(v).trim() !== '') return String(v).trim()
      }
      return null
    }
    selectedVendorExpiryCheckDis.value = get(
      'Expiry_Check_Dis',
      'Expiry Check Dis',
      'Vendor_TBL::Expiry_Check_Dis',
    )
    selectedVendorWhtExpiryCheckDis.value = get(
      'WHT_Expiry_Check_Dis',
      'WHT Expiry Check Dis',
      'Vendor_TBL::WHT_Expiry_Check_Dis',
    )
    selectedVendorExpiryCheck.value = get(
      'Expiry_Check',
      'Expiry Check',
      'Vendor_TBL::Expiry_Check',
    )
    selectedVendorWhtExpiryCheck.value = get(
      'WHT_Expiry_Check',
      'WHT Expiry Check',
      'Vendor_TBL::WHT_Expiry_Check',
    )
  }

  function setField(field: keyof Vendor, value: string): void {
    if (Object.prototype.hasOwnProperty.call(vendor.value, field)) {
      vendor.value = { ...vendor.value, [field]: value }
    }
  }

  /** Convert FileMaker date (MM/DD/YYYY) to YYYY-MM-DD for HTML date input. */
  function fileMakerDateToInput(dateStr: string | undefined): string {
    const s = String(dateStr ?? '').trim()
    if (!s) return ''
    const match = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
    if (match) {
      const [, month, day, year] = match
      return `${year}-${month!.padStart(2, '0')}-${day!.padStart(2, '0')}`
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
    return s
  }

  /** Populate vendor from a Payables_Main record. Clears selected expiry (existing entry uses payableStore). */
  function setFromMain(mainData: {
    VendorID?: string
    VendorName?: string
    VendorEmail?: string
    Date?: string
    Currency?: string
  } | null): void {
    if (!mainData) {
      reset()
      return
    }
    selectedVendorExpiryCheckDis.value = null
    selectedVendorWhtExpiryCheckDis.value = null
    selectedVendorExpiryCheck.value = null
    selectedVendorWhtExpiryCheck.value = null
    vendor.value = {
      ...vendor.value,
      vendor_id: String(mainData.VendorID ?? '').trim(),
      vendor_name: String(mainData.VendorName ?? '').trim(),
      contact_email: String(mainData.VendorEmail ?? '').trim(),
      payment_terms: fileMakerDateToInput(mainData.Date),
      currency: String(mainData.Currency ?? '').trim() || vendor.value.currency,
    }
  }

  async function loadById(vendorId: string): Promise<void> {
    if (!vendorId) {
      reset()
      return
    }
    const { findRecords, isConnected } = useFileMaker()
    if (!isConnected.value) {
      error.value = 'Not connected to FileMaker'
      return
    }
    loading.value = true
    error.value = null
    const { data, error: err } = await findRecords<Vendor>('Vendors', { limit: 1000 })
    loading.value = false
    if (err) {
      error.value = err
      return
    }
    const found = data.find(
      (r) => String(r.id) === String(vendorId) || String(r.vendor_id) === String(vendorId)
    )
    if (found) {
      vendor.value = { ...DEFAULT_VENDOR, ...found }
    } else {
      vendor.value = { ...DEFAULT_VENDOR, vendor_id: vendorId }
    }
  }

  async function save(): Promise<{ ok: boolean }> {
    const { createRecord, updateRecord, isConnected } = useFileMaker()
    if (!isConnected.value) {
      error.value = 'Not connected to FileMaker'
      return { ok: false }
    }
    loading.value = true
    error.value = null
    const v = vendor.value
    const fieldData = {
      vendor_name: v.vendor_name,
      vendor_id: v.vendor_id,
      payment_terms: v.payment_terms,
      contact_email: v.contact_email,
      phone_number: v.phone_number,
      currency: v.currency,
    }
    if (v.id) {
      const { error: err } = await updateRecord('Vendors', v.id, fieldData)
      loading.value = false
      if (err) {
        error.value = err
        return { ok: false }
      }
      return { ok: true }
    }
    const { id, error: err } = await createRecord('Vendors', fieldData)
    loading.value = false
    if (err) {
      error.value = err
      return { ok: false }
    }
    vendor.value = { ...v, id: id ?? '' }
    return { ok: true }
  }

  return {
    vendor: computed(() => vendor.value),
    loading,
    error,
    isEmpty,
    selectedVendorExpiryCheckDis: computed(() => selectedVendorExpiryCheckDis.value),
    selectedVendorWhtExpiryCheckDis: computed(() => selectedVendorWhtExpiryCheckDis.value),
    selectedVendorExpiryCheck: computed(() => selectedVendorExpiryCheck.value),
    selectedVendorWhtExpiryCheck: computed(() => selectedVendorWhtExpiryCheck.value),
    reset,
    setField,
    setFromMain,
    setExpiryFromVendorRecord,
    loadById,
    save,
  }
})
