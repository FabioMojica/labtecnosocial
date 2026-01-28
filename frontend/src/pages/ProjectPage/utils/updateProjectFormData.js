export function updateProjectFormData(projectData) {
    const formData = new FormData();

    console.log("oroject frm data", projectData);

    if (projectData.name) formData.append("name", projectData.name);
    if (projectData.description) formData.append("description", projectData.description);

    if (projectData.program?.id) formData.append("program_id", projectData.program.id);

    if (projectData.image_url instanceof File) {
        formData.append("file", projectData.image_url);  
    } else if (projectData.image_url === null){
        formData.append("image_url", null)
    }

    if (Array.isArray(projectData.preEliminados) && projectData.preEliminados.length > 0) {
        formData.append("preEliminados", JSON.stringify(projectData.preEliminados));
    }

    if (Array.isArray(projectData.preAnadidos) && projectData.preAnadidos.length > 0) {
        formData.append("preAnadidos", JSON.stringify(projectData.preAnadidos));
    }

    if (Array.isArray(projectData.intAnadidos) && projectData.intAnadidos.length > 0) {
    formData.append("intAnadidos", JSON.stringify(projectData.intAnadidos));
    }

    if (Array.isArray(projectData.intEliminados) && projectData.intEliminados.length > 0) {
        formData.append("intEliminados", JSON.stringify(projectData.intEliminados));
    }    

    return formData;
}
