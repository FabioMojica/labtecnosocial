export function updateUserFormData(userData) {
  const formData = new FormData();

  if (userData.firstName) formData.append("firstName", userData.firstName);
  if (userData.lastName) formData.append("lastName", userData.lastName);
  if (userData.email) formData.append("email", userData.email);
  if (userData.oldPassword) formData.append("oldPassword", userData.oldPassword);
  if (userData.newPassword) formData.append("newPassword", userData.newPassword);
  if (userData.role) formData.append("role", userData.role);
  if (userData.state) formData.append("state", userData.state);

  if (userData.image_file instanceof File) {
    formData.append("file", userData.image_file);
  }

  return formData;
}
