import { expect, test } from "@playwright/test";
import { buildFakeJwt } from "./helpers/session";

const superAdminUser = {
  id: 1,
  firstName: "Super",
  lastName: "Admin",
  email: "super@test.com",
  role: "super-admin",
};

const regularUser = {
  id: 3,
  firstName: "User",
  lastName: "QA",
  email: "user@test.com",
  role: "user",
};

const strategicPlanPayload = {
  id: 900,
  year: 2026,
  plan_version: 1,
  mission: "Mision de prueba estrategica",
  objectives: [
    {
      id: 100,
      title: "Objetivo 1",
      indicators: [{ id: 200, concept: "Cobertura", amount: 10 }],
      programs: [
        {
          id: 300,
          description: "Programa A",
          operationalProjects: [{ id: 400, name: "Proyecto Alfa", description: "Desc A" }],
        },
      ],
    },
  ],
};

const mockAuth = async (page, user) => {
  const token =
    user.role === "super-admin"
      ? (() => {
          const encode = (obj) => Buffer.from(JSON.stringify(obj)).toString("base64url");
          const expSeconds = Math.floor(Date.now() / 1000) + 60 * 60 * 2;
          return `${encode({ alg: "HS256", typ: "JWT" })}.${encode({
            id: user.id,
            role: user.role,
            exp: expSeconds,
          })}.signature`;
        })()
      : buildFakeJwt();

  await page.route("**/auth/refresh**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: { token, user },
      }),
    });
  });
};

const mockStrategicEndpoints = async (page, year = 2026) => {
  await page.route("**/strategic-plans", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: [{ id: 900, year }],
      }),
    });
  });

  await page.route("**/strategic-plans/deleteStrategicPlan/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, data: null }),
    });
  });

  // Register the specific year route after the generic one so it takes precedence.
  await page.route(`**/strategic-plans/${year}**`, async (route) => {
    if (route.request().method() === "PUT") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { ...strategicPlanPayload, plan_version: 2 },
        }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: strategicPlanPayload,
      }),
    });
  });
};

test.describe("Strategic Planning module E2E", () => {
  test("usuario puede visualizar plan en modo documento y exportar menu", async ({ page }) => {
    await mockAuth(page, regularUser);
    await mockStrategicEndpoints(page, 2026);

    await page.goto("/planificacion-estrategica/2026", { waitUntil: "domcontentloaded" });

    await expect(page.getByText(/Planes Estrat/i)).toBeVisible();
    await expect(page.getByText(/Plan Estrat/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /Misi.n:/i })).toBeVisible();

    await page.getByRole("button", { name: /exportar/i }).click();
    await expect(page.getByRole("menuitem", { name: /Exportar en PDF/i })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: /Exportar en DOCX/i })).toBeVisible();
  });

  test("super-admin puede cambiar vista de columna a documento", async ({ page }) => {
    await mockAuth(page, superAdminUser);
    await mockStrategicEndpoints(page, 2026);

    await page.goto("/planificacion-estrategica/2026", { waitUntil: "domcontentloaded" });
    const viewSelect = page
      .locator("label")
      .filter({ hasText: /Seleccionar Vista/i })
      .locator("..")
      .locator("[role='combobox']")
      .first();
    await expect(viewSelect).toBeVisible();
    await viewSelect.click();
    await page.getByRole("option", { name: "Documento" }).click();

    await expect(page.getByText(/Plan Estrat/i)).toBeVisible();
  });

  test("super-admin puede eliminar plan estrategico confirmando el anio", async ({ page }) => {
    await mockAuth(page, superAdminUser);
    await mockStrategicEndpoints(page, 2026);

    await page.goto("/planificacion-estrategica/2026", { waitUntil: "domcontentloaded" });

    await page.locator("button:has(svg[data-testid='DeleteOutlineIcon'])").click();
    await expect(page.getByRole("button", { name: /Eliminar/i })).toBeDisabled();

    const digitInputs = page.locator("input[maxlength='1']");
    await digitInputs.nth(0).fill("2");
    await digitInputs.nth(1).fill("0");
    await digitInputs.nth(2).fill("2");
    await digitInputs.nth(3).fill("6");

    await expect(page.getByRole("button", { name: /Eliminar/i })).toBeEnabled();
    await page.getByRole("button", { name: /Eliminar/i }).click();

    await expect(page.getByText(/A.o sin plan estrat.gico registrado/i)).toBeVisible();
  });
});
