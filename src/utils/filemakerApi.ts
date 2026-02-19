/**
 * FileMaker Data API helpers.
 * Database: PGH_Item_Distribution
 * Tables/Layouts: Payables_Main, Payables_Details
 */

const DEFAULT_BASE_URL = ''
const STORAGE_KEY_BASE_URL = 'fm_base_url'

let sessionBaseUrlOverride: string | null = (() => {
  try {
    return localStorage.getItem(STORAGE_KEY_BASE_URL)
  } catch {
    return null
  }
})()

export function getBaseUrl(): string {
  return sessionBaseUrlOverride ?? ((import.meta.env?.VITE_FILEMAKER_BASE_URL as string) || DEFAULT_BASE_URL)
}

/** Override base URL at runtime (e.g. from Connect modal when env is not set). Persists across refresh. */
export function setSessionBaseUrl(url: string | null): void {
  sessionBaseUrlOverride = url
  try {
    if (url) localStorage.setItem(STORAGE_KEY_BASE_URL, url)
    else localStorage.removeItem(STORAGE_KEY_BASE_URL)
  } catch {
    /* ignore */
  }
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
  VENDOR_TBL: 'Vendor_TBL',
  PAYABLES_USERS: 'Payables_Users',
  PAYABLES_SETTINGS: 'Payables_Settings',
  CHEQUE_COLLECTION: 'Cheque_Collection',
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
  /** Set when cheque is collected (e.g. "Yes") */
  ChequeIssued?: string
  ChequeIssuedDate?: string
  BankName?: string
  ChequeNo?: string
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

/**
 * Vendor_TBL fields (from schema):
 * Vendor_ID, Vendor_Name, Vendor_Location, Vendor_Email, GRA_Expiry_Date,
 * Received_Date, Tin_Number, WHT_Expiry_Date, Received_WHT_Date,
 * Expiry_Check, WHT_Expiry_Check (calculation fields)
 */
export interface VendorTblFieldData {
  Vendor_ID?: string
  Vendor_Name?: string
  Vendor_Location?: string
  Vendor_Email?: string
  GRA_Expiry_Date?: string
  Received_Date?: string
  Tin_Number?: string
  WHT_Expiry_Date?: string
  Received_WHT_Date?: string
  Expiry_Check?: string
  WHT_Expiry_Check?: string
}

/**
 * Payables_Users fields (from schema):
 * Email, FullName, Role, Status
 */
export interface PayablesUsersFieldData {
  Email?: string
  FullName?: string
  Role?: string
  Status?: string
}

/**
 * Payables_Settings fields (from schema):
 * DocOption: "Don't Show" | "Approved" | "Posted"
 */
export interface PayablesSettingsFieldData {
  DocOption?: string
}

/**
 * Cheque_Collection fields: logs when vendors collect cheques.
 * Links to Payables_Main via TransRef.
 */
export interface ChequeCollectionFieldData {
  TransRef?: string
  BankName?: string
  ChequeNo?: string
  Amount?: number
  ChequePayee?: string
  ReceivedBy?: string
  IDNo?: string
  Contact?: string
  TinNo?: string
  CollectionDate?: string
}

