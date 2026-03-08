/**
 * Captures screenshots for user documentation.
 * Run: npx playwright test docs-screenshots.spec.ts
 * Screenshots are saved to docs/screenshots/
 */
import { test, expect } from "@playwright/test";
import path from "path";

const SCREENSHOT_DIR = "docs/screenshots";

test.describe("Documentation screenshots", () => {
  test("capture login and main views for user manual", async ({ page }) => {
    const email = process.env.E2E_TEST_EMAIL ?? "ampenelawrence5@gmail.com";
    const password = process.env.E2E_TEST_PASSWORD ?? "123456";

    // --- Login flow ---
    await page.goto("/");

    await test.step("Login: email step", async () => {
      await page.fill('input[type="email"]', email);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "01-login-email.png"),
        fullPage: true,
      });
      await page.getByRole("button", { name: "Proceed" }).click();
    });

    await test.step("Login: password step", async () => {
      await page.fill('input[type="password"]', password);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "02-login-password.png"),
        fullPage: true,
      });
      await page.getByRole("button", { name: "Sign in" }).click();
    });

    await test.step("Home view", async () => {
      await page.waitForURL(/\/home/);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "03-home.png"),
        fullPage: true,
      });
    });

    // --- Main views ---
    await test.step("Settings view", async () => {
      await page.getByRole("link", { name: "Settings" }).click();
      await expect(page).toHaveURL(/\/settings/);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "04-settings.png"),
        fullPage: true,
      });
    });

    await test.step("Vendors view (if visible)", async () => {
      const vendorsLink = page.getByRole("link", { name: "Vendors" });
      if ((await vendorsLink.count()) > 0) {
        await vendorsLink.click();
        await page.waitForURL(/\/vendors/);
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, "05-vendors.png"),
          fullPage: true,
        });
      }
    });

    await test.step("Tax view (if visible)", async () => {
      const taxLink = page.getByRole("link", { name: "Tax" });
      if ((await taxLink.count()) > 0) {
        await taxLink.click();
        await page.waitForURL(/\/tax/);
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, "06-tax.png"),
          fullPage: true,
        });
      }
    });

    await test.step("Back to Home", async () => {
      await page.getByRole("link", { name: "Payables" }).click();
      await expect(page).toHaveURL(/\/home/);
    });
  });
});
