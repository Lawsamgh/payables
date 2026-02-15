/**
 * Shared types for Accounts Payable app and FileMaker integration.
 */

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error'

export interface FileMakerCredentials {
  username: string
  password: string
}

export interface Vendor {
  id: string
  vendor_name: string
  vendor_id: string
  payment_terms: string
  contact_email: string
  phone_number: string
  currency: string
  created_date: string
}

export type PayableStatus = 'Pending' | 'Paid' | 'Overdue'

export interface PayableRow {
  id: string
  /** FileMaker recordId for Payables_Details (when loaded); used to update existing records on save. */
  recordId?: string
  vendor_id: string
  invoice_number: string
  vendor_name: string
  invoice_date: string
  due_date: string
  amount: string
  tax: string
  total: string
  status: PayableStatus
  payment_date: string
  reference: string
  created_date: string
}

export interface FindOptions {
  limit?: number
  offset?: number
  sort?: string
}

export type CellValue = string | number

export type GetCellValueFn = (row: number, col: number) => CellValue

export type HeaderToColMap = Record<string, number>

export type SelectionDirection =
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'tab'
  | 'tabReverse'
  | 'enter'
  | 'enterReverse'
