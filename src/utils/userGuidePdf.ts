/**
 * User guide PDF content for Officer and Manager roles.
 * Layout: header, title banner, two-column table (section | content), footer.
 */

export type GuideRole = "officer" | "manager";

interface Section {
  section: string;
  content: string | string[];
}

function sectionRow(section: string, content: string | string[]): unknown[] {
  const contentArr = Array.isArray(content) ? content : [content];
  const contentStack = contentArr.map((c) => ({
    text: c,
    fontSize: 10,
    margin: [0, 0, 0, 4] as [number, number, number, number],
  }));
  return [
    {
      text: section,
      fontSize: 10,
      bold: true,
      fillColor: "#f1f5f9",
      margin: [8, 6, 8, 6] as [number, number, number, number],
    },
    {
      stack: contentStack,
      margin: [8, 6, 8, 6] as [number, number, number, number],
    },
  ];
}

function getOfficerSections(): Section[] {
  return [
    {
      section: "1. Introduction",
      content:
        "The Accounts Payable Tracker helps you manage vendor invoices and payables. As an Officer, you create entries, post them for manager approval, send invoices to vendors, and manage vendor and tax information. Managers approve or reject what you post.",
    },
    {
      section: "2. Home (Payables Dashboard)",
      content:
        "The Home page shows your payable entries by status. Tabs: Draft, Posted, Rejected, Approved. Use Search, Date, and KPI filters. Click an entry card to open it. On Draft, use New entry to create.",
    },
    {
      section: "3. Entry View – Create & Edit Payables",
      content: [
        "Vendor section: select vendor, edit details (read-only when Posted). Invoice grid: spreadsheet-style with invoice #, amounts, tax, total, status. Use keyboard navigation and right-click for Copy/Paste.",
        "Actions: Save (Ctrl/Cmd+S), Save and Post (Ctrl/Cmd+P), Repost (rejected entries), Request to edit (posted entries when feature enabled).",
      ],
    },
    {
      section: "4. Invoices View",
      content:
        "View modes: Default (grid) or List. Filters: Status, Cheque, Date range. Export PDF. Select mailable invoices and send to vendors.",
    },
    {
      section: "5. Vendors View",
      content:
        "Search and filter by GRA/WHT expiry. Edit vendor details. View field history (clock icon). Export CSV/PDF. Refresh Data from BCPS.",
    },
    {
      section: "6. Tax View",
      content: "Search, filter by status. Add/Edit tax codes. Export CSV/PDF.",
    },
    {
      section: "7. Cheque Collection",
      content:
        "Search by TransRef, ChequePayee, Cheque No. Add collection via stepper. Export CSV/PDF.",
    },
    {
      section: "8. TransRef QR Code",
      content:
        "For approved entries: open entry, open TransRef QR modal, share Code and QR with vendor for collection.",
    },
    {
      section: "9. Keyboard Shortcuts",
      content: [
        "Ctrl/Cmd + K – command palette",
        "Ctrl/Cmd + S – save",
        "Ctrl/Cmd + P – post/repost",
        "? – shortcut reference",
      ],
    },
  ];
}

function getManagerSections(): Section[] {
  return [
    {
      section: "1. Introduction",
      content:
        "As a Manager, you review and approve or reject payables that Officers post. You do not create or post entries. You focus on reviewing posted entries, approving or rejecting them, and granting/denying edit requests.",
    },
    {
      section: "2. Home (Payables Dashboard)",
      content:
        "Tabs: Posted (awaiting approval) and Approved. Search and filter. Click an entry to review. Bulk approve when available.",
    },
    {
      section: "3. Entry View – Approve & Reject",
      content:
        "Review vendor and invoice grid. Use Approve to approve the entry. Use Reject and enter a reason; Officers can then edit and repost.",
    },
    {
      section: "4. Edit Requests",
      content:
        "When an Officer requests to edit a Posted entry: Grant or Deny. If granted, they can edit and repost.",
    },
    {
      section: "5. Vendors & Tax",
      content:
        "Same as Officers: search, filter, edit, view history, export CSV/PDF.",
    },
    {
      section: "6. Activity Logs",
      content:
        "Managers can view Activity Logs (Settings → Activity Logs). Filter by action, date range. Export to Excel/PDF.",
    },
    {
      section: "7. Pages Managers Cannot Access",
      content:
        "Invoices and Cheque Collection are Officer-only. Manage Users, Documents, etc. are Admin-only.",
    },
    {
      section: "8. Tips",
      content:
        "Use clear rejection reasons. Check GRA/WHT expiry and tax calculations before approving. Grant edit requests when appropriate.",
    },
  ];
}

export function buildGuidePdfDocDefinition(role: GuideRole): object {
  const title = role === "officer" ? "Officer User Guide" : "Manager User Guide";
  const sections =
    role === "officer" ? getOfficerSections() : getManagerSections();

  const tableBody = [
    [
      { text: "Section", style: "tableHeader", fillColor: "#1e293b" },
      { text: "Content", style: "tableHeader", fillColor: "#1e293b" },
    ],
    ...sections.map((s) => sectionRow(s.section, s.content)),
  ];

  return {
    pageSize: "A4" as const,
    pageMargins: [40, 40, 40, 60],
    defaultStyle: { fontSize: 10 },
    styles: {
      tableHeader: { bold: true, color: "#f1f5f9", fontSize: 10 },
    },
    content: [
      {
        text: "Accounts Payable Tracker",
        fontSize: 12,
        bold: true,
        margin: [0, 0, 0, 8] as [number, number, number, number],
      },
      {
        canvas: [
          {
            type: "line",
            x1: 0,
            y1: 0,
            x2: 515,
            y2: 0,
            lineWidth: 1,
            lineColor: "#94a3b8",
          },
        ],
        margin: [0, 0, 0, 16] as [number, number, number, number],
      },
      {
        text: title,
        fontSize: 16,
        bold: true,
        margin: [0, 0, 0, 16] as [number, number, number, number],
      },
      {
        table: {
          headerRows: 1,
          widths: ["auto", "*"],
          body: tableBody,
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
        },
      },
    ],
    footer: (currentPage: number, pageCount: number) => ({
      margin: [40, 8, 40, 0],
      text: `Page ${currentPage} of ${pageCount}`,
      fontSize: 9,
      alignment: "center" as const,
    }),
  };
}
