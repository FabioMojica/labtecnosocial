import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../src/app.js";
import {
  closeTestDb,
  getSeedUsers,
  initFreshTestDb,
  loginAndGetAccessToken,
  seedCoreUsers,
} from "../helpers/testHarness.js";
import { AppDataSource } from "../../data-source.js";
import { User } from "../../src/entities/User.js";

const SECRET = process.env.JWT_SECRET || "testsecret";

describe("Fase B - Auth API", () => {
  const seedUsers = getSeedUsers();

  beforeAll(async () => {
    await initFreshTestDb();
    await seedCoreUsers();
  });

  afterAll(async () => {
    await closeTestDb();
  });

  test("POST /api/auth/login retorna accessToken y user", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: seedUsers.admin.email,
        password: seedUsers.admin.password,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(typeof res.body?.data?.accessToken).toBe("string");
    expect(res.body?.data?.user?.email).toBe(seedUsers.admin.email);
  });

  test("POST /api/auth/login rechaza credenciales invalidas", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: seedUsers.admin.email,
        password: "incorrecta",
      });

    expect(res.statusCode).toBe(401);
    expect(res.body?.success).toBe(false);
  });

  test("POST /api/auth/login rechaza cuenta deshabilitada", async () => {
    const userRepo = AppDataSource.getRepository(User);
    await userRepo.update({ email: seedUsers.regularUser.email }, { state: "disabled" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: seedUsers.regularUser.email,
        password: seedUsers.regularUser.password,
      });

    expect(res.statusCode).toBe(403);
    expect(res.body?.success).toBe(false);

    await userRepo.update({ email: seedUsers.regularUser.email }, { state: "enabled" });
  });

  test("GET /api/auth/me con token valido retorna perfil", async () => {
    const token = await loginAndGetAccessToken(app, seedUsers.admin.email, seedUsers.admin.password);
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(res.body?.data?.user?.email).toBe(seedUsers.admin.email);
  });

  test("GET /api/auth/me con token invalido retorna 401", async () => {
    const badToken = jwt.sign({ id: 999, role: "admin", sessionVersion: 1 }, "wrong-secret");
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${badToken}`);

    expect(res.statusCode).toBe(401);
    expect(res.body?.success).toBe(false);
  });

  test("POST /api/auth/refresh requiere cookie refreshToken", async () => {
    const res = await request(app).post("/api/auth/refresh");
    expect(res.statusCode).toBe(401);
    expect(res.body?.success).toBe(false);
  });

  test("POST /api/auth/refresh con cookie valida retorna nuevo accessToken", async () => {
    const login = await request(app)
      .post("/api/auth/login")
      .send({
        email: seedUsers.superAdmin.email,
        password: seedUsers.superAdmin.password,
      });

    const setCookie = login.headers["set-cookie"];
    expect(Array.isArray(setCookie)).toBe(true);
    expect(setCookie.length).toBeGreaterThan(0);

    const refresh = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", setCookie);

    expect(refresh.statusCode).toBe(200);
    expect(refresh.body?.success).toBe(true);
    expect(typeof refresh.body?.data?.token).toBe("string");
  });

  test("POST /api/auth/logout limpia refresh token", async () => {
    const res = await request(app).post("/api/auth/logout");
    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
  });

  test("GET /api/auth/sumaryData/:id retorna resumen para super-admin", async () => {
    const token = await loginAndGetAccessToken(app, seedUsers.superAdmin.email, seedUsers.superAdmin.password);
    const superAdminRepo = AppDataSource.getRepository(User);
    const superAdmin = await superAdminRepo.findOneBy({ email: seedUsers.superAdmin.email });

    const res = await request(app)
      .get(`/api/auth/sumaryData/${superAdmin?.id ?? 1}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(Array.isArray(res.body?.data)).toBe(true);
  });

  test("POST /api/auth/refresh falla si el sessionVersion cambiÃ³", async () => {
    const login = await request(app)
      .post("/api/auth/login")
      .send({
        email: seedUsers.admin.email,
        password: seedUsers.admin.password,
      });

    const setCookie = login.headers["set-cookie"];
    expect(Array.isArray(setCookie)).toBe(true);

    const userRepo = AppDataSource.getRepository(User);
    const admin = await userRepo.findOneBy({ email: seedUsers.admin.email });
    await userRepo.update({ id: admin.id }, { session_version: (admin.session_version ?? 0) + 1 });

    const refresh = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", setCookie);

    expect(refresh.statusCode).toBe(401);
    expect(refresh.body?.success).toBe(false);
    expect(refresh.body?.error?.code).toBe("SESSION_EXPIRED");
  });
});
