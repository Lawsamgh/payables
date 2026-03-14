/**
 * Rejection notification: email poster when manager rejects an entry.
 * Calls FileMaker script NotifyRejectedEntryToOfficer.
 * CCs the manager who rejected.
 */

import { useRouter } from "vue-router";
import { useFileMaker } from "./useFileMaker";
import { useVendorStore } from "../stores/vendorStore";
import { LAYOUTS } from "../utils/filemakerApi";

function getFieldValue(fd: Record<string, unknown> | undefined, key: string): string {
  if (!fd) return "";
  const v =
    fd[key] ??
    fd[key.replace(/([A-Z])/g, " $1").trim()] ??
    fd[key.charAt(0).toLowerCase() + key.slice(1)];
  if (v == null || v === "") return "";
  return String(v).trim();
}

function normalizeName(s: string): string {
  return (s || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

async function getOfficerEmailByFullName(
  findRecordsWithIds: ReturnType<typeof useFileMaker>["findRecordsWithIds"],
  fullName: string,
): Promise<string | null> {
  const name = (fullName || "").trim();
  if (!name) return null;
  const { data } = await findRecordsWithIds<Record<string, unknown>>(
    LAYOUTS.PAYABLES_USERS,
    { limit: 500 },
  );
  const searchNorm = normalizeName(name);
  for (const row of data ?? []) {
    const fd = row?.fieldData;
    const fn = getFieldValue(fd, "FullName") || getFieldValue(fd, "Full Name");
    if (normalizeName(fn) === searchNorm) {
      const email =
        getFieldValue(fd, "Email") || getFieldValue(fd, "E-Mail");
      if (email && email.includes("@")) return email;
      return null;
    }
  }
  return null;
}

export function useRejectionNotification() {
  const router = useRouter();
  const vendorStore = useVendorStore();
  const { findRecordsWithIds, runScript, loggedInEmail } = useFileMaker();

  /**
   * Run FileMaker script NotifyRejectedEntryToOfficer.
   * Emails the poster (To) and CCs the manager who rejected (copyManager).
   */
  async function notifyRejectedEntryToOfficer(params: {
    transRef: string;
    postedName: string;
    /** Fallback when postedName lookup fails (e.g. Creator). */
    creatorName?: string;
    rejectedBy: string;
    /** Rejection reason text to include in the email. */
    rejectReason?: string;
    vendorName?: string;
  }): Promise<{ error: string | null }> {
    const trimmedRef = (params.transRef || "").trim();
    if (!trimmedRef) return { error: null };

    let posterEmail =
      (params.postedName || "").trim() &&
      (await getOfficerEmailByFullName(findRecordsWithIds, params.postedName || ""));
    if (!posterEmail && (params.creatorName || "").trim()) {
      posterEmail = await getOfficerEmailByFullName(
        findRecordsWithIds,
        params.creatorName || "",
      );
    }
    if (!posterEmail) {
      return {
        error: `Could not find poster email for "${params.postedName || "Officer"}" or creator "${params.creatorName || "—"}". Check that PostedName/Creator in Payables_Main matches FullName in Payables_Users.`,
      };
    }

    let copyManager =
      (params.rejectedBy || "").trim() &&
      (await getOfficerEmailByFullName(findRecordsWithIds, params.rejectedBy));
    if (!copyManager || !copyManager.includes("@")) {
      const loginEmail = (loggedInEmail.value || "").trim();
      if (loginEmail && loginEmail.includes("@")) {
        copyManager = loginEmail;
      }
    }
    if (!copyManager || !copyManager.includes("@")) {
      return {
        error: `Could not find manager email for "${params.rejectedBy || "—"}". Add Email in Payables_Users for the rejecting user.`,
      };
    }

    const entryUrl = new URL(
      router.resolve({ name: "entry", query: { transRef: trimmedRef } }).href,
      window.location.origin,
    ).href;

    const vendorname = (params.vendorName ?? vendorStore.vendor?.vendor_name ?? "").trim() || "—";
    const postedname = (params.postedName || "").trim() || "Officer";
    const approvedby = (params.rejectedBy || "").trim() || "Manager";

    const rejectReason = (params.rejectReason ?? "").trim();

    const scriptParam = JSON.stringify({
      transref: trimmedRef,
      url: entryUrl,
      posteremail: posterEmail,
      postedname,
      copyManager,
      approvedby,
      vendorname,
      rejectReason,
    });

    const { error } = await runScript(
      LAYOUTS.PAYABLES_MAIN,
      "NotifyRejectedEntryToOfficer",
      scriptParam,
    );
    return { error: error ?? null };
  }

  return { notifyRejectedEntryToOfficer };
}
