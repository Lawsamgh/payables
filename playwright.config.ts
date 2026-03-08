import { defineConfig, devices } from "@playwright/test";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],

  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    viewport: { width: 1920, height: 1080 },
  },

  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
  },

  projects: [
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: "auth",
      testMatch: /auth\.spec\.ts|auth-validation\.spec\.ts|docs-screenshots\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
        headless: false,
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: "chromium",
      testIgnore: [/.*\.setup\.ts/, /auth\.spec\.ts/],
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
        headless: false,
        viewport: { width: 1920, height: 1080 },
        storageState: "tests/.auth/user.json",
      },
      dependencies: ["setup"],
    },
  ],
});
