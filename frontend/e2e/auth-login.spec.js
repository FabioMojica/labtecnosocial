import { expect, test } from "@playwright/test";
import { buildFakeJwt } from "./helpers/session";

test.describe("Auth flow", () => {
  test.describe.configure({ timeout: 60000 });
  test("login exitoso redirige a /inicio", async ({ page }) => {
    const token = buildFakeJwt();
    await page.route("**/auth/refresh**", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          error: { code: "TOKEN_MISSING", message: "No session" },
        }),
      });
    });

    await page.route("**/auth/login**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            accessToken: token,
            user: {
              id: 1,
              firstName: "Admin",
              lastName: "QA",
              email: "admin@test.com",
              role: "admin",
            },
          },
        }),
      });
    });

    await page.goto("/login");

    await page.locator('input[type="email"]').fill("admin@test.com");
    await page.locator('input[type="password"]').fill("Ab1$xy78");

    const submitButton = page.getByRole("button", { name: /iniciar sesi/i });
    await expect(submitButton).toBeEnabled();

    await submitButton.click();
    await page.waitForFunction(() => sessionStorage.getItem("token"));
    await expect(page).toHaveURL(/\/inicio/);
  });
});
