/**
 * Shared PDF build + download for approved/posted payables.
 * Uses payableStore + vendorStore (must be populated before calling).
 */

import { usePayableStore } from "../stores/payableStore";
import { useVendorStore } from "../stores/vendorStore";
import { useDocumentSettingsStore } from "../stores/documentSettingsStore";
import { useFileMaker } from "./useFileMaker";
import { useToastStore } from "../stores/toastStore";
import {
  LAYOUTS,
  type PayableInvoiceFieldData,
  type TaxValueFieldData,
} from "../utils/filemakerApi";
import type { FindRecordWithId } from "./useFileMaker";
import type { PayableRow } from "../types";

function formatDateForPdfDisplay(dateStr: string | undefined): string {
  if (!dateStr?.trim()) return "—";
  const s = dateStr.trim();
  // Parse YYYY-MM-DD
  const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso) {
    const [, y, m, d] = iso;
    return `${d!.padStart(2, "0")}/${m!.padStart(2, "0")}/${y}`;
  }
  // Parse MM/DD/YYYY
  const us = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (us) {
    const [, m, d, y] = us;
    return `${d!.padStart(2, "0")}/${m!.padStart(2, "0")}/${y}`;
  }
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }
  return s;
}

function formatPdfNumber(value: string | number | undefined): string {
  if (value === undefined || value === null || value === "") return "—";
  const n =
    typeof value === "number"
      ? value
      : parseFloat(String(value).replace(/,/g, ""));
  if (Number.isNaN(n)) return "—";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function amountInWords(amount: number, currencyCode = ""): string {
  const whole = Math.floor(amount);
  const cents = Math.round((amount - whole) * 100);
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  function toWords(n: number): string {
    if (n === 0) return "Zero";
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return (tens[Math.floor(n / 10)] + " " + ones[n % 10]).trim();
    if (n < 1000)
      return (
        ones[Math.floor(n / 100)] +
        " Hundred " +
        toWords(n % 100)
      ).trim();
    if (n < 1e6)
      return (
        toWords(Math.floor(n / 1000)) +
        " Thousand " +
        toWords(n % 1000)
      ).trim();
    if (n < 1e9)
      return (
        toWords(Math.floor(n / 1e6)) +
        " Million " +
        toWords(n % 1e6)
      ).trim();
    return String(n);
  }
  const wholeStr = whole === 0 ? "Zero" : toWords(whole);
  const currency = currencyCode ? ` ${currencyCode}` : "";
  if (cents === 0) return `${wholeStr}${currency} only`;
  return `${wholeStr}${currency} and ${cents}/100`;
}

export function usePdfDownload() {
  const payableStore = usePayableStore();
  const vendorStore = useVendorStore();
  const documentSettings = useDocumentSettingsStore();
  const { isConnected, findRecordsByQueryWithIds, findRecordsWithIds } =
    useFileMaker();
  const toast = useToastStore();

  /**
   * Build and download PDF for the current entry in payableStore/vendorStore.
   * Respects Settings > Documents (invoiceDownloadWhen).
   * Uses Status (Approved/Posted) as the source of truth; mainPosted is not required
   * since some workflows allow PDF for Approved entries before accounting Posted.
   * @returns true if PDF was downloaded, false if skipped
   */
  async function buildAndDownloadPdf(): Promise<boolean> {
    const status = payableStore.mainStatus;
    const when = documentSettings.invoiceDownloadWhen;
    const statusAllowed =
      when === "approved_only"
        ? status === "Approved"
        : when === "once_posted"
          ? status === "Posted" || status === "Approved"
          : false;
    const ok = statusAllowed && payableStore.currentTransRef?.trim();
    if (!ok) return false;

    try {
      const [pdfMakeModule, vfsModule] = await Promise.all([
        import("pdfmake/build/pdfmake"),
        import("pdfmake/build/vfs_fonts"),
      ]);
      const pdfMake =
        (
          pdfMakeModule as {
            default?: {
              createPdf: (def: unknown) => { download: (name: string) => void };
              addVirtualFileSystem?: (v: unknown) => void;
            };
          }
        ).default ??
        (pdfMakeModule as {
          createPdf: (def: unknown) => { download: (name: string) => void };
          addVirtualFileSystem?: (v: unknown) => void;
        });
      const vfs = (vfsModule as { default?: unknown }).default ?? vfsModule;
      if (pdfMake.addVirtualFileSystem && vfs) {
        pdfMake.addVirtualFileSystem(vfs);
      }

      const transRef = payableStore.currentTransRef?.trim() ?? "";
      const content = await buildSinglePageContent();
      const watermarkText = transRef ? `APPROVED · ${transRef}` : "APPROVED";
      const docDefinition = {
        pageSize: "A4" as const,
        pageOrientation: "landscape" as const,
        pageMargins: [40, 50, 40, 70],
        defaultStyle: { fontSize: 10, color: "#000" },
        watermark: {
          text: watermarkText,
          color: "#b0b0b0",
          opacity: 0.12,
          bold: true,
          angle: -45,
        },
        content,
        footer: (currentPage: number, pageCount: number) => ({
          margin: [40, 10, 40, 0],
          stack: [
            {
              text: `PAGE ${currentPage} of ${pageCount}`,
              fontSize: 9,
              alignment: "center" as const,
            },
            {
              text:
                "Finance Payables  ·  " +
                new Date().toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                }),
              fontSize: 8,
              alignment: "center" as const,
              margin: [0, 2, 0, 0],
            },
          ],
        }),
      };

      const filename = transRef
        ? `Approved-Payable-${transRef.replace(/[/\\?%*:|"<>]/g, "-")}.pdf`
        : "Approved-Payable.pdf";
      const pdfDoc = pdfMake.createPdf(docDefinition);
      await pdfDoc.download(filename);
      toast.success("PDF downloaded.");
      return true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "PDF download failed.";
      toast.error(msg);
      return false;
    }
  }

  /**
   * Build and download a combined PDF of multiple payable entries.
   * Fetches each entry, builds one page per entry, and downloads as a single PDF.
   * Respects Settings > Documents (invoiceDownloadWhen).
   * @param transRefs - Array of TransRef values to include
   * @returns number of pages included, or 0 if failed/skipped
   */
  async function buildAndDownloadCombinedPdf(
    transRefs: string[],
  ): Promise<number> {
    const when = documentSettings.invoiceDownloadWhen;
    if (when === "none") return 0;
    const refs = transRefs
      .map((r) => (r ?? "").trim())
      .filter(Boolean);
    if (refs.length === 0) return 0;

    try {
      const [pdfMakeModule, vfsModule] = await Promise.all([
        import("pdfmake/build/pdfmake"),
        import("pdfmake/build/vfs_fonts"),
      ]);
      const pdfMake =
        (
          pdfMakeModule as {
            default?: {
              createPdf: (def: unknown) => { download: (name: string) => void };
              addVirtualFileSystem?: (v: unknown) => void;
            };
          }
        ).default ??
        (pdfMakeModule as {
          createPdf: (def: unknown) => { download: (name: string) => void };
          addVirtualFileSystem?: (v: unknown) => void;
        });
      const vfs = (vfsModule as { default?: unknown }).default ?? vfsModule;
      if (pdfMake.addVirtualFileSystem && vfs) {
        pdfMake.addVirtualFileSystem(vfs);
      }

      const pages: unknown[][] = [];
      for (const transRef of refs) {
        await payableStore.fetchDetailsByTransRef(transRef);
        if (payableStore.error || !payableStore.mainPosted) continue;
        const status = payableStore.mainStatus;
        const ok =
          when === "approved_only"
            ? status === "Approved"
            : when === "once_posted"
              ? status === "Posted" || status === "Approved"
              : false;
        if (!ok) continue;

        const pageContent = await buildSinglePageContent();
        if (pageContent.length) pages.push(pageContent);
      }

      const allContent = pages.flatMap((p, i) => {
        if (i < pages.length - 1 && p.length > 0) {
          const last = p[p.length - 1];
          const lastWithBreak =
            typeof last === "object" && last !== null && !Array.isArray(last)
              ? { ...(last as Record<string, unknown>), pageBreak: "after" as const }
              : last;
          return [...p.slice(0, -1), lastWithBreak];
        }
        return p;
      });

      if (allContent.length === 0) {
        toast.error("No downloadable invoices in the selection.");
        return 0;
      }

      const dateStr = new Date().toISOString().slice(0, 10);
      const docDefinition = {
        pageSize: "A4" as const,
        pageOrientation: "landscape" as const,
        pageMargins: [40, 50, 40, 70],
        defaultStyle: { fontSize: 10, color: "#000" },
        watermark: {
          text: "APPROVED",
          color: "#b0b0b0",
          opacity: 0.12,
          bold: true,
          angle: -45,
        },
        content: allContent,
        footer: (currentPage: number, pageCount: number) => ({
          margin: [40, 10, 40, 0],
          stack: [
            {
              text: `PAGE ${currentPage} of ${pageCount}`,
              fontSize: 9,
              alignment: "center" as const,
            },
            {
              text:
                "Finance Payables  ·  " +
                new Date().toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                }),
              fontSize: 8,
              alignment: "center" as const,
              margin: [0, 2, 0, 0],
            },
          ],
        }),
      };

      const filename = `Combined-Payables-${dateStr}.pdf`;
      const pdfDoc = pdfMake.createPdf(docDefinition);
      await pdfDoc.download(filename);
      toast.success(`Downloaded combined PDF (${pages.length} invoices).`);
      return pages.length;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Combined PDF download failed.";
      toast.error(msg);
      return 0;
    }
  }

  async function buildSinglePageContent(): Promise<unknown[]> {
    const transRef = payableStore.currentTransRef?.trim() ?? "";
    const v = vendorStore.vendor;
    const amountToPayVal =
      typeof payableStore.amountToPay === "number"
        ? payableStore.amountToPay
        : 0;
    const advancePaymentVal = payableStore.advancePaymentNum ?? 0;
    const advancePaymentStr =
      (v.currency ? `${v.currency} ` : "") + formatPdfNumber(advancePaymentVal);
    const totalFormatted = formatPdfNumber(amountToPayVal);
    const totalStr = (v.currency ? `${v.currency} ` : "") + totalFormatted;
    const dateStr = new Date().toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const vendorLine =
      [transRef, v.vendor_id, v.vendor_name].filter(Boolean).join("  ·  ") ||
      "—";
    const inWords = amountInWords(amountToPayVal, v.currency || "");

    const rows = payableStore.rows.filter(
      (r: PayableRow) =>
        (r.invoice_number ?? "").trim() !== "" ||
        (r.amount ?? "").trim() !== "" ||
        (r.total ?? "").trim() !== "",
    );

    const subTotal = rows.reduce((acc, r) => {
      const n = parseFloat(String(r.amount ?? "").replace(/,/g, ""));
      return acc + (Number.isNaN(n) ? 0 : n);
    }, 0);
    const totalTax = rows.reduce((acc, r) => {
      const taxAmount = (r.reference ?? "").trim() || (r.tax ?? "");
      const n = parseFloat(String(taxAmount).replace(/,/g, ""));
      return acc + (Number.isNaN(n) ? 0 : n);
    }, 0);
    const totalWhtTax = rows.reduce((acc, r) => {
      const n = parseFloat(String(r.wht_tax_amount ?? "").replace(/,/g, ""));
      return acc + (Number.isNaN(n) ? 0 : n);
    }, 0);
    const subTotalStr =
      (v.currency ? `${v.currency} ` : "") + formatPdfNumber(subTotal);

    const uniqueInvoices = [
      ...new Set(
        rows.map((r) => (r.invoice_number ?? "").trim()).filter(Boolean),
      ),
    ];
    const payableInvoiceByInv = new Map<string, PayableInvoiceFieldData[]>();
    let taxListData: FindRecordWithId<TaxValueFieldData>[] = [];
    if (isConnected.value && uniqueInvoices.length > 0) {
      const [invResults, taxRes] = await Promise.all([
        Promise.all(
          uniqueInvoices.map((inv) =>
            findRecordsByQueryWithIds<PayableInvoiceFieldData>(
              LAYOUTS.PAYABLE_INVOICE,
              { invoiceNumber: inv },
              100,
            ),
          ),
        ),
        findRecordsWithIds<TaxValueFieldData>(LAYOUTS.TAX_VALUE, {
          limit: 500,
        }),
      ]);
      invResults.forEach((res, i) => {
        const inv = uniqueInvoices[i];
        if (inv && res.data?.length) {
          payableInvoiceByInv.set(
            inv,
            res.data.map((r) => r.fieldData).filter(Boolean),
          );
        }
      });
      taxListData = taxRes.data ?? [];
    }

    function getActionForTax(
      taxName: string,
      rate: number,
      taxType?: string,
    ): "Add" | "Sub" {
      const nameMatch = String(taxName ?? "").trim();
      for (const { fieldData } of taxListData) {
        const fd = fieldData;
        const matchName = String(fd.Tax_Name ?? "").trim() === nameMatch;
        const matchRate = Number(fd.Tax_Rate) === rate;
        const matchType =
          !taxType ||
          String(fd.Tax_Type ?? "").trim() === String(taxType).trim();
        if (matchName && matchRate && matchType) {
          return (fd.Action ?? "").trim() === "Sub" ? "Sub" : "Add";
        }
      }
      return "Add";
    }

    function buildTaxBreakdownText(
      row: PayableRow,
      actionFilter: "Add" | "Sub",
    ): string {
      const inv = (row.invoice_number ?? "").trim();
      if (!inv) return "—";
      const records = payableInvoiceByInv.get(inv);
      if (!records?.length) return "—";
      const parts = records
        .filter((rec) => {
          const rate = Number(rec.Rate ?? 0);
          const name = (rec.TaxName ?? "").trim();
          const action = getActionForTax(name, rate, rec.Tax_Type);
          return action === actionFilter;
        })
        .map((rec) => {
          const rate = Number(rec.Rate ?? 0);
          const name = (rec.TaxName ?? "").trim() || "Tax";
          const rateStr = rate !== 0 ? `${rate}%` : "";
          return `${name}${rateStr ? ` ${rateStr}` : ""}`;
        });
      return parts.length ? parts.join(", ") : "—";
    }

    const tableFontSize = 7;
    const tableHeaderRow = [
      { text: "Invoice No.", fillColor: "#ebebeb", bold: true, fontSize: tableFontSize },
      {
        text: "Amount before VAT",
        fillColor: "#ebebeb",
        bold: true,
        alignment: "right" as const,
        fontSize: tableFontSize,
      },
      {
        text: "Tax Rate",
        fillColor: "#ebebeb",
        bold: true,
        alignment: "right" as const,
        fontSize: tableFontSize,
      },
      {
        text: "Tax Amount",
        fillColor: "#ebebeb",
        bold: true,
        alignment: "right" as const,
        fontSize: tableFontSize,
      },
      {
        text: "Tax breakdown (Add)",
        fillColor: "#ebebeb",
        bold: true,
        fontSize: tableFontSize,
      },
      {
        text: "WHT Tax",
        fillColor: "#ebebeb",
        bold: true,
        alignment: "right" as const,
        fontSize: tableFontSize,
      },
      {
        text: "WHT Tax Amount",
        fillColor: "#ebebeb",
        bold: true,
        alignment: "right" as const,
        fontSize: tableFontSize,
      },
      {
        text: "WHT Tax breakdown (Sub)",
        fillColor: "#ebebeb",
        bold: true,
        fontSize: tableFontSize,
      },
      {
        text: "Total",
        fillColor: "#ebebeb",
        bold: true,
        alignment: "right" as const,
        fontSize: tableFontSize,
      },
    ];
    const tableBody = [
      tableHeaderRow,
      ...rows.map((r) => {
        const taxAmount = (r.reference ?? "").trim() || (r.tax ?? "");
        return [
          { text: (r.invoice_number ?? "").trim() || "—", fontSize: tableFontSize },
          {
            text: formatPdfNumber(r.amount ?? ""),
            alignment: "right" as const,
            fontSize: tableFontSize,
          },
          { text: formatPdfNumber(r.tax ?? ""), alignment: "right" as const, fontSize: tableFontSize },
          { text: formatPdfNumber(taxAmount), alignment: "right" as const, fontSize: tableFontSize },
          { text: buildTaxBreakdownText(r, "Add"), fontSize: tableFontSize },
          { text: formatPdfNumber(r.wht_tax ?? ""), alignment: "right" as const, fontSize: tableFontSize },
          { text: formatPdfNumber(r.wht_tax_amount ?? ""), alignment: "right" as const, fontSize: tableFontSize },
          { text: buildTaxBreakdownText(r, "Sub"), fontSize: tableFontSize },
          {
            text: formatPdfNumber(r.total ?? ""),
            alignment: "right" as const,
            fontSize: tableFontSize,
          },
        ];
      }),
    ];

    return [
      {
        columns: [
          { text: "Invoice Payment - PDF", fontSize: 15, bold: true },
          {
            text: dateStr.toUpperCase(),
            fontSize: 10,
            alignment: "right",
            width: "*",
          },
        ],
        margin: [0, 0, 0, 10],
      },
      {
        canvas: [
          { type: "line", x1: 0, y1: 0, x2: 762, y2: 0 },
        ],
        margin: [0, 4, 0, 10],
      },
      {
        text: vendorLine,
        alignment: "center",
        bold: true,
        fontSize: 12,
        margin: [0, 0, 0, 6],
      },
      {
        table: {
          widths: [120, "*"],
          body: [
            [
              {
                text: "Purchase order",
                bold: true,
                fillColor: "#f5f5f5",
                fontSize: 8,
              },
              { text: v.purchase_order?.trim() || "—", fontSize: 8 },
            ],
            [
              {
                text: "Vendor ID",
                bold: true,
                fillColor: "#f5f5f5",
                fontSize: 8,
              },
              { text: v.vendor_id?.trim() || "—", fontSize: 8 },
            ],
            [
              {
                text: "Vendor name",
                bold: true,
                fillColor: "#f5f5f5",
                fontSize: 8,
              },
              { text: v.vendor_name?.trim() || "—", fontSize: 8 },
            ],
            [
              {
                text: "Date (DD/MM/YYYY)",
                bold: true,
                fillColor: "#f5f5f5",
                fontSize: 8,
              },
              {
                text: formatDateForPdfDisplay(
                  v.payment_terms?.trim() ||
                    new Date().toISOString().slice(0, 10),
                ),
                fontSize: 8,
              },
            ],
            [
              {
                text: "Email",
                bold: true,
                fillColor: "#f5f5f5",
                fontSize: 8,
              },
              { text: v.contact_email?.trim() || "—", fontSize: 8 },
            ],
            [
              {
                text: "Currency",
                bold: true,
                fillColor: "#f5f5f5",
                fontSize: 8,
              },
              { text: v.currency?.trim() || "—", fontSize: 8 },
            ],
            [
              {
                text: "Vendor balance in BC",
                bold: true,
                fillColor: "#f5f5f5",
                fontSize: 8,
              },
              {
                text:
                  v.vendor_balance?.trim()
                    ? (v.currency ? `${v.currency} ` : "") +
                      formatPdfNumber(v.vendor_balance)
                    : "—",
                fontSize: 8,
              },
            ],
          ],
        },
        layout: { hLineWidth: () => 0.2, vLineWidth: () => 0.2 },
        margin: [0, 0, 0, 12],
      },
      {
        canvas: [
          { type: "line", x1: 0, y1: 0, x2: 762, y2: 0 },
        ],
        margin: [0, 0, 0, 12],
      },
      {
        table: {
          headerRows: 1,
          widths: [65, 70, 42, 55, "*", 42, 60, "*", 55],
          body: tableBody,
        },
        layout: { hLineWidth: () => 0.25, vLineWidth: () => 0.25 },
        margin: [0, 0, 0, 14],
      },
      {
        columns: [
          {
            width: "*",
            stack: [
              {
                text: "Amount in words",
                bold: true,
                fontSize: 9,
                margin: [0, 0, 0, 4],
              },
              { text: inWords, fontSize: 10 },
            ],
            fillColor: "#f8f8f8",
            margin: [0, 4, 8, 4],
          },
          {
            width: 240,
            table: {
              widths: [130, "*"],
              body: [
                [
                  {
                    text: "Sub Total (excl. tax)",
                    fontSize: 9,
                    fillColor: "#f5f5f5",
                  },
                  {
                    text: subTotalStr,
                    fontSize: 9,
                    alignment: "right" as const,
                    fillColor: "#f5f5f5",
                  },
                ],
                [
                  {
                    text: "Total Tax (Add)",
                    fontSize: 9,
                    fillColor: "#f5f5f5",
                  },
                  {
                    text: (v.currency ? `${v.currency} ` : "") + formatPdfNumber(totalTax),
                    fontSize: 9,
                    alignment: "right" as const,
                    fillColor: "#f5f5f5",
                  },
                ],
                [
                  {
                    text: "Total WHT Tax (Sub)",
                    fontSize: 9,
                    fillColor: "#f5f5f5",
                  },
                  {
                    text: (v.currency ? `${v.currency} ` : "") + formatPdfNumber(totalWhtTax),
                    fontSize: 9,
                    alignment: "right" as const,
                    fillColor: "#f5f5f5",
                  },
                ],
                [
                  {
                    text: "Advance Payment",
                    fontSize: 9,
                    fillColor: "#f5f5f5",
                  },
                  {
                    text: advancePaymentVal > 0 ? advancePaymentStr : "—",
                    fontSize: 9,
                    alignment: "right" as const,
                    fillColor: "#f5f5f5",
                  },
                ],
                [
                  {
                    text: "Amount to Pay",
                    fontSize: 9,
                    bold: true,
                    fillColor: "#f5f5f5",
                  },
                  {
                    text: totalStr,
                    fontSize: 9,
                    bold: true,
                    alignment: "right" as const,
                    fillColor: "#f5f5f5",
                  },
                ],
              ],
            },
            layout: { hLineWidth: () => 0.2, vLineWidth: () => 0.2 },
          },
        ],
      },
    ];
  }

  return { buildAndDownloadPdf, buildAndDownloadCombinedPdf };
}
