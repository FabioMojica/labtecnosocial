export const formatNumber = (value = 0) =>
  Intl.NumberFormat('es-BO', {
    notation: 'compact',
    maximumFractionDigits: 1,
    roundingMode: 'trunc', 
  }).format(value);
