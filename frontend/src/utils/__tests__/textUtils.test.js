import {
  cleanAndValidatePositiveNumber,
  cleanExtraSpaces,
  validateOnlyLetters,
  validateRequiredText,
  validateSpaces,
  validateTextLength,
} from "../textUtils";

describe("textUtils", () => {
  test("cleanExtraSpaces limpia espacios redundantes", () => {
    expect(cleanExtraSpaces("   hola    mundo   ")).toBe("hola mundo");
    expect(cleanExtraSpaces(null)).toBe("");
  });

  test("validateRequiredText valida campo requerido", () => {
    expect(validateRequiredText("   ", "Nombre")).toBe("Nombre no puede estar vacío.");
    expect(validateRequiredText("Fabio", "Nombre")).toBeNull();
  });

  test("validateTextLength valida min y max", () => {
    expect(validateTextLength("ab", 3, 10, "Nombre")).toContain("al menos 3");
    expect(validateTextLength("a".repeat(11), 3, 10, "Nombre")).toContain("exceder 10");
    expect(validateTextLength("abc", 3, 10, "Nombre")).toBeNull();
  });

  test("validateOnlyLetters valida solo letras y espacios", () => {
    expect(validateOnlyLetters("Fabio Mojica", "Nombre")).toBeNull();
    expect(validateOnlyLetters("Fabio123", "Nombre")).toContain("solo debe contener letras");
  });

  test("cleanAndValidatePositiveNumber normaliza y valida positivos", () => {
    expect(cleanAndValidatePositiveNumber("007")).toBe("7");
    expect(cleanAndValidatePositiveNumber("12,5")).toBe("12.5");
    expect(cleanAndValidatePositiveNumber("-2")).toBe("");
    expect(cleanAndValidatePositiveNumber("abc")).toBe("");
  });

  test("validateSpaces detecta errores de espaciado", () => {
    expect(validateSpaces("  Fabio", "Nombre")).toContain("comenzar");
    expect(validateSpaces("Fabio  Mojica", "Nombre")).toContain("múltiples espacios");
    expect(validateSpaces("Fabio Mojica", "Nombre")).toBeNull();
  });
});
