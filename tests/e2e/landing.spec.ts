import { test, expect } from "@playwright/test";

test("landing page renders without horizontal scroll", async ({ page }) => {
  await page.goto("/");
  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  expect(hasOverflow).toBe(false);
});

test("landing page exposes a link to sign in", async ({ page }) => {
  await page.goto("/");
  const signInish = page.getByRole("link", { name: /sign in|log in|login/i }).first();
  await expect(signInish).toBeVisible();
});
