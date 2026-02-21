/**
 * Composable for "Request to edit (mistake posted)" flow:
 * - Officer creates a request and manager is notified by email.
 * - Manager can grant the request (unpost the entry) from the Posted entry view.
 */

import { ref } from "vue";
import { useRouter } from "vue-router";
import { useFileMaker } from "./useFileMaker";
import { useVendorStore } from "../stores/vendorStore";
import { LAYOUTS, type PayablesEditRequestFieldData } from "../utils/filemakerApi";
import type { FindRecordWithId } from "./useFileMaker";
import { formatTimestampForFileMaker } from "../utils/filemakerMappers";
import { writeActivityLog } from "../utils/activityLog";

export interface PendingEditRequest {
  recordId: string;
  RequestedBy?: string;
  RequestedAt?: string;
  Status?: string;
  GrantedBy?: string;
}

const pendingByTransRef = ref<Record<string, PendingEditRequest | null>>({});

export function useEditRequest() {
  const router = useRouter();
  const vendorStore = useVendorStore();
  const {
    createRecord,
    updateRecord,
    findRecordsByQueryWithIds,
    findRecordsWithIds,
    runScript,
  } = useFileMaker();

  function getFieldValue(fd: Record<string, unknown> | undefined, key: string): string {
    if (!fd) return "";
    const v =
      fd[key] ??
      fd[key.replace(/([A-Z])/g, " $1").trim()] ??
      fd[key.charAt(0).toLowerCase() + key.slice(1)];
    if (v == null || v === "") return "";
    return String(v).trim();
  }

  /** Get officer email from Payables_Users by FullName (for NotifyEditRequestGranted). */
  async function getOfficerEmailByFullName(fullName: string): Promise<string | null> {
    const name = (fullName || "").trim();
    if (!name) return null;
    const { data } = await findRecordsWithIds<Record<string, unknown>>(
      LAYOUTS.PAYABLES_USERS,
      { limit: 500 },
    );
    const normalized = name.toLowerCase();
    for (const row of data ?? []) {
      const fd = row?.fieldData;
      const fn = getFieldValue(fd, "FullName") || getFieldValue(fd, "Full Name");
      if (fn.toLowerCase() === normalized) {
        const email = getFieldValue(fd, "Email");
        if (email) return email;
        return null;
      }
    }
    return null;
  }

  /**
   * Run FileMaker script NotifyEditRequestGranted to email the officer that their edit request was granted.
   * Uses requestedByName to look up officer email from Payables_Users.
   */
  async function notifyEditRequestGranted(
    transRef: string,
    requestedByName: string,
  ): Promise<{ error: string | null }> {
    const trimmedRef = (transRef || "").trim();
    if (!trimmedRef) return { error: null };
    const email = await getOfficerEmailByFullName(requestedByName || "Officer");
    if (!email) return { error: null };
    const entryUrl = new URL(
      router.resolve({ name: "entry", query: { transRef: trimmedRef } }).href,
      window.location.origin,
    ).href;
    const vendorName = (vendorStore.vendor?.vendor_name ?? "").trim() || "—";
    const postedname = (requestedByName || "").trim() || "Officer";
    const scriptParam = JSON.stringify({
      url: entryUrl,
      email,
      postedname,
      transref: trimmedRef,
      vendorname: vendorName,
    });
    const { error } = await runScript(
      LAYOUTS.PAYABLES_MAIN,
      "NotifyEditRequestGranted",
      scriptParam,
    );
    return { error: error ?? null };
  }

  /** Get manager (HOD) email from Payables_Settings. */
  async function getManagerEmail(): Promise<string | null> {
    const { data } = await findRecordsWithIds<Record<string, unknown>>(
      LAYOUTS.PAYABLES_SETTINGS,
      { limit: 1 },
    );
    const fd = data?.[0]?.fieldData;
    const email =
      fd?.HODEmail != null && String(fd.HODEmail).trim() !== ""
        ? String(fd.HODEmail).trim()
        : null;
    return email;
  }

  /**
   * Fetch pending edit request for a TransRef (Status = Pending).
   * Finds by TransRef only then filters for Pending in code (resilient to field/casing in FileMaker).
   */
  async function fetchPendingEditRequest(
    transRef: string,
  ): Promise<{ data: PendingEditRequest | null; error: string | null }> {
    if (!transRef?.trim()) {
      return { data: null, error: null };
    }
    const trimmedRef = transRef.trim();
    const { data, error } = await findRecordsByQueryWithIds<
      PayablesEditRequestFieldData
    >(LAYOUTS.PAYABLES_EDIT_REQUEST, { TransRef: trimmedRef }, 20);
    if (error) return { data: null, error };
    const getStr = (fd: Record<string, unknown> | undefined, key: string): string | undefined => {
      if (!fd) return undefined;
      const v =
        fd[key] ??
        fd[key.replace(/([A-Z])/g, " $1").trim()] ??
        fd[key.charAt(0).toLowerCase() + key.slice(1)];
      if (v == null || v === "") return undefined;
      return String(v).trim();
    };
    for (const row of data ?? []) {
      const r = row as FindRecordWithId<PayablesEditRequestFieldData>;
      if (!r?.recordId) continue;
      const fd = r.fieldData as Record<string, unknown> | undefined;
      const status = getStr(fd, "Status");
      if (status?.toLowerCase() !== "pending") continue;
      const pending: PendingEditRequest = {
        recordId: r.recordId,
        RequestedBy: getStr(fd, "RequestedBy"),
        RequestedAt: getStr(fd, "RequestedAt"),
        Status: status,
        GrantedBy: getStr(fd, "GrantedBy"),
      };
      pendingByTransRef.value[trimmedRef] = pending;
      return { data: pending, error: null };
    }
    pendingByTransRef.value[trimmedRef] = null;
    return { data: null, error: null };
  }

  /**
   * Get cached pending request for a TransRef (after fetchPendingEditRequest).
   */
  function getCachedPending(transRef: string): PendingEditRequest | null {
    return pendingByTransRef.value[transRef] ?? null;
  }

  /**
   * Clear cached pending for a TransRef (e.g. after granting).
   */
  function clearCachedPending(transRef: string): void {
    pendingByTransRef.value[transRef] = null;
  }

  /**
   * Create an edit request record and send email to manager via NotifyManagerEditRequest.
   */
  async function createEditRequest(
    transRef: string,
    officerName: string,
  ): Promise<{ error: string | null }> {
    if (!transRef?.trim()) return { error: "Transaction reference required" };
    const requestedBy = (officerName || "").trim() || "Officer";
    const requestedAt = formatTimestampForFileMaker();

    const { error: createErr } = await createRecord(
      LAYOUTS.PAYABLES_EDIT_REQUEST,
      {
        TransRef: transRef.trim(),
        RequestedBy: requestedBy,
        RequestedAt: requestedAt,
        Status: "Pending",
        GrantedBy: "",
      },
    );
    if (createErr) return { error: createErr };

    await writeActivityLog(
      createRecord,
      transRef.trim(),
      "EditRequested",
      requestedBy,
    );

    const email = await getManagerEmail();
    if (!email) {
      // Request saved; email not sent (no HOD email in settings)
      return { error: null };
    }

    const entryUrl = new URL(
      router.resolve({ name: "entry", query: { transRef } }).href,
      window.location.origin,
    ).href;
    const vendorName =
      (vendorStore.vendor?.vendor_name ?? "").trim() || "—";

    const scriptParam = JSON.stringify({
      url: entryUrl,
      email,
      postedname: requestedBy,
      transref: transRef.trim(),
      vendorname: vendorName,
    });

    const { error: scriptErr } = await runScript(
      LAYOUTS.PAYABLES_MAIN,
      "NotifyManagerEditRequest",
      scriptParam,
    );
    if (scriptErr) {
      // Request was created; only notification failed
      return { error: null };
    }
    return { error: null };
  }

  /**
   * Grant an edit request: unpost the main record and mark the request as Granted.
   */
  async function grantEditRequest(
    transRef: string,
    mainRecordId: string,
    managerName: string,
  ): Promise<{ error: string | null }> {
    if (!transRef?.trim() || !mainRecordId?.trim()) {
      return { error: "Transaction reference and main record required" };
    }

    const trimmedRef = transRef.trim();
    const { data: pendingList, error: findErr } = await findRecordsByQueryWithIds<
      PayablesEditRequestFieldData
    >(LAYOUTS.PAYABLES_EDIT_REQUEST, { TransRef: trimmedRef }, 20);
    if (findErr) return { error: findErr };
    const getStr = (fd: Record<string, unknown> | undefined, key: string): string | undefined => {
      if (!fd) return undefined;
      const v =
        fd[key] ??
        fd[key.replace(/([A-Z])/g, " $1").trim()] ??
        fd[key.charAt(0).toLowerCase() + key.slice(1)];
      if (v == null || v === "") return undefined;
      return String(v).trim();
    };
    let first: FindRecordWithId<PayablesEditRequestFieldData> | undefined;
    for (const row of pendingList ?? []) {
      const r = row as FindRecordWithId<PayablesEditRequestFieldData>;
      if (!r?.recordId) continue;
      const fd = r.fieldData as Record<string, unknown> | undefined;
      const status = getStr(fd, "Status");
      if (status?.toLowerCase() === "pending") {
        first = r;
        break;
      }
    }
    if (!first?.recordId) {
      return { error: "No pending edit request found for this entry" };
    }

    const { error: mainErr } = await updateRecord(
      LAYOUTS.PAYABLES_MAIN,
      mainRecordId,
      {
        Posted: "",
        PostedDate: "",
        PostedName: "",
      },
      { allowEmptyStrings: true },
    );
    if (mainErr) return { error: mainErr };

    const grantedBy = (managerName || "").trim() || "Manager";
    const { error: updateErr } = await updateRecord(
      LAYOUTS.PAYABLES_EDIT_REQUEST,
      first.recordId,
      {
        Status: "Granted",
        GrantedBy: grantedBy,
      },
    );
    if (updateErr) return { error: updateErr };

    await writeActivityLog(
      createRecord,
      transRef.trim(),
      "EditAllowed",
      grantedBy,
    );
    clearCachedPending(trimmedRef);
    return { error: null };
  }

  return {
    fetchPendingEditRequest,
    getCachedPending,
    clearCachedPending,
    createEditRequest,
    grantEditRequest,
    notifyEditRequestGranted,
    getManagerEmail,
  };
}
