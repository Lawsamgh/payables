import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("login flow completes successfully", async ({ page }) => {
    const email = process.env.E2E_TEST_EMAIL ?? "ampenelawrence5@gmail.com";
    const password = process.env.E2E_TEST_PASSWORD ?? "123456";

    await page.goto("/");

    await test.step("enter email and proceed", async () => {
      await page.fill('input[type="email"]', email);
      await page.getByRole("button", { name: "Proceed" }).click();
    });

    await test.step("enter password and sign in", async () => {
      await page.fill('input[type="password"]', password);
      await page.getByRole("button", { name: "Sign in" }).click();
    });

    await test.step("verify redirect to home", async () => {
      await expect(page).toHaveURL(/\/home/);
      await expect(page.getByRole("link", { name: "Payables" })).toBeVisible();
    });
  });
});
