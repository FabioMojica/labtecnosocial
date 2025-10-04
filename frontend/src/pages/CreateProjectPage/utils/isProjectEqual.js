
export const isProjectEqual = (a, b) => {
  return (
    a.name === b.name &&
    a.description === b.description &&
    a.image_url === b.image_url &&
    a.image_file === b.image_file &&
    JSON.stringify(a.newResponsibles) === JSON.stringify(b.newResponsibles) &&
    JSON.stringify(a.integrations) === JSON.stringify(b.integrations)
  );
};
