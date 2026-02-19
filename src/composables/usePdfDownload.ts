/**
 * Shared PDF build + download for approved/posted payables.
 * Uses payableStore + vendorStore (must be populated before calling).
 */

import { usePayableStore } from "../stores/payableStore";
import { useVendorStore } from "../stores/vendorStore";
import { useDocumentSettingsStore } from "../stores/documentSettingsStore";
import { useFileMaker } from "./useFileMaker";
import { useToastStore } from "../stores/toastStore";
import { LAYOUTS, type PayableInvoiceFieldData } from "../utils/filemakerApi";
import type { PayableRow } from "../types";

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
  const { isConnected, findRecordsByQueryWithIds } = useFileMaker();
  const toast = useToastStore();

  /**
   * Build and download PDF for the current entry in payableStore/vendorStore.
   * Respects Settings > Documents (invoiceDownloadWhen).
   * @returns true if PDF was downloaded, false if skipped
   */
  async function buildAndDownloadPdf(): Promise<boolean> {
    const status = payableStore.mainStatus;
    const when = documentSettings.invoiceDownloadWhen;
    const ok =
      payableStore.mainPosted &&
      (when === "approved_only"
        ? status === "Approved"
        : when === "once_posted"
          ? status === "Posted" || status === "Approved"
          : false);
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
      const v = vendorStore.vendor;
      const totalAmount =
        typeof payableStore.entryTotal === "number"
          ? payableStore.entryTotal
          : 0;
      const totalFormatted = formatPdfNumber(totalAmount);
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
      const inWords = amountInWords(totalAmount, v.currency || "");

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
        const n = parseFloat(String(r.tax ?? "").replace(/,/g, ""));
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
      if (isConnected.value && uniqueInvoices.length > 0) {
        const results = await Promise.all(
          uniqueInvoices.map((inv) =>
            findRecordsByQueryWithIds<PayableInvoiceFieldData>(
              LAYOUTS.PAYABLE_INVOICE,
              { invoiceNumber: inv },
              100,
            ),
          ),
        );
        results.forEach((res, i) => {
          const inv = uniqueInvoices[i];
          if (inv && res.data?.length) {
            payableInvoiceByInv.set(
              inv,
              res.data.map((r) => r.fieldData).filter(Boolean),
            );
          }
        });
      }

      function buildTaxBreakdownText(row: PayableRow): string {
        const inv = (row.invoice_number ?? "").trim();
        if (!inv) return "—";
        const records = payableInvoiceByInv.get(inv);
        if (!records?.length) return "—";
        const parts = records.map((rec) => {
          const rate = Number(rec.Rate ?? 0);
          const name = (rec.TaxName ?? "").trim() || "Tax";
          const rateStr = rate !== 0 ? `${rate}%` : "";
          return `${name}${rateStr ? ` ${rateStr}` : ""}`;
        });
        return parts.join(", ");
      }

      const tableHeaderRow = [
        { text: "Invoice No.", fillColor: "#ebebeb", bold: true },
        {
          text: "Amount",
          fillColor: "#ebebeb",
          bold: true,
          alignment: "right" as const,
        },
        {
          text: "Tax",
          fillColor: "#ebebeb",
          bold: true,
          alignment: "right" as const,
        },
        {
          text: "Tax Amount",
          fillColor: "#ebebeb",
          bold: true,
          alignment: "right" as const,
        },
        { text: "Tax breakdown", fillColor: "#ebebeb", bold: true, fontSize: 9 },
        {
          text: "Total",
          fillColor: "#ebebeb",
          bold: true,
          alignment: "right" as const,
        },
      ];
      const tableBody = [
        tableHeaderRow,
        ...rows.map((r) => {
          const taxAmount = (r.reference ?? "").trim() || (r.tax ?? "");
          return [
            (r.invoice_number ?? "").trim() || "—",
            {
              text: formatPdfNumber(r.amount ?? ""),
              alignment: "right" as const,
            },
            { text: formatPdfNumber(r.tax ?? ""), alignment: "right" as const },
            { text: formatPdfNumber(taxAmount), alignment: "right" as const },
            { text: buildTaxBreakdownText(r), fontSize: 9 },
            {
              text: formatPdfNumber(r.total ?? ""),
              alignment: "right" as const,
            },
          ];
        }),
      ];

      const watermarkText = transRef ? `APPROVED · ${transRef}` : "APPROVED";
      const docDefinition = {
        pageSize: "A4",
        pageOrientation: "landscape",
        pageMargins: [40, 50, 40, 70],
        defaultStyle: { fontSize: 10, color: "#000" },
        watermark: {
          text: watermarkText,
          color: "#b0b0b0",
          opacity: 0.12,
          bold: true,
          angle: -45,
        },
        content: [
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
                  { text: "Vendor ID", bold: true, fillColor: "#f5f5f5" },
                  v.vendor_id?.trim() || "—",
                ],
                [
                  { text: "Vendor name", bold: true, fillColor: "#f5f5f5" },
                  v.vendor_name?.trim() || "—",
                ],
                [
                  { text: "Date", bold: true, fillColor: "#f5f5f5" },
                  v.payment_terms?.trim() || dateStr,
                ],
                [
                  { text: "Email", bold: true, fillColor: "#f5f5f5" },
                  v.contact_email?.trim() || "—",
                ],
                [
                  { text: "Currency", bold: true, fillColor: "#f5f5f5" },
                  v.currency?.trim() || "—",
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
              widths: [110, 95, 90, 95, "*", 100],
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
                      { text: "Total Tax", fontSize: 9, fillColor: "#f5f5f5" },
                      {
                        text: formatPdfNumber(totalTax),
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
                        text: "—",
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
        ],
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
      pdfMake.createPdf(docDefinition).download(filename);
      toast.success("PDF downloaded.");
      return true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "PDF download failed.";
      toast.error(msg);
      return false;
    }
  }

  return { buildAndDownloadPdf };
}
