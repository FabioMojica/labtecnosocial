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

describe("Fase B - Strategic + Operational Plan API", () => {
  const seedUsers = getSeedUsers();
  const testYear = 2031;
  let superAdminToken;
  let adminToken;
  let regularUserToken;
  let adminId;
  let projectId;
  let strategicPlanVersion;
  let createdRowId;

  beforeAll(async () => {
    await initFreshTestDb();
    const userRepo = await seedCoreUsers();
    const admin = await userRepo.findOneBy({ email: seedUsers.admin.email });

    adminId = admin.id;
    superAdminToken = await loginAndGetAccessToken(app, seedUsers.superAdmin.email, seedUsers.superAdmin.password);
    adminToken = await loginAndGetAccessToken(app, seedUsers.admin.email, seedUsers.admin.password);
    regularUserToken = await loginAndGetAccessToken(app, seedUsers.regularUser.email, seedUsers.regularUser.password);

    const projectRes = await request(app)
      .post("/api/projects/create")
      .set("Authorization", `Bearer ${superAdminToken}`)
      .send({
        name: "Proyecto Operativo QA Planes",
        description: "Proyecto para pruebas de planes",
        responsibles: [adminId],
        integrations: [],
      });

    expect(projectRes.statusCode).toBe(200);
    projectId = projectRes.body?.data?.id;
  });

  afterAll(async () => {
    await closeTestDb();
  });

  test("PUT /api/strategic-plans/:year crea plan estrategico", async () => {
    const payload = {
      mission: "Mision de prueba QA",
      plan_version: 0,
      objectives: [
        {
          id: "new-objective-1",
          objectiveTitle: "Objetivo de cobertura",
          indicators: [{ id: "new-ind-1", concept: "Indicador QA", amount: 10 }],
          programs: [
            {
              id: "new-prog-1",
              programDescription: "Programa QA",
              operationalProjects: [{ id: projectId }],
            },
          ],
        },
      ],
    };

    const res = await request(app)
      .put(`/api/strategic-plans/${testYear}`)
      .set("Authorization", `Bearer ${superAdminToken}`)
      .send(payload);

    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(res.body?.data?.year).toBe(testYear);
    expect(Array.isArray(res.body?.data?.objectives)).toBe(true);
    strategicPlanVersion = res.body?.data?.plan_version;
    expect(Number.isInteger(strategicPlanVersion)).toBe(true);
  });

  test("GET /api/strategic-plans/:year permite lectura para usuario", async () => {
    const res = await request(app)
      .get(`/api/strategic-plans/${testYear}`)
      .set("Authorization", `Bearer ${regularUserToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(res.body?.data?.year).toBe(testYear);
  });

  test("PUT /api/strategic-plans/:year rechaza version desactualizada", async () => {
    const res = await request(app)
      .put(`/api/strategic-plans/${testYear}`)
      .set("Authorization", `Bearer ${superAdminToken}`)
      .send({
        mission: "Mision stale",
        plan_version: strategicPlanVersion - 1,
        objectives: [],
      });

    expect(res.statusCode).toBe(409);
    expect(res.body?.success).toBe(false);
  });

  test("GET /api/operational-plans/:id retorna estado inicial", async () => {
    const res = await request(app)
      .get(`/api/operational-plans/${projectId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(Array.isArray(res.body?.data?.rows)).toBe(true);
    expect(res.body?.data?.operationalPlan_version).toBe(0);
  });

  test("GET /api/operational-plans/:id rechaza id invalido", async () => {
    const res = await request(app)
      .get(`/api/operational-plans/invalid-id`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body?.success).toBe(false);
  });

  test("POST /api/operational-plans/updateOperationalPlan/:id guarda filas y versiona", async () => {
    const res = await request(app)
      .post(`/api/operational-plans/updateOperationalPlan/${projectId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        operationalPlan_version: 0,
        create: [
          {
            objective: "Objetivo operativo 1",
            indicator_amount: 5,
            indicator_concept: "Entregables",
            team: ["Equipo QA"],
            resources: ["Laptop"],
            budget_amount: 1000,
            budget_description: "Presupuesto base",
            period_start: "2026-01-01T00:00:00.000Z",
            period_end: "2026-01-31T23:59:59.000Z",
          },
        ],
        update: [],
        delete: [],
      });

    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(res.body?.data?.operationalPlan_version).toBe(1);
    expect(Array.isArray(res.body?.data?.savedRows)).toBe(true);
    expect(res.body.data.savedRows.length).toBe(1);
    createdRowId = res.body.data.savedRows[0].id;
  });

  test("POST /api/operational-plans/updateOperationalPlan/:id rechaza version stale", async () => {
    const res = await request(app)
      .post(`/api/operational-plans/updateOperationalPlan/${projectId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        operationalPlan_version: 0,
        create: [],
        update: [],
        delete: [],
      });

    expect(res.statusCode).toBe(409);
    expect(res.body?.success).toBe(false);
  });

  test("POST /api/operational-plans/updateOperationalPlan/:id rechaza id invalido", async () => {
    const res = await request(app)
      .post(`/api/operational-plans/updateOperationalPlan/invalid-id`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        operationalPlan_version: 0,
        create: [],
        update: [],
        delete: [],
      });

    expect(res.statusCode).toBe(400);
    expect(res.body?.success).toBe(false);
  });

  test("GET /api/operational-plans/:id permite lectura a usuario no asignado? no, retorna 403", async () => {
    const res = await request(app)
      .get(`/api/operational-plans/${projectId}`)
      .set("Authorization", `Bearer ${regularUserToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body?.success).toBe(false);
  });

  test("DELETE /api/operational-plans/deleteOperationalPlan/:id rechaza usuario sin permisos", async () => {
    const res = await request(app)
      .delete(`/api/operational-plans/deleteOperationalPlan/${projectId}`)
      .set("Authorization", `Bearer ${regularUserToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body?.success).toBe(false);
  });

  test("DELETE /api/operational-plans/deleteOperationalPlan/:id elimina plan operativo", async () => {
    expect(createdRowId).toBeTruthy();

    const res = await request(app)
      .delete(`/api/operational-plans/deleteOperationalPlan/${projectId}`)
      .set("Authorization", `Bearer ${superAdminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
  });

  test("DELETE /api/operational-plans/deleteOperationalPlan/:id sin plan devuelve 404", async () => {
    const res = await request(app)
      .delete(`/api/operational-plans/deleteOperationalPlan/${projectId}`)
      .set("Authorization", `Bearer ${superAdminToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body?.success).toBe(false);
  });

  test("DELETE /api/strategic-plans/deleteStrategicPlan/:year elimina plan estrategico", async () => {
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
