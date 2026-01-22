import { axiosInstance } from "./config";

import { loadAbort } from "../utils";
import { Routes } from "./config/routes";
import { handleApiError } from "./config/handleApiError";


export const getOperationalPlanOfProjectApi = async (id) => {
  const controller = loadAbort();
  try {
    const { data } = await axiosInstance.get(
      `${Routes.OPERATIONAL_PLAN}/${id}`,
      { signal: controller.signal }
    );

    if (data?.success !== true) {
      throw {
        code: 'INVALID_API_CONTRACT',
        message: 'Respuesta inesperada del servidor.',
      };
    }

    return data?.data;

  } catch (error) {
    throw handleApiError(error, 'Ocurrió un error inesperado al obtener el plan operativo del proyecto. Inténtalo nuevamente más tarde.');
  }
};

export const saveOperationalRowsApi = async (projectId, rowsPayload) => {
  const controller = loadAbort();
  try {
    const { data } = await axiosInstance.post(
      `${Routes.UPDATE_OPERATIONAL_PLAN}/${projectId}`,
      rowsPayload,
      { signal: controller.signal }
    );

    if (data?.success !== true) {
      throw { 
        code: 'INVALID_API_CONTRACT',
        message: 'Respuesta inesperada del servidor.',
      };
    }

    return data?.data;
  } catch (error) {
    throw handleApiError(error, 'Ocurrió un error inesperado al guardar el plan operativo del proyecto. Inténtalo nuevamente más tarde.');
  }
};

export const deleteOperationalPlanningApi = async (projectId) => {
  const controller = loadAbort();
  try {
    const { data } = await axiosInstance.delete(`${Routes.DELETE_OPERATIONAL_PLAN}/${projectId}`, { signal: controller.signal });

    if (data?.success !== true) {
      throw {
        code: 'INVALID_API_CONTRACT',
        message: 'Respuesta inesperada del servidor.',
      };
    }
    return data?.data;
  } catch (error) {
    throw handleApiError(error, 'Ocurrió un error inesperado al eliminar el plan operativo del proyecto. Inténtalo nuevamente más tarde.');
  }
};
