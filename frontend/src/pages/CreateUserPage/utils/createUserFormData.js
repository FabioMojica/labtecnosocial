export function createUserFormData(userData) {
  const formData = new FormData();

  console.log("userDataaaaaaa", userData);

  if (userData.name) formData.append("firstName", userData.firstName);
  if (userData.description) formData.append("lastName", userData.lastName);
  if (userData.description) formData.append("email", userData.email);
  if (userData.description) formData.append("password", userData.password);
  if (userData.description) formData.append("role", userData.role);
  if (userData.description) formData.append("state", userData.state);

  if (userData.image_file instanceof File) {
    formData.append("file", userData.image_file);
  }
  console.log(Array.from(formData.entries()));
  return formData; 
}
  