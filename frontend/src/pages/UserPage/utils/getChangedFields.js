const EDITABLE_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "role",
  "state",
  "image_url",
];

export const getChangedFields = (current, original) => {
  const changes = {};

  EDITABLE_FIELDS.forEach((key) => {
    const currentValue = current[key];
    const originalValue = original[key];

    // imagen nueva
    if (currentValue instanceof File) {
      changes[key] = currentValue;
      return; 
    }

    // borrar imagen
    if (key === "image_url" && currentValue === null && originalValue !== null) {
      changes[key] = null;
      return;
    }

    // valores primitivos
    if (
      currentValue !== undefined &&
      currentValue !== originalValue
    ) {
      changes[key] = currentValue;
    }
  });

  return changes;
};