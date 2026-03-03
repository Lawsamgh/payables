/**
 * Send approved (not issued) invoice notification to vendors via FileMaker script SendInvoiceToVendor.
 * Email includes the Code for cheque collection (no PDF, no URL).
 */

import { useFileMaker } from "./useFileMaker";
import { useToastStore } from "../stores/toastStore";
import { LAYOUTS } from "../utils/filemakerApi";
import { formatNumberDisplay } from "../utils/formatNumber";
import type { MailableItem } from "../stores/invoiceMailSelectionStore";

export function useSendInvoiceToVendor() {
  const { runScript } = useFileMaker();
  const toast = useToastStore();

  async function sendToVendors(
    items: MailableItem[],
  ): Promise<{ error: string | null }> {
    const valid = items.filter(
      (i) =>
        i.transRef?.trim() &&
        i.vendorEmail?.trim() &&
        i.vendorEmail.includes("@") &&
        i.code?.trim(),
    );
    if (valid.length === 0) {
      return {
        error:
          "No valid items to send. Each item needs TransRef, vendor email, and Code.",
      };
    }

    const scriptParam = JSON.stringify({
      items: valid.map((i) => ({
        // Match FileMaker script JSON paths:
        // items[i].transRef, items[i].vendorEmail, items[i].vendorName, items[i].code, items[i].total
        transRef: i.transRef.trim(),
        vendorEmail: i.vendorEmail.trim(),
        vendorName: (i.vendorName ?? "").trim() || "Vendor",
        code: i.code.trim(),
        total: formatNumberDisplay(Number(i.total) || 0) || "0.00",
      })),
    });

    const { error, scriptError, scriptResult } = await runScript(
      LAYOUTS.PAYABLES_MAIN,
      "SendInvoiceToVendor",
      scriptParam,
    );

    // Only treat as error when error is set. FileMaker returns scriptError "0" on success;
    // the string "0" is truthy in JS, so checking scriptError would wrongly flag success as failure.
    if (error) {
      let msg = error ?? scriptError ?? "Failed to send emails.";
      if (scriptResult && String(scriptResult).trim()) {
        msg += ` Script result: ${String(scriptResult).trim()}`;
      }
      // Surface FileMaker script result in the console to aid debugging.
      // eslint-disable-next-line no-console
      console.error("[SendInvoiceToVendor] error", {
        error,
        scriptError,
        scriptResult,
      });
      toast.error(msg);
      return { error: msg };
    }

    if (scriptResult && String(scriptResult).trim()) {
      const trimmed = String(scriptResult).trim();
      toast.success(
        `Email sent to ${valid.length} vendor(s). Script result: ${trimmed}`,
      );
      // eslint-disable-next-line no-console
      console.info("[SendInvoiceToVendor] scriptResult", { scriptResult: trimmed });
    } else {
      toast.success(`Email sent to ${valid.length} vendor(s).`);
    }
    return { error: null };
  }

  return { sendToVendors };
}
