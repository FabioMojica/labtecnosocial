export const downloadUserCredentials = ({
  firstName,
  lastName,
  email,
  password,
}) => {
  const content = `
Datos personales:
----------------------------------
Nombre del usuario: ${firstName}
Apellido del usuario: ${lastName}
----------------------------------
Credenciales de acceso:
----------------------------------
Email del usuario: ${email}
Contraseña: ${password}
----------------------------------
`.trim();

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `credenciales_${email}.txt`;
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
