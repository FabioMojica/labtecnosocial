import { axiosInstance } from "./config";

import { loadAbort } from "../utils";
import { Routes } from "./config/routes";

export const createOperationalProjectApi = async (projectData) => {
  const controller = loadAbort();
  try {
    const response = await axiosInstance.post(
      Routes.CREATE_PROJECT,
      projectData,
      {
        signal: controller.signal,
      }
    );

    if (response.status === 200) return response.data;
    return null;
  } catch (error) {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return null;
    if (error.response) throw new Error(error.response.data.message || "Error al crear el proyecto");
    throw new Error("Error al intentar crear el proyecto");
  }
};
 
export const getAllOperationalProjectsApi = async () => {
  const controller = loadAbort();
  try {
    const response = await axiosInstance.get(Routes.GET_ALL_PROJECTS, { signal: controller.signal });
    if (response.status === 200) return response.data.projects;
    return null;
  } catch (error) {
    console.log("errorrr", error);
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return null;
    if (error.response) throw new Error(error.response.data.message || "Error al obtener los proyectos");
    throw new Error("Error al intentar obtener los proyectos");
  }
};

export const getProjectByIdApi = async (id) => {
  const controller = loadAbort();
  try {
    const response = await axiosInstance.get(`${Routes.GET_PROJECT_BY_ID}/${id}`, { signal: controller.signal });
    if (response.status === 200) return response.data;
    return null;
  } catch (error) {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return null;
    if (error.response) throw new Error(error.response.data.message || "Error al obtener el proyecto");
    throw new Error("Error al intentar obtener el proyecto");
  }
};

export const deleteProjectByIdApi = async (id) => {
  const controller = loadAbort();
  try {
    const response = await axiosInstance.delete(`${Routes.DELETE_PROJECT}/${id}`, { signal: controller.signal });
    if (response.status === 200) return response.data;
    return null;
  } catch (error) {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return null;
    if (error.response) throw new Error(error.response.data.message || "Error al eliminar el proyecto");
    throw new Error("Error al intentar eliminar el proyecto");
  }
};

export const updateProjectApi = async (id, formData) => {
  const controller = loadAbort();
  try {
    const response = await axiosInstance.patch(
      `${Routes.UPDATE_PROJECT}/${id}`,
      formData,
      {
        signal: controller.signal,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    if (response.status === 200) return response.data;
    return null;
  } catch (error) {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return null;
    if (error.response) throw new Error(error.response.data.message || "Error al actualizar proyecto");
    throw new Error("Ocurrió un error al actualizar el proyecto. Inténtalo de nuevo más tarde.");
  }
};

export const removeResponsibleApi = async (projectId, responsibleId) => {
  const controller = loadAbort();
  try {
    const response = await axiosInstance.delete(`${Routes.REMOVE_RESPONSIBLE}/${projectId}/responsibles/${responsibleId}`, { signal: controller.signal });
    if (response.status === 200) return response.data;
    return null;
  } catch (error) {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return null;
    if (error.response) throw new Error(error.response.data.message || "Error al eliminar responsable");
    throw new Error("Error al intentar eliminar responsable");
  }
};

export const assignProjectResponsiblesApi = async ({ projectId, responsibles }) => {
  const controller = loadAbort();
  try {
    const response = await axiosInstance.post(
      `${Routes.ASSIGN_RESPONSIBLES}/${projectId}`,
      { responsibles },
      { signal: controller.signal }
    );
    if (response.status === 200) return response.data;
    return null;
  } catch (error) {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return null;
    if (error.response) throw new Error(error.response.data.message || "Error al asignar responsables");
    throw new Error("Error al intentar asignar responsables");
  }
};

export const assignProjectToProgram = async (projectId, programId) => {
  const controller = loadAbort();
  try {
    const response = await axiosInstance.patch(
      `${Routes.UPDATE_PROJECT}/${projectId}`, 
      { program_id: programId },
      { signal: controller.signal }
    );
    if (response.status === 200) return response.data;
    return null;
  } catch (error) {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return null;
    if (error.response) throw new Error(error.response.data.message || "Error al asignar proyecto al programa");
    throw new Error("Error al intentar asignar proyecto al programa");
  }
};


export const getOperationalProjectsWithIntegrationsApi = async (email) => {
  const controller = loadAbort();
  try {
    const response = await axiosInstance.get(Routes.GET_PROJECTS_WITH_INTEGRATIONS, {
      signal: controller.signal,
      params: { email },
    });

    if (response.status === 200) return response.data.projects;
    return null;
  } catch (error) {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return null;
    if (error.response) throw new Error(error.response.data.message || "Error al obtener proyectos con integraciones");
    throw new Error("Error al intentar obtener proyectos con integraciones");
  }
};
