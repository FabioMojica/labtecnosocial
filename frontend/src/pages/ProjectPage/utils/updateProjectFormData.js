export function updateProjectFormData(projectData) {
    const formData = new FormData();

    if (projectData.name) formData.append("name", projectData.name);
    if (projectData.description) formData.append("description", projectData.description);

    if (projectData.program?.id) formData.append("program_id", projectData.program.id);

    if (projectData.image_file instanceof File) {
        formData.append("file", projectData.image_file);
    } else if (projectData.image_url === "" || projectData.image_url === null) {
        formData.append("image_url", ""); 
    }

    if (Array.isArray(projectData.preEliminados) && projectData.preEliminados.length > 0) {
        formData.append("preEliminados", JSON.stringify(projectData.preEliminados));
    }

    if (Array.isArray(projectData.preAnadidos) && projectData.preAnadidos.length > 0) {
        formData.append("preAnadidos", JSON.stringify(projectData.preAnadidos));
    }
    return formData;
}
