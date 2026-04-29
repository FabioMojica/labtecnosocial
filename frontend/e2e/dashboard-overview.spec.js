import { expect, test } from "@playwright/test";
import { adminUser, buildFakeJwt } from "./helpers/session";

const buildRoleJwt = (role = "admin", id = 1) => {
  const encode = (obj) => Buffer.from(JSON.stringify(obj)).toString("base64url");
  const expSeconds = Math.floor(Date.now() / 1000) + 60 * 60 * 2;
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode({
    id,
    role,
    exp: expSeconds,
  })}.signature`;
};

const setupSessionAndAuthRoutes = async (page, { token, user }) => {
  await page.addInitScript(({ tokenValue, userValue }) => {
    sessionStorage.setItem("token", tokenValue);
    sessionStorage.setItem("user", JSON.stringify(userValue));
  }, { tokenValue: token, userValue: user });

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

  await page.route("**/auth/me**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: { user },
      }),
    });
  });
};

test.describe("Dashboard overview integrations ranking", () => {
  test.describe.configure({ timeout: 60000 });
  test("renderiza ranking de alcance y commits", async ({ page }) => {
    const token = buildFakeJwt();
    await setupSessionAndAuthRoutes(page, { token, user: adminUser });

    await page.route("**/dashboard/getProjectsWithIntegrations**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: 1,
              name: "Simi",
              integrations: [
                { platform: "facebook", integration_id: "fb1", name: "FB Simi" },
                { platform: "instagram", integration_id: "ig1", name: "IG Simi" },
                { platform: "github", integration_id: "gh1", name: "repo-simi", url: "https://github.com/lab/repo-simi" },
              ],
            },
          ],
        }),
      });
    });

    await page.route("**/projects/getAll**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [{ id: 1, name: "Simi" }],
        }),
      });
    });

    await page.route("**/apis/facebook/*/insights**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [{ name: "page_media_view", values: [{ value: 410 }] }],
        }),
      });
    });

    await page.route("**/apis/instagram/*/insights**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [{ name: "reach", values: [{ value: 51 }] }],
        }),
      });
    });

    await page.route("**/apis/github/*/github-stats**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { commitsCount: 68 },
        }),
      });
    });

    await page.goto("/dashboard");

    await expect(page.getByRole("heading", { name: /Ranking de proyectos con integraciones/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Alcance en redes/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Ranking de commits/i })).toBeVisible();
  });

  test("usuario sin proyectos asignados ve mensaje especifico", async ({ page }) => {
    const user = {
      id: 99,
      firstName: "Usuario",
      lastName: "Sin Proyectos",
      email: "usuario@test.com",
      role: "user",
    };
    const token = buildRoleJwt("user", user.id);

    await setupSessionAndAuthRoutes(page, { token, user });

    await page.route("**/dashboard/getProjectsWithIntegrations**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: [] }),
      });
    });

    await page.route("**/projects/getAll**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: [] }),
      });
    });

    await page.goto("/dashboard");

    await expect(page.getByRole("heading", { name: /Aun no tienes proyectos asignados/i })).toBeVisible();
    await expect(page.getByRole("button", { name: "Volver al inicio" })).toBeVisible();
  });

  test("admin con proyectos asignados sin integraciones ve mensaje especifico", async ({ page }) => {
    const user = {
      id: 7,
      firstName: "Admin",
      lastName: "Sin Integraciones",
      email: "admin.sin.integraciones@test.com",
      role: "admin",
    };
    const token = buildRoleJwt("admin", user.id);

    await setupSessionAndAuthRoutes(page, { token, user });

    await page.route("**/dashboard/getProjectsWithIntegrations**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: [] }),
      });
    });

    await page.route("**/projects/getAll**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [{ id: 1, name: "Proyecto Asignado" }],
        }),
      });
    });

    await page.goto("/dashboard");

    await expect(page.getByRole("heading", { name: /Ninguno de tus proyectos asignados esta integrado con APIs/i })).toBeVisible();
    await expect(page.getByRole("button", { name: "Volver al inicio" })).toBeVisible();
  });

  test("super admin sin integraciones pero con proyectos ve mensaje de crear integracion", async ({ page }) => {
    const user = {
      id: 1,
      firstName: "Super",
      lastName: "Admin",
      email: "superadmin@test.com",
      role: "super-admin",
    };
    const token = buildRoleJwt("super-admin", user.id);

    await setupSessionAndAuthRoutes(page, { token, user });

    await page.route("**/dashboard/getProjectsWithIntegrations**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: [] }),
      });
    });

    await page.route("**/projects/getAll**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [{ id: 11, name: "Proyecto Existente" }],
        }),
      });
    });

    await page.goto("/dashboard");

    await expect(page.getByRole("heading", { name: /No tienes ningun proyecto integrado con APIs/i })).toBeVisible();
    await expect(page.getByRole("button", { name: "Crear uno" })).toBeVisible();
  });
});
