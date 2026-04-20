import { expect, test } from "@playwright/test";
import { adminUser, buildFakeJwt } from "./helpers/session";

const mockAuth = async (page) => {
  const token = buildFakeJwt();
  await page.addInitScript(({ tokenValue, userValue }) => {
    sessionStorage.setItem("token", tokenValue);
    sessionStorage.setItem("user", JSON.stringify(userValue));
  }, { tokenValue: token, userValue: adminUser });

  await page.route("**/auth/refresh**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: { token, user: adminUser },
      }),
    });
  });

  await page.route("**/auth/me**", async (route) => {
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

const selectProjectFromModal = async (page, projectName) => {
  await page.getByRole("button", { name: /Seleccionar proyecto/i }).click();
  const modal = page.locator("div[role='presentation']").filter({ hasText: "Selecciona un proyecto" }).first();
  await expect(modal.getByText(projectName)).toBeVisible();
  await modal.getByRole("button", { name: projectName }).click();
};

test.describe("Projects + Operational Plan module", () => {
  test.describe.configure({ timeout: 60000 });
  test("lista proyectos en /proyectos", async ({ page }) => {
    await mockAuth(page);

    await page.route("**/projects/getAll**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: 1,
              name: "Proyecto QA",
              description: "Descripcion QA",
              projectResponsibles: [],
              integrations: [],
            },
          ],
        }),
      });
    });

    await page.goto("/proyectos");

    await expect(page.getByText("Proyecto QA")).toBeVisible();
  });

  test("planificacion operativa carga plan para proyecto seleccionado", async ({ page }) => {
    await mockAuth(page);

    await page.route("**/projects/getAll**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: 1,
              name: "Proyecto QA",
              description: "Descripcion QA",
              image_url: null,
              projectResponsibles: [],
              integrations: [],
            },
          ],
        }),
      });
    });

    await page.route("**/operational-plans/1**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            rows: [
              {
                id: 10,
                objective: "Objetivo QA",
                indicator_amount: "1",
                indicator_concept: "Indicador",
                team: [],
                resources: [],
                budget_amount: "0",
                budget_description: "",
                period_start: "2026-01-01T00:00:00.000Z",
                period_end: "2026-01-10T00:00:00.000Z",
              },
            ],
            operationalPlan_version: 1,
            operationalPlan_created_at: "2026-01-01T00:00:00.000Z",
            operationalPlan_updated_at: "2026-01-02T00:00:00.000Z",
          },
        }),
      });
    });

    await page.goto("/planificacion-operativa");
    await expect(page.getByRole("heading", { name: "Planificación Operativa", level: 4 })).toBeVisible();

    await Promise.all([
      page.waitForResponse((res) => res.url().includes("/operational-plans/") && res.status() === 200),
      selectProjectFromModal(page, "Proyecto QA"),
    ]);

    await expect(page.getByText("Plan Operativo Proyecto QA")).toBeVisible({ timeout: 15000 });
  });

  test("creacion de proyecto (form + preview)", async ({ page }) => {
    await mockAuth(page);

    await page.route("**/projects/create**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { id: 99, name: "Proyecto QA" },
        }),
      });
    });

    await page.route("**/projects/getProjectById/99**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            id: 99,
            name: "Proyecto QA",
            description: "Descripcion QA",
            image_url: null,
            projectResponsibles: [],
            integrations: [],
          },
        }),
      });
    });

    await page.goto("/proyectos/crear");

    await page.getByLabel(/Ingrese un nombre para el proyecto/i).fill("Proyecto QA");
    await page.getByLabel(/Ingrese una descripción para el proyecto/i).fill("Descripcion QA");
    await page.keyboard.press("Tab");

    await page.getByRole("tab", { name: /Crear Proyecto/i }).click();
    await page.getByRole("button", { name: /Crear proyecto/i }).click({ force: true });

    await expect(page).toHaveURL(/\/proyecto\//);
    await expect(page.getByText("Informaci\u00f3n del proyecto")).toBeVisible();
  });

  test("edicion de proyecto (info + guardar cambios)", async ({ page }) => {
    await page.setViewportSize({ width: 850, height: 700 });
    await mockAuth(page);

    await page.route("**/projects/getAll**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: 1,
              name: "Proyecto QA",
              description: "Descripcion QA",
              created_at: "2026-01-01T00:00:00.000Z",
              updated_at: "2026-01-02T00:00:00.000Z",
              projectResponsibles: [{ id: 1, firstName: "Admin", lastName: "QA", email: "admin@test.com", role: "admin", state: "enabled" }],
              integrations: [],
            },
          ],
        }),
      });
    });

    await page.route("**/projects/getProjectById/1**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            id: 1,
            name: "Proyecto QA",
            description: "Descripcion QA",
            image_url: null,
            projectResponsibles: [{ id: 1, firstName: "Admin", lastName: "QA", email: "admin@test.com", role: "admin", state: "enabled" }],
            integrations: [],
          },
        }),
      });
    });

    await page.route("**/users/getAllUsers**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            { id: 1, firstName: "Admin", lastName: "QA", email: "admin@test.com", role: "admin", state: "enabled" },
          ],
        }),
      });
    });

    await page.route("**/projects/1**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            id: 1,
            name: "Proyecto QA Editado",
            description: "Descripcion QA",
            image_url: null,
            projectResponsibles: [{ id: 1, firstName: "Admin", lastName: "QA", email: "admin@test.com", role: "admin", state: "enabled" }],
            integrations: [],
          },
        }),
      });
    });

    await page.goto("/proyectos");
    await page.getByText("Proyecto QA").first().click();

    await page.locator("button:has(svg[data-testid='EditIcon'])").click();
    await expect(page.getByText("Editar Proyecto")).toBeVisible();

    await page.getByRole("textbox").first().fill("Proyecto QA Editado");
    await page.getByRole("button", { name: /Guardar Cambios/i }).click();

    await expect(page.getByText("Proyecto actualizado exitosamente.")).toBeVisible();
  });

  test("plan operativo: guardar cambios en una fila", async ({ page }) => {
    await mockAuth(page);

    await page.route("**/projects/getAll**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            { id: 1, name: "Proyecto QA", description: "Descripcion QA", projectResponsibles: [], integrations: [] },
          ],
        }),
      });
    });

    await page.route("**/operational-plans/1**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            rows: [
              {
                id: 10,
                objective: "Objetivo inicial",
                indicator_amount: "1",
                indicator_concept: "Indicador",
                team: [],
                resources: [],
                budget_amount: "0",
                budget_description: "",
                period_start: "2026-01-01T00:00:00.000Z",
                period_end: "2026-01-10T00:00:00.000Z",
              },
            ],
            operationalPlan_version: 1,
            operationalPlan_created_at: "2026-01-01T00:00:00.000Z",
            operationalPlan_updated_at: "2026-01-02T00:00:00.000Z",
          },
        }),
      });
    });

    await page.route("**/operational-plans/updateOperationalPlan/1**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { savedRows: [] },
        }),
      });
    });

    await page.goto("/planificacion-operativa");
    await expect(page.getByRole("heading", { name: "Planificación Operativa", level: 4 })).toBeVisible();

    await Promise.all([
      page.waitForResponse((res) => res.url().includes("/operational-plans/") && res.status() === 200),
      selectProjectFromModal(page, "Proyecto QA"),
    ]);

    await expect(page.getByText("Plan Operativo Proyecto QA")).toBeVisible({ timeout: 15000 });

    await page.locator("button:has(svg[data-testid='VisibilityIcon']), button:has(svg[data-testid='EditIcon'])").first().click();
    await page.getByLabel(/Texto del Objetivo/i).fill("Objetivo actualizado");
    await page.getByRole("button", { name: /Guardar/i }).click();

    await page.getByRole("button", { name: /Guardar Plan/i }).click();
    await expect(page.getByText("Plan operativo guardado correctamente.")).toBeVisible();
  });

  test("plan operativo: exportacion PDF y Excel en solo lectura", async ({ page }) => {
    await page.addInitScript(() => {
      class FakeWorker {
        constructor() {
          this.onmessage = null;
          setTimeout(() => {
            this.onmessage?.({ data: { done: true, pdfBytes: new Uint8Array([1, 2, 3]) } });
          }, 50);
        }
        postMessage() {}
        terminate() {}
      }
      window.Worker = FakeWorker;
    });

    await mockAuth(page);

    await page.route("**/projects/getAll**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            { id: 1, name: "Proyecto QA", description: "Descripcion QA", projectResponsibles: [], integrations: [] },
          ],
        }),
      });
    });

    await page.route("**/operational-plans/1**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            rows: [
              {
                id: 10,
                objective: "Objetivo QA",
                indicator_amount: "1",
                indicator_concept: "Indicador",
                team: [],
                resources: [],
                budget_amount: "0",
                budget_description: "",
                period_start: "2026-01-01T00:00:00.000Z",
                period_end: "2026-01-10T00:00:00.000Z",
              },
            ],
            operationalPlan_version: 1,
            operationalPlan_created_at: "2026-01-01T00:00:00.000Z",
            operationalPlan_updated_at: "2026-01-02T00:00:00.000Z",
          },
        }),
      });
    });

    await page.goto("/planificacion-operativa");
    await expect(page.getByRole("heading", { name: "Planificación Operativa", level: 4 })).toBeVisible();

    await Promise.all([
      page.waitForResponse((res) => res.url().includes("/operational-plans/") && res.status() === 200),
      selectProjectFromModal(page, "Proyecto QA"),
    ]);

    await expect(page.getByText("Plan Operativo Proyecto QA")).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("combobox", { name: /Modo de vista/i })).toBeVisible({ timeout: 15000 });
    await page.getByRole("combobox", { name: /Modo de vista/i }).click();
    await page.getByRole("option", { name: /Solo lectura/i }).click();

    await page.getByRole("button", { name: /exportar/i }).click();
    await page.getByRole("menuitem", { name: /Exportar a Excel/i }).click();

    await page.getByRole("button", { name: /exportar/i }).click();
    await page.getByRole("menuitem", { name: /Exportar a PDF/i }).click();

    await expect(page.getByRole("heading", { name: "PDF generado" }).first()).toBeVisible();
  });
});
