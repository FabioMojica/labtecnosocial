import request from 'supertest';
import app from '../../src/app.js';
import { AppDataSource } from '../../data-source.js';
import { User } from '../../src/entities/User.js';
import { createNewAdminUser, createNewSuperAdminUser, createNewUser, users } from '../fixtures/fixtures.js';

let superAdminToken;
let adminToken;
let userToken;

const loginAndGetToken = async (email, password) => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password });

  expect(res.statusCode).toBe(200);
  return res.body?.data?.accessToken;
};

beforeAll(async () => {
  await AppDataSource.initialize();
  await AppDataSource.dropDatabase();
  await AppDataSource.synchronize();

  const userRepo = AppDataSource.getRepository(User);
  await userRepo.save(await createNewSuperAdminUser());
  await userRepo.save(await createNewAdminUser());
  await userRepo.save(await createNewUser());

  superAdminToken = await loginAndGetToken(users.superAdmin.email, users.superAdmin.password);
  adminToken = await loginAndGetToken(users.admin.email, users.admin.password);
  userToken = await loginAndGetToken(users.regularUser.email, users.regularUser.password);
});

afterAll(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});

describe('Usuarios API - Fase A (alineado a rutas y contrato actuales)', () => {
  test('GET /api/users/getAllUsers debe responder con estructura success/data', async () => {
    const res = await request(app)
      .get('/api/users/getAllUsers')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(Array.isArray(res.body?.data)).toBe(true);
  });

  test('POST /api/users/createUser (admin) crea usuario con estado por defecto disabled si estado invalido', async () => {
    const payload = {
      firstName: 'Nuevo',
      lastName: 'Invitado',
      email: 'nuevo.invitado@test.com',
      password: 'Password123@',
      role: 'user',
      state: 'estado-invalido',
    };

    const res = await request(app)
      .post('/api/users/createUser')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(payload);

    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(res.body?.data?.email).toBe(payload.email);
    expect(res.body?.data?.state).toBe('disabled');
  });

  test('POST /api/users/createUser rechaza email duplicado', async () => {
    const payload = {
      firstName: 'Duplicado',
      lastName: 'Usuario',
      email: 'nuevo.invitado@test.com',
      password: 'Password123@',
      role: 'user',
    };

    const res = await request(app)
      .post('/api/users/createUser')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(payload);

    expect(res.statusCode).toBe(409);
    expect(res.body?.success).toBe(false);
    expect(res.body?.error?.code).toBe('VALIDATION_ERROR');
  });

  test('POST /api/users/createUser rechaza crear super-admin si quien crea es admin', async () => {
    const payload = {
      firstName: 'No',
      lastName: 'Permitido',
      email: 'no.superadmin@test.com',
      password: 'Password123@',
      role: 'super-admin',
      state: 'enabled',
    };

    const res = await request(app)
      .post('/api/users/createUser')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(payload);

    expect(res.statusCode).toBe(403);
    expect(res.body?.success).toBe(false);
  });

  test('POST /api/users/createUser rechaza si el token es de user sin permiso create', async () => {
    const payload = {
      firstName: 'Sin',
      lastName: 'Permiso',
      email: 'sin.permiso@test.com',
      password: 'Password123@',
      role: 'user',
    };

    const res = await request(app)
      .post('/api/users/createUser')
      .set('Authorization', `Bearer ${userToken}`)
      .send(payload);

    expect(res.statusCode).toBe(403);
    expect(res.body?.success).toBe(false);
    expect(res.body?.error?.code).toBe('USER_UNAUTHORIZED');
  });

  test('POST /api/users/createUser (super-admin) rechaza crear un segundo super-admin', async () => {
    const payload = {
      firstName: 'Otro',
      lastName: 'Super',
      email: 'segundo.superadmin@test.com',
      password: 'Password123@',
      role: 'super-admin',
      state: 'enabled',
    };

    const res = await request(app)
      .post('/api/users/createUser')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send(payload);

    expect(res.statusCode).toBe(403);
    expect(res.body?.success).toBe(false);
  });

  test('GET /api/users/getUserByEmail/:email devuelve usuario existente', async () => {
    const res = await request(app)
      .get(`/api/users/getUserByEmail/${encodeURIComponent(users.regularUser.email)}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(res.body?.data?.email).toBe(users.regularUser.email);
  });

  test('PATCH /api/users/updateUser/:originalEmail permite actualizar nombre (admin)', async () => {
    const res = await request(app)
      .patch(`/api/users/updateUser/${encodeURIComponent(users.regularUser.email)}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ firstName: 'UsuarioEditado' });

    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(res.body?.data?.firstName).toBe('UsuarioEditado');
  });

  test('PATCH /api/users/updateUser/:originalEmail rechaza email duplicado', async () => {
    const res = await request(app)
      .patch(`/api/users/updateUser/${encodeURIComponent(users.regularUser.email)}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: users.admin.email });

    expect(res.statusCode).toBe(400);
    expect(res.body?.success).toBe(false);
  });

  test('PATCH /api/users/updateUser/:originalEmail rechaza asignar super-admin si quien edita es admin', async () => {
    const res = await request(app)
      .patch(`/api/users/updateUser/${encodeURIComponent(users.regularUser.email)}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'super-admin' });

    expect(res.statusCode).toBe(403);
    expect(res.body?.success).toBe(false);
  });

  test('PATCH /api/users/updateUser/:originalEmail rechaza si user intenta editar a otro', async () => {
    const res = await request(app)
      .patch(`/api/users/updateUser/${encodeURIComponent(users.admin.email)}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ firstName: 'Hack' });

    expect(res.statusCode).toBe(403);
    expect(res.body?.success).toBe(false);
    expect(res.body?.error?.code).toBe('USER_UNAUTHORIZED');
  });

  test('PATCH /api/users/updateUser/:originalEmail rechaza si user intenta editar su propio perfil (campos no permitidos)', async () => {
    const res = await request(app)
      .patch(`/api/users/updateUser/${encodeURIComponent(users.regularUser.email)}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ firstName: 'NoPermitido' });

    expect(res.statusCode).toBe(403);
    expect(res.body?.success).toBe(false);
    expect(res.body?.error?.code).toBe('USER_UNAUTHORIZED');
  });

  test('DELETE /api/users/deleteUser/:email rechaza admin (sin permiso de middleware)', async () => {
    const res = await request(app)
      .delete(`/api/users/deleteUser/${encodeURIComponent('nuevo.invitado@test.com')}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ password: users.admin.password });

    expect(res.statusCode).toBe(403);
    expect(res.body?.success).toBe(false);
  });

  test('DELETE /api/users/deleteUser/:email rechaza eliminar a otro admin', async () => {
    const payload = {
      firstName: 'Admin',
      lastName: 'Secundario',
      email: 'admin.secundario@test.com',
      password: 'Admin2$1',
      role: 'admin',
      state: 'enabled',
    };

    await request(app)
      .post('/api/users/createUser')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send(payload);

    const res = await request(app)
      .delete(`/api/users/deleteUser/${encodeURIComponent(payload.email)}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ password: payload.password });

    expect(res.statusCode).toBe(403);
    expect(res.body?.success).toBe(false);
  });

  test('DELETE /api/users/deleteUser/:email rechaza eliminar la propia cuenta (admin)', async () => {
    const res = await request(app)
      .delete(`/api/users/deleteUser/${encodeURIComponent(users.admin.email)}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ password: users.admin.password });

    expect(res.statusCode).toBe(403);
    expect(res.body?.success).toBe(false);
  });

  test('DELETE /api/users/deleteUser/:email rechaza si la contraseña es incorrecta (super-admin)', async () => {
    const payload = {
      firstName: 'Usuario',
      lastName: 'ParaEliminar',
      email: 'usuario.eliminar@test.com',
      password: 'User2$1',
      role: 'user',
      state: 'enabled',
    };

    await request(app)
      .post('/api/users/createUser')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(payload);

    const res = await request(app)
      .delete(`/api/users/deleteUser/${encodeURIComponent(payload.email)}`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ password: 'PasswordIncorrecta' });

    expect(res.statusCode).toBe(401);
    expect(res.body?.success).toBe(false);
  });

  test('DELETE /api/users/deleteUser/:email permite eliminar usuario con super-admin', async () => {
    const res = await request(app)
      .delete(`/api/users/deleteUser/${encodeURIComponent('nuevo.invitado@test.com')}`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ password: users.superAdmin.password });

    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
  });
});
