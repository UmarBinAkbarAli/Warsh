import { expect, type Page, test } from "@playwright/test";

// Credentials come from the environment, never the repo:
//   E2E_EMAIL / E2E_PASSWORD (use the staging or prod test user)
const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;

async function openLogin(page: Page) {
  await page.goto("/");
  await page.getByText("Continue with Email", { exact: true }).click();
  await expect(page.getByText("Welcome back")).toBeVisible();
}

test("signed-out visitor reaches the sign-in screen", async ({ page }) => {
  await openLogin(page);
  await expect(page.getByPlaceholder("Email")).toBeVisible();
  await expect(page.getByPlaceholder("Password")).toBeVisible();
});

test("API is reachable through the web origin", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.status()).toBe(200);
});

test.describe("signed in", () => {
  test.skip(!email || !password, "set E2E_EMAIL and E2E_PASSWORD");

  test("login lands on Learn and shows chapters", async ({ page }) => {
    await openLogin(page);
    await page.getByPlaceholder("Email").fill(email!);
    await page.getByPlaceholder("Password").fill(password!);
    await page.getByText("Sign In", { exact: true }).click();

    await expect(page.getByText(/chapter/i).first()).toBeVisible({ timeout: 20_000 });
  });
});
