import { v4 as uuidv4, validate as validateUUID } from 'uuid';

/**
 * Genera un UUID válido o valida el que se le pasa.
 * @param {string} [id] - ID opcional a validar.
 * @returns {string} - UUID válido.
 */
export const generateUUID = (id) => {
  if (id && validateUUID(id)) {
    return id; // El ID recibido es válido
  }
  // Genera uno nuevo y garantiza que sea válido
  let newId = uuidv4();
  while (!validateUUID(newId)) {
    newId = uuidv4();
  }
  return newId;
};
