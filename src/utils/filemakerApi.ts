/**
 * FileMaker Data API helpers.
 * Database: PGH_Item_Distribution
 * Tables/Layouts: Payables_Main, Payables_Details
 */

const DEFAULT_BASE_URL = ''

export function getBaseUrl(): string {
  return (import.meta.env?.VITE_FILEMAKER_BASE_URL as string) || DEFAULT_BASE_URL
}

export interface AuthCredentials {
  username: string
  password: string
}

export function getAuthHeaders(
  token?: string | null,
  credentials?: AuthCredentials | null
): Record<string, string> {
  if (token) {
    return { Authorization: `Bearer ${token}` }
  }
  if (credentials?.username && credentials?.password) {
    const encoded = btoa(`${credentials.username}:${credentials.password}`)
    return { Authorization: `Basic ${encoded}` }
  }
  return {}
}

export function parseFileMakerError(error: unknown): string {
  if (!error) return 'Unknown error'
  const err = error as { response?: { data?: { messages?: Array<{ message?: string; code?: number }> }; message?: string }; message?: string }
  const data = err.response?.data
  if (data?.messages?.[0]) {
    const msg = data.messages[0]
    return msg.message ?? `${msg.code}: ${JSON.stringify(msg)}`
  }
  if (typeof data === 'string') return data
  if (err.message) return err.message
  return 'Request failed'
}

/** Layout names for PGH_Item_Distribution */
export const LAYOUTS = {
  PAYABLES_MAIN: 'Payables_Main',
  PAYABLES_DETAILS: 'Payables_Details',
  TAX_VALUE: 'Tax_Value | TBL',
  PAYABLE_INVOICE: 'Payable_Invoice',
  PAYABLES_REJECTION_HISTORY: 'Payables_Rejection_History',
} as const

/**
 * Payables_Main fields (from schema):
 * CreationTimestamp, VendorID, VendorName, VendorEmail, Date, TransRef, Posted, Currency, Total,
 * PostedDate, Status (calculation), Approved, Rejected
 * Note: InvoiceNumber is NOT sent to Payables_Main - it's only in Payables_Details
 */
export interface PayablesMainFieldData {
  CreationTimestamp?: string
  VendorID?: string
  VendorName?: string
  VendorEmail?: string
  Date?: string // Date field (replaces Payment terms)
  TransRef?: string
  Posted?: string
  Currency?: string
  Total?: number
  PostedDate?: string
  /** Calculation: Approved | Rejected | Posted | Draft */
  Status?: string
  Approved?: string
  Rejected?: string
  RejectReason?: string
}

/**
 * Payables_Details fields (from schema):
 * TransRef (FK to Payables_Main), InvoiceNumber, Amount, Tax (calculated from Payable_Invoice), Tax Amount (calculation field), Total
 * Note: Tax is a calculated field in FileMaker - do not send it when creating/updating records.
 * Note: Tax Amount is a calculation field in FileMaker - do not send it when creating/updating records.
 */
export interface PayablesDetailsFieldData {
  TransRef?: string
  /** Invoice number: send as number when numeric, otherwise as string (e.g. "INV-001") */
  InvoiceNumber?: number | string
  Amount?: number
  Tax?: number // Calculated field - read-only, don't send when updating
  TaxAmount?: number // Calculation field - read-only, don't send when updating (mapped from grid Reference column)
  Total?: number
}

/**
 * Tax_Value | TBL fields (from schema):
 * Tax_Type, T_Code, Tax_Name, Tax_Rate, Start_Date, End_Date, Status
 */
export interface TaxValueFieldData {
  Tax_Type?: string
  T_Code?: string
  Tax_Name?: string
  Tax_Rate?: number
  Start_Date?: string
  End_Date?: string
  Status?: string
}

/**
 * Payable_Invoice fields (from schema):
 * invoiceNumber (Text), TaxName (Text), Rate (Number)
 */
export interface PayableInvoiceFieldData {
  invoiceNumber?: string
  TaxName?: string
  Rate?: number
}

