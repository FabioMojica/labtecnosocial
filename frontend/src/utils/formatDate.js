export const formatDate = (date) => {
  if (!date) return ''; 
  const d = new Date(date);
  if (isNaN(d)) return ''; 
  return d.toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};
