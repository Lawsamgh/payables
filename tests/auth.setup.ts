/**
 * Auth setup: logs in and saves storage state for authenticated tests.
 * Run once before other specs via Playwright's setup project.
 */
import { test as setup, expect } from "@playwright/test";

const authFile = "tests/.auth/user.json";

setup("authenticate", async ({ page }) => {
  const email = process.env.E2E_TEST_EMAIL ?? "ampenelawrence5@gmail.com";
  const password = process.env.E2E_TEST_PASSWORD ?? "123456";

  await page.goto("/");
  await page.fill('input[type="email"]', email);
  await page.getByRole("button", { name: "Proceed" }).click();
  await page.fill('input[type="password"]', password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await page.waitForURL(/\/home/);
  await expect(page.getByRole("link", { name: "Payables" })).toBeVisible();

  await page.context().storageState({ path: authFile });
});
