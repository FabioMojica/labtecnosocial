import { hashPassword, comparePassword } from "../../src/utils/passwordUtils.js";

test('Debe encriptar y validar correctamente la contraseña', async () => {
  const plain = 'Password123';
  const hash = await hashPassword(plain, 10);
  expect(await comparePassword(plain, hash)).toBe(true);
});
