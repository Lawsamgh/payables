/**
 * Auth validation tests — analyst checks for login error handling.
 */
import { test, expect } from "@playwright/test";

test.describe("Login validation", () => {
  test("empty email shows validation toast", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Proceed" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Enter your email" })).toBeVisible();
    await expect(page).toHaveURL(/\//);
  });

  test("invalid email format shows validation toast", async ({ page }) => {
    await page.goto("/");
    await page.fill('input[type="email"]', "notanemail");
    await page.getByRole("button", { name: "Proceed" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Enter a valid email address" })).toBeVisible();
    await expect(page).toHaveURL(/\//);
  });

  test("empty password shows validation toast", async ({ page }) => {
    const email = process.env.E2E_TEST_EMAIL ?? "ampenelawrence5@gmail.com";
    await page.goto("/");
    await page.fill('input[type="email"]', email);
    await page.getByRole("button", { name: "Proceed" }).click();
    await page.waitForSelector('input[type="password"]', { state: "visible" });
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Enter your password" })).toBeVisible();
    await expect(page).toHaveURL(/\//);
  });

  test("wrong password shows error toast and stays on login", async ({ page }) => {
    const email = process.env.E2E_TEST_EMAIL ?? "ampenelawrence5@gmail.com";
    await page.goto("/");
    await page.fill('input[type="email"]', email);
    await page.getByRole("button", { name: "Proceed" }).click();
    await page.fill('input[type="password"]', "wrongpassword123");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("status").filter({ hasText: /invalid|credentials|incorrect/i })).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/\//);
  });

  test("redirect query is respected after login", async ({ page }) => {
    const email = process.env.E2E_TEST_EMAIL ?? "ampenelawrence5@gmail.com";
    const password = process.env.E2E_TEST_PASSWORD ?? "123456";
    await page.goto("/?redirect=/settings");

    await page.fill('input[type="email"]', email);
    await page.getByRole("button", { name: "Proceed" }).click();
    await page.fill('input[type="password"]', password);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/settings/);
  });
});
