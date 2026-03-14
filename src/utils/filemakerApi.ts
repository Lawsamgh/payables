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
    const raw = msg.message?.trim();
    if (raw && raw !== "OK") return raw;
    const code = msg.code != null ? String(msg.code) : "unknown";
    return `Request failed (code ${code})`;
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
  EMAIL_LIST: "EmailList",
} as const;

/**
 * Payables_Main fields (from schema):
 * CreationTimestamp, VendorID, VendorName, VendorEmail, Date, TransRef, Posted, Currency, Total,
 * PostedDate, Status (calculation), Approved, Rejected
 * Note: InvoiceNumber is NOT sent to Payables_Main - it's only in Payables_Details
 */
export interface PayablesMainFieldData {
  CreationTimestamp?: string;
  ModificationTimestamp?: string;
  PurchaseOrder?: string;
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
  RejectedBy?: string;
  RejectReason?: string;
  /** Set when cheque is collected (e.g. "Yes") */
  ChequeIssued?: string;
  ChequeIssuedDate?: string;
  BankName?: string;
  ChequeNo?: string;
  Code?: string;
  /** Advance payment amount (deducted from Amount to Pay). */
  AdvancePayment?: number | string;
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
 * Tax_Type, T_Code, Tax_Name, Tax_Rate, Start_Date, End_Date, Status, Action
 * Action: "Add" = add tax to amount, "Sub" = subtract from amount (e.g. WHT)
 */
export interface TaxValueFieldData {
  Tax_Type?: string;
  T_Code?: string;
  Tax_Name?: string;
  Tax_Rate?: number;
  Start_Date?: string;
  End_Date?: string;
  Status?: string;
  Action?: string; // "Add" | "Sub"
}

/**
 * Payable_Invoice fields (from schema):
 * invoiceNumber (Text), Tax_Type (Text), TaxName (Text), Rate (Number)
 */
export interface PayableInvoiceFieldData {
  invoiceNumber?: string;
  Tax_Type?: string;
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
 * Expiry_Check, WHT_Expiry_Check (calculation fields),
 * VendorBalance (from BC via GetVendorBalanceFromBC script)
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
  VendorBalance?: string | number;
}

/**
 * Payables_Users fields (from schema):
 * Email, FullName, Role, Status, Onboarded
 */
export interface PayablesUsersFieldData {
  Email?: string;
  FullName?: string;
  Role?: string;
  Status?: string;
  Onboarded?: string;
  /** App theme: "dark" | "light" */
  Theme?: string;
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
 * - firstLoginRequired: true if FirstLoginRequired is "Yes" (user must set password via reset link)
 * - error: set if a connection or unexpected error occurred
 */
export interface CheckEmailResult {
  exists: boolean;
  inactive?: boolean;
  firstLoginRequired?: boolean;
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
 *   Uses GET /records (not POST /_find) to avoid 500 errors when the _find
 *   endpoint fails. Fetches up to 500 records and matches by email client-side.
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

    // Use GET /records instead of POST /_find to avoid 500 when _find endpoint fails.
    // Fetch all records and match client-side (same logic as previous fallback).
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

    // Check FirstLoginRequired on first active match
    const activeMatch = matchingRecords.find((r) => {
      const status = getFieldValue(r?.fieldData, "Status").toLowerCase();
      return status !== "inactive";
    });
    const firstLoginVal = getFieldValue(activeMatch?.fieldData, "FirstLoginRequired").toLowerCase();
    const firstLoginRequired = firstLoginVal === "yes" || firstLoginVal === "1";

    return { exists: true, firstLoginRequired };
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
 * Run a FileMaker script using service credentials (VITE_FILEMAKER_USER / VITE_FILEMAKER_PASSWORD).
 * Used for public flows like reset password where the user is not authenticated.
 * Returns scriptResult and scriptError; error is set for connection/auth failures.
 */
export async function runScriptWithServiceAuth(
  layout: string,
  scriptName: string,
  scriptParam?: string,
): Promise<{
  error: string | null;
  scriptResult?: string | null;
  scriptError?: string;
}> {
  const base = getBaseUrl()?.trim();
  if (!base)
    return {
      error: "FileMaker URL not set",
      scriptResult: null,
      scriptError: undefined,
    };

  const envUser = (import.meta.env?.VITE_FILEMAKER_USER as string) || "";
  const envPass = (import.meta.env?.VITE_FILEMAKER_PASSWORD as string) || "";
  if (!envUser.trim() || !envPass) {
    return {
      error: "Service credentials not configured",
      scriptResult: null,
      scriptError: undefined,
    };
  }

  const urlBase = base.replace(/\/$/, "");

  try {
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
      return {
        error: "Could not connect to FileMaker",
        scriptResult: null,
        scriptError: undefined,
      };
    }

    const path = `/layouts/${encodeURIComponent(layout)}/script/${encodeURIComponent(scriptName)}`;
    const url =
      scriptParam != null && scriptParam !== ""
        ? `${path}?script.param=${encodeURIComponent(scriptParam)}`
        : path;

    const res = await axios.get<{
      response?: { scriptError?: string; scriptResult?: string };
      messages?: Array<{ code?: string; message?: string }>;
    }>(`${urlBase}${path.startsWith("/") ? "" : "/"}${url}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      timeout: 15000,
    });

    const scriptError = res.data?.response?.scriptError ?? "0";
    const scriptResult = res.data?.response?.scriptResult ?? null;

    if (scriptError !== "0") {
      const raw = (scriptResult ?? "").trim();
      const msg = res.data?.messages?.[0]?.message?.trim();
      const errMsg =
        raw && raw !== "0" && raw !== "OK"
          ? raw
          : msg && msg !== "OK" && msg.length > 2
            ? msg
            : `Script error (code ${scriptError})`;
      return { error: errMsg, scriptResult, scriptError };
    }

    return { error: null, scriptResult, scriptError };
  } catch (err) {
    const msg = parseFileMakerError(err);
    return {
      error: msg,
      scriptResult: null,
      scriptError: undefined,
    };
  }
}

/**
 * EmailList fields: Email, Label, Active (all Text).
 * Used for notification recipient dropdown.
 */
export interface EmailListFieldData {
  Email?: string;
  Label?: string;
  /** "Yes" / "1" = active, shown in dropdown. */
  Active?: string;
}

/**
 * Payables_Settings fields (from schema):
 * DocOption: "Don't Show" | "Approved" | "Posted"
 * HODEmail: email address of recipient for notification mails (Head of Department)
 * BulkApprove: "Yes" | "No" – enable bulk approve in Posted tab
 * ManagerEditDraft: "Yes" | "No" – allow managers to edit Draft/Rejected entries
 * SessionTimeoutWarning: "Yes" | "No" – show session expiry warning modal
 * EditRequestEnabled: "Yes" | "No" – enable edit request (mistake posted) flow
 * OverdueDays: number – days threshold for overdue (default 7)
 * OverdueIndicatorEnabled: "Yes" | "No" – show overdue badges and modal
 * CommandPaletteEnabled: "Yes" | "No" – enable ⌘K command palette
 * BookletEnabled: "Yes" | "No" – enable multi-entry booklet view
 * ChequeCollectionEnabled: "Yes" | "No" – show Cheque collection section
 * TaxViewEnabled: "Yes" | "No" – show Tax section
 * VendorsViewEnabled: "Yes" | "No" – show Vendors section
 * ApprovalEmailToOfficer: "Yes" | "No" – email poster + CC officers when entry approved
 * OnboardingEnabled: "Yes" | "No" – show onboarding modal for new users
 * TokenExpiry: number – token expiry time in minutes
 */
export interface PayablesSettingsFieldData {
  DocOption?: string;
  HODEmail?: string;
  /** Second HOD to CC when officer posts an entry (NotifyManagerOnPost). */
  CopyHODEmail?: string;
  BulkApprove?: string;
  ApprovalEmailToOfficer?: string;
  /** Copy officer on post: CC logged-in officer when sending invoice emails to vendors. */
  CopyOfficerOnPost?: string;
  ManagerEditDraft?: string;
  SessionTimeoutWarning?: string;
  EditRequestEnabled?: string;
  OverdueDays?: string | number;
  OverdueIndicatorEnabled?: string;
  CommandPaletteEnabled?: string;
  BookletEnabled?: string;
  ChequeCollectionEnabled?: string;
  TaxViewEnabled?: string;
  VendorsViewEnabled?: string;
  OnboardingEnabled?: string;
  /** Admin-configured URL for vendor cheque collection QR code (Settings > Manage URL). */
  VendorCollectURL?: string;
  /** Admin-configured URL used in password-set emails (Payables_Settings.SetPasswordURL). */
  SetPasswordURL?: string;
  /** Max number of invoices that can be selected for Send mail at once. */
  EmailMaxLimit?: string | number;
  /** Token expiry time in minutes. */
  TokenExpiry?: string | number;
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
