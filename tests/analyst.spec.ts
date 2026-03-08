/**
 * Analyst-style tests — validation, modals, and critical flows.
 * Runs with authenticated session.
 */
import { test, expect } from "@playwright/test";

test.describe("Form validation", () => {
  test("Settings Users: add user with empty email shows validation", async ({ page }) => {
    await page.goto("/settings/users");
    await expect(page).toHaveURL(/\/settings\/users/);

    const addBtn = page.getByRole("button", { name: /add user|add/i });
    if ((await addBtn.count()) === 0) return;
    await addBtn.click();

    await page.getByRole("button", { name: "Add User" }).click();
    await expect(page.getByRole("status").filter({ hasText: /email is required/i })).toBeVisible();
  });

  test("Reject modal requires reason", async ({ page }) => {
    await page.goto("/home");
    const rejectBtn = page.getByRole("button", { name: /reject/i }).first();
    if ((await rejectBtn.count()) === 0) return;
    await rejectBtn.click();

    const reasonModal = page.getByRole("textbox", { name: /reason/i });
    if ((await reasonModal.count()) === 0) return;

    await page.getByRole("button", { name: "Reject" }).click();
    await expect(page.getByRole("alert").filter({ hasText: /enter a reason/i })).toBeVisible();
  });
});

test.describe("Auth guard", () => {
  test("unauthenticated redirect to login", async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();
    await page.goto("/home");
    await expect(page).toHaveURL(/\/(\?.*)?$/);
    await expect(page.getByRole("button", { name: "Proceed" })).toBeVisible();
    await context.close();
  });
});

test.describe("Critical flows smoke", () => {
  test("Home loads with stats or empty state", async ({ page }) => {
    await page.goto("/home");
    await expect(page).toHaveURL(/\/home/);
    await expect(page.getByRole("link", { name: "Payables" })).toBeVisible();
  });

  test("Settings loads and shows sections", async ({ page }) => {
    await page.goto("/settings");
    await expect(page).toHaveURL(/\/settings/);
    await expect(page.getByRole("link", { name: "Settings" })).toBeVisible();
  });

  test("Command palette opens with shortcut", async ({ page }) => {
    await page.goto("/home");
    await page.keyboard.press("Meta+k");
    const palette = page.getByRole("dialog").filter({ hasText: /command|search|shortcut/i });
    await expect(palette).toBeVisible({ timeout: 2000 });
  });

  test("Keyboard shortcuts page loads", async ({ page }) => {
    await page.goto("/settings/shortcuts");
    await expect(page).toHaveURL(/\/settings\/shortcuts/);
    await expect(page.getByRole("heading", { name: /keyboard shortcuts/i })).toBeVisible();
  });
});
