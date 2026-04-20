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

const createReportPayload = (title = "Reporte QA Fase B") => {
  const elementId = crypto.randomUUID();
  return {
    title,
    elements: {
      [elementId]: {
        id: elementId,
        type: "text",
        content: "<p>Contenido de prueba</p>",
      },
    },
    elementsOrder: [elementId],
  };
};

describe("Fase B - Reports API", () => {
  const seedUsers = getSeedUsers();
  let adminToken;
  let regularUserToken;
  let createdReportId;

  beforeAll(async () => {
    await initFreshTestDb();
    await seedCoreUsers();

    adminToken = await loginAndGetAccessToken(app, seedUsers.admin.email, seedUsers.admin.password);
    regularUserToken = await loginAndGetAccessToken(app, seedUsers.regularUser.email, seedUsers.regularUser.password);
  });

  afterAll(async () => {
    await closeTestDb();
  });

  test("POST /api/reports/createReport crea reporte con payload valido", async () => {
    const payload = createReportPayload("Reporte Inicial");

    const res = await request(app)
      .post("/api/reports/createReport")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("report", JSON.stringify(payload));

    expect(res.statusCode).toBe(201);
    expect(res.body?.success).toBe(true);
    expect(res.body?.data?.title).toBe(payload.title);
    expect(res.body?.data?.report_version).toBe(1);
    expect(res.body?.data?.id).toBeTruthy();
    createdReportId = res.body.data.id;
  });

  test("GET /api/reports retorna listado para admin", async () => {
    const res = await request(app)
      .get("/api/reports")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(Array.isArray(res.body?.data)).toBe(true);
    expect(res.body.data.some((report) => report.id === createdReportId)).toBe(true);
  });

  test("GET /api/reports bloquea usuario sin permisos de reportes", async () => {
    const res = await request(app)
      .get("/api/reports")
      .set("Authorization", `Bearer ${regularUserToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body?.success).toBe(false);
  });

  test("GET /api/reports/:reportId recupera reporte por id", async () => {
    const res = await request(app)
      .get(`/api/reports/${createdReportId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(res.body?.data?.id).toBe(createdReportId);
    expect(res.body?.data?.title).toBe("Reporte Inicial");
  });

  test("PUT /api/reports/:reportId actualiza reporte e incrementa version", async () => {
    const payload = {
      ...createReportPayload("Reporte Actualizado"),
      report_version: 1,
    };

    const res = await request(app)
      .put(`/api/reports/${createdReportId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .field("report", JSON.stringify(payload));

    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(res.body?.data?.title).toBe(payload.title);
    expect(res.body?.data?.report_version).toBe(2);
  });

  test("PUT /api/reports/:reportId retorna 409 si llega una version antigua", async () => {
    const stalePayload = {
      ...createReportPayload("Reporte Con Version Vieja"),
      report_version: 1,
    };

    const res = await request(app)
      .put(`/api/reports/${createdReportId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .field("report", JSON.stringify(stalePayload));

    expect(res.statusCode).toBe(409);
    expect(res.body?.success).toBe(false);
    expect(res.body?.error?.code).toBe("VERSION_ERROR");
  });

  test("DELETE /api/reports/:reportId elimina reporte", async () => {
    const res = await request(app)
      .delete(`/api/reports/${createdReportId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
  });

  test("GET /api/reports/:reportId retorna 404 despues de eliminar", async () => {
    const res = await request(app)
      .get(`/api/reports/${createdReportId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body?.success).toBe(false);
  });
});
