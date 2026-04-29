import { expect, test } from "@playwright/test";
import { adminUser, buildFakeJwt } from "./helpers/session";

const mockAuth = async (page, token = buildFakeJwt()) => {
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
};

const reportDetailResponse = (overrides = {}) => ({
  success: true,
  data: {
    id: 20,
    title: "Reporte Base",
    report_version: 1,
    created_at: "2026-04-01T10:00:00.000Z",
    updated_at: "2026-04-02T10:00:00.000Z",
    data: {
      elements: {
        "11111111-1111-4111-8111-111111111111": {
          id: "11111111-1111-4111-8111-111111111111",
          type: "text",
          content: {
            content_html: "<p>Texto base</p>",
            content_delta: { ops: [{ insert: "Texto base\n" }] },
          },
          position: 0,
        },
      },
      elementsOrder: ["11111111-1111-4111-8111-111111111111"],
    },
    ...overrides,
  },
});

test.describe("Reports module", () => {
  test("lista de reportes carga correctamente", async ({ page }) => {
    await mockAuth(page);

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

  test("lista vacía muestra estado sin reportes y permite ir a crear", async ({ page }) => {
    await mockAuth(page);

    await page.route("**/reports", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: [] }),
      });
    });

    await page.goto("/reportes");
    await expect(page.getByText("Aún no tienes reportes registrados")).toBeVisible();
    await page.getByRole("button", { name: "Crear uno" }).click();
    await expect(page).toHaveURL(/\/reportes\/editor$/);
  });

  test("crear reporte desde editor (texto + guardar)", async ({ page }) => {
    await mockAuth(page);

    await page.route("**/reports/createReport", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            id: 77,
            title: "Reporte QA E2E",
            report_version: 1,
            created_at: "2026-04-01T10:00:00.000Z",
            updated_at: "2026-04-01T10:05:00.000Z",
            data: {
              elements: {
                "11111111-1111-4111-8111-111111111111": {
                  id: "11111111-1111-4111-8111-111111111111",
                  type: "text",
                  content: {
                    content_html: "<p>Nuevo texto...</p>",
                    content_delta: { ops: [{ insert: "Nuevo texto...\n" }] },
                  },
                  position: 0,
                },
              },
              elementsOrder: ["11111111-1111-4111-8111-111111111111"],
            },
          },
        }),
      });
    });

    const createResponse = page.waitForResponse("**/reports/createReport");
    await page.goto("/reportes/editor");

    await page.getByRole("button", { name: "Texto" }).click();
    await page.getByPlaceholder("Escribe un título para tu reporte").fill("Reporte QA E2E");

    const saveButton = page.getByRole("button", { name: "Guardar reporte" });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    await createResponse;
    await expect(page).toHaveURL(/\/reportes\/editor\/Reporte%20QA%20E2E$/);
  });

  test("actualizar reporte maneja conflicto de version (409)", async ({ page }) => {
    await mockAuth(page);

    await page.route("**/reports", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: [
              {
                id: 20,
                title: "Reporte Base",
                report_version: 1,
                created_at: "2026-04-01T10:00:00.000Z",
                updated_at: "2026-04-02T10:00:00.000Z",
              },
            ],
          }),
        });
        return;
      }
      await route.continue();
    });

    await page.route("**/reports/20", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(reportDetailResponse()),
        });
        return;
      }

      if (route.request().method() === "PUT") {
        await route.fulfill({
          status: 409,
          contentType: "application/json",
          body: JSON.stringify({
            success: false,
            error: {
              code: "VERSION_ERROR",
              message:
                "Error al actualizar el reporte: asegurate de estar trabajando sobre la ultima version del reporte refrescando la pagina.",
            },
          }),
        });
        return;
      }

      await route.continue();
    });

    await page.goto("/reportes");
    await page.getByText("Reporte Base").first().click();

    await expect(page.getByPlaceholder("Escribe un título para tu reporte")).toBeVisible();
    await page.getByPlaceholder("Escribe un título para tu reporte").fill("Reporte editado");

    const updateResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/reports/20") &&
        response.request().method() === "PUT",
    );
    await page.getByRole("button", { name: "Guardar reporte" }).click();
    await updateResponse;

    await expect(page.getByText("Error al actualizar el reporte")).toBeVisible();
  });

  test("eliminar reporte desde editor redirige a listado", async ({ page }) => {
    await mockAuth(page);

    await page.route("**/reports", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: [
              {
                id: 20,
                title: "Reporte Base",
                report_version: 1,
                created_at: "2026-04-01T10:00:00.000Z",
                updated_at: "2026-04-02T10:00:00.000Z",
              },
            ],
          }),
        });
        return;
      }
      await route.continue();
    });

    await page.route("**/reports/20", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(reportDetailResponse()),
        });
        return;
      }
      if (route.request().method() === "DELETE") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true, data: { id: 20 } }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto("/reportes");
    await page.getByText("Reporte Base").first().click();
    await expect(page.getByPlaceholder("Escribe un título para tu reporte")).toBeVisible();

    await page
      .locator("button")
      .filter({ has: page.locator('svg[data-testid="SummarizeRoundedIcon"]') })
      .first()
      .click();
    const deleteMenuItem = page
      .locator('[role="menuitem"]')
      .filter({ hasText: "Eliminar el reporte" })
      .first();
    await expect(deleteMenuItem).toBeVisible();
    await deleteMenuItem.click();

    await page.getByPlaceholder("Nombre del proyecto").fill("Reporte Base");
    const deleteResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/reports/20") &&
        response.request().method() === "DELETE",
    );
    await page.getByRole("button", { name: "Eliminar" }).click();
    await deleteResponse;

    await expect(page).toHaveURL(/\/reportes$/);
  });
});
