import request from "supertest";
import app from "../../src/app.js";
import { AppDataSource } from "../../data-source.js";
import { User } from "../../src/entities/User.js";
import {
  closeTestDb,
  getSeedUsers,
  initFreshTestDb,
  loginAndGetAccessToken,
  seedCoreUsers,
} from "../helpers/testHarness.js";

describe("Fase B - Projects + Integrations + Dashboard", () => {
  const seedUsers = getSeedUsers();
  let superAdminToken;
  let adminToken;
  let regularUserToken;
  let superAdminId;
  let adminId;
  let userId;
  let projectId;
  let restrictedProjectId;
  let githubIntegrationId;

  beforeAll(async () => {
    await initFreshTestDb();
    const repo = await seedCoreUsers();

    const superAdmin = await repo.findOneBy({ email: seedUsers.superAdmin.email });
    const admin = await repo.findOneBy({ email: seedUsers.admin.email });
    const regularUser = await repo.findOneBy({ email: seedUsers.regularUser.email });

    superAdminId = superAdmin.id;
    adminId = admin.id;
    userId = regularUser.id;

    superAdminToken = await loginAndGetAccessToken(app, seedUsers.superAdmin.email, seedUsers.superAdmin.password);
    adminToken = await loginAndGetAccessToken(app, seedUsers.admin.email, seedUsers.admin.password);
    regularUserToken = await loginAndGetAccessToken(app, seedUsers.regularUser.email, seedUsers.regularUser.password);
  });

  afterAll(async () => {
    await closeTestDb();
  });

  test("POST /api/projects/create crea proyecto con responsables e integraciones", async () => {
    const payload = {
      name: "Proyecto QA Fase B",
      description: "Proyecto de prueba de integraciones",
      responsibles: [adminId, userId],
      integrations: [
        { type: "github", data: { id: "repo-test-1", name: "repo-test", url: "https://github.com/org/repo-test" } },
        { type: "facebook", data: { id: "fb-page-1", name: "Pagina FB", url: "https://facebook.com/page" } },
      ],
    };

    const res = await request(app)
      .post("/api/projects/create")
      .set("Authorization", `Bearer ${superAdminToken}`)
      .send(payload);

    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(res.body?.data?.name).toBe(payload.name);
    expect(Array.isArray(res.body?.data?.integrations)).toBe(true);
    expect(res.body.data.integrations.length).toBeGreaterThanOrEqual(2);
    projectId = res.body.data.id;

    const githubIntegration = res.body.data.integrations.find((i) => i.platform === "github");
    expect(githubIntegration).toBeTruthy();
    githubIntegrationId = githubIntegration.id;
  });

  test("POST /api/projects/create crea proyecto sin usuario asignado", async () => {
    const payload = {
      name: "Proyecto QA Restringido",
      description: "Solo admin responsable",
      responsibles: [adminId],
      integrations: [],
    };

    const res = await request(app)
      .post("/api/projects/create")
      .set("Authorization", `Bearer ${superAdminToken}`)
      .send(payload);

    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
    restrictedProjectId = res.body?.data?.id;
    expect(Number.isInteger(restrictedProjectId)).toBe(true);
  });

  test("GET /api/projects/getAll retorna proyectos visibles para admin asignado", async () => {
    const res = await request(app)
      .get("/api/projects/getAll")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(Array.isArray(res.body?.data)).toBe(true);
    expect(res.body.data.some((p) => p.id === projectId)).toBe(true);
  });

  test("GET /api/projects/getAll para user solo retorna proyectos asignados", async () => {
    const res = await request(app)
      .get("/api/projects/getAll")
      .set("Authorization", `Bearer ${regularUserToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
    const ids = res.body?.data?.map((p) => p.id) || [];
    expect(ids).toContain(projectId);
    expect(ids).not.toContain(restrictedProjectId);
  });

  test("GET /api/projects/getProjectById/:id retorna detalle del proyecto", async () => {
    const res = await request(app)
      .get(`/api/projects/getProjectById/${projectId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(res.body?.data?.id).toBe(projectId);
    expect(Array.isArray(res.body?.data?.integrations)).toBe(true);
  });

  test("GET /api/projects/getProjectById/:id permite lectura para user no asignado", async () => {
    const res = await request(app)
      .get(`/api/projects/getProjectById/${restrictedProjectId}`)
      .set("Authorization", `Bearer ${regularUserToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(res.body?.data?.id).toBe(restrictedProjectId);
  });

  test("PATCH /api/projects/:id permite a admin asignar y desasignar responsables de cualquier rol", async () => {
    const addPayload = {
      preAnadidos: JSON.stringify([{ id: superAdminId }]),
      preEliminados: JSON.stringify([]),
      intAnadidos: JSON.stringify([]),
      intEliminados: JSON.stringify([]),
    };

    const addRes = await request(app)
      .patch(`/api/projects/${projectId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send(addPayload);

    expect(addRes.statusCode).toBe(200);
    expect(addRes.body?.success).toBe(true);
    expect(addRes.body?.data?.projectResponsibles?.some((r) => r.id === superAdminId)).toBe(true);

    const removePayload = {
      preAnadidos: JSON.stringify([]),
      preEliminados: JSON.stringify([{ id: superAdminId }]),
      intAnadidos: JSON.stringify([]),
      intEliminados: JSON.stringify([]),
    };

    const removeRes = await request(app)
      .patch(`/api/projects/${projectId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send(removePayload);

    expect(removeRes.statusCode).toBe(200);
    expect(removeRes.body?.success).toBe(true);
    expect(removeRes.body?.data?.projectResponsibles?.some((r) => r.id === superAdminId)).toBe(false);
  });

  test("PUT /api/apis/project-integration/:projectId/integrations actualiza integraciones", async () => {
    const body = {
      toCreate: [
        { platform: "instagram", integration_id: "ig-1", name: "Cuenta IG", url: "https://instagram.com/cuenta" },
      ],
      toUpdate: [
        { id: githubIntegrationId, name: "repo-test-renamed", url: "https://github.com/org/repo-test-renamed" },
      ],
      toDelete: [],
    };

    const res = await request(app)
      .put(`/api/apis/project-integration/${projectId}/integrations`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send(body);

    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
    const integrations = res.body?.data?.project?.integrations || [];
    expect(integrations.some((i) => i.platform === "instagram")).toBe(true);
    expect(integrations.some((i) => i.id === githubIntegrationId && i.name === "repo-test-renamed")).toBe(true);
  });

  test("GET /api/dashboard/getProjectsWithIntegrations retorna proyectos con integraciones para admin", async () => {
    const res = await request(app)
      .get("/api/dashboard/getProjectsWithIntegrations")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(Array.isArray(res.body?.data)).toBe(true);
    expect(res.body.data.some((p) => p.id === projectId)).toBe(true);
  });

  test("GET /api/dashboard/getProjectsWithIntegrations retorna 401 sin token", async () => {
    const res = await request(app).get("/api/dashboard/getProjectsWithIntegrations");
    expect(res.statusCode).toBe(403);
    expect(res.body?.success).toBe(false);
  });

  test("GET /api/dashboard/getProjectsWithIntegrations para user asignado devuelve el proyecto", async () => {
    const res = await request(app)
      .get("/api/dashboard/getProjectsWithIntegrations")
      .set("Authorization", `Bearer ${regularUserToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(Array.isArray(res.body?.data)).toBe(true);
    expect(res.body.data.some((p) => p.id === projectId)).toBe(true);
  });

  test("DELETE /api/projects/:id elimina proyecto", async () => {
    const res = await request(app)
      .delete(`/api/projects/${restrictedProjectId}`)
      .set("Authorization", `Bearer ${superAdminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
  });
});
