/**
 * Maps app PayableRow to PGH_Item_Distribution Payables_Main and Payables_Details field data.
 */

import type { PayableRow } from '../types'
import type { PayablesMainFieldData, PayablesDetailsFieldData } from './filemakerApi'

/** Coerce to number; use 0 when empty so FileMaker gets valid numbers */
function toNum(value: string | number): number {
  if (value === '' || value === null || value === undefined) return 0
  const n = typeof value === 'number' ? value : parseFloat(String(value))
  return Number.isNaN(n) ? 0 : n
}

/** Invoice number for Payables_Details: use number when numeric, otherwise pass string as-is (e.g. "INV-001") */
function toInvoiceNumber(value: string | number | undefined): number | string {
  if (value === undefined || value === null) return ''
  const s = String(value).trim()
  if (s === '') return ''
  const n = typeof value === 'number' ? value : parseFloat(s)
  return Number.isNaN(n) ? s : n
}

/** Format date only for FileMaker Date field: MM/DD/YYYY */
export function formatDateOnlyForFileMaker(d?: Date): string {
  const date = d ?? new Date()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const yyyy = date.getFullYear()
  return `${mm}/${dd}/${yyyy}`
}

/** Format current date/time as US timestamp for FileMaker: MM/DD/YYYY HH:mm:ss */
export function formatTimestampForFileMaker(d?: Date): string {
  const date = d ?? new Date()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const yyyy = date.getFullYear()
  const hh = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  const ss = String(date.getSeconds()).padStart(2, '0')
  return `${mm}/${dd}/${yyyy} ${hh}:${min}:${ss}`
}

/** Convert date from YYYY-MM-DD (HTML date input) to MM/DD/YYYY (FileMaker format) */
export function formatDateForFileMaker(dateStr: string | undefined): string | undefined {
  if (!dateStr || dateStr.trim() === '') return undefined
  // If already in MM/DD/YYYY format, return as-is
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr.trim())) {
    return dateStr.trim()
  }
  // Convert from YYYY-MM-DD to MM/DD/YYYY
  const parts = dateStr.trim().split('-')
  if (parts.length === 3) {
    const [year, month, day] = parts
    return `${month}/${day}/${year}`
  }
  // If format is unrecognized, return as-is (let FileMaker handle validation)
  return dateStr.trim()
}

/**
 * Build field data for Payables_Main from one grid row.
 * Do not send TransRef – FileMaker auto-generates it; get it from the created record and use for Details.
 * VendorID/VendorName come from the selected vendor (options) when set, else from the row.
 * Note: InvoiceNumber is NOT sent to Payables_Main - it's only stored in Payables_Details.
 */
export function rowToPayablesMain(
  row: PayableRow,
  options: {
    vendorEmail?: string
    vendorId?: string
    vendorName?: string
    date?: string
    currency?: string
    total?: number
  } = {}
): PayablesMainFieldData {
  const dateValue = formatDateForFileMaker(options.date)
  // Only include Date field if it has a value to avoid FileMaker validation errors
  const result: PayablesMainFieldData = {
    VendorID: options.vendorId ?? row.vendor_id ?? '',
    VendorName: options.vendorName ?? row.vendor_name ?? '',
    VendorEmail: options.vendorEmail ?? '',
    // InvoiceNumber is NOT sent to Payables_Main
  }
  // Only add Date field if it has a value (FileMaker may have validation rules on Date field)
  if (dateValue && dateValue !== '') {
    result.Date = dateValue
  }
  if (options.currency != null && options.currency !== '') {
    result.Currency = options.currency
  }
  if (options.total != null && !Number.isNaN(options.total)) {
    result.Total = options.total
  }
  return result
}

/**
 * Build field data for Payables_Details from one grid row.
 * transRef must match the Payables_Main record this detail belongs to (one-to-many link).
 * Note: Tax, Tax Amount, and Total are calculated fields in FileMaker, so we don't send them when updating.
 * The Reference column in the grid maps to Tax Amount field in FileMaker (but Tax Amount is calculated, so we don't send it).
 */
export function rowToPayablesDetails(row: PayableRow, transRef: string): PayablesDetailsFieldData {
  const invNum = toInvoiceNumber(row.invoice_number)
  return {
    TransRef: transRef,
    InvoiceNumber: invNum === '' ? undefined : invNum,
    Amount: toNum(row.amount), // Send 0 if empty, or the actual number value
    // Tax is calculated in FileMaker from Payable_Invoice, so we don't send it
    // Tax Amount is a calculation field in FileMaker (mapped from Reference column), so we don't send it
    // Total is calculated in FileMaker (Amount + Tax), so we don't send it
  }
}
