import request from "supertest";
import app from "../../src/app.js";
import { AppDataSource } from "../../data-source.js";
import { StrategicPlan } from "../../src/entities/StrategicPlan.js";
import {
  closeTestDb,
  getSeedUsers,
  initFreshTestDb,
  loginAndGetAccessToken,
  seedCoreUsers,
} from "../helpers/testHarness.js";

describe("Fase B - Strategic Plan API", () => {
  const testYear = 2032;
  const seedUsers = getSeedUsers();
  let superAdminToken;
  let adminToken;
  let regularUserToken;
  let planVersion;

  beforeAll(async () => {
    await initFreshTestDb();
    await seedCoreUsers();

    superAdminToken = await loginAndGetAccessToken(
      app,
      seedUsers.superAdmin.email,
      seedUsers.superAdmin.password
    );
    adminToken = await loginAndGetAccessToken(
      app,
      seedUsers.admin.email,
      seedUsers.admin.password
    );
    regularUserToken = await loginAndGetAccessToken(
      app,
      seedUsers.regularUser.email,
      seedUsers.regularUser.password
    );
  });

  afterAll(async () => {
    await closeTestDb();
  });

  test("GET /api/strategic-plans lista anios", async () => {
    const res = await request(app)
      .get("/api/strategic-plans")
      .set("Authorization", `Bearer ${superAdminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(Array.isArray(res.body?.data)).toBe(true);
  });

  test("PUT /api/strategic-plans/:year crea plan estrategico", async () => {
    const res = await request(app)
      .put(`/api/strategic-plans/${testYear}`)
      .set("Authorization", `Bearer ${superAdminToken}`)
      .send({
        mission: "Mision QA estrategia",
        plan_version: 0,
        objectives: [],
      });

    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(res.body?.data?.year).toBe(testYear);
    expect(Number.isInteger(res.body?.data?.plan_version)).toBe(true);
    planVersion = res.body?.data?.plan_version;
  });

  test("GET /api/strategic-plans/:year permite lectura para user", async () => {
    const res = await request(app)
      .get(`/api/strategic-plans/${testYear}`)
      .set("Authorization", `Bearer ${regularUserToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(res.body?.data?.year).toBe(testYear);
  });

  test("PUT /api/strategic-plans/:year rechaza admin (sin permiso update)", async () => {
    const res = await request(app)
      .put(`/api/strategic-plans/${testYear}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        mission: "No autorizado",
        plan_version: planVersion,
        objectives: [],
      });

    expect(res.statusCode).toBe(403);
    expect(res.body?.success).toBe(false);
  });

  test("PUT /api/strategic-plans/:year rechaza version stale", async () => {
    const res = await request(app)
      .put(`/api/strategic-plans/${testYear}`)
      .set("Authorization", `Bearer ${superAdminToken}`)
      .send({
        mission: "Mision stale",
        plan_version: planVersion - 1,
        objectives: [],
      });

    expect(res.statusCode).toBe(409);
    expect(res.body?.success).toBe(false);
  });

  test("GET /api/strategic-plans/:year invalido retorna 400", async () => {
    const res = await request(app)
      .get("/api/strategic-plans/abc")
      .set("Authorization", `Bearer ${superAdminToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body?.success).toBe(false);
  });

  test("DELETE /api/strategic-plans/deleteStrategicPlan/:year rechaza admin", async () => {
    const res = await request(app)
      .delete(`/api/strategic-plans/deleteStrategicPlan/${testYear}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body?.success).toBe(false);
  });

  test("DELETE /api/strategic-plans/deleteStrategicPlan/:year elimina plan", async () => {
    const res = await request(app)
      .delete(`/api/strategic-plans/deleteStrategicPlan/${testYear}`)
      .set("Authorization", `Bearer ${superAdminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);

    const strategicPlanRepo = AppDataSource.getRepository(StrategicPlan);
    const deleted = await strategicPlanRepo.findOne({ where: { year: testYear } });
    expect(deleted).toBeNull();
  });
});

