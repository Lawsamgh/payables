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

export const useDocumentSettingsStore = defineStore("documentSettings", () => {
  const invoiceDownloadWhen = ref<InvoiceDownloadWhen>(loadFromStorage());
  const settingsRecordId = ref<string | null>(null);

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
    const docOpt = (record?.fieldData as PayablesSettingsFieldData | undefined)?.DocOption;
    invoiceDownloadWhen.value = fmToInternal(docOpt);
    try {
      localStorage.setItem(STORAGE_KEY, invoiceDownloadWhen.value);
    } catch {
      /* ignore */
    }
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

  return {
    invoiceDownloadWhen,
    setInvoiceDownloadWhen,
    loadFromFileMaker,
  };
});
