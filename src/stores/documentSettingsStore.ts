/**
 * Document settings: when to show the Download Invoice button.
 * Persists to FileMaker Payables_Settings.DocOption; falls back to localStorage when offline.
 */

import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { useFileMaker } from "../composables/useFileMaker";
import { LAYOUTS } from "../utils/filemakerApi";
import type { PayablesSettingsFieldData } from "../utils/filemakerApi";

export type InvoiceDownloadWhen =
  | "once_posted"   // Show when Posted or Approved
  | "approved_only" // Show only when Approved
  | "none";         // Do not show

const STORAGE_KEY = "invoice-download-when";

/** FileMaker DocOption value → internal value */
function fmToInternal(fm: string | undefined): InvoiceDownloadWhen {
  const v = (fm ?? "").trim();
  if (v === "Don't Show") return "none";
  if (v === "Approved") return "approved_only";
  if (v === "Posted") return "once_posted";
  return "approved_only";
}

/** Internal value → FileMaker DocOption value */
function internalToFm(v: InvoiceDownloadWhen): string {
  if (v === "none") return "Don't Show";
  if (v === "approved_only") return "Approved";
  return "Posted";
}

function loadFromStorage(): InvoiceDownloadWhen {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "once_posted" || v === "approved_only" || v === "none") return v;
  } catch {
    /* ignore */
  }
  return "approved_only";
}

/** Parse FileMaker "Yes"/"1" as true; "No"/"0"/empty as false. Default when empty. */
function parseYesNo(value: string | undefined, defaultWhenEmpty: boolean): boolean {
  const v = (value ?? "").trim().toLowerCase();
  if (!v) return defaultWhenEmpty;
  return v === "yes" || v === "1" || v === "true";
}

export const useDocumentSettingsStore = defineStore("documentSettings", () => {
  const invoiceDownloadWhen = ref<InvoiceDownloadWhen>(loadFromStorage());
  const settingsRecordId = ref<string | null>(null);
  /** HOD Email: recipient for notification mails (from Payables_Settings.HODEmail). */
  const hodEmail = ref<string>("");

  /** Feature flags from Payables_Settings (admin-configurable). */
  const bulkApproveEnabled = ref(true);
  const managerEditDraftEnabled = ref(false);
  const sessionTimeoutWarningEnabled = ref(true);
  const editRequestEnabled = ref(true);
  const overdueDays = ref(7);
  const overdueIndicatorEnabled = ref(true);
  const commandPaletteEnabled = ref(true);
  const bookletEnabled = ref(true);
  const chequeCollectionEnabled = ref(true);
  const taxViewEnabled = ref(true);
  const vendorsViewEnabled = ref(true);
  const approvalEmailToOfficerEnabled = ref(true);
  const onboardingEnabled = ref(true);
  /** Admin-configured URL for vendor cheque collection QR code. Empty = use default /vendor-collect. */
  const vendorCollectQrUrl = ref("");

  const { findRecordsWithIds, updateRecord, isConnected } = useFileMaker();

  watch(
    isConnected,
    (connected) => {
      if (connected) loadFromFileMaker();
    },
    { immediate: true },
  );

  async function loadFromFileMaker(): Promise<void> {
    if (!isConnected.value) return;
    const { data, error } = await findRecordsWithIds<PayablesSettingsFieldData>(
      LAYOUTS.PAYABLES_SETTINGS,
      { limit: 1 }
    );
    if (error || !data?.length) return;
    const record = data[0];
    settingsRecordId.value = record?.recordId ?? null;
    const fd = record?.fieldData as PayablesSettingsFieldData | undefined;
    const docOpt = fd?.DocOption;
    invoiceDownloadWhen.value = fmToInternal(docOpt);
    const hod = fd?.HODEmail ?? (fd as Record<string, unknown>)?.["HOD Email"] ?? (fd as Record<string, unknown>)?.["hodEmail"] ?? "";
    hodEmail.value = typeof hod === "string" ? hod.trim() : "";
    bulkApproveEnabled.value = parseYesNo(fd?.BulkApprove, true);
    managerEditDraftEnabled.value = parseYesNo(fd?.ManagerEditDraft, false);
    sessionTimeoutWarningEnabled.value = parseYesNo(fd?.SessionTimeoutWarning, true);
    editRequestEnabled.value = parseYesNo(fd?.EditRequestEnabled, true);
    const od = fd?.OverdueDays;
    const odNum = typeof od === "number" ? od : (od != null && od !== "" ? parseInt(String(od), 10) : NaN);
    overdueDays.value = Number.isFinite(odNum) && odNum >= 1 && odNum <= 365 ? odNum : 7;
    overdueIndicatorEnabled.value = parseYesNo(fd?.OverdueIndicatorEnabled, true);
    commandPaletteEnabled.value = parseYesNo(fd?.CommandPaletteEnabled, true);
    bookletEnabled.value = parseYesNo(fd?.BookletEnabled, true);
    chequeCollectionEnabled.value = parseYesNo(fd?.ChequeCollectionEnabled, true);
    taxViewEnabled.value = parseYesNo(fd?.TaxViewEnabled, true);
    vendorsViewEnabled.value = parseYesNo(fd?.VendorsViewEnabled, true);
    approvalEmailToOfficerEnabled.value = parseYesNo(fd?.ApprovalEmailToOfficer, true);
    onboardingEnabled.value = parseYesNo(fd?.OnboardingEnabled, true);
    const qrUrl = fd?.VendorCollectURL ?? (fd as Record<string, unknown>)?.["Vendor Collect URL"] ?? fd?.URL ?? "";
    vendorCollectQrUrl.value = typeof qrUrl === "string" ? qrUrl.trim() : "";
    try {
      localStorage.setItem(STORAGE_KEY, invoiceDownloadWhen.value);
    } catch {
      /* ignore */
    }
  }

  type FeatureFlagKey =
    | "BulkApprove"
    | "ManagerEditDraft"
    | "SessionTimeoutWarning"
    | "EditRequestEnabled"
    | "OverdueIndicatorEnabled"
    | "CommandPaletteEnabled"
    | "BookletEnabled"
    | "ChequeCollectionEnabled"
    | "TaxViewEnabled"
    | "VendorsViewEnabled"
    | "ApprovalEmailToOfficer"
    | "OnboardingEnabled";

  async function saveFeatureFlag(
    field: FeatureFlagKey,
    value: boolean
  ): Promise<{ error: string | null }> {
    if (!isConnected.value || !settingsRecordId.value) {
      return { error: "Not connected" };
    }
    const fmValue = value ? "Yes" : "No";
    const { error } = await updateRecord(
      LAYOUTS.PAYABLES_SETTINGS,
      settingsRecordId.value,
      { [field]: fmValue },
    );
    if (!error) {
      if (field === "BulkApprove") bulkApproveEnabled.value = value;
      else if (field === "ManagerEditDraft") managerEditDraftEnabled.value = value;
      else if (field === "SessionTimeoutWarning") sessionTimeoutWarningEnabled.value = value;
      else if (field === "EditRequestEnabled") editRequestEnabled.value = value;
      else if (field === "OverdueIndicatorEnabled") overdueIndicatorEnabled.value = value;
      else if (field === "CommandPaletteEnabled") commandPaletteEnabled.value = value;
      else if (field === "BookletEnabled") bookletEnabled.value = value;
      else if (field === "ChequeCollectionEnabled") chequeCollectionEnabled.value = value;
      else if (field === "TaxViewEnabled") taxViewEnabled.value = value;
      else if (field === "VendorsViewEnabled") vendorsViewEnabled.value = value;
      else if (field === "ApprovalEmailToOfficer") approvalEmailToOfficerEnabled.value = value;
      else if (field === "OnboardingEnabled") onboardingEnabled.value = value;
    }
    return { error };
  }

  async function saveOverdueDays(value: number): Promise<{ error: string | null }> {
    if (!isConnected.value || !settingsRecordId.value) {
      return { error: "Not connected" };
    }
    const clamped = Math.max(1, Math.min(365, Math.round(value)));
    const { error } = await updateRecord(
      LAYOUTS.PAYABLES_SETTINGS,
      settingsRecordId.value,
      { OverdueDays: clamped },
    );
    if (!error) overdueDays.value = clamped;
    return { error };
  }

  async function saveToFileMaker(): Promise<void> {
    if (!isConnected.value || !settingsRecordId.value) return;
    const fmValue = internalToFm(invoiceDownloadWhen.value);
    await updateRecord(
      LAYOUTS.PAYABLES_SETTINGS,
      settingsRecordId.value,
      { DocOption: fmValue },
    );
  }

  watch(
    invoiceDownloadWhen,
    async (v) => {
      try {
        localStorage.setItem(STORAGE_KEY, v);
      } catch {
        /* ignore */
      }
      await saveToFileMaker();
    },
    { immediate: false },
  );

  function setInvoiceDownloadWhen(v: InvoiceDownloadWhen): void {
    invoiceDownloadWhen.value = v;
  }

  async function saveVendorCollectQrUrl(value: string): Promise<{ error: string | null }> {
    if (!isConnected.value || !settingsRecordId.value) {
      return { error: "Not connected" };
    }
    const trimmed = value.trim();
    vendorCollectQrUrl.value = trimmed;
    const { error } = await updateRecord(
      LAYOUTS.PAYABLES_SETTINGS,
      settingsRecordId.value,
      { VendorCollectURL: trimmed },
      { allowEmptyStrings: true },
    );
    return { error };
  }

  async function saveHodEmail(value: string): Promise<{ error: string | null }> {
    if (!isConnected.value || !settingsRecordId.value) {
      return { error: "Not connected" };
    }
    const trimmed = value.trim();
    hodEmail.value = trimmed;
    const { error } = await updateRecord(
      LAYOUTS.PAYABLES_SETTINGS,
      settingsRecordId.value,
      { HODEmail: trimmed },
      { allowEmptyStrings: true },
    );
    return { error };
  }

  return {
    invoiceDownloadWhen,
    hodEmail,
    bulkApproveEnabled,
    managerEditDraftEnabled,
    sessionTimeoutWarningEnabled,
    editRequestEnabled,
    overdueDays,
    overdueIndicatorEnabled,
    commandPaletteEnabled,
    bookletEnabled,
    chequeCollectionEnabled,
    taxViewEnabled,
    vendorsViewEnabled,
    approvalEmailToOfficerEnabled,
    onboardingEnabled,
    setInvoiceDownloadWhen,
    loadFromFileMaker,
    vendorCollectQrUrl,
    saveVendorCollectQrUrl,
    saveHodEmail,
    saveFeatureFlag,
    saveOverdueDays,
  };
});
