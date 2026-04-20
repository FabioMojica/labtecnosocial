import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '../../src/app.js';

describe('Seguridad / Autenticacion - Unit Tests', () => {
  test('Las contrasenas se almacenan en hash', async () => {
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
      throw new Error('El token no expiro');
    } catch (err) {
      expect(err.name).toBe('TokenExpiredError');
    }
  });

  test('Token caducado debe fallar en endpoint protegido', async () => {
    const token = jwt.sign({ email: 'admin@test.com' }, 'testsecret', { expiresIn: '1s' });
    await new Promise(resolve => setTimeout(resolve, 1500));

    const res = await request(app)
      .get('/api/users/getAllUsers')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(401);
    expect(res.body?.success).toBe(false);
  });

  test('Token con firma incorrecta debe fallar', async () => {
    const token = jwt.sign({ email: 'admin@test.com' }, 'wrongsecret');
    const res = await request(app)
      .get('/api/users/getAllUsers')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(401);
    expect(res.body?.success).toBe(false);
  });
});
