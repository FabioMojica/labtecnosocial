import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../../src/app.js';
import { AppDataSource } from '../../data-source.js';
import { User } from '../../src/entities/User.js';
import { createNewAdminUser, createNewAdmin2User, createNewCoordinatorUser, users, createNewAdmin3User, createNewAdmin4User } from '../fixtures/fixtures.js';
const { admin, admin2, admin3, admin4, coordinator, coordinator2, disabledUser, deletedUser } = users;
import fs from 'fs';
import path from 'path';

let validCoordinatorToken;
let validNewCoordinatorToken;
let validAdminToken;
let validNewAdmin3Token;

beforeAll(async () => {
  await AppDataSource.initialize();
  await AppDataSource.dropDatabase();
  await AppDataSource.synchronize();
  const userRepo = AppDataSource.getRepository(User);
  const email = admin.email;
  const existingUser = await userRepo.findOneBy({ email });

  if (!existingUser) {
    const newAdmin = await createNewAdminUser();
    await userRepo.save(newAdmin);
  }

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: admin.email, password: `${admin.password}` });

  validAdminToken = loginRes.body.token;

  const existingCoordinator = await userRepo.findOneBy({ email: coordinator2.email });
  if (!existingCoordinator) {
    const newCoordinator = await createNewCoordinatorUser();
    await userRepo.save(newCoordinator);
  }

  const loginResp = await request(app)
    .post('/api/auth/login')
    .send({ email: coordinator2.email, password: `${coordinator2.password}` });

  validNewCoordinatorToken = loginResp.body.token;

  const existingAdmin3 = await userRepo.findOneBy({ email: admin3.email });
  if (!existingAdmin3) {
    const newAdmin = await createNewAdmin3User();
    await userRepo.save(newAdmin);
  }

  const loginR = await request(app)
    .post('/api/auth/login')
    .send({ email: admin3.email, password: `${admin3.password}` });

  validNewAdmin3Token = loginR.body.token;

  const existingAdmin4 = await userRepo.findOneBy({ email: admin4.email });
  if (!existingAdmin4) {
    const newAdmin = await createNewAdmin4User();
    await userRepo.save(newAdmin);
  }
});

afterAll(async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  if (AppDataSource.isInitialized) await AppDataSource.destroy();
});

// ------------------------------------------------------
// Módulo Usuarios - Creación de usuarios
// ------------------------------------------------------}
describe('Módulo Usuarios - Creación de usuarios', () => {
  // -------------------
  // Tests positivos
  // -------------------
  test('Debería permitir que un administrador cree un usuario coordinador POST /auth-users', async () => {
    const res = await request(app)
      .post('/api/auth-users')
      .set('Authorization', `Bearer ${validAdminToken}`)
      .send(coordinator);

    expect(res.statusCode).toBe(201);
    expect(res.body).toMatchObject({
      firstName: 'Juan',
      lastName: 'Perez',
      role: 'coordinator',
      email: 'juan.perez@test.com',
      image_url: null,
      state: 'habilitado',
    });
    expect(res.body).not.toHaveProperty('password');
  });

  test('Debería permitir crear un usuario con rol admin', async () => {
    const res = await request(app)
      .post('/api/auth-users')
      .set('Authorization', `Bearer ${validAdminToken}`)
      .send(admin2);

    expect(res.statusCode).toBe(201);
    expect(res.body).toMatchObject({
      firstName: 'Pedro',
      lastName: 'Blanco',
      role: 'admin',
      email: 'pedroadmin@gmail.com',
      image_url: null,
      state: 'habilitado',
    });
  });

  test('Debería crear un usuario sin state enviado (debe asignar "deshabilitado")', async () => {
    const userNoState = { ...coordinator, email: 'sinstate@test.com', state: undefined };
    const res = await request(app)
      .post('/api/auth-users')
      .set('Authorization', `Bearer ${validAdminToken}`)
      .send(userNoState);

    expect(res.statusCode).toBe(201);
    expect(res.body.state).toBe('deshabilitado');
  });

  test('Debería crear un usuario con estado inválido (debe asignar "deshabilitado")', async () => {
    const userInvalidState = { ...coordinator, email: 'invalidstate@test.com', state: 'otro' };
    const res = await request(app)
      .post('/api/auth-users')
      .set('Authorization', `Bearer ${validAdminToken}`)
      .send(userInvalidState);

    expect(res.statusCode).toBe(201);
    expect(res.body.state).toBe('deshabilitado');
  });

  test('Debería crear un usuario con estado inválido eliminado', async () => {
    const res = await request(app)
      .post('/api/auth-users')
      .set('Authorization', `Bearer ${validAdminToken}`)
      .send(deletedUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.state).toBe('eliminado');
  });


  // -------------------
  // Tests negativos
  // -------------------

  test('Debería rechazar la creación si faltan datos requeridos', async () => {
    const res = await request(app)
      .post('/api/auth-users')
      .set('Authorization', `Bearer ${validAdminToken}`)
      .send({ email: 'incompleto@test.com' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Faltan datos requeridos/);
  });

  test('Debería rechazar la creación de un usuario duplicado', async () => {
    const res = await request(app)
      .post('/api/auth-users')
      .set('Authorization', `Bearer ${validAdminToken}`)
      .send(coordinator);

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toMatch(/El correo ya está registrado/);
  });

  test('Debería rechazar creación si hay error interno del servidor', async () => {
    const userRepo = AppDataSource.getRepository(User);
    const spySave = jest.spyOn(userRepo, 'save').mockRejectedValueOnce(new Error('DB falló'));

    const res = await request(app)
      .post('/api/auth-users')
      .set('Authorization', `Bearer ${validAdminToken}`)
      .send({
        firstName: 'Test',
        lastName: 'Error',
        email: 'error@test.com',
        password: 'Password123',
        role: 'coordinator',
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/Error interno del servidor/);

    spySave.mockRestore();
  });
});

describe('Módulo Usuarios - Login de usuarios', () => {

  test('Debería permitir el login exitoso de un usuario habilitado', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: coordinator.email, password: coordinator.password });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(coordinator.email);

    validCoordinatorToken = res.body.token
  });

  test('Debería rechazar el login si falta el email o la contraseña', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: coordinator.email });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Email y contraseña son requeridos/);
  });

  test('Debería rechazar el login si el usuario no está registrado', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'noexiste@test.com', password: '123456' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/Usuario no encontrado/);
  });

  test('Debería rechazar el login si la contraseña es incorrecta', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: coordinator.email, password: 'incorrecta' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/Credenciales incorrectas/);
  });

  test('Debería rechazar el login si el usuario eliminado no es admin', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: deletedUser.email, password: deletedUser.password });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/Este usuario ha sido eliminado/);
  });

  test('Debería permitir el login si el usuario admin está eliminado', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: admin.email, password: admin.password });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('Debería retornar error 500 si ocurre un fallo interno en el servidor', async () => {
    // Forzamos un error en el repositorio
    const userRepo = AppDataSource.getRepository(User);
    const originalFind = userRepo.findOneBy;
    userRepo.findOneBy = jest.fn(() => { throw new Error('Fallo simulado'); });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: coordinator.email, password: coordinator.password });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/Error del servidor/);

    userRepo.findOneBy = originalFind;
  });

});

describe('Módulo Usuarios - Obtención de usuarios', () => {
  test('Administrador debe obtener todos los usuarios GET /auth-users/users', async () => {
    const res = await request(app)
      .get('/api/auth-users/users')
      .set('Authorization', `Bearer ${validAdminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);

    res.body.forEach(user => {
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('firstName');
      expect(user).toHaveProperty('lastName');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('role');
      expect(user).toHaveProperty('state');
      expect(user).toHaveProperty('projectCount');
    });
  });

  test('Un usuario sin rol admin no debería obtener todos los usuarios', async () => {
    const res = await request(app)
      .get('/api/auth-users/users')
      .set('Authorization', `Bearer ${validCoordinatorToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/No tienes permisos para acceder a esta ruta/);
  });

  test('Usuarios sin proyectos deben tener projectCount = 0', async () => {
    const res = await request(app)
      .get('/api/auth-users/users')
      .set('Authorization', `Bearer ${validAdminToken}`);

    expect(res.statusCode).toBe(200);
    const userWithoutProjects = res.body.find(u => u.projectCount === 0);
    expect(userWithoutProjects).toBeDefined();
  });

  test('Debe devolver 500 si ocurre un error interno en el servidor', async () => {
    const userRepo = AppDataSource.getRepository(User);

    const mockQueryBuilder = {
      leftJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      addGroupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockRejectedValueOnce(new Error('DB falló')),
    };

    jest.spyOn(userRepo, 'createQueryBuilder').mockReturnValueOnce(mockQueryBuilder);

    const res = await request(app)
      .get('/api/auth-users/users')
      .set('Authorization', `Bearer ${validAdminToken}`);

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('message', 'Error interno del servidor');
  });

});

describe('Módulo Usuarios - Obtención de usuario por email', () => {
  // -------------------
  // Tests positivos
  // -------------------
  test('Debería permitir que un administrador obtenga un usuario existente por email', async () => {
    const res = await request(app)
      .get(`/api/auth-users/users/${encodeURIComponent(coordinator.email)}`)
      .set('Authorization', `Bearer ${validAdminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe(coordinator.email);
    expect(res.body).toHaveProperty('projects');
    expect(Array.isArray(res.body.projects)).toBe(true);
  });

  test('Debería devolver el usuario con projects vacíos si no tiene asignados', async () => {
    const res = await request(app)
      .get(`/api/auth-users/users/${encodeURIComponent(admin2.email)}`)
      .set('Authorization', `Bearer ${validAdminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe(admin2.email);
    expect(Array.isArray(res.body.projects)).toBe(true);
    expect(res.body.projects.length).toBe(0);
  });

  // -------------------
  // Tests negativos
  // -------------------
  test('Debería rechazar si no se envía email en los parámetros', async () => {
    const res = await request(app)
      .get('/api/auth-users/users/%20')
      .set('Authorization', `Bearer ${validAdminToken}`);

    expect(res.statusCode).toBe(404);
    // Express no matchea la ruta sin param, lo normal es 404
  });

  test('Debería rechazar si el email no existe en la base de datos', async () => {
    const res = await request(app)
      .get(`/api/auth-users/users/${encodeURIComponent('noexiste@test.com')}`)
      .set('Authorization', `Bearer ${validAdminToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/Usuario no encontrado/);
  });


  test('Debería devolver 500 si ocurre un error interno en el servidor', async () => {
    const userRepo = AppDataSource.getRepository(User);

    // Mock del método que realmente se usa
    const spyFindOne = jest.spyOn(userRepo, 'findOne').mockRejectedValueOnce(new Error('DB falló'));

    const res = await request(app)
      .get(`/api/auth-users/users/${encodeURIComponent(coordinator.email)}`)
      .set('Authorization', `Bearer ${validAdminToken}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/Error interno del servidor/);

    spyFindOne.mockRestore();
  });

});

describe('Módulo Usuarios - Actualización de usuarios', () => {
  // -------------------
  // Tests positivos
  // -------------------

  test('Debería permitir que un administrados actualizé usuario PATCH /auth-users/users/:email', async () => {
    const res = await request(app)
      .patch(`/api/auth-users/users/${encodeURIComponent(coordinator.email)}`)
      .set('Authorization', `Bearer ${validAdminToken}`)
      .send({ firstName: 'JuanUpdated' });

    expect(res.statusCode).toBe(200);
    expect(res.body.firstName).toBe('JuanUpdated');
  });

  test('Debería permitir que un administrador pueda actualizar nombre de un usuario', async () => {
    const res = await request(app)
      .patch(`/api/auth-users/users/${encodeURIComponent(coordinator.email)}`)
      .set('Authorization', `Bearer ${validAdminToken}`)
      .send({ firstName: 'JuanUpdated' });

    expect(res.statusCode).toBe(200);
    expect(res.body.firstName).toBe('JuanUpdated');
  });

  test('Debería permitir que un administrador pueda actualizar rol y estado de un usuario', async () => {
    const res = await request(app)
      .patch(`/api/auth-users/users/${encodeURIComponent(coordinator.email)}`)
      .set('Authorization', `Bearer ${validAdminToken}`)
      .send({ role: 'admin', state: 'deshabilitado' });

    expect(res.statusCode).toBe(200);
    expect(res.body.role).toBe('admin');
    expect(res.body.state).toBe('deshabilitado');
  });

  test('Debería permitir que un administrador pueda actualizar email a uno no usado', async () => {
    const res = await request(app)
      .patch(`/api/auth-users/users/${encodeURIComponent(coordinator.email)}`)
      .set('Authorization', `Bearer ${validAdminToken}`)
      .send({ email: 'nuevoemail@test.com' });

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe('nuevoemail@test.com');
  });

  test('Debería permitir que un coordinador pueda actualizar solo su foto', async () => {
    const filePath = path.join(__dirname, '../fixtures', 'ci.jpg');
    const res = await request(app)
      .patch(`/api/auth-users/users/${encodeURIComponent(coordinator.email)}`)
      .set('Authorization', `Bearer ${validCoordinatorToken}`)
      .attach('file', filePath);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/Sesión expirada por cambios en el perfil. Por favor vuelve a iniciar sesión./);
  });

  // -------------------
  // Tests negativos
  // -------------------
  test('Debería rechazar la actualización de usuario que no existe, devuelve 404', async () => {
    const res = await request(app)
      .patch(`/api/auth-users/users/nonexistent@test.com`)
      .set('Authorization', `Bearer ${validAdminToken}`)
      .send({ firstName: 'Test' });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/Usuario no encontrado/);
  });

  test('Debería no permitir actualizar un usuario sin permisos intenta actualizar otro perfil → 403', async () => {
    const resp = await request(app)
      .patch(`/api/auth-users/users/${encodeURIComponent(admin2.email)}`)
      .set('Authorization', `Bearer ${validNewCoordinatorToken}`)
      .send({ firstName: 'MalUpdate' });


    expect(resp.statusCode).toBe(403);
    expect(resp.body.message).toMatch(/No puedes modificar este perfil/);
  });

  test('Debería rechazar actualizar campos no permitidos diferentes a la foto de perfil → 403', async () => {
    const res = await request(app)
      .patch(`/api/auth-users/users/${encodeURIComponent(coordinator2.email)}`)
      .set('Authorization', `Bearer ${validNewCoordinatorToken}`)
      .send({ firstName: 'Juan', lastName: 'Perez' });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/Coordinador solo puede actualizar su foto/);
  });

  test('Debería no permitir intentar asignar rol inválido → 400', async () => {
    const res = await request(app)
      .patch(`/api/auth-users/users/${encodeURIComponent(coordinator2.email)}`)
      .set('Authorization', `Bearer ${validAdminToken}`)
      .send({ role: 'invalidrole' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Rol no válido/);
  });

  test('Debería no permitir intentar cambiar email a uno existente → 400', async () => {
    const res = await request(app)
      .patch(`/api/auth-users/users/${encodeURIComponent(coordinator2.email)}`)
      .set('Authorization', `Bearer ${validAdminToken}`)
      .send({ email: admin.email });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/El email ya está en uso/);
  });

  test('Debería devolver error interno del servidor → 500', async () => {
    const userRepo = AppDataSource.getRepository(User);
    const spySave = jest.spyOn(userRepo, 'save').mockRejectedValueOnce(new Error('DB falló'));

    const res = await request(app)
      .patch(`/api/auth-users/users/${encodeURIComponent(coordinator2.email)}`)
      .set('Authorization', `Bearer ${validAdminToken}`)
      .send({ firstName: 'ErrorTest' });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/Error del servidor/);

    spySave.mockRestore();
  });

});

describe('Módulo Usuarios - Eliminación de usuarios', () => {

  // -------------------
  // Tests positivos
  // -------------------

  test('Debería permitir que un admin elimine un usuario coordinador', async () => {
    const res = await request(app)
      .delete(`/api/auth-users/users/${encodeURIComponent(coordinator2.email)}`)
      .set('Authorization', `Bearer ${validAdminToken}`)
      .send({ password: `${coordinator2.password}`, requesterEmail: `${admin.email}` });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Usuario eliminado correctamente/);
  });

  test('Debería permitir que un admin se elimine a sí mismo', async () => {
    const res = await request(app)
      .delete(`/api/auth-users/users/${encodeURIComponent(admin.email)}`)
      .set('Authorization', `Bearer ${validAdminToken}`)
      .send({ password: `${admin.password}`, requesterEmail: `${admin.email}` });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Usuario eliminado correctamente/);
  });

  // -------------------
  // Tests negativos
  // -------------------

  test('Debería rechazar eliminación si no es admin quien solicita', async () => {
    const userRepo = AppDataSource.getRepository(User);

    const tempCoordinator = userRepo.create({
      firstName: 'Temp',
      lastName: 'Coordinator',
      email: 'tempcoordinator@test.com',
      password: await bcrypt.hash('Password123', 10),
      role: 'coordinator',
      state: 'habilitado',
    });
    await userRepo.save(tempCoordinator);
  
    const loginResp = await request(app)
      .post('/api/auth/login')
      .send({ email: tempCoordinator.email, password: 'Password123' });
    const tempCoordinatorToken = loginResp.body.token;

    const res = await request(app)
      .delete(`/api/auth-users/users/${encodeURIComponent(admin2.email)}`)
      .set('Authorization', `Bearer ${tempCoordinatorToken}`)
      .send({ password: `${admin2.password}`, requesterEmail: tempCoordinator.email });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/No tienes permisos/);

    await userRepo.remove(tempCoordinator);
  });


  test('Debería rechazar eliminación si el usuario no existe', async () => {
    const res = await request(app)
      .delete(`/api/auth-users/users/nonexistent@test.com`)
      .set('Authorization', `Bearer ${validNewAdmin3Token}`)
      .send({ password: '123456', requesterEmail: `${admin2.email}` });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/Usuario no encontrado/);
  });

  test('Debería rechazar eliminación de otro admin', async () => {
    const res = await request(app)
      .delete(`/api/auth-users/users/${encodeURIComponent(admin4.email)}`)
      .set('Authorization', `Bearer ${validNewAdmin3Token}`)
      .send({ password: `${admin4.password}`, requesterEmail: admin3.email });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/No puedes eliminar otro administrador/);
  });

  test('Debería rechazar eliminación si la contraseña es incorrecta', async () => {
    const res = await request(app)
      .delete(`/api/auth-users/users/${encodeURIComponent(admin3.email)}`)
      .set('Authorization', `Bearer ${validNewAdmin3Token}`)
      .send({ password: 'WrongPassword', requesterEmail: admin3.email });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/Credenciales inválidas/);

  });
});

