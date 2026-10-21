import { defineConfig, devices } from "@playwright/test";

// Smoke tests run against the deployed web build by default. Point E2E_BASE_URL
// at `npm run web` (http://localhost:8081) to test local changes.
const baseURL = process.env.E2E_BASE_URL ?? "https://app.warsh.app";

export default defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  retries: 1,
  reporter: [["list"], ["html", { open: "never", outputFolder: "e2e-report" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
