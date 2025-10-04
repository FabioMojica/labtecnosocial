import { axiosInstance } from "./config";
import { loadAbort } from "../utils";
import { Routes } from "./config/routes";

export const loginUserApi = async (userData) => {
  const controller = loadAbort(); 

  try {
    const response = await axiosInstance.post(
      Routes.LOGIN,
      userData,
      { signal: controller.signal } 
    );

    if (response.status === 200) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") {
      console.log("Petición cancelada");
      return null;
    }

    if (error.response) {
      if (error.response.status === 401) {
        throw new Error('Credenciales incorrectas');
      }
      throw new Error(error.response.data.message || 'Error en la autenticación');
    }

    throw new Error('Error al intentar iniciar sesión');
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
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") {
      console.log("Petición cancelada");
      return null;
    }

    if (error.response) {
      throw new Error(error.response.data.message || "Error al cerrar sesión");
    }

    throw new Error("Error al intentar cerrar sesión");
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
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") {
      console.log("Petición cancelada");
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
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") {
      console.log("Petición cancelada");
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
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") {
      console.log("Petición cancelada");
      return null;
    }

    if (error.response) {
      throw new Error(error.response.data.message || "Error al obtener el resumen de datos");
    }

    throw new Error("Error al intentar obtener el resumen de datos");
  }
};