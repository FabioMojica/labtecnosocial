import { expect, test } from "@playwright/test";
import { adminUser, buildFakeJwt } from "./helpers/session";

test.describe("Reports module", () => {
  test("lista de reportes carga correctamente", async ({ page }) => {
    const token = buildFakeJwt();

    await page.route("**/auth/refresh", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { token, user: adminUser },
        }),
      });
    });

    await page.route("**/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { user: adminUser },
        }),
      });
    });

    await page.route("**/reports", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: 10,
              title: "Reporte mensual",
              report_version: 3,
              created_at: "2026-04-01T10:00:00.000Z",
              updated_at: "2026-04-02T10:00:00.000Z",
            },
          ],
        }),
      });
    });

    const refreshResponse = page.waitForResponse("**/auth/refresh");
    const reportsResponse = page.waitForResponse("**/reports");
    await page.goto("/reportes");
    await refreshResponse;
    await reportsResponse;

    await expect(page.getByText("Lista de reportes")).toBeVisible();
    await expect(page.getByText("Reporte mensual")).toBeVisible();
  });
});
