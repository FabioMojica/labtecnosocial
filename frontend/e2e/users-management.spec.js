import { expect, test } from "@playwright/test";
import { buildFakeJwt } from "./helpers/session";

const buildUser = (overrides = {}) => ({
  id: 1,
  firstName: "Admin",
  lastName: "QA",
  email: "admin@test.com",
  role: "admin",
  state: "enabled",
  ...overrides,
});

const mockAuthRefresh = async (page, user) => {
  const token = buildFakeJwt();
  await page.route("**/auth/refresh", async (route) => {
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

test.describe("Users module E2E", () => {
  test("admin accede a /usuarios y ve lista", async ({ page }) => {
    await mockAuthRefresh(page, buildUser());

    await page.route("**/users/getAllUsers", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            buildUser(),
            buildUser({ id: 2, firstName: "Maria", lastName: "Perez", email: "maria@test.com" }),
          ],
        }),
      });
    });

    const usersResponse = page.waitForResponse("**/users/getAllUsers");
    await page.goto("/usuarios");
    await usersResponse;

    await expect(page.getByText("Lista de usuarios")).toBeVisible();
    await expect(page.getByText("maria@test.com")).toBeVisible();
  });

  test("creaciÃ³n de usuario con validaciones y redirecciÃ³n al perfil", async ({ page }) => {
    await mockAuthRefresh(page, buildUser());

    await page.route("**/users/createUser", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            id: 9,
            email: "nuevo@test.com",
            firstName: "Nuevo",
            lastName: "Usuario",
            role: "user",
            state: "enabled",
          },
        }),
      });
    });

    await page.route("**/users/getUserByEmail/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            id: 9,
            email: "nuevo@test.com",
            firstName: "Nuevo",
            lastName: "Usuario",
            role: "user",
            state: "enabled",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        }),
      });
    });

    await page.goto("/usuarios/crear");

    const createButton = page.getByRole("button", { name: /Crear usuario/i });
    await expect(createButton).toBeDisabled();

    await page.getByLabel(/Nombre/i).fill("Nuevo");
    await page.getByLabel(/Apellidos/i).fill("Usuario");
    await page.getByLabel(/Correo electr/i).fill("nuevo@test.com");
    await page.getByLabel(/Contrase/i).fill("Ab1$xy78");

    await expect(createButton).toBeEnabled();

    const createResponse = page.waitForResponse("**/users/createUser");
    await createButton.click();
    await createResponse;

    await expect(page).toHaveURL(/\/usuario\/nuevo%40test\.com/);
    await expect(page.getByText("Nuevo Usuario")).toBeVisible();
  });

  test("admin puede editar su propio perfil (botÃ³n visible)", async ({ page }) => {
    await mockAuthRefresh(page, buildUser());

    await page.route("**/users/getUserByEmail/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            id: 1,
            email: "admin@test.com",
            firstName: "Admin",
            lastName: "QA",
            role: "admin",
            state: "enabled",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        }),
      });
    });

    const ownResponse = page.waitForResponse("**/users/getUserByEmail/**");
    await page.goto("/usuario/admin%40test.com");
    await ownResponse;
    const editIconOwn = page.locator('[data-testid="EditIcon"]');
    await expect(editIconOwn).toHaveCount(1);
  });

  test("admin no puede editar otro admin (botÃ³n no visible)", async ({ page }) => {
    await mockAuthRefresh(page, buildUser());

    await page.route("**/users/getUserByEmail/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            id: 2,
            email: "otro.admin@test.com",
            firstName: "Otro",
            lastName: "Admin",
            role: "admin",
            state: "enabled",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        }),
      });
    });

    const otherResponse = page.waitForResponse("**/users/getUserByEmail/**");
    await page.goto("/usuario/otro.admin%40test.com");
    await otherResponse;
    const editIconOther = page.locator('[data-testid="EditIcon"]');
    await expect(editIconOther).toHaveCount(0);
  });

  test("eliminaciÃ³n de usuario con confirmaciÃ³n de contraseÃ±a (super-admin)", async ({ page }) => {
    await mockAuthRefresh(page, buildUser({ role: "super-admin", email: "super@test.com" }));

    await page.route("**/users/getUserByEmail/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            id: 3,
            email: "user.delete@test.com",
            firstName: "Para",
            lastName: "Eliminar",
            role: "user",
            state: "enabled",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        }),
      });
    });

    await page.route("**/users/deleteUser/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: {} }),
      });
    });

    await page.goto("/usuario/user.delete%40test.com");
    const tabs = page.locator('[role="tab"]');
    await expect(tabs).toHaveCount(2);
    await tabs.nth(1).click();

    await page.getByLabel(/Ingrese el email/i).fill("user.delete@test.com");
    await page.getByLabel(/Ingrese la contrase/i).fill("super1A@");

    const deleteResponse = page.waitForResponse("**/users/deleteUser/**");
    await page.getByRole("button", { name: /Eliminar/i }).click();
    await deleteResponse;

    await expect(page).toHaveURL(/\/usuarios/);
  });

  test("usuario sin rol admin no puede acceder a /usuarios", async ({ page }) => {
    await mockAuthRefresh(page, buildUser({ role: "user", email: "user@test.com" }));

    await page.goto("/usuarios");

    await expect(page).toHaveURL(/\/404/);
    await expect(page.getByText("404")).toBeVisible();
  });
});
