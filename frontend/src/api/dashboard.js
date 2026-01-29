import { Routes } from "./config";
import { handleApiError } from "./config/handleApiError";
import { loadAbort } from "../utils";
import { axiosInstance } from "./config";

export const getOperationalProjectsWithIntegrationsApi = async (email) => {
  const controller = loadAbort();
  try {
    const { data } = await axiosInstance.get(Routes.dashboard.GET_PROJECTS_WITH_INTEGRATIONS, {
      signal: controller.signal,
      params: { email },
    }); 

    if (data?.success !== true) { 
      throw {
        code: 'INVALID_API_CONTRACT',
        message: 'Respuesta inesperada del servidor.',
      };
    }

    return data?.data;

  } catch (error) {
    console.log(error)
    throw handleApiError(error, 'Ocurrió un error inesperado al obtener el proyecto con sus integraciones. Inténtalo nuevamente más tarde.');
  }
};
