import crypto from "crypto";
import request from "supertest";
import app from "../../src/app.js";
import {
  closeTestDb,
  getSeedUsers,
  initFreshTestDb,
  loginAndGetAccessToken,
  seedCoreUsers,
} from "../helpers/testHarness.js";

const createReportPayload = (title = "Reporte QA Extended") => {
  const elementId = crypto.randomUUID();
  return {
    title,
    elements: {
      [elementId]: {
        id: elementId,
        type: "text",
        content: "<p>Contenido base</p>",
      },
    },
    elementsOrder: [elementId],
  };
};

describe("Reports API - casos extendidos", () => {
  const seedUsers = getSeedUsers();
  let adminToken;
  let userToken;
  let reportId;

  beforeAll(async () => {
    await initFreshTestDb();
    await seedCoreUsers();

    adminToken = await loginAndGetAccessToken(app, seedUsers.admin.email, seedUsers.admin.password);
    userToken = await loginAndGetAccessToken(app, seedUsers.regularUser.email, seedUsers.regularUser.password);
  });

  afterAll(async () => {
    await closeTestDb();
  });

  test("POST /api/reports/createReport requiere autenticacion", async () => {
    const payload = createReportPayload();
    const res = await request(app).post("/api/reports/createReport").field("report", JSON.stringify(payload));
    expect(res.statusCode).toBe(403);
    expect(res.body?.success).toBe(false);
  });

  test("POST /api/reports/createReport valida payload (title requerido)", async () => {
    const payload = createReportPayload("");
    const res = await request(app)
      .post("/api/reports/createReport")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("report", JSON.stringify(payload));

    expect(res.statusCode).toBe(400);
    expect(res.body?.success).toBe(false);
    expect(res.body?.error?.code).toBe("VALIDATION_ERROR");
  });

  test("POST /api/reports/createReport crea reporte base para pruebas", async () => {
    const payload = createReportPayload("Reporte para permisos");
    const res = await request(app)
      .post("/api/reports/createReport")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("report", JSON.stringify(payload));

    expect(res.statusCode).toBe(201);
    expect(res.body?.success).toBe(true);
    reportId = res.body?.data?.id;
    expect(reportId).toBeTruthy();
  });

  test("GET /api/reports/:id bloquea a rol user", async () => {
    const res = await request(app)
      .get(`/api/reports/${reportId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body?.success).toBe(false);
    expect(res.body?.error?.code).toBe("USER_UNAUTHORIZED");
  });

  test("PUT /api/reports/:id exige report_version", async () => {
    const payload = {
      ...createReportPayload("Reporte editado sin version"),
    };
    const res = await request(app)
      .put(`/api/reports/${reportId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .field("report", JSON.stringify(payload));

    expect(res.statusCode).toBe(400);
    expect(res.body?.success).toBe(false);
    expect(res.body?.error?.code).toBe("VALIDATION_ERROR");
  });

  test("PUT /api/reports/:id retorna 404 para reporte inexistente", async () => {
    const payload = {
      ...createReportPayload("Inexistente"),
      report_version: 1,
    };
    const res = await request(app)
      .put("/api/reports/999999")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("report", JSON.stringify(payload));

    expect(res.statusCode).toBe(404);
    expect(res.body?.success).toBe(false);
    expect(res.body?.error?.code).toBe("RESOURCE_NOT_FOUND");
  });

  test("GET /api/reports devuelve listado ordenado por id descendente", async () => {
    const extraPayload = createReportPayload("Reporte extra");
    await request(app)
      .post("/api/reports/createReport")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("report", JSON.stringify(extraPayload));

    const res = await request(app)
      .get("/api/reports")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body?.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    const [first, second] = res.body.data;
    expect(first.id).toBeGreaterThan(second.id);
  });

  test("DELETE /api/reports/:id retorna 404 cuando reporte no existe", async () => {
    const res = await request(app)
      .delete("/api/reports/999999")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body?.success).toBe(false);
    expect(res.body?.error?.code).toBe("RESOURCE_NOT_FOUND");
  });
});
