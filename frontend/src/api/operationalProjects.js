import { axiosInstance } from "./config";

import { loadAbort } from "../utils";
import { Routes } from "./config/routes";
import { handleApiError } from "./config/handleApiError";

export const createOperationalProjectApi = async (projectData) => {
  const controller = loadAbort();
  try {
    const { data } = await axiosInstance.post(
      Routes.CREATE_PROJECT,
      projectData,
      {
        signal: controller.signal,
      }
    );

    if (data?.success !== true) {
      throw {
        code: 'INVALID_API_CONTRACT',
        message: 'Respuesta inesperada del servidor.',
      };
    }

    return data?.data;
  } catch (error) {
    throw handleApiError(error, 'Ocurrió un error inesperado al crear el proyecto. Inténtalo nuevamente más tarde.');
  }
};

export const getAllOperationalProjectsApi = async () => {
  const controller = loadAbort();
  try {
    const { data } = await axiosInstance.get(Routes.GET_ALL_PROJECTS, { signal: controller.signal });

    if (data?.success !== true) {
      throw {
        code: 'INVALID_API_CONTRACT',
        message: 'Respuesta inesperada del servidor.',
      };
    }

    return data?.data;
  } catch (error) {
    throw handleApiError(error, 'Ocurrió un error inesperado al obtener los proyectos. Inténtalo nuevamente más tarde.');
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
    const { data } = await axiosInstance.delete(`${Routes.DELETE_PROJECT}/${id}`, { signal: controller.signal });

    if (data?.success !== true) {
      throw {
        code: 'INVALID_API_CONTRACT',
        message: 'Respuesta inesperada del servidor.',
      };
    }

    return data?.data;
  } catch (error) {
    throw handleApiError(error, 'Ocurrió un error inesperado al eliminar el proyecto. Inténtalo nuevamente más tarde.');
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
    throw handleApiError(error, 'Ocurrió un error inesperado al actualizar el proyecto. Inténtalo nuevamente más tarde.');
  }
};