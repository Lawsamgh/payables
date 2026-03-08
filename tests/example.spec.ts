import { test, expect } from "@playwright/test";

/**
 * Smoke test: runs with authenticated session (storageState).
 * Quick tour of the main app areas.
 */
test("authenticated user can access main views", async ({ page }) => {
  await page.goto("/home");

  await test.step("Home loads", async () => {
    await expect(page).toHaveURL(/\/home/);
    await expect(page.getByRole("link", { name: "Payables" })).toBeVisible();
  });

  await test.step("Navigate to Settings and back", async () => {
    await page.getByRole("link", { name: "Settings" }).click();
    await expect(page).toHaveURL(/\/settings/);
    await page.getByRole("link", { name: "Payables" }).click();
    await expect(page).toHaveURL(/\/home/);
  });
});
