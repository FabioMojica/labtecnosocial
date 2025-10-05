export function createProjectFormData(projectData) {
  const formData = new FormData();

  console.log("prokect dataaaaaaaaa", projectData);

  if (projectData.name) formData.append("name", projectData.name);
  if (projectData.description) formData.append("description", projectData.description);

  if (projectData.image_file instanceof File) {
    formData.append("file", projectData.image_file);
  }

  if (Array.isArray(projectData.responsibles) && projectData.responsibles.length > 0) {
    formData.append("responsibles", JSON.stringify(projectData.responsibles));
  }

  if (Array.isArray(projectData.integrations) && projectData.integrations.length > 0) {
    formData.append("integrations", JSON.stringify(projectData.integrations));
  }

  console.log(Array.from(formData.entries()));


  return formData; 
}
