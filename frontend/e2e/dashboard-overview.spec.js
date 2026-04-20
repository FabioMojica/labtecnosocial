import { expect, test } from "@playwright/test";
import { adminUser, buildFakeJwt } from "./helpers/session";

test.describe("Dashboard overview integrations ranking", () => {
  test.describe.configure({ timeout: 60000 });
  test("renderiza ranking de alcance y commits", async ({ page }) => {
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

    await expect(page.getByText("Ranking de proyectos con integraciones")).toBeVisible();
    await expect(page.getByText("Alcance en redes")).toBeVisible();
    await expect(page.getByText("Ranking de commits")).toBeVisible();
  });
});
