export const generateSecurePassword = () => {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%^&*()_+{}[]<>?";
  const all = upper + lower + numbers + special;

  let password = "";
  password += upper[Math.floor(Math.random() * upper.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Completar hasta 8 caracteres
  for (let i = password.length; i < 8; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  onChange?.({ password });
  notify("Contraseña segura generada", "info");
};