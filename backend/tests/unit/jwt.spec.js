import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { users } from '../fixtures/fixtures.js';
import request from 'supertest';


const { admin, coordinator, disabledUser, deletedUser } = users;

import app from '../../src/app.js';

describe('Seguridad / Autenticación - Unit Tests', () => {

  test('Las contraseñas se almacenan en hash', async () => {
    const plainPassword = 'Secret123';
    const hashed = await bcrypt.hash(plainPassword, 10);

    expect(hashed).not.toBe(plainPassword);

    const match = await bcrypt.compare(plainPassword, hashed);
    expect(match).toBe(true);
  });

  test('JWT expira correctamente', async () => {
    const secret = 'testsecret';
    const token = jwt.sign({ email: 'user@test.com' }, secret, { expiresIn: '1s' });

    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      jwt.verify(token, secret);
      throw new Error('El token no expiró');
    } catch (err) {
      expect(err.name).toBe('TokenExpiredError');
    }
  });

  test('Token caducado debe fallar', async () => {
  const token = jwt.sign({ email: admin.email }, 'testsecret', { expiresIn: '1s' });
  await new Promise(resolve => setTimeout(resolve, 1500));

  const res = await request(app)
    .get('/api/auth-users/users')
    .set('Authorization', `Bearer ${token}`);

  expect(res.statusCode).toBe(401);
});

test('Token con firma incorrecta debe fallar', async () => {
  const token = jwt.sign({ email: admin.email }, 'wrongsecret');
  const res = await request(app)
    .get('/api/auth-users/users')
    .set('Authorization', `Bearer ${token}`);

  expect(res.statusCode).toBe(401);
});


});
