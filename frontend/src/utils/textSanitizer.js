/**
 * Limpia un texto: quita espacios al inicio y final,
 * y reduce múltiples espacios intermedios a uno solo.
 * @param {string} text
 * @returns {string}
 */
export const sanitizeText = (text) => {
  return text.trim().replace(/\s+/g, " ");
};

/**
 * Verifica si el texto limpio es válido según reglas y maxLength dinámico.
 * @param {string} text
 * @param {number} maxLength
 * @returns {boolean}
 */
export const isValidSanitizedText = (text, maxLength) => {
  const cleaned = sanitizeText(text);
  const regex =
    /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü0-9.,;:¡!¿?\-()%'"_@/#&+\s]+$/;

  return (
    cleaned.length > 0 &&
    cleaned.length <= maxLength &&
    regex.test(cleaned)
  );
};

/**
 * Compara texto actual con original, ambos sanitizados.
 * @param {string} current
 * @param {string} original
 * @returns {boolean}
 */
export const hasSanitizedChanges = (current, original) => {
  return sanitizeText(current) !== sanitizeText(original);
};
