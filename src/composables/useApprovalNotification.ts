/**
 * Approval notification: email poster + CC other officers when manager approves an entry.
 * Calls FileMaker script NotifyApprovalToOfficer (requires ApprovalEmailToOfficer enabled in Payables_Settings).
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

/** Normalize name for matching: trim, collapse multiple spaces, lowercase. */
function normalizeName(s: string): string {
  return (s || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

/** Get officer email from Payables_Users by FullName (lenient matching). */
async function getOfficerEmailByFullName(
  findRecordsWithIds: ReturnType<typeof useFileMaker>["findRecordsWithIds"],
  fullName: string
): Promise<string | null> {
  const name = (fullName || "").trim();
  if (!name) return null;
  const { data } = await findRecordsWithIds<Record<string, unknown>>(
    LAYOUTS.PAYABLES_USERS,
    { limit: 500 }
  );
  const searchNorm = normalizeName(name);
  for (const row of data ?? []) {
    const fd = row?.fieldData;
    const fn = getFieldValue(fd, "FullName") || getFieldValue(fd, "Full Name");
    if (normalizeName(fn) === searchNorm) {
      const email = getFieldValue(fd, "Email");
      if (email) return email;
      return null;
    }
  }
  return null;
}

/** Get all Officer emails from Payables_Users, excluding the poster (by FullName). */
async function getOtherOfficerEmails(
  findRecordsWithIds: ReturnType<typeof useFileMaker>["findRecordsWithIds"],
  excludePostedName: string
): Promise<string[]> {
  const { data } = await findRecordsWithIds<Record<string, unknown>>(
    LAYOUTS.PAYABLES_USERS,
    { limit: 500 }
  );
  const exclude = normalizeName(excludePostedName);
  const emails: string[] = [];
  const seen = new Set<string>();
  for (const row of data ?? []) {
    const fd = row?.fieldData;
    const role = getFieldValue(fd, "Role").toLowerCase();
    if (role !== "officer") continue;
    const fn = getFieldValue(fd, "FullName") || getFieldValue(fd, "Full Name");
    if (normalizeName(fn) === exclude) continue;
    const email = getFieldValue(fd, "Email");
    if (email && !seen.has(email.toLowerCase())) {
      seen.add(email.toLowerCase());
      emails.push(email);
    }
  }
  return emails;
}

export function useApprovalNotification() {
  const router = useRouter();
  const vendorStore = useVendorStore();
  const { findRecordsWithIds, runScript } = useFileMaker();

  /**
   * Run FileMaker script NotifyApprovalToOfficer to email the poster and CC other officers.
   */
  async function notifyApprovalToOfficer(params: {
    transRef: string;
    postedName: string;
    approvedBy: string;
    vendorName?: string;
  }): Promise<{ error: string | null }> {
    const trimmedRef = (params.transRef || "").trim();
    if (!trimmedRef) return { error: null };

    const posterEmail = await getOfficerEmailByFullName(
      findRecordsWithIds,
      params.postedName || "Officer"
    );
    if (!posterEmail) {
      return {
        error: `Could not find poster email for "${params.postedName || "Officer"}". Check that PostedName in Payables_Main matches FullName in Payables_Users.`,
      };
    }

    const officerEmailsCcList = await getOtherOfficerEmails(
      findRecordsWithIds,
      params.postedName || ""
    );
    /** FileMaker Send Mail CC expects semicolon-separated emails, not a JSON array. */
    const officerEmailsCc = officerEmailsCcList.join("; ");

    const entryUrl = new URL(
      router.resolve({ name: "entry", query: { transRef: trimmedRef } }).href,
      window.location.origin
    ).href;

    const vendorname = (params.vendorName ?? vendorStore.vendor?.vendor_name ?? "").trim() || "—";
    const postedname = (params.postedName || "").trim() || "Officer";
    const approvedby = (params.approvedBy || "").trim() || "Manager";

    const scriptParam = JSON.stringify({
      transref: trimmedRef,
      url: entryUrl,
      posteremail: posterEmail,
      postedname,
      officerEmailsCc,
      approvedby,
      vendorname,
    });

    const { error } = await runScript(
      LAYOUTS.PAYABLES_MAIN,
      "NotifyApprovalToOfficer",
      scriptParam
    );
    return { error: error ?? null };
  }

  return { notifyApprovalToOfficer };
}
