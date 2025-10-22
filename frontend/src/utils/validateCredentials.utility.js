/**
 * Valida si un email tiene un formato correcto.
 * @param email - Email a validar.
 * @returns Mensaje de error o null si es válido.
 */
export const validateEmail = (email) => {
  if (!email) return "El email es requerido";

  // Regex estándar para validar correos electrónicos
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return regex.test(email) ? null : "El email no es válido";
};

/**
 * Valida que la contraseña no exceda los 8 caracteres.
 * @param password - Contraseña a validar.
 * @returns Mensaje de error o null si es válida.
 */
export const validatePasswordLength = (password) => {
  if (!password) return "La contraseña es requerida";
  return password.length === 8
    ? null
    : "La contraseña debe tener exactamente 8 caracteres";
};


/**
 * Valida la complejidad de la contraseña:
 * - No vacía
 * - Máximo 8 caracteres
 * - Al menos una mayúscula
 * - Al menos un número
 * - Al menos un carácter especial
 * @param password - Contraseña a validar.
 * @returns Mensaje de error o null si es válida.
 */
export const validatePassword = (password) => {
  if (!password) return "La contraseña es requerida";

  // Verifica longitud exacta
  const lengthError = validatePasswordLength(password);
  if (lengthError) return lengthError;

  // No debe tener espacios
  if (/\s/.test(password)) return "La contraseña no puede contener espacios";

  if (!/[A-Z]/.test(password)) return "La contraseña debe contener al menos una mayúscula";
  if (!/[0-9]/.test(password)) return "La contraseña debe contener al menos un número";
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return "La contraseña debe contener al menos un carácter especial";
  }

  return null;
};

