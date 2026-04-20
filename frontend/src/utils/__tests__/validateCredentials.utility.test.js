import {
  generateSecurePassword,
  validateEmail,
  validatePassword,
  validatePasswordLength,
} from "../validateCredentials.utility";

describe("validateCredentials.utility", () => {
  test("validateEmail valida formato correcto", () => {
    expect(validateEmail("usuario@correo.com")).toBeNull();
    expect(validateEmail("")).toBe("El email es requerido");
    expect(validateEmail("no-valido")).toBe("El email no es válido");
  });

  test("validatePasswordLength exige exactamente 8 caracteres", () => {
    expect(validatePasswordLength("Ab1$xy")).toBe(
      "La contraseña debe tener exactamente 8 caracteres"
    );
    expect(validatePasswordLength("Ab1$xy78")).toBeNull();
  });

  test("validatePassword aplica reglas de complejidad", () => {
    expect(validatePassword("Ab1$xy78")).toBeNull();
    expect(validatePassword("ab1$xy78")).toContain("mayúscula");
    expect(validatePassword("ABcd$xyz")).toContain("número");
    expect(validatePassword("ABcd1234")).toContain("carácter especial");
    expect(validatePassword("Ab1$ xy8")).toContain("espacios");
  });

  test("generateSecurePassword retorna password de 8 chars", () => {
    const generated = generateSecurePassword();
    expect(generated).toHaveLength(8);
    expect(validatePassword(generated)).toBeNull();
  });
});
