/**
 * Payables (grid rows) state. Syncs with FileMaker PGH_Item_Distribution:
 * Payables_Main (vendor + invoice) and Payables_Details (amount, tax, total).
 */

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  useFileMaker,
  type FileMakerFieldData,
} from "../composables/useFileMaker";
import { useVendorStore } from "./vendorStore";
import { LAYOUTS } from "../utils/filemakerApi";
import {
  rowToPayablesMain,
  rowToPayablesDetails,
  formatDateForFileMaker,
} from "../utils/filemakerMappers";
import type { PayableRow, PayableStatus } from "../types";
import type { ColumnKey } from "../composables/useSpreadsheet";

const STATUS_OPTIONS: PayableStatus[] = ["Pending", "Paid", "Overdue"];

/** Get string from row trying snake_case, camelCase, and PascalCase keys. */
function getRowStr(row: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    const v = row[k];
    if (v !== undefined && v !== null) {
      const s = String(v).trim();
      if (s !== "") return s;
    }
  }
  return "";
}

/** Return a user-friendly message when the error is due to expired/invalid FileMaker session. */
function normalizeFileMakerError(context: string, apiError: string): string {
  const lower = apiError.toLowerCase();
  if (lower.includes("token") || lower.includes("unauthorized") || lower.includes("401") || lower.includes("session")) {
    return "Session expired. Please connect to FileMaker again (click Connect in the status bar).";
  }
  return `${context}: ${apiError}`;
}

/** Check if row at index has data we send to FileMaker (read from current store state, same as grid). */
function isRowEmptyByIndex(rowsSnapshot: PayableRow[], index: number): boolean {
  const row = rowsSnapshot[index];
  if (!row) return true;
  const r = { ...row } as Record<string, unknown>;
  const inv = getRowStr(r, "invoice_number", "invoiceNumber", "InvoiceNumber");
  const amtStr = getRowStr(r, "amount", "Amount");
  const totalStr = getRowStr(r, "total", "Total");
  const hasInv = inv.length > 0;
  const hasAmount = amtStr !== "" && !Number.isNaN(parseFloat(amtStr));
  const hasTotal = totalStr !== "" && !Number.isNaN(parseFloat(totalStr));
  return !hasInv && !hasAmount && !hasTotal;
}

function emptyRow(overrides: Partial<PayableRow> = {}): PayableRow {
  return {
    id: "",
    vendor_id: "",
    invoice_number: "",
    vendor_name: "",
    invoice_date: "",
    due_date: "",
    amount: "",
    tax: "",
    total: "",
    status: "Pending",
    payment_date: "",
    reference: "",
    created_date: "",
    ...overrides,
  };
}

export const usePayableStore = defineStore("payable", () => {
  const rows = ref<PayableRow[]>([emptyRow()]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const syncing = ref(false);
  /** When set, entry view shows only Details for this Main (TransRef). */
  const currentTransRef = ref<string | null>(null);
  /** Main record id (for updating Posted after post). */
  const currentMainRecordId = ref<string | null>(null);
  /** True when the current Main has Posted = "Yes" (hide Post button). */
  const mainPosted = ref(false);
  /** Status from Payables_Main (Approved | Rejected | Posted | Draft). */
  const mainStatus = ref<string | null>(null);
  /** Reject reason from Payables_Main when Status is Rejected. */
  const mainRejectReason = ref<string | null>(null);
  /** Total from Payables_Main (calculation) when loaded; null when not loaded or cleared. */
  const mainTotalFromMain = ref<string | number | null>(null);
  /** Cheque issued state from Payables_Main (when cheque collected). */
  const mainChequeIssued = ref<string | null>(null);
  const mainChequeIssuedDate = ref<string | null>(null);
  const mainBankName = ref<string | null>(null);
  const mainChequeNo = ref<string | null>(null);
  /** Vendor expiry check display text (from Vendor_TBL). */
  const mainExpiryCheckDis = ref<string | null>(null);
  const mainWhtExpiryCheckDis = ref<string | null>(null);
  /** Vendor expiry check status (Valid/Invalid) for coloring. */
  const mainExpiryCheck = ref<string | null>(null);
  const mainWhtExpiryCheck = ref<string | null>(null);
  /** True when any cell has been edited or a row added/removed since last load or save. */
  const isDirty = ref(false);
  /** FileMaker recordIds to delete on next save (rows user removed that existed in FileMaker). */
  const pendingDeletes = ref<string[]>([]);
  /** Last deleted row for Undo (cleared on Save or when undo is used). */
  const lastDeleted = ref<{ row: PayableRow; index: number } | null>(null);

  const rowCount = computed(() => rows.value.length);
  /** Count of rows that have data (excludes empty placeholder row). */
  const filledRowCount = computed(() =>
    rows.value.filter((r, i) => !isRowEmptyByIndex(rows.value, i)).length,
  );
  const hasUndoDelete = computed(() => lastDeleted.value != null);

  const hasNewRows = computed(() =>
    rows.value.some((r) => {
      const id = r?.id;
      if (id == null || id === "") return true;
      const s = String(id).trim();
      if (s === "") return true;
      if (s.startsWith("loaded-") || s.startsWith("synced-")) return false;
      return true;
    }),
  );

  /** Entry total: from Payables_Main when loaded and not dirty, otherwise sum of grid row totals. */
  const entryTotal = computed(() => {
    if (isDirty.value || mainTotalFromMain.value == null) {
      const sum = rows.value.reduce((acc, r) => {
        const t = parseFloat(String(r.total ?? ""));
        return acc + (Number.isNaN(t) ? 0 : t);
      }, 0);
      return sum;
    }
    const v = mainTotalFromMain.value;
    const n = typeof v === "number" ? v : parseFloat(String(v));
    return Number.isNaN(n) ? 0 : n;
  });

  function recomputeTotal(rowIndex: number): void {
    const r = rows.value[rowIndex];
    if (!r) return;
    const amount = parseFloat(r.amount);
    const tax = parseFloat(r.tax);
    const total =
      (Number.isNaN(amount) ? 0 : amount) + (Number.isNaN(tax) ? 0 : tax);
    if (!Number.isNaN(total)) {
      rows.value = rows.value.map((row, i) =>
        i === rowIndex ? { ...row, total: String(total) } : row,
      );
    }
  }

  function addRow(aboveIndex: number = -1): void {
    isDirty.value = true;
    if (aboveIndex >= 0) {
      const newRow = emptyRow();
      rows.value = [
        ...rows.value.slice(0, aboveIndex),
        newRow,
        ...rows.value.slice(aboveIndex),
      ];
    } else {
      rows.value = [...rows.value, emptyRow()];
    }
  }

  function removeRow(index: number): void {
    if (index < 0 || index >= rows.value.length) return;
    const row = rows.value[index];
    lastDeleted.value = { row: { ...row } as PayableRow, index };
    if (row?.recordId) {
      pendingDeletes.value = [...pendingDeletes.value, row.recordId];
    }
    isDirty.value = true;
    rows.value = rows.value.filter((_, i) => i !== index);
  }

  function undoDelete(): void {
    const d = lastDeleted.value;
    if (!d) return;
    const { row, index } = d;
    if (row.recordId) {
      pendingDeletes.value = pendingDeletes.value.filter(
        (id) => id !== row.recordId,
      );
    }
    const current = rows.value;
    rows.value = [...current.slice(0, index), row, ...current.slice(index)];
    lastDeleted.value = null;
  }

  function markDirty(): void {
    isDirty.value = true;
  }

  function updateCell(rowIndex: number, field: ColumnKey, value: string): void {
    if (rowIndex < 0 || rowIndex >= rows.value.length) return;
    isDirty.value = true;
    rows.value = rows.value.map((r, i) =>
      i === rowIndex ? { ...r, [field]: value } : r,
    );
    if (field === "amount" || field === "tax") {
      recomputeTotal(rowIndex);
    }
  }

  function setRows(newRows: Partial<PayableRow>[]): void {
    rows.value =
      Array.isArray(newRows) && newRows.length
        ? newRows.map((r) => ({ ...emptyRow(), ...r }))
        : [emptyRow()];
    isDirty.value = false;
    pendingDeletes.value = [];
    lastDeleted.value = null;
  }

  function clearAll(): void {
    rows.value = [emptyRow()];
    error.value = null;
    isDirty.value = false;
    pendingDeletes.value = [];
    lastDeleted.value = null;
    currentTransRef.value = null;
    currentMainRecordId.value = null;
    mainPosted.value = false;
    mainStatus.value = null;
    mainRejectReason.value = null;
    mainTotalFromMain.value = null;
  }

  async function fetchFromFileMaker(): Promise<void> {
    const { findRecords, isConnected } = useFileMaker();
    if (!isConnected.value) {
      error.value = "Not connected to FileMaker";
      return;
    }
    currentTransRef.value = null;
    loading.value = true;
    error.value = null;
    const { data: detailsData, error: err } = await findRecords<
      Record<string, unknown>
    >(LAYOUTS.PAYABLES_DETAILS, { limit: 500 });
    loading.value = false;
    if (err) {
      error.value = err;
      return;
    }
    const mapped = detailsData.map((d) => {
      const taxValue = d?.Tax;
      const taxStr =
        taxValue != null && taxValue !== "" ? String(taxValue) : "";
      // Fetch Tax Amount field (may be "Tax Amount" with space in FileMaker)
      const taxAmountValue = d?.['Tax Amount'] ?? d?.TaxAmount;
      let taxAmountStr =
        taxAmountValue != null && taxAmountValue !== "" ? String(taxAmountValue) : "";
      if (taxAmountStr === "" && taxStr !== "") taxAmountStr = taxStr;
      return {
        ...emptyRow(),
        invoice_number: String(d?.InvoiceNumber ?? ""),
        amount: String(d?.Amount ?? ""),
        tax: taxStr,
        total: String(d?.Total ?? ""),
        reference: taxAmountStr, // Map Tax Amount to Reference column
      };
    });
    setRows(mapped.length ? mapped : [emptyRow()]);
  }

  /** Load only Payables_Details records related to the given Main (TransRef), and populate VendorDetails and Posted state from that Main. */
  async function fetchDetailsByTransRef(transRef: string): Promise<void> {
    const {
      findRecords,
      findRecordsWithIds,
      findRecordsByQueryWithIds,
      isConnected,
    } = useFileMaker();
    const vendorStore = useVendorStore();
    if (!isConnected.value) {
      error.value = "Not connected to FileMaker";
      return;
    }
    if (!transRef?.trim()) {
      setRows([emptyRow()]);
      currentTransRef.value = null;
      currentMainRecordId.value = null;
      mainPosted.value = false;
      mainChequeIssued.value = null;
      mainChequeIssuedDate.value = null;
      mainBankName.value = null;
      mainChequeNo.value = null;
      mainExpiryCheckDis.value = null;
      mainWhtExpiryCheckDis.value = null;
      mainExpiryCheck.value = null;
      mainWhtExpiryCheck.value = null;
      vendorStore.setFromMain(null);
      return;
    }
    const ref = transRef.trim();
    currentTransRef.value = ref;
    loading.value = true;
    error.value = null;
    setRows([emptyRow()]);
    // Fetch by TransRef so we get the exact entry (not limited to first 500)
    const [detailsWithIdsRes, mainWithIdsRes] = await Promise.all([
      findRecordsByQueryWithIds<Record<string, unknown>>(
        LAYOUTS.PAYABLES_DETAILS,
        { TransRef: ref },
        500,
      ),
      findRecordsByQueryWithIds<Record<string, unknown>>(
        LAYOUTS.PAYABLES_MAIN,
        { TransRef: ref },
        10,
      ),
    ]);
    loading.value = false;
    if (detailsWithIdsRes.error || mainWithIdsRes.error) {
      error.value = detailsWithIdsRes.error ?? mainWithIdsRes.error ?? null;
      setRows([emptyRow()]);
      return;
    }
    const detailsData = detailsWithIdsRes.data.filter(
      (d) => String(d?.fieldData?.TransRef ?? "").trim() === ref,
    );
    const currentRows = rows.value;
    // Tax is a calculated field in FileMaker (sums from Payable_Invoice), so read it directly from Payables_Details
    // Tax Amount is a calculation field - map it to Reference column in grid
    const mapped = detailsData.map((d, i) => {
      const invNum = String(d?.fieldData?.InvoiceNumber ?? "").trim();
      const taxValue = d?.fieldData?.Tax;
      const taxStr =
        taxValue != null && taxValue !== "" ? String(taxValue) : "";
      // Fetch Tax Amount field (may be "Tax Amount" with space in FileMaker)
      const fieldData = d?.fieldData as Record<string, unknown> | undefined;
      const taxAmountValue = fieldData?.['Tax Amount'] ?? fieldData?.TaxAmount;
      let taxAmountStr =
        taxAmountValue != null && taxAmountValue !== "" ? String(taxAmountValue) : "";
      // If FileMaker didn't return Tax Amount but we have Tax, use Tax for the Reference column
      if (taxAmountStr === "" && taxStr !== "") taxAmountStr = taxStr;
      const recordId = d?.recordId ? String(d.recordId) : undefined;
      const fromFileMaker = {
        ...emptyRow(),
        id: `loaded-${i}`,
        recordId,
        invoice_number: invNum,
        amount: String(d?.fieldData?.Amount ?? ""),
        tax: taxStr,
        total: String(d?.fieldData?.Total ?? ""),
        reference: taxAmountStr,
      };
      // Preserve Amount before VAT and Invoice Number from current grid when updating calculated fields (tax, reference, total)
      const existing = currentRows.find((r) => r.recordId === recordId);
      if (existing) {
        return {
          ...fromFileMaker,
          invoice_number: existing.invoice_number ?? fromFileMaker.invoice_number,
          amount: existing.amount ?? fromFileMaker.amount,
        };
      }
      return fromFileMaker;
    });
    // Keep any new rows (no recordId) that exist in the current grid
    const newRows = currentRows.filter((r) => !r.recordId || String(r.recordId).trim() === "");
    const merged = mapped.length ? [...mapped, ...newRows] : (newRows.length ? newRows : [emptyRow()]);
    setRows(merged);
    const mainWithId = mainWithIdsRes.data?.find(
      (m) => String(m?.fieldData?.TransRef ?? "").trim() === ref,
    );
    if (mainWithId) {
      currentMainRecordId.value = mainWithId.recordId;
      mainPosted.value =
        String(mainWithId.fieldData?.Posted ?? "").trim() === "Yes";
      const fd = mainWithId.fieldData as Record<string, unknown> | undefined;
      const statusRaw = fd?.Status ?? fd?.status ?? "";
      mainStatus.value = typeof statusRaw === "string" && statusRaw.trim() ? statusRaw.trim() : null;
      const reasonRaw = fd?.RejectReason ?? fd?.["Reject Reason"] ?? fd?.rejectReason ?? "";
      mainRejectReason.value = typeof reasonRaw === "string" && reasonRaw.trim() ? reasonRaw.trim() : null;
      vendorStore.setFromMain({
        VendorID: fd?.VendorID as string | undefined,
        VendorName: (fd?.VendorName ?? fd?.["Vendor Name"]) as string | undefined,
        VendorEmail: fd?.VendorEmail as string | undefined,
        Date: fd?.Date as string | undefined,
        Currency: fd?.Currency as string | undefined,
      });
      const { getRecord } = useFileMaker();
      const { data: mainFieldData } = await getRecord<Record<string, unknown>>(
        LAYOUTS.PAYABLES_MAIN,
        String(mainWithId.recordId),
      );
      const totalVal = mainFieldData?.Total ?? mainFieldData?.["Total"];
      if (totalVal !== undefined && totalVal !== null && totalVal !== "") {
        const num = typeof totalVal === "number" ? totalVal : parseFloat(String(totalVal));
        mainTotalFromMain.value = Number.isNaN(num) ? totalVal : num;
      } else {
        mainTotalFromMain.value = null;
      }
      const chequeIssued = mainFieldData?.ChequeIssued ?? mainFieldData?.["Cheque Issued"];
      mainChequeIssued.value =
        chequeIssued != null && String(chequeIssued).trim() !== ""
          ? String(chequeIssued).trim()
          : null;
      const chequeDate = mainFieldData?.ChequeIssuedDate ?? mainFieldData?.["Cheque Issued Date"];
      mainChequeIssuedDate.value =
        chequeDate != null && String(chequeDate).trim() !== ""
          ? String(chequeDate).trim()
          : null;
      const bankName = mainFieldData?.BankName ?? mainFieldData?.["Bank Name"];
      mainBankName.value =
        bankName != null && String(bankName).trim() !== ""
          ? String(bankName).trim()
          : null;
      const chequeNo = mainFieldData?.ChequeNo ?? mainFieldData?.["Cheque No"];
      mainChequeNo.value =
        chequeNo != null && String(chequeNo).trim() !== ""
          ? String(chequeNo).trim()
          : null;
      // Expiry_Check_Dis and WHT_Expiry_Check_Dis: from Vendor_TBL via relationship (Vendor ID)
      // 1) Try Payables_Main layout first – related fields may be returned
      // 2) Otherwise fetch Vendor_TBL by Vendor_ID
      function getFieldStr(obj: Record<string, unknown> | undefined, ...keys: string[]): string | null {
        if (!obj) return null;
        for (const k of keys) {
          const v = obj[k];
          if (v != null && String(v).trim() !== "") return String(v).trim();
        }
        return null;
      }
      const md = mainFieldData as Record<string, unknown> | undefined;
      let expiryDis = getFieldStr(
        md,
        "Expiry_Check_Dis",
        "Expiry Check Dis",
        "ExpiryCheckDis",
        "Vendor_TBL::Expiry_Check_Dis",
      );
      let whtDis = getFieldStr(
        md,
        "WHT_Expiry_Check_Dis",
        "WHT Expiry Check Dis",
        "WHTExpiryCheckDis",
        "Vendor_TBL::WHT_Expiry_Check_Dis",
      );
      if (!expiryDis) {
        expiryDis = getFieldStr(md, "Vendor_TBL::Expiry_Check_Dis");
      }
      let vendorFd: Record<string, unknown> | undefined = undefined;
      if (!expiryDis || !whtDis) {
        const vendorId = String(fd?.VendorID ?? fd?.["Vendor ID"] ?? "").trim();
        if (vendorId) {
          const { findRecordsByQueryWithIds, findRecordsWithIds } = useFileMaker();
          let vendorRecords: { fieldData: Record<string, unknown> }[] = [];
          const byId = await findRecordsByQueryWithIds<Record<string, unknown>>(
            LAYOUTS.VENDOR_TBL,
            { "Vendor ID": vendorId },
            1,
          );
          if (byId.data?.length) {
            vendorRecords = byId.data as { fieldData: Record<string, unknown> }[];
          } else {
            const byUnderscore = await findRecordsByQueryWithIds<Record<string, unknown>>(
              LAYOUTS.VENDOR_TBL,
              { Vendor_ID: vendorId },
              1,
            );
            if (byUnderscore.data?.length) {
              vendorRecords = byUnderscore.data as { fieldData: Record<string, unknown> }[];
            } else {
              const allRes = await findRecordsWithIds<Record<string, unknown>>(
                LAYOUTS.VENDOR_TBL,
                { limit: 500 },
              );
              const match = allRes.data?.find((r) => {
                const vid = String(
                  (r.fieldData as Record<string, unknown>)?.Vendor_ID ??
                    (r.fieldData as Record<string, unknown>)?.["Vendor ID"] ??
                    "",
                ).trim();
                return vid === vendorId;
              });
              if (match) {
                vendorRecords = [{ fieldData: match.fieldData as Record<string, unknown> }];
              }
            }
          }
          vendorFd = vendorRecords[0]?.fieldData;
          if (vendorFd) {
            expiryDis =
              expiryDis ??
              getFieldStr(vendorFd, "Expiry_Check_Dis", "Expiry Check Dis", "ExpiryCheckDis", "Vendor_TBL::Expiry_Check_Dis");
            whtDis =
              whtDis ??
              getFieldStr(vendorFd, "WHT_Expiry_Check_Dis", "WHT Expiry Check Dis", "WHTExpiryCheckDis", "Vendor_TBL::WHT_Expiry_Check_Dis");
          }
        } else {
          vendorFd = undefined;
        }
      } else {
        vendorFd = undefined;
      }
      mainExpiryCheckDis.value = expiryDis;
      mainWhtExpiryCheckDis.value = whtDis;
      let expiryCheck = getFieldStr(
        md,
        "Expiry_Check",
        "Expiry Check",
        "ExpiryCheck",
        "Vendor_TBL::Expiry_Check",
      );
      let whtCheck = getFieldStr(
        md,
        "WHT_Expiry_Check",
        "WHT Expiry Check",
        "WHTExpiryCheck",
        "Vendor_TBL::WHT_Expiry_Check",
      );
      if ((!expiryCheck || !whtCheck) && vendorFd) {
        expiryCheck =
          expiryCheck ??
          getFieldStr(vendorFd, "Expiry_Check", "Expiry Check", "ExpiryCheck", "Vendor_TBL::Expiry_Check");
        whtCheck =
          whtCheck ??
          getFieldStr(vendorFd, "WHT_Expiry_Check", "WHT Expiry Check", "WHTExpiryCheck", "Vendor_TBL::WHT_Expiry_Check");
      }
      mainExpiryCheck.value = expiryCheck;
      mainWhtExpiryCheck.value = whtCheck;
    } else {
      currentMainRecordId.value = null;
      mainPosted.value = false;
      mainStatus.value = null;
      mainRejectReason.value = null;
      mainTotalFromMain.value = null;
      mainChequeIssued.value = null;
      mainChequeIssuedDate.value = null;
      mainBankName.value = null;
      mainChequeNo.value = null;
      mainExpiryCheckDis.value = null;
      mainWhtExpiryCheckDis.value = null;
      mainExpiryCheck.value = null;
      mainWhtExpiryCheck.value = null;
      vendorStore.setFromMain(null);
    }
  }

  async function syncToFileMaker(opts?: {
    markPosted?: boolean;
    /** When true (repost), clear Rejected and RejectReason fields. */
    clearRejected?: boolean;
  }): Promise<{
    posted: number;
    updated: number;
    deleted: number;
    error: string | null;
    markedPosted?: boolean;
    mainUpdated?: boolean;
  }> {
    const markPosted = opts?.markPosted !== false;
    const clearRejected = opts?.clearRejected === true;
    const {
      createRecord,
      getRecord,
      updateRecord,
      deleteRecord,
      findRecordsByQuery,
      findRecordsByQueryWithIds,
      isConnected,
    } = useFileMaker();
    if (!isConnected.value) {
      error.value = "Not connected to FileMaker";
      return {
        posted: 0,
        updated: 0,
        deleted: 0,
        error: "Not connected to FileMaker",
      };
    }
    const currentRows = rows.value;
    let toPost = currentRows
      .map((row, index) => ({ row, index }))
      .filter(({ row }) => !row.id || String(row.id).trim() === "")
      .filter(({ row, index }) => !isRowEmptyByIndex(currentRows, index));

    // Always check for duplicate invoice numbers in the grid (before any early return)
    const seenInvoices = new Set<string>();
    for (const row of currentRows) {
      const inv = getRowStr(
        row as Record<string, unknown>,
        "invoice_number",
        "invoiceNumber",
        "InvoiceNumber",
      );
      if (inv === "") continue;
      const key = inv.trim().toLowerCase();
      if (seenInvoices.has(key)) {
        error.value = `Duplicate invoice number "${inv}" in the grid. Each line must have a unique invoice number.`;
        return { posted: 0, updated: 0, deleted: 0, error: error.value };
      }
      seenInvoices.add(key);
    }

    // Check for duplicate invoice numbers in updated rows against FileMaker (before any early return)
    // This must happen before the early return for "Save and Post" with only updates
    const hasRowsToUpdate = currentRows.some((r) => r.recordId);
    if (hasRowsToUpdate && isConnected.value) {
        for (const row of currentRows) {
          if (!row.recordId) continue; // Skip rows without recordId (they're new, will be checked later)
          const invRaw = getRowStr(
            row as Record<string, unknown>,
            "invoice_number",
            "invoiceNumber",
            "InvoiceNumber",
          );
          if (invRaw === "") continue;
          const invNum = Number(invRaw);
          const invForFind = Number.isNaN(invNum) ? invRaw : invNum;

          // Check Payables_Details - exclude current record
          const detailsResultWithIds = await findRecordsByQueryWithIds<{
            InvoiceNumber?: string | number;
          }>(LAYOUTS.PAYABLES_DETAILS, { InvoiceNumber: invForFind }, 100);
          if (detailsResultWithIds.error) {
            error.value = normalizeFileMakerError("Could not check invoice uniqueness", detailsResultWithIds.error);
            return { posted: 0, updated: 0, deleted: 0, error: error.value };
          }
          // Filter out the current record being updated
          const otherDetailsWithSameInvoice = detailsResultWithIds.data.filter(
            (r) => r.recordId !== row.recordId,
          );
          if (otherDetailsWithSameInvoice.length > 0) {
            error.value = `Invoice number "${invRaw}" already exists in FileMaker (in another record). Use a unique invoice number.`;
            return { posted: 0, updated: 0, deleted: 0, error: error.value };
          }
        }
    }

    // Record already exists, no new rows, no pending deletes, no edits to persist: just set Posted to Yes
    // When hasRowsToUpdate, we must run the full flow to persist grid/vendor changes before posting
    if (
      toPost.length === 0 &&
      pendingDeletes.value.length === 0 &&
      !hasRowsToUpdate &&
      markPosted &&
      currentMainRecordId.value
    ) {
      syncing.value = true;
      error.value = null;
      try {
        const todayIso = new Date().toISOString().slice(0, 10);
        const postedDate = formatDateForFileMaker(todayIso) ?? todayIso;
        const mainPayload: FileMakerFieldData = { Posted: "Yes", PostedDate: postedDate };
        if (clearRejected) {
          mainPayload.Rejected = "";
          mainPayload.RejectReason = "";
        }
        const { error: updateErr } = await updateRecord(
          LAYOUTS.PAYABLES_MAIN,
          currentMainRecordId.value,
          mainPayload,
          clearRejected ? { allowEmptyStrings: true } : undefined,
        );
        if (updateErr) {
          error.value = updateErr;
          return { posted: 0, updated: 0, deleted: 0, error: updateErr };
        }
        mainPosted.value = true;
        if (clearRejected) {
          mainStatus.value = null;
          mainRejectReason.value = null;
        }
        isDirty.value = false;
        return {
          posted: 0,
          updated: 0,
          deleted: 0,
          error: null,
          markedPosted: true,
        };
      } finally {
        syncing.value = false;
      }
    }

    const hasPendingDeletes = pendingDeletes.value.length > 0;
    const noGridWork = toPost.length === 0 && !hasRowsToUpdate && !hasPendingDeletes;
    if (noGridWork && !currentTransRef.value) {
      return {
        posted: 0,
        updated: 0,
        deleted: 0,
        error:
          "Required: Each row must have at least one of Invoice Number *, Amount *, or Total *. Fill one of these in the grid and try again.",
      };
    }
    // When we have currentTransRef, always continue so we can run the Main update (vendor/date/currency) even if there are no grid changes

    // New entry: require a vendor on Main
    if (!currentTransRef.value) {
      const vendorStore = useVendorStore();
      const hasVendor = Boolean(
        String(vendorStore.vendor.vendor_id ?? "").trim() ||
        String(vendorStore.vendor.vendor_name ?? "").trim(),
      );
      if (!hasVendor) {
        return {
          posted: 0,
          updated: 0,
          deleted: 0,
          error:
            "Required: Enter Vendor name * or Vendor ID * in Vendor details above, then save.",
        };
      }
    }

    syncing.value = true;
    error.value = null;
    let posted = 0;
    let updated = 0;
    let deleted = 0;
    let mainUpdated = false;
    let mainRecordIdToUpdate: string | null = null;
    try {
      // Ensure each new row's invoice number does not already exist in FileMaker
      for (const { row } of toPost) {
        const invRaw = getRowStr(
          row as Record<string, unknown>,
          "invoice_number",
          "invoiceNumber",
          "InvoiceNumber",
        );
        if (invRaw === "") continue;
        const invNum = Number(invRaw);
        const invForFind = Number.isNaN(invNum) ? invRaw : invNum;
        const detailsResult = await findRecordsByQuery(
          LAYOUTS.PAYABLES_DETAILS,
          { InvoiceNumber: invForFind },
          1,
        );
        if (detailsResult.error) {
          error.value = normalizeFileMakerError("Could not check invoice uniqueness", detailsResult.error);
          return { posted: 0, updated: 0, deleted: 0, error: error.value };
        }
        if (detailsResult.data.length > 0) {
          error.value = `Invoice number "${invRaw}" already exists in FileMaker. Use a unique invoice number.`;
          return { posted: 0, updated: 0, deleted: 0, error: error.value };
        }
      }

      // Note: Duplicate check for updated rows already happened above (before early returns)
      // Only new rows need to be checked here

      for (const recordId of pendingDeletes.value) {
        const { error: delErr } = await deleteRecord(
          LAYOUTS.PAYABLES_DETAILS,
          recordId,
        );
        if (delErr) {
          error.value = delErr;
          return { posted: 0, updated: 0, deleted, error: delErr };
        }
        deleted++;
      }
      pendingDeletes.value = [];
      lastDeleted.value = null;

      let transRef: string;
      if (currentTransRef.value) {
        transRef = currentTransRef.value;
        mainRecordIdToUpdate = currentMainRecordId.value;
      } else {
        const vendorStore = useVendorStore();
        const v = vendorStore.vendor;
        const vendorIdVal = String(v.vendor_id ?? "").trim();
        const vendorNameVal = String(v.vendor_name ?? "").trim();
        const mainCreatePayload: FileMakerFieldData = {};
        if (vendorIdVal !== "") {
          mainCreatePayload.VendorID = vendorIdVal;
        } else if (vendorNameVal !== "") {
          mainCreatePayload.VendorName = vendorNameVal;
        }
        if (Object.keys(mainCreatePayload).length === 0) {
          error.value = "Required: Enter Vendor name or Vendor ID in Vendor details.";
          return { posted: 0, updated: 0, deleted: 0, error: error.value };
        }
        const { id: mainRecordId, error: mainErr } = await createRecord(
          LAYOUTS.PAYABLES_MAIN,
          mainCreatePayload,
        );
        if (mainErr || !mainRecordId) {
          error.value = mainErr ? `Payables_Main create: ${mainErr}` : "Main record not created";
          return { posted: 0, updated: 0, deleted: 0, error: error.value };
        }
        mainRecordIdToUpdate = mainRecordId;
        const { data: mainDataResp, error: getErr } = await getRecord<{
          TransRef?: string;
        }>(LAYOUTS.PAYABLES_MAIN, mainRecordId);
        if (getErr || !mainDataResp?.TransRef) {
          error.value = getErr ?? "Could not read TransRef from Main";
          return { posted: 0, updated: 0, deleted: 0, error: error.value };
        }
        transRef = mainDataResp.TransRef;
        currentTransRef.value = transRef;
        currentMainRecordId.value = mainRecordId;
      }
      for (const { row, index } of toPost) {
        const detailsData = rowToPayablesDetails(row, transRef);
        const { id: detailsRecordId, error: detailsErr } = await createRecord(
          LAYOUTS.PAYABLES_DETAILS,
          detailsData as FileMakerFieldData,
        );
        if (detailsErr) {
          error.value = `Payables_Details create: ${detailsErr}`;
          return { posted, updated: 0, deleted: 0, error: error.value };
        }
        posted++;
        rows.value = rows.value.map((r, j) =>
          j === index
            ? { ...r, id: `synced-${Date.now()}-${index}`, recordId: detailsRecordId ?? undefined }
            : r,
        );
      }
      const vendorStoreForMain = useVendorStore();
      if (mainRecordIdToUpdate && currentTransRef.value) {
        const v = vendorStoreForMain.vendor;
        const vendorIdVal = String(v.vendor_id ?? "").trim();
        const vendorNameVal = String(v.vendor_name ?? "").trim();
        const vendorEmailVal = String(v.contact_email ?? "").trim();
        const currencyVal = String(v.currency ?? "").trim();
        const mainPayload: FileMakerFieldData = {};
        if (vendorIdVal !== "") mainPayload.VendorID = vendorIdVal;
        if (vendorNameVal !== "") mainPayload.VendorName = vendorNameVal;
        if (vendorEmailVal !== "") mainPayload.VendorEmail = vendorEmailVal;
        if (currencyVal !== "") mainPayload.Currency = currencyVal;
        const fmDate = formatDateForFileMaker(v.payment_terms || undefined);
        if (fmDate) mainPayload.Date = fmDate;
        if (markPosted) {
          const todayIso = new Date().toISOString().slice(0, 10);
          mainPayload.Posted = "Yes";
          mainPayload.PostedDate = formatDateForFileMaker(todayIso) ?? todayIso;
          if (clearRejected) {
            mainPayload.Rejected = "";
            mainPayload.RejectReason = "";
          }
        }
        const { error: mainUpdateErr } = await updateRecord(
          LAYOUTS.PAYABLES_MAIN,
          mainRecordIdToUpdate,
          mainPayload,
          clearRejected ? { allowEmptyStrings: true } : undefined,
        );
        if (mainUpdateErr) {
          error.value = mainUpdateErr;
          return { posted, updated, deleted, error: error.value };
        }
        mainUpdated = true;
        if (markPosted) {
          mainPosted.value = true;
          if (clearRejected) {
            mainStatus.value = null;
            mainRejectReason.value = null;
          }
        }
      }

      for (const row of currentRows) {
        if (row.recordId) {
          const newInv = getRowStr(
            row as Record<string, unknown>,
            "invoice_number",
            "invoiceNumber",
            "InvoiceNumber",
          ).trim();
          // Get current Payables_Details to read old InvoiceNumber before we overwrite
          const { data: currentDetails } = await getRecord<{
            InvoiceNumber?: string | number;
          }>(LAYOUTS.PAYABLES_DETAILS, row.recordId);
          const oldInv =
            currentDetails?.InvoiceNumber != null
              ? String(currentDetails.InvoiceNumber).trim()
              : "";

          const detailsData = rowToPayablesDetails(row, transRef);
          const { error: updateErr } = await updateRecord(
            LAYOUTS.PAYABLES_DETAILS,
            row.recordId,
            detailsData as FileMakerFieldData,
          );
          if (updateErr) {
            error.value = updateErr;
            return { posted, updated, deleted, error: error.value };
          }
          updated++;

          // If invoice number changed, update Payable_Invoice records that used the old number
          if (
            oldInv !== "" &&
            newInv !== "" &&
            oldInv !== newInv
          ) {
            const { data: invoiceRecords } =
              await findRecordsByQueryWithIds<{ invoiceNumber?: string }>(
                LAYOUTS.PAYABLE_INVOICE,
                { invoiceNumber: oldInv },
                500,
              );
            for (const rec of invoiceRecords) {
              if (!rec.recordId) continue;
              const { error: invUpdateErr } = await updateRecord(
                LAYOUTS.PAYABLE_INVOICE,
                rec.recordId,
                { invoiceNumber: newInv } as FileMakerFieldData,
              );
              if (invUpdateErr) {
                error.value =
                  `Updated Details but failed to update Payable_Invoice: ${invUpdateErr}`;
                return { posted, updated, deleted, error: error.value };
              }
            }
          }
        }
      }
      if (markPosted && mainRecordIdToUpdate && !mainUpdated) {
        const todayIso = new Date().toISOString().slice(0, 10);
        const postedDate = formatDateForFileMaker(todayIso) ?? todayIso;
        const mainPayload: FileMakerFieldData = { Posted: "Yes", PostedDate: postedDate };
        if (clearRejected) {
          mainPayload.Rejected = "";
          mainPayload.RejectReason = "";
        }
        const { error: updateErr } = await updateRecord(
          LAYOUTS.PAYABLES_MAIN,
          mainRecordIdToUpdate,
          mainPayload,
          clearRejected ? { allowEmptyStrings: true } : undefined,
        );
        if (!updateErr) {
          mainPosted.value = true;
          if (clearRejected) {
            mainStatus.value = null;
            mainRejectReason.value = null;
          }
        }
      }
      isDirty.value = false;
      const sum = rows.value.reduce((acc, r) => {
        const t = parseFloat(String(r.total ?? ""));
        return acc + (Number.isNaN(t) ? 0 : t);
      }, 0);
      mainTotalFromMain.value = sum;
      return { posted, updated, deleted, error: error.value, mainUpdated: mainUpdated || undefined };
    } finally {
      syncing.value = false;
    }
  }

  return {
    rows: computed(() => rows.value),
    rowCount,
    filledRowCount,
    hasNewRows,
    hasUndoDelete,
    loading,
    error,
    syncing,
    isDirty: computed(() => isDirty.value),
    currentTransRef: computed(() => currentTransRef.value),
    currentMainRecordId: computed(() => currentMainRecordId.value),
    mainPosted: computed(() => mainPosted.value),
    mainStatus: computed(() => mainStatus.value),
    mainRejectReason: computed(() => mainRejectReason.value),
    mainChequeIssued: computed(() => mainChequeIssued.value),
    mainChequeIssuedDate: computed(() => mainChequeIssuedDate.value),
    mainBankName: computed(() => mainBankName.value),
    mainChequeNo: computed(() => mainChequeNo.value),
    mainExpiryCheckDis: computed(() => mainExpiryCheckDis.value),
    mainWhtExpiryCheckDis: computed(() => mainWhtExpiryCheckDis.value),
    mainExpiryCheck: computed(() => mainExpiryCheck.value),
    mainWhtExpiryCheck: computed(() => mainWhtExpiryCheck.value),
    entryTotal,
    STATUS_OPTIONS,
    addRow,
    removeRow,
    undoDelete,
    markDirty,
    updateCell,
    setRows,
    clearAll,
    recomputeTotal,
    fetchFromFileMaker,
    fetchDetailsByTransRef,
    syncToFileMaker,
  };
});
