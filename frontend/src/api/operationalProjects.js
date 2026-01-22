import { axiosInstance } from "./config";

import { loadAbort } from "../utils";
import { Routes } from "./config/routes";
import { handleApiError } from "./config/handleApiError";

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

    return response.data;
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
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return null;
    if (error.response) throw new Error(error.response.data.message || "Error al obtener los proyectos");
    throw new Error("Error al intentar obtener los proyectos");
  }
};

export const getProjectByIdApi = async (id) => {
  const controller = loadAbort();
  try {
    const { data } = await axiosInstance.get(`${Routes.GET_PROJECT_BY_ID}/${id}`, { signal: controller.signal });

    if (data?.success !== true) {
      throw {
        code: 'INVALID_API_CONTRACT',
        message: 'Respuesta inesperada del servidor.',
      };
    }

    return data?.data;   

  } catch (error) { 
    throw handleApiError(error, 'Ocurrió un error inesperado al obtener el proyecto. Inténtalo nuevamente más tarde.');
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
    const { data } = await axiosInstance.patch(
      `${Routes.UPDATE_PROJECT}/${id}`,
      formData,
      {
        signal: controller.signal,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    if (data?.success !== true) {
      throw {
        code: 'INVALID_API_CONTRACT',
        message: 'Respuesta inesperada del servidor.',
      };
    }

    return data?.data;  

  } catch (error) {
    console.log(error);
    throw handleApiError(error, 'Ocurrió un error inesperado al actualizar el proyecto. Inténtalo nuevamente más tarde.');
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
