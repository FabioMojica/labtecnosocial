import { axiosInstance } from "./config";
import { loadAbort } from "../utils";
import { Routes } from "./config/routes";
import { handleApiError } from "./config/handleApiError";

// Obtener todo
export const getAllStrategicPlansApi = async () => {
  const controller = loadAbort();
  try {
    const { data } = await axiosInstance.get(Routes.STRATEGIC_PLAN, { signal: controller.signal });

    if (data?.success !== true) {
      throw { 
        code: 'INVALID_API_CONTRACT',
        message: 'Respuesta inesperada del servidor.', 
      };
    }

    return data?.data;
  } catch (error) {
    throw handleApiError(error, 'Error al intentar obtener planes estratégicos. Inténtalo de nuevo más tarde.');
  }
};

export const getStrategicPlanByYearApi = async (year) => {
  const controller = loadAbort();
  try {
    const { data } = await axiosInstance.get(`${Routes.STRATEGIC_PLAN}/${year}`, { signal: controller.signal });
    
    if (data?.success !== true) {
      throw {
        code: 'INVALID_API_CONTRACT',
        message: 'Respuesta inesperada del servidor.',
      };
    }
    return data?.data;
  } catch (error) {
    throw handleApiError(error, 'Error al intentar obtener el plan estratégico del año.');
  }
};

export const updateStrategicPlanApi = async (year, updatedData) => {
  const controller = loadAbort();
  try {
    const { data } = await axiosInstance.put(`${Routes.STRATEGIC_PLAN}/${year}`, updatedData);

    if (data?.success !== true) {
      throw {
        code: 'INVALID_API_CONTRACT',
        message: 'Respuesta inesperada del servidor.',
      };
    }

    return data?.data;

  } catch (error) { 
    throw handleApiError(error, 'Error al intentar actualizar el plan estratégico del año.');
  }
};

export const deleteStrategicPlanApi = async (year) => {
  const controller = loadAbort();
  try {
    const { data } = await axiosInstance.delete(`${Routes.DELETE_STRATEGIC_PLAN}/${year}`, { signal: controller.signal });

    if (data?.success !== true) {
      throw {
        code: 'INVALID_API_CONTRACT',
        message: 'Respuesta inesperada del servidor.',
      };
    }

    return data?.data;
 
  } catch (error) { 
    console.log(error);
    throw handleApiError(error, 'Error al intentar eliminar el plan estratégico del año.');
  }
};
