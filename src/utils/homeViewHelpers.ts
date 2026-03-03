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

/** Get modification timestamp from record (FileMaker ModificationTimestamp, includes date+time). Fallback to CreationTimestamp. */
export function getModificationTimestamp(
  item: FindRecordWithId<PayablesMainFieldData>,
): string {
  const fd = item?.fieldData as Record<string, unknown> | undefined
  if (!fd) return ''
  const modKeys = [
    'ModificationTimestamp',
    'Modification Timestamp',
    'modificationTimestamp',
    'modification_timestamp',
    'ModificationDate',
    'Modification Date',
    'DateModified',
    'Date Modified',
  ]
  for (const key of modKeys) {
    const v = fd[key]
    if (v != null && String(v).trim()) return String(v).trim()
  }
  for (const [key, val] of Object.entries(fd)) {
    if (val != null && String(val).trim() && /modification|modified|date\s*modified/i.test(key)) {
      return String(val).trim()
    }
  }
  return getCreationTimestamp(item)
}

/** Extract numeric part from TransRef (e.g. RF100042 -> 100042) for sort fallback. */
function getTransRefSortKey(item: FindRecordWithId<PayablesMainFieldData>): number {
  const fd = item?.fieldData as Record<string, unknown> | undefined
  const ref = fd?.TransRef ?? fd?.['Trans Ref'] ?? ''
  const s = String(ref ?? '').trim()
  const match = s.match(/\d+/)
  return match ? parseInt(match[0], 10) : 0
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

/** Parse timestamp to epoch ms. Handles FileMaker formats (MM/DD/YYYY HH:MM:SS, ISO, etc.). */
function parseTimestampToEpoch(ts: string): number {
  const s = ts.trim()
  if (!s) return 0
  const d = new Date(s)
  if (!Number.isNaN(d.getTime())) return d.getTime()
  const m = s.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i)
  if (m) {
    let h = parseInt(m[4], 10)
    const min = parseInt(m[5], 10)
    const sec = parseInt(m[6] || '0', 10)
    const ampm = (m[7] || '').toUpperCase()
    if (ampm === 'PM' && h < 12) h += 12
    if (ampm === 'AM' && h === 12) h = 0
    const y = parseInt(m[3], 10)
    const month = parseInt(m[1], 10) - 1
    const day = parseInt(m[2], 10)
    const alt = new Date(y, month, day, h, min, sec)
    if (!Number.isNaN(alt.getTime())) return alt.getTime()
  }
  const iso = s.replace(/\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i, (_, h, min, sec, ampm) => {
    let hr = parseInt(h, 10)
    if (ampm) {
      if (ampm.toUpperCase() === 'PM' && hr < 12) hr += 12
      if (ampm.toUpperCase() === 'AM' && hr === 12) hr = 0
    }
    return `T${String(hr).padStart(2, '0')}:${min}:${sec || '00'}`
  })
  const d2 = new Date(iso)
  return Number.isNaN(d2.getTime()) ? 0 : d2.getTime()
}

/** Sort by ModificationTimestamp (recent first). Fallback: CreationTimestamp, then TransRef numeric, then recordId. */
export function sortByModificationTimestamp(
  items: FindRecordWithId<PayablesMainFieldData>[],
): FindRecordWithId<PayablesMainFieldData>[] {
  return [...items].sort((a, b) => {
    const tsA = getModificationTimestamp(a)
    const tsB = getModificationTimestamp(b)
    const epochA = parseTimestampToEpoch(tsA)
    const epochB = parseTimestampToEpoch(tsB)
    if (epochA > 0 || epochB > 0) {
      const cmp = epochB - epochA
      if (cmp !== 0) return cmp
    }
    const refA = getTransRefSortKey(a)
    const refB = getTransRefSortKey(b)
    if (refA > 0 || refB > 0) return refB - refA
    const idA = Number(a.recordId) || 0
    const idB = Number(b.recordId) || 0
    return idB - idA
  })
}

/** Filter and sort by Status (Draft, Posted, Rejected, Approved) then by ModificationTimestamp (recent first). */
export function filterByStatusAndSort(
  items: FindRecordWithId<PayablesMainFieldData>[],
  status: string,
): FindRecordWithId<PayablesMainFieldData>[] {
  const filtered = items.filter((item) => getStatus(item) === status)
  return sortByModificationTimestamp(filtered)
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
