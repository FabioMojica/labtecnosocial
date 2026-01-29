import { axiosInstance } from "./config";
import { loadAbort } from "../utils";
import { Routes } from "./config/routes";
import { handleApiError } from "./config/handleApiError";

export const loginUserApi = async (userData) => {
  const controller = loadAbort();

  try {
    const { data }= await axiosInstance.post(
      Routes.auth.LOGIN,
      userData,
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
    throw handleApiError(error, 'Ocurrió un error inesperado al iniciar sesión. Inténtalo nuevamente más tarde.');
  }
};

export const logoutUserApi = async () => {
  const controller = loadAbort();

  try {
    const { data } = await axiosInstance.post(
      Routes.auth.LOGOUT,
      {},
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
    throw handleApiError(error, 'Ocurrió un error inesperado al cerrar sesión en el servidor.');
  }
};


export const meApi = async () => {
  const controller = loadAbort();

  try {
    const { data } = await axiosInstance.get(Routes.auth.ME, {
      withCredentials: true,
      signal: controller.signal,
    });

    if (data?.success !== true) {
      throw {
        code: 'INVALID_API_CONTRACT',
        message: 'Respuesta inesperada del servidor.',
      };
    }

    return data; 

  } catch (error) {
    throw handleApiError(error, 'Ocurrió un error inesperado en el servidor.');
  }
};

export const refreshApi = async () => {
  const controller = loadAbort();  

  try {
    const { data } = await axiosInstance.post(
      Routes.auth.TOKEN_REFRESH,
      {},
      { withCredentials: true, signal: controller.signal }
    );

    if (data?.success !== true) {
      throw {
        code: 'INVALID_API_CONTRACT',
        message: 'Respuesta inesperada del servidor.',
      };
    } 

    return data?.data;
  } catch (error) {
    console.warn("Refresh token failed:", error.message);
    throw handleApiError(error, 'Ocurrió un error inesperado al refrescar la sesión. Inténtalo de nuevo más tarde.');
  }
};

export const getSummaryDataApi = async (user) => {
  const controller = loadAbort(); 

  try {
    const { data } = await axiosInstance.get(
      `${Routes.auth.GET_SUMMARY_DATA}/${user.id}`,
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
    throw handleApiError(error, 'Ocurrió un error inesperado al obtener el resumen de datos del sistema.');
  }
};