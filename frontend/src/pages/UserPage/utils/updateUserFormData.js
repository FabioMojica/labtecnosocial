
export function updateUserFormData(changedFields) {
  const formData = new FormData();

  const userData = changedFields; 

  if (userData.firstName) formData.append("firstName", userData.firstName);
  if (userData.lastName) formData.append("lastName", userData.lastName);
  if (userData.email) formData.append("email", userData.email);
  if (userData.oldPassword) formData.append("oldPassword", userData.oldPassword);
  if (userData.newPassword) formData.append("newPassword", userData.newPassword);
  if (userData.role) formData.append("role", userData.role);
  if (userData.state) formData.append("state", userData.state); 

  if (userData.image_url instanceof File) {
    formData.append("file", userData.image_url); 
  } else if (userData.image_url === null) {
    formData.append("image_url", null); 
  }

  return formData;
} 
