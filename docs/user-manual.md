# Finance Payables Tracker — User Manual

## Signing In

### Step 1: Enter your email

1. Open the application in your browser.
2. Enter your email address in the email field.
3. Click **Proceed**.

![Login — Email step](screenshots/01-login-email.png)

### Step 2: Enter your password

1. Enter your password in the password field.
2. Click **Sign in**.

![Login — Password step](screenshots/02-login-password.png)

### After signing in

You will be redirected to the **Home** (Payables) view.

![Home view](screenshots/03-home.png)

---

## Main Navigation

Use the sidebar on the left to navigate between sections:

- **Payables** — Home dashboard
- **New entry** — Create a new payable entry (Manager/Admin only)
- **Invoices** — View and manage invoices (Manager/Admin only)
- **Cheque collection** — Collect cheques (if enabled)
- **Vendors** — Manage vendors (if enabled)
- **Tax** — Tax view (if enabled)
- **Settings** — App settings

---

## Settings

Access account and app settings from the sidebar.

![Settings view](screenshots/04-settings.png)

---

## Vendors

View and manage vendors (when enabled for your organization).

![Vendors view](screenshots/05-vendors.png)

---

## Tax

View tax-related information (when enabled).

![Tax view](screenshots/06-tax.png)

---

## Generating Screenshots

To regenerate the screenshots used in this manual, run:

```bash
npm run test:e2e:docs
```

Ensure the dev server is running and FileMaker is accessible before running.
