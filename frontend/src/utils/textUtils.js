/**
 * Limpia espacios innecesarios de una cadena.
 * - Ignora espacios al inicio.
 * - Reduce múltiples espacios intermedios a uno.
 * - Elimina espacios al final.
 */
export const cleanExtraSpaces = (text = "") => {
  if (typeof text !== "string") return "";
  return text
    .trimStart()                 // elimina espacios al inicio
    .replace(/\s+/g, " ")        // reemplaza múltiples espacios por uno
    .trim();                     // elimina espacios al final
};

/**
 * Valida que un texto no esté vacío ni solo con espacios.
 * Retorna un mensaje de error o null si es válido.
 */
export const validateRequiredText = (text, fieldName = "Campo") => {
  const cleaned = cleanExtraSpaces(text);
  if (!cleaned) return `${fieldName} no puede estar vacío.`;
  return null;
};

/**
 * Valida longitud mínima y máxima de un texto.
 */
export const validateTextLength = (text, min, max, fieldName = "Campo") => {
  const cleaned = cleanExtraSpaces(text);
  if (cleaned.length < min) return `${fieldName} debe tener al menos ${min} caracteres.`;
  if (cleaned.length > max) return `${fieldName} no puede exceder ${max} caracteres.`;
  return null;
};

/**
 * Valida que un texto contenga solo letras (y espacios opcionalmente).
 * @param {string} text - Texto a validar.
 * @param {string} fieldName - Nombre del campo (para el mensaje de error).
 * @returns {string|null} Mensaje de error o null si es válido.
 */
export const validateOnlyLetters = (text, fieldName = "Campo") => {
  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(text)) {
    return `${fieldName} solo debe contener letras y espacios`;
  }
  return null;
};
/**
 * Limpia y valida que una cantidad sea un número real positivo.
 * - Elimina espacios.
 * - Quita ceros innecesarios al inicio (excepto "0" o "0.xx").
 * - Convierte comas en puntos para decimales.
 * - Rechaza valores negativos o no numéricos.
 * Retorna:
 *   - número limpio como string (por ejemplo "12.5")
 *   - "" si es inválido
 */
export const cleanAndValidatePositiveNumber = (input = "") => {
  if (typeof input !== "string" && typeof input !== "number") return "";
  
  let value = String(input).trim();

  // Reemplaza comas por puntos (por si el usuario usa coma decimal)
  value = value.replace(",", ".");

  // Elimina ceros a la izquierda, pero conserva "0" o "0.xx"
  if (/^0+\d+$/.test(value)) {
    value = value.replace(/^0+/, ""); // ej: "007" → "7"
  }

  // Si está vacío o no es número, retornar vacío
  if (!value || isNaN(value)) return "";

  const num = parseFloat(value);

  // Permitir cero exacto, pero no negativos
  if (num < 0) return "";

  // Limpiar decimales innecesarios (e.g. "12.00" → "12")
  return num % 1 === 0 ? String(parseInt(num)) : String(num);
};

/**
 * Valida que un nombre no tenga:
 * - espacios al inicio
 * - espacios al final
 * - múltiples espacios consecutivos en el medio
 * Retorna mensaje de error o null si es válido
 */
export const validateSpaces = (name = "", fieldName = "Campo") => {
  if (typeof name !== "string") return `${fieldName} debe ser un texto válido.`;

  if (/^\s/.test(name)) return `${fieldName} no debe comenzar con espacios.`;
  if (/\s$/.test(name)) return `${fieldName} no debe terminar con espacios.`;
  if (/\s{2,}/.test(name)) return `${fieldName} no debe tener múltiples espacios consecutivos.`;

  return null;
};
