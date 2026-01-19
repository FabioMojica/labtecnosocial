import { axiosInstance } from "./config";
import { loadAbort } from "../utils";
import { Routes } from "./config/routes";
import { handleApiError } from "./config/handleApiError";

export const loginUserApi = async (userData) => {
  const controller = loadAbort();

  try {
    const { data }= await axiosInstance.post(
      Routes.LOGIN,
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
    const response = await axiosInstance.post(
      Routes.LOGOUT,
      {},
      { signal: controller.signal }
    );

    if (response.status === 200) {
      return response.data;
    } else {
      return null; 
    }
  } catch (error) {
    throw handleApiError(error, 'Ocurrió un error inesperado al cerrar sesión en el servidor.');
  }
};


export const meApi = async () => {
  const controller = loadAbort();

  try {
    const response = await axiosInstance.get(Routes.ME, {
      withCredentials: true,
      signal: controller.signal,
    });

    if (response.status === 200) return response.data;
    return null;
  } catch (error) {

    if (error.code === 'ECONNABORTED') {
      throw new Error('La petición tardó demasiado. Por favor intenta de nuevo.');
    }

    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") {
      return null;
    }

    if (error.response) {
      throw new Error(error.response.data.message || "Error al obtener el usuario");
    }

    throw new Error("Error al intentar obtener el usuario");
  }
};

export const refreshApi = async () => {
  const controller = loadAbort();

  try {
    const response = await axiosInstance.post(
      Routes.TOKEN_REFRESH,
      {},
      { withCredentials: true, signal: controller.signal }
    );

    if (response.status === 200) return response.data;
    return null;
  } catch (error) {

    if (error.code === 'ECONNABORTED') {
      throw new Error('La petición tardó demasiado. Por favor intenta de nuevo.');
    }

    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") {
      return null;
    }

    if (error.response) {
      console.warn("Refresh token failed:", error.response.data.message);
      return null;
    }

    console.warn("Refresh token failed:", error.message);
    return null;
  }
};

export const getSummaryDataApi = async (user) => {
  const controller = loadAbort();

  try {
    const response = await axiosInstance.get(
      `${Routes.GET_SUMMARY_DATA}/${user.id}`,
      { signal: controller.signal }
    );

    if (response.status === 200) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {

    if (error.code === 'ECONNABORTED') {
      throw new Error('La petición tardó demasiado. Por favor intenta de nuevo.');
    }

    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") {
      return null;
    }

    if (error.response) {
      throw new Error(error.response.data.message || "Error al obtener el resumen de datos");
    }

    throw new Error("Error al intentar obtener el resumen de datos");
  }
};