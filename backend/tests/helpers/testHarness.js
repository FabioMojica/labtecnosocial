import request from "supertest";
import { AppDataSource } from "../../data-source.js";
import { User } from "../../src/entities/User.js";
import { createNewAdminUser, createNewSuperAdminUser, createNewUser, users } from "../fixtures/fixtures.js";

export const initFreshTestDb = async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  await AppDataSource.dropDatabase();
  await AppDataSource.synchronize();
};

export const closeTestDb = async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
};

export const seedCoreUsers = async () => {
  const userRepo = AppDataSource.getRepository(User);
  await userRepo.save(await createNewSuperAdminUser());
  await userRepo.save(await createNewAdminUser());
  await userRepo.save(await createNewUser());
  return userRepo;
};

export const loginAndGetAccessToken = async (app, email, password) => {
  const response = await request(app)
    .post("/api/auth/login")
    .send({ email, password });

  if (response.statusCode !== 200 || !response.body?.data?.accessToken) {
    throw new Error(`Login de test fallido para ${email}. status=${response.statusCode}`);
  }

  return response.body.data.accessToken;
};

export const getSeedUsers = () => users;

