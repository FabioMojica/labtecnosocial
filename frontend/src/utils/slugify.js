export const slugify = (text = '') => {
  console.log("texttxtx", text)

  const base = text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/^proyecto-?/i, '') 
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return `proyecto-${base}`;
};
