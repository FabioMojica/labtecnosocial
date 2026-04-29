import request from "supertest";
import axios from "axios";
import app from "../../src/app.js";
import {
  closeTestDb,
  getSeedUsers,
  initFreshTestDb,
  loginAndGetAccessToken,
  seedCoreUsers,
} from "../helpers/testHarness.js";

describe("KPI Dashboard module - backend integration", () => {
  const seedUsers = getSeedUsers();
  let adminToken;
  let userToken;
  let axiosGetSpy;

  beforeAll(async () => {
    await initFreshTestDb();
    await seedCoreUsers();

    adminToken = await loginAndGetAccessToken(
      app,
      seedUsers.admin.email,
      seedUsers.admin.password
    );
    userToken = await loginAndGetAccessToken(
      app,
      seedUsers.regularUser.email,
      seedUsers.regularUser.password
    );
  });

  beforeEach(() => {
    axiosGetSpy = jest.spyOn(axios, "get");
  });

  afterEach(() => {
    axiosGetSpy.mockRestore();
  });

  afterAll(async () => {
    await closeTestDb();
  });

  test("GET /api/apis/github/repos retorna repositorios normalizados", async () => {
    axiosGetSpy.mockResolvedValueOnce({
      data: [
        {
          id: 10,
          name: "repo-kpi",
          full_name: "lab-tecnosocial/repo-kpi",
          owner: { avatar_url: "https://avatars/repo.png" },
        },
      ],
    });

    const res = await request(app)
      .get("/api/apis/github/repos")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(res.body?.data?.[0]).toMatchObject({
      id: "10",
      name: "repo-kpi",
      url: "https://github.com/lab-tecnosocial/repo-kpi",
    });
  });

  test("GET /api/apis/github/:repo/branches retorna ramas simplificadas", async () => {
    axiosGetSpy.mockResolvedValueOnce({
      data: [
        { name: "main", protected: true },
        { name: "develop", protected: false },
      ],
    });

    const res = await request(app)
      .get("/api/apis/github/repo-kpi/branches?owner=lab-tecnosocial")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(res.body?.data).toEqual([
      { name: "main", protected: true },
      { name: "develop", protected: false },
    ]);
  });

  test("GET /api/apis/github/:repo/branches retorna 404 cuando no existe", async () => {
    axiosGetSpy.mockRejectedValueOnce({
      response: { status: 404, data: { message: "Not Found" } },
    });

    const res = await request(app)
      .get("/api/apis/github/repo-inexistente/branches?owner=lab-tecnosocial")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body?.success).toBe(false);
    expect(String(res.body?.error?.message || "")).toMatch(/Repositorio no encontrado/i);
  });

  test("GET /api/apis/github/:repo/github-stats valida rango invalido", async () => {
    const res = await request(app)
      .get("/api/apis/github/repo-kpi/github-stats?range=invalid-range&branch=main&owner=lab-tecnosocial")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body?.success).toBe(false);
    expect(String(res.body?.error?.message || "")).toMatch(/Rango de tiempo/i);
  });

  test("GET /api/apis/facebook/:pageId/insights retorna insights agregados", async () => {
    axiosGetSpy
      .mockResolvedValueOnce({
        data: {
          data: [{ id: "fb-1", access_token: "PAGE_ACCESS_TOKEN" }],
          paging: {},
        },
      })
      .mockResolvedValueOnce({
        data: {
          data: [{ name: "page_views_total", values: [{ value: 12, end_time: "2026-04-20T07:00:00+0000" }] }],
        },
      })
      .mockResolvedValueOnce({
        data: {
          data: [{ name: "page_media_view", values: [{ value: { is_from_ads: 0, value: 10 }, end_time: "2026-04-20T07:00:00+0000" }] }],
        },
      });

    const res = await request(app)
      .get("/api/apis/facebook/fb-1/insights?range=lastMonth")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(Array.isArray(res.body?.data)).toBe(true);
    expect(res.body?.data?.some((row) => row?.name === "page_views_total")).toBe(true);
  });

  test("GET /api/apis/instagram/:instagramId/insights procesa metricas daily y total_value", async () => {
    axiosGetSpy.mockImplementation(async (url, config = {}) => {
      const metric = config?.params?.metric;
      const metricType = config?.params?.metric_type;

      if (url.includes("/insights") && metric === "reach" && !metricType) {
        return {
          data: {
            data: [{ name: "reach", values: [{ value: 100, end_time: "2026-04-20T07:00:00+0000" }] }],
          },
        };
      }

      if (url.includes("/insights") && metricType === "total_value") {
        return {
          data: {
            data: [
              {
                name: metric,
                total_value: { value: 20 },
              },
            ],
          },
        };
      }

      throw new Error(`Unexpected axios call in test: ${url}`);
    });

    const res = await request(app)
      .get("/api/apis/instagram/ig-1/insights?range=lastMonth")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(Array.isArray(res.body?.data)).toBe(true);
    expect(res.body?.data?.some((row) => row?.name === "reach")).toBe(true);
    expect(res.body?.data?.some((row) => row?.name === "profile_views")).toBe(true);
  });

  test("GET /api/apis/instagram/:instagramId/overview permite acceso a rol user", async () => {
    axiosGetSpy.mockResolvedValueOnce({
      data: {
        id: "ig-1",
        username: "cuenta-test",
        profile_picture_url: "https://img/ig.jpg",
      },
    });

    const res = await request(app)
      .get("/api/apis/instagram/ig-1/overview")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(res.body?.data?.username).toBe("cuenta-test");
  });

  test("GET /api/apis/facebook/pages rechaza acceso sin token", async () => {
    const res = await request(app).get("/api/apis/facebook/pages");
    expect(res.statusCode).toBe(403);
    expect(res.body?.success).toBe(false);
  });
});
