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
  let createdBudgetRequestId;

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
      budget_amount: "1500.75",
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
    projectId = res.body.data.id;
    expect(projectId).toBeTruthy();
    expect(Number(res.body?.data?.budget_amount)).toBe(1500.75);
    expect(Array.isArray(res.body?.data?.integrations)).toBe(true);
    expect(res.body.data.integrations.length).toBeGreaterThanOrEqual(2);

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
    expect(Number(res.body?.data?.budget_amount)).toBe(1500.75);
    expect(Array.isArray(res.body?.data?.integrations)).toBe(true);
  });

  test("GET /api/projects/getProjectById/:id permite lectura para user no asignado", async () => {
    const res = await request(app)
      .get(`/api/projects/getProjectById/${restrictedProjectId}`)
      .set("Authorization", `Bearer ${regularUserToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(res.body?.data?.id).toBe(restrictedProjectId);
    expect(res.body?.data).not.toHaveProperty("budget_amount");
  });

  test("POST /api/projects/create bloquea presupuesto para admin", async () => {
    const res = await request(app)
      .post("/api/projects/create")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Proyecto con presupuesto admin",
        description: "No deberia permitirlo",
        budget_amount: "900.00",
      });

    expect(res.statusCode).toBe(403);
    expect(res.body?.success).toBe(false);
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

  test("PATCH /api/projects/:id bloquea actualizacion de presupuesto para admin", async () => {
    const res = await request(app)
      .patch(`/api/projects/${projectId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ budget_amount: "2000.00" });

    expect(res.statusCode).toBe(403);
    expect(res.body?.success).toBe(false);
  });

  test("PATCH /api/projects/:id permite a super admin actualizar presupuesto", async () => {
    const res = await request(app)
      .patch(`/api/projects/${projectId}`)
      .set("Authorization", `Bearer ${superAdminToken}`)
      .send({ budget_amount: "3200.50" });

    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(Number(res.body?.data?.budget_amount)).toBe(3200.5);
  });

  test("POST /api/projects/:id/budget-requests permite a admin crear una solicitud dentro del presupuesto", async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/budget-requests`)
      .set("Authorization", `Bearer ${adminToken}`)
      .field("objective", "Comprar materiales para validaciones")
      .field(
        "items",
        JSON.stringify([
          { item_name: "Lápices", quantity: 10, unit_cost: 2.5 },
          { item_name: "Cuadernos", quantity: 5, unit_cost: 12 },
        ])
      );

    expect(res.statusCode).toBe(201);
    expect(res.body?.success).toBe(true);
    expect(res.body?.data?.status).toBe("pending");
    expect(Number(res.body?.data?.total_amount)).toBe(85);
    expect(Array.isArray(res.body?.data?.items)).toBe(true);
    expect(res.body?.data?.items).toHaveLength(2);
    createdBudgetRequestId = res.body?.data?.id;
    expect(Number.isInteger(createdBudgetRequestId)).toBe(true);
  });

  test("POST /api/projects/:id/budget-requests bloquea solicitudes que exceden el presupuesto", async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/budget-requests`)
      .set("Authorization", `Bearer ${adminToken}`)
      .field("objective", "Solicitud fuera de presupuesto")
      .field(
        "items",
        JSON.stringify([
          { item_name: "Equipo", quantity: 1, unit_cost: 5000 },
        ])
      );

    expect(res.statusCode).toBe(400);
    expect(res.body?.success).toBe(false);
    expect(res.body?.error?.message).toContain("excede el presupuesto");
  });

  test("GET /api/projects/:id/budget-requests retorna solo solicitudes propias para admin", async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/budget-requests`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(Array.isArray(res.body?.data?.requests)).toBe(true);
    expect(res.body?.data?.requests).toHaveLength(1);
    expect(res.body?.data?.requests[0]?.id).toBe(createdBudgetRequestId);
    expect(res.body?.data?.requests[0]).not.toHaveProperty("requested_by");
  });

  test("GET /api/projects/:id/budget-requests retorna todas las solicitudes para super admin", async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/budget-requests`)
      .set("Authorization", `Bearer ${superAdminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(Array.isArray(res.body?.data?.requests)).toBe(true);
    expect(res.body?.data?.requests.length).toBeGreaterThanOrEqual(1);
    expect(res.body?.data?.requests[0]?.requested_by?.email).toBe(seedUsers.admin.email);
  });

  test("GET /api/projects/:id/budget-requests bloquea acceso para user", async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/budget-requests`)
      .set("Authorization", `Bearer ${regularUserToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body?.success).toBe(false);
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
