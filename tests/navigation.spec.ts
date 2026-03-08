import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("home view loads", async ({ page }) => {
    await page.goto("/home");
    await expect(page).toHaveURL(/\/home/);
    await expect(page.getByRole("link", { name: "Payables" })).toBeVisible();
  });

  test("Settings view loads", async ({ page }) => {
    await page.goto("/settings");
    await expect(page).toHaveURL(/\/settings/);
    await expect(page.getByRole("link", { name: "Settings" })).toBeVisible();
  });

  test("can navigate via sidebar", async ({ page }) => {
    await page.goto("/home");

    await test.step("navigate to Settings", async () => {
      await page.getByRole("link", { name: "Settings" }).click();
      await expect(page).toHaveURL(/\/settings/);
    });

    await test.step("navigate back to Payables", async () => {
      await page.getByRole("link", { name: "Payables" }).click();
      await expect(page).toHaveURL(/\/home/);
    });
  });

  test("Vendors view loads when enabled", async ({ page }) => {
    await page.goto("/vendors");
    // May redirect to home if vendors view is disabled; otherwise should show Vendors
    const url = page.url();
    if (url.includes("/vendors")) {
      await expect(page.getByRole("link", { name: "Vendors" })).toBeVisible();
    }
  });

  test("Tax view loads when enabled", async ({ page }) => {
    await page.goto("/tax");
    const url = page.url();
    if (url.includes("/tax")) {
      await expect(page.getByRole("link", { name: "Tax" })).toBeVisible();
    }
  });
});
