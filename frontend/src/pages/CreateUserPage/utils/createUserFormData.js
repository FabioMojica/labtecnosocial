export function createUserFormData(userData) {
  const formData = new FormData();

  console.log("userDataaaaaaa", userData);

  if (userData.firstName) formData.append("firstName", userData.firstName);
  if (userData.lastName) formData.append("lastName", userData.lastName);
  if (userData.email) formData.append("email", userData.email);
  if (userData.password) formData.append("password", userData.password);
  if (userData.role) formData.append("role", userData.role); 
  if (userData.state) formData.append("state", userData.state);

  if (userData.image_file instanceof File) {
    formData.append("file", userData.image_file);
  }
  console.log(Array.from(formData.entries()));
  return formData; 
}
  