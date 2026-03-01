/**
 * Pure helpers for HomeView. No Vue reactivity.
 */

import type { FindRecordWithId } from '../composables/useFileMaker'
import type { PayablesMainFieldData } from './filemakerApi'

/** Resolve a field from layout fieldData (handles FullName / Full Name / fullName etc.). */
export function getFieldValue(
  fd: Record<string, unknown> | undefined,
  key: string,
): string {
  if (!fd) return ''
  const v =
    fd[key] ??
    fd[key.replace(/([A-Z])/g, ' $1').trim()] ??
    fd[key.charAt(0).toLowerCase() + key.slice(1)]
  if (v == null || v === '') return ''
  return String(v).trim()
}

/** Match item by search (vendor name, ID, invoice #, ref). */
export function matchesSearch(
  item: FindRecordWithId<PayablesMainFieldData>,
  q: string,
): boolean {
  if (!q.trim()) return true
  const s = q.trim().toLowerCase()
  const name = String(item.fieldData?.VendorName ?? '').toLowerCase()
  const vendorId = String(item.fieldData?.VendorID ?? '').toLowerCase()
  const fd = item.fieldData as Record<string, unknown> | undefined
  const invoice = String(fd?.InvoiceNumber ?? fd?.Invoice_Number ?? '').toLowerCase()
  const ref = String(item.fieldData?.TransRef ?? '').toLowerCase()
  return (
    name.includes(s) ||
    vendorId.includes(s) ||
    invoice.includes(s) ||
    ref.includes(s)
  )
}

/** Get creation timestamp from record (FileMaker CreationTimestamp, any casing). */
export function getCreationTimestamp(
  item: FindRecordWithId<PayablesMainFieldData>,
): string {
  const fd = item?.fieldData as Record<string, unknown> | undefined
  if (!fd) return ''
  const raw =
    fd.CreationTimestamp ??
    fd['Creation timestamp'] ??
    fd.creationTimestamp ??
    fd.creation_timestamp ??
    ''
  return String(raw ?? '').trim()
}

/** Get PostedDate for posted chart (FileMaker PostedDate field). Fallback to Date. */
export function getPostedDate(
  item: FindRecordWithId<PayablesMainFieldData>,
): string {
  const fd = item?.fieldData as Record<string, unknown> | undefined
  if (!fd) return ''
  const raw =
    fd.PostedDate ??
    fd['Posted date'] ??
    fd.postedDate ??
    fd.posted_date ??
    fd.Date ??
    fd.date ??
    ''
  return String(raw ?? '').trim()
}

/** Get ApprovedDate for approved chart (FileMaker ApprovedDate field). Fallback to Date. */
export function getApprovedDate(
  item: FindRecordWithId<PayablesMainFieldData>,
): string {
  const fd = item?.fieldData as Record<string, unknown> | undefined
  if (!fd) return ''
  const raw =
    fd.ApprovedDate ??
    fd['Approved date'] ??
    fd.approvedDate ??
    fd.approved_date ??
    fd.Date ??
    fd.date ??
    ''
  return String(raw ?? '').trim()
}

/** Resolve Status from record: Status field, or derived from Approved/Rejected/Posted (Draft if none). */
export function getStatus(
  item: FindRecordWithId<PayablesMainFieldData>,
): string {
  const fd = item?.fieldData as Record<string, unknown> | undefined
  if (!fd) return 'Draft'
  const status = fd.Status ?? fd.status
  if (status != null && String(status).trim()) return String(status).trim()
  const approved = fd.Approved ?? fd.approved
  const rejected = fd.Rejected ?? fd.rejected
  const posted = fd.Posted ?? fd.posted
  if (approved != null && String(approved).trim()) return 'Approved'
  if (rejected != null && String(rejected).trim()) return 'Rejected'
  if (posted != null && String(posted).trim() === 'Yes') return 'Posted'
  return 'Draft'
}

/** Normalize any date/timestamp to YYYY-MM-DD for grouping. */
export function toDateKey(raw: string | undefined): string | null {
  if (!raw || typeof raw !== 'string') return null
  const s = raw.trim()
  if (!s) return null
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return null
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Sort by CreationTimestamp (recent first). Fallback to recordId when timestamp is missing. */
export function sortByCreationTimestamp(
  items: FindRecordWithId<PayablesMainFieldData>[],
): FindRecordWithId<PayablesMainFieldData>[] {
  return [...items].sort((a, b) => {
    const tsA = getCreationTimestamp(a)
    const tsB = getCreationTimestamp(b)
    if (!tsA && !tsB) {
      const idA = Number(a.recordId) || 0
      const idB = Number(b.recordId) || 0
      return idB - idA
    }
    if (!tsA) return 1
    if (!tsB) return -1
    const dateA = new Date(tsA).getTime()
    const dateB = new Date(tsB).getTime()
    return dateB - dateA
  })
}

/** Filter and sort by Status (Draft, Posted, Rejected, Approved) then by date. */
export function filterByStatusAndSort(
  items: FindRecordWithId<PayablesMainFieldData>[],
  status: string,
): FindRecordWithId<PayablesMainFieldData>[] {
  const filtered = items.filter((item) => getStatus(item) === status)
  return sortByCreationTimestamp(filtered)
}

/** Animate a ref's value from current to target over duration. */
export function animateValue(
  ref: { value: number },
  target: number,
  duration = 500,
): void {
  const start = ref.value
  const startTime = performance.now()
  function step(now: number) {
    const elapsed = now - startTime
    const t = Math.min(elapsed / duration, 1)
    const ease = 1 - Math.pow(1 - t, 2)
    ref.value = Math.round(start + (target - start) * ease)
    if (t < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

export type PostedQuickFilter = 'all' | 'overdue' | 'this-week'
const POSTED_FILTER_KEY = 'home-posted-filter'

export function loadPostedFilter(): PostedQuickFilter {
  try {
    const v = sessionStorage.getItem(POSTED_FILTER_KEY)
    if (v === 'overdue' || v === 'this-week' || v === 'all') return v
  } catch {
    /* ignore */
  }
  return 'all'
}

export function savePostedFilter(v: PostedQuickFilter): void {
  try {
    sessionStorage.setItem(POSTED_FILTER_KEY, v)
  } catch {
    /* ignore */
  }
}
