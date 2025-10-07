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
