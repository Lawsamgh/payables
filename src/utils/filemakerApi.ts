/**
 * FileMaker Data API helpers.
 * Database: PGH_Item_Distribution
 * Tables/Layouts: Payables_Main, Payables_Details
 */

import axios from "axios";

const DEFAULT_BASE_URL = "";
const STORAGE_KEY_BASE_URL = "fm_base_url";

let sessionBaseUrlOverride: string | null = (() => {
  try {
    return localStorage.getItem(STORAGE_KEY_BASE_URL);
  } catch {
    return null;
  }
})();

export function getBaseUrl(): string {
  return (
    sessionBaseUrlOverride ??
    ((import.meta.env?.VITE_FILEMAKER_BASE_URL as string) || DEFAULT_BASE_URL)
  );
}

/** Override base URL at runtime (e.g. from Connect modal when env is not set). Persists across refresh. */
export function setSessionBaseUrl(url: string | null): void {
  sessionBaseUrlOverride = url;
  try {
    if (url) localStorage.setItem(STORAGE_KEY_BASE_URL, url);
    else localStorage.removeItem(STORAGE_KEY_BASE_URL);
  } catch {
    /* ignore */
  }
}

export interface AuthCredentials {
  username: string;
  password: string;
}

export function getAuthHeaders(
  token?: string | null,
  credentials?: AuthCredentials | null,
): Record<string, string> {
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  if (credentials?.username && credentials?.password) {
    const encoded = btoa(`${credentials.username}:${credentials.password}`);
    return { Authorization: `Basic ${encoded}` };
  }
  return {};
}

export function parseFileMakerError(error: unknown): string {
  if (!error) return "Unknown error";
  const err = error as {
    response?: {
      data?: { messages?: Array<{ message?: string; code?: number }> };
      message?: string;
    };
    message?: string;
  };
  const data = err.response?.data;
  if (data?.messages?.[0]) {
    const msg = data.messages[0];
    return msg.message ?? `${msg.code}: ${JSON.stringify(msg)}`;
  }
  if (typeof data === "string") return data;
  if (err.message) return err.message;
  return "Request failed";
}

/** Layout names for PGH_Item_Distribution */
export const LAYOUTS = {
  PAYABLES_MAIN: "Payables_Main",
  PAYABLES_DETAILS: "Payables_Details",
  TAX_VALUE: "Tax_Value | TBL",
  PAYABLE_INVOICE: "Payable_Invoice",
  PAYABLES_REJECTION_HISTORY: "Payables_Rejection_History",
  PAYABLES_ACTIVITY_LOG: "Payables_Activity_Log",
  VENDOR_TBL: "Vendor_TBL",
  PAYABLES_USERS: "Payables_Users",
  PAYABLES_SETTINGS: "Payables_Settings",
  CHEQUE_COLLECTION: "Cheque_Collection",
  PAYABLES_EDIT_REQUEST: "Payables_Edit_Request",
} as const;

/**
 * Payables_Main fields (from schema):
 * CreationTimestamp, VendorID, VendorName, VendorEmail, Date, TransRef, Posted, Currency, Total,
 * PostedDate, Status (calculation), Approved, Rejected
 * Note: InvoiceNumber is NOT sent to Payables_Main - it's only in Payables_Details
 */
export interface PayablesMainFieldData {
  CreationTimestamp?: string;
  VendorID?: string;
  VendorName?: string;
  VendorEmail?: string;
  Date?: string; // Date field (replaces Payment terms)
  TransRef?: string;
  Posted?: string;
  Currency?: string;
  Total?: number;
  PostedDate?: string;
  /** Calculation: Approved | Rejected | Posted | Draft */
  Status?: string;
  Approved?: string;
  ApprovedBy?: string;
  Rejected?: string;
  RejectReason?: string;
  /** Set when cheque is collected (e.g. "Yes") */
  ChequeIssued?: string;
  ChequeIssuedDate?: string;
  BankName?: string;
  ChequeNo?: string;
}

/**
 * Payables_Details fields (from schema):
 * TransRef (FK to Payables_Main), InvoiceNumber, Amount, Tax (calculated from Payable_Invoice), Tax Amount (calculation field), Total
 * Note: Tax is a calculated field in FileMaker - do not send it when creating/updating records.
 * Note: Tax Amount is a calculation field in FileMaker - do not send it when creating/updating records.
 */
export interface PayablesDetailsFieldData {
  TransRef?: string;
  /** Invoice number: send as number when numeric, otherwise as string (e.g. "INV-001") */
  InvoiceNumber?: number | string;
  Amount?: number;
  Tax?: number; // Calculated field - read-only, don't send when updating
  TaxAmount?: number; // Calculation field - read-only, don't send when updating (mapped from grid Reference column)
  Total?: number;
}

/**
 * Tax_Value | TBL fields (from schema):
 * Tax_Type, T_Code, Tax_Name, Tax_Rate, Start_Date, End_Date, Status
 */
export interface TaxValueFieldData {
  Tax_Type?: string;
  T_Code?: string;
  Tax_Name?: string;
  Tax_Rate?: number;
  Start_Date?: string;
  End_Date?: string;
  Status?: string;
}

/**
 * Payable_Invoice fields (from schema):
 * invoiceNumber (Text), TaxName (Text), Rate (Number)
 */
export interface PayableInvoiceFieldData {
  invoiceNumber?: string;
  TaxName?: string;
  Rate?: number;
}

/**
 * Payables_Activity_Log fields: audit trail for payable lifecycle events.
 */
export interface PayablesActivityLogFieldData {
  TransRef?: string;
  Action?: string; // Created | Edited | Posted | Rejected | Approved | Reposted | EditRequested | EditAllowed
  Actor?: string;
  Timestamp?: string;
  Reason?: string;
}

/**
 * Payables_Edit_Request fields: officer request to edit a mistakenly posted entry.
 */
export interface PayablesEditRequestFieldData {
  TransRef?: string;
  RequestedBy?: string;
  RequestedAt?: string;
  Status?: string; // Pending | Granted | Denied
  GrantedBy?: string;
}

/**
 * Vendor_TBL fields (from schema):
 * Vendor_ID, Vendor_Name, Vendor_Location, Vendor_Email, GRA_Expiry_Date,
 * Received_Date, Tin_Number, WHT_Expiry_Date, Received_WHT_Date,
 * Expiry_Check, WHT_Expiry_Check (calculation fields)
 */
export interface VendorTblFieldData {
  Vendor_ID?: string;
  Vendor_Name?: string;
  Vendor_Location?: string;
  Vendor_Email?: string;
  GRA_Expiry_Date?: string;
  Received_Date?: string;
  Tin_Number?: string;
  WHT_Expiry_Date?: string;
  Received_WHT_Date?: string;
  Expiry_Check?: string;
  WHT_Expiry_Check?: string;
}

/**
 * Payables_Users fields (from schema):
 * Email, FullName, Role, Status
 */
export interface PayablesUsersFieldData {
  Email?: string;
  FullName?: string;
  Role?: string;
  Status?: string;
}

function getFieldValue(
  fd: Record<string, unknown> | undefined,
  key: string,
): string {
  if (!fd) return "";
  const v =
    fd[key] ??
    fd[key.replace(/([A-Z])/g, " $1").trim()] ??
    fd[key.charAt(0).toLowerCase() + key.slice(1)];
  if (v == null || v === "") return "";
  return String(v).trim();
}

/**
 * Result of checking if an email exists in Payables_Users.
 * - exists: true if the email was found AND the account is active
 * - inactive: true if the email was found but Status is "Inactive"
 * - error: set if a connection or unexpected error occurred
 */
export interface CheckEmailResult {
  exists: boolean;
  inactive?: boolean;
  error?: string;
}

/**
 * Check if an email exists in Payables_Users using VITE_FILEMAKER_USER and VITE_FILEMAKER_PASSWORD.
 * Used at login to validate email before showing the password step.
 *
 * Returns:
 *   { exists: true }              — email found and account is Active
 *   { exists: false, inactive: true } — email found but account is Inactive
 *   { exists: false }             — email not found
 *   { exists: false, error: '…' } — connection or unexpected error
 *
 * Strategy:
 *   1. Try FileMaker _find with Email + Status=Active (exact match)
 *   2. Try _find with lowercase field name variant
 *   3. Try _find for email only (to detect inactive accounts)
 *   4. Fall back to fetching all records and matching client-side
 *      (handles field name / case differences in older FM layouts)
 */
export async function checkEmailExistsInPayablesUsers(
  email: string,
): Promise<CheckEmailResult> {
  const base = getBaseUrl()?.trim();
  if (!base) return { exists: false, error: "FileMaker URL not set" };

  const envUser = (import.meta.env?.VITE_FILEMAKER_USER as string) || "";
  const envPass = (import.meta.env?.VITE_FILEMAKER_PASSWORD as string) || "";
  if (!envUser.trim() || !envPass) {
    return { exists: false, error: "Service credentials not configured" };
  }

  const urlBase = base.replace(/\/$/, "");
  const exactEmail = String(email).trim();
  const normalizedEmail = exactEmail.toLowerCase();

  try {
    // ── 1. Open a service session ──────────────────────────────────────────
    const sessRes = await axios.post<{ response?: { token?: string } }>(
      `${urlBase}/sessions`,
      {},
      {
        auth: { username: envUser.trim(), password: envPass },
        headers: { "Content-Type": "application/json" },
        timeout: 15000,
      },
    );
    const token =
      sessRes.data?.response?.token ??
      (sessRes.headers?.["x-fm-data-access-token"] as string) ??
      (sessRes.headers?.["X-FM-Data-Access-Token"] as string);

    if (!token) {
      return { exists: false, error: "Could not connect to FileMaker" };
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    // ── 2. Helper: run a _find query, returns matching records ─────────────
    const runFind = async (
      query: Record<string, string>,
    ): Promise<Array<{ fieldData?: Record<string, unknown> }>> => {
      try {
        const res = await axios.post<{
          response?: {
            data?: Array<{ fieldData?: Record<string, unknown> }>;
          };
        }>(
          `${urlBase}/layouts/Payables_Users/_find`,
          { query: [query], limit: "5" },
          { headers, timeout: 15000 },
        );
        return res.data?.response?.data ?? [];
      } catch (e) {
        const err = e as {
          response?: {
            data?: { messages?: Array<{ code?: string; message?: string }> };
          };
        };
        const code = String(err.response?.data?.messages?.[0]?.code ?? "");
        const msg = String(
          err.response?.data?.messages?.[0]?.message ?? "",
        ).toLowerCase();
        // FM error 401 = no records match the request — not a real error
        if (code === "401" || msg.includes("no records match")) {
          return [];
        }
        throw e;
      }
    };

    // ── 3. Try _find: email AND Status = Active ────────────────────────────
    let activeRecords = await runFind({
      Email: `=${exactEmail}`,
      Status: "Active",
    });

    // Retry with lowercase field name variant
    if (activeRecords.length === 0) {
      activeRecords = await runFind({
        email: `=${exactEmail}`,
        Status: "Active",
      });
    }

    if (activeRecords.length > 0) {
      return { exists: true };
    }

    // ── 4. Try _find: email only (no Status filter) to detect inactive ─────
    let emailOnlyRecords = await runFind({ Email: `=${exactEmail}` });
    if (emailOnlyRecords.length === 0) {
      emailOnlyRecords = await runFind({ email: `=${exactEmail}` });
    }

    if (emailOnlyRecords.length > 0) {
      // Email exists — check whether all matching records are Inactive
      const allInactive = emailOnlyRecords.every((r) => {
        const status = getFieldValue(r?.fieldData, "Status").toLowerCase();
        return status === "inactive";
      });
      if (allInactive) {
        return { exists: false, inactive: true };
      }
      // Found but not inactive and not active — treat as active to be safe
      return { exists: true };
    }

    // ── 5. Fallback: fetch all records and match client-side ───────────────
    //    (handles layouts where _find field names differ from actual names)
    const listRes = await axios.get<{
      response?: {
        data?: Array<{ fieldData?: Record<string, unknown> }>;
      };
    }>(`${urlBase}/layouts/Payables_Users/records`, {
      params: { _limit: "500" },
      headers,
      timeout: 15000,
    });

    const allRecords = listRes.data?.response?.data ?? [];

    // Find records matching this email (case-insensitive)
    const matchingRecords = allRecords.filter((r) => {
      const fd = r?.fieldData;
      const rowEmail = getFieldValue(fd, "Email").toLowerCase();
      return rowEmail === normalizedEmail;
    });

    if (matchingRecords.length === 0) {
      return { exists: false };
    }

    // Check Status on matched records
    const allInactive = matchingRecords.every((r) => {
      const status = getFieldValue(r?.fieldData, "Status").toLowerCase();
      return status === "inactive";
    });

    if (allInactive) {
      return { exists: false, inactive: true };
    }

    return { exists: true };
  } catch (err) {
    const msg = parseFileMakerError(err);
    if (
      msg &&
      (msg.toLowerCase().includes("no record") ||
        msg.toLowerCase().includes("401"))
    ) {
      return { exists: false };
    }
    return { exists: false, error: msg };
  }
}

/**
 * Payables_Settings fields (from schema):
 * DocOption: "Don't Show" | "Approved" | "Posted"
 */
export interface PayablesSettingsFieldData {
  DocOption?: string;
}

/**
 * Cheque_Collection fields: logs when vendors collect cheques.
 * Links to Payables_Main via TransRef.
 */
export interface ChequeCollectionFieldData {
  TransRef?: string;
  BankName?: string;
  ChequeNo?: string;
  Amount?: number;
  ChequePayee?: string;
  ReceivedBy?: string;
  IDNo?: string;
  Contact?: string;
  TinNo?: string;
  CollectionDate?: string;
  /** Officer who issued/logged the collection (FullName from Payables_Users). */
  IssuedBy?: string;
}
