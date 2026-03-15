/**
 * Activity/audit log for payable lifecycle events.
 * Writes to Payables_Activity_Log table.
 */

import { LAYOUTS } from './filemakerApi'
import { formatTimestampForFileMaker } from './filemakerMappers'

export type ActivityAction =
  | 'Created'
  | 'Edited'
  | 'Posted'
  | 'Rejected'
  | 'Approved'
  | 'Reposted'
  | 'Deleted'
  | 'Collected'
  | 'EditRequested'
  | 'EditAllowed'

type CreateRecordFn = (
  layout: string,
  fieldData: Record<string, string | number | null | undefined>,
) => Promise<{ id: string | null; error: string | null }>

/** Write an activity log entry. Returns error message if failed, null on success. */
export async function writeActivityLog(
  createRecord: CreateRecordFn,
  transRef: string,
  action: ActivityAction,
  actor: string,
  reason?: string,
  amountAtAction?: number | string | null,
  vendorNameAtAction?: string | null,
): Promise<string | null> {
  const payload: Record<string, string | number | null | undefined> = {
    TransRef: transRef,
    Action: action,
    Actor: actor || '—',
    Timestamp: formatTimestampForFileMaker(),
  }
  if (reason != null && reason.trim() !== '') {
    payload.Reason = reason.trim()
  }
  if (amountAtAction != null && amountAtAction !== '') {
    const num = typeof amountAtAction === 'number' ? amountAtAction : parseFloat(String(amountAtAction))
    if (!Number.isNaN(num)) {
      payload.AmountAtAction = num
    }
  }
  if (vendorNameAtAction != null && String(vendorNameAtAction).trim() !== '') {
    payload.VendorNameAtAction = String(vendorNameAtAction).trim()
  }
  const { error } = await createRecord(LAYOUTS.PAYABLES_ACTIVITY_LOG, payload)
  return error ?? null
}
