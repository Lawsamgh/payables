# Accounts Payable Tracker

Vue 3 Accounts Payable tracking application with FileMaker Data API integration. Apple-inspired dark UI with glassmorphism, spreadsheet-style grid, and two-way sync with FileMaker.

## Features

- **Vendor details**: Toggle section with Vendor Name, ID, Payment Terms, Contact Email, Phone, Currency
- **Spreadsheet grid**: Invoice #, Vendor Name, Dates, Amount, Tax, Total, Status, Payment Date, Reference
- **Formulas**: `=SUM(Amount1:Amount5)`, `=A1+A2`, and basic arithmetic
- **Keyboard navigation**: Arrow keys, Tab, Enter; Enter on last row adds a new row
- **Context menu**: Right-click for Copy, Paste, Cut, Clear
- **Export**: Download as Excel-compatible CSV
- **FileMaker**: Optional connection for CRUD on Vendors and Payables layouts

## Setup

```bash
npm install
cp .env.example .env
# Edit .env and set VITE_FILEMAKER_BASE_URL if using FileMaker (e.g. https://your-server/fmi/data/v1/databases/YourDB)
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

## FileMaker (PGH_Item_Distribution)

- Database: **PGH_Item_Distribution**. Set `VITE_FILEMAKER_BASE_URL` to your Data API URL (e.g. `https://your-server/fmi/data/v1/databases/PGH_Item_Distribution`).
- **Payables_Main** layout: CreationTimestamp, VendorID, VendorName, VendorEmail, InvoiceNumber, TransRef.
- **Payables_Details** layout: CreationTimestamp, InvoiceNumber, Amount, Tax, Total.
- Each grid row is inserted as one **Payables_Main** record (vendor + invoice) and one **Payables_Details** record (amounts). VendorEmail is taken from the Vendor section if filled.
- Click **Connect** in the status bar, then **Save** to insert unsaved rows into FileMaker.

## Tech stack

- Vue 3 (Composition API, `<script setup>`)
- **TypeScript** (strict mode, typed stores/composables and components)
- Pinia, Axios, Vite, Tailwind CSS v4
- Fonts: Outfit (UI), JetBrains Mono (grid)

Run `npm run type-check` to verify types without building.
