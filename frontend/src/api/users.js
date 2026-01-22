import { loadAbort } from "../utils";
import { axiosInstance } from "./config";
import { Routes } from "./config";
import { handleApiError } from "./config/handleApiError";

// Obtener todos los usuarios
export const getAllUsersApi = async () => {
  const controller = loadAbort();
  try {
    const { data } = await axiosInstance.get(Routes.users.GET_ALL_USERS, { signal: controller.signal });
  
    if (data?.success !== true) {
      throw {
        code: 'INVALID_API_CONTRACT',
        message: 'Respuesta inesperada del servidor.',
      };
    }
    return data?.data;
  } catch (error) {
    throw handleApiError(error, "Ocurrió un error inesperado al obtener los usuario. Inténtalo de nuevo más tarde.")
  }
};

export const getAllAdminsApi = async () => {
  const controller = loadAbort();
  try { 
    const { data } = await axiosInstance.get(Routes.users.GET_ALL_ADMINS, { signal: controller.signal });
  
    if (data?.success !== true) {
      throw {
        code: 'INVALID_API_CONTRACT',
        message: 'Respuesta inesperada del servidor.',
      };
    }
    return data?.data;
  } catch (error) {
    throw handleApiError(error, "Ocurrió un error inesperado al obtener los administradores. Inténtalo de nuevo más tarde.")
  }
};

// Obtener coordinadores
export const fetchCoordinatorsApi = async () => {
  const controller = loadAbort();
  try {
    const response = await axiosInstance.get(Routes.users.GET_COORDINATORS, { signal: controller.signal });
    if (response.status === 200) return response.data;
    return null;
  } catch (error) {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return null;
    if (error.response) throw new Error(error.response.data.message || "Error al obtener coordinadores");
    throw new Error("Error al intentar obtener coordinadores");
  }
};

export const getUserByEmailApi = async (email) => {
  const controller = loadAbort();
  try {
    const { data } = await axiosInstance.get(`${Routes.users.GET_USER_BY_EMAIL}/${encodeURIComponent(email)}`, { signal: controller.signal });

    if (data?.success !== true) {
      throw {
        code: 'INVALID_API_CONTRACT',
        message: 'Respuesta inesperada del servidor.',
      };
    }

    return data?.data;
  } catch (error) {
    throw handleApiError(error, "Ocurrió un error inesperado al obtener el usuario. Inténtalo de nuevo más tarde.")
  }
};

export const updateUserApi = async (originalEmail, userData) => {
  const controller = loadAbort();

  try {
    const { data } = await axiosInstance.patch(`${Routes.users.UPDATE_USER}/${encodeURIComponent(originalEmail)}`, userData);

    if (data?.success !== true) {
      throw {
        code: 'INVALID_API_CONTRACT',
        message: 'Respuesta inesperada del servidor.',
      }; 
    }

    return data?.data;
  } catch (error) {
    throw handleApiError(error, 'Ocurrió un error al actualizar el usaurio. Inténtalo de nuevo más tarde.');
  }
};

export const deleteUserApi = async ({ email, password, requesterEmail }) => {
  const controller = loadAbort();
  try {
    const { data } = await axiosInstance.delete(`${Routes.users.DELETE_USER}/${encodeURIComponent(email)}`, {
      data: { password, requesterEmail },
      signal: controller.signal,
    });

    if (data?.success !== true) {
      throw {
        code: 'INVALID_API_CONTRACT',
        message: 'Respuesta inesperada del servidor.',
      };
    }
    return data?.data;
  } catch (error) {
    console.log(error);
    throw handleApiError(error, 'Ocurrió un error al eliminar el usaurio. Inténtalo de nuevo más tarde.');
  }
};

export const createUserApi = async (userData) => {
  const controller = loadAbort();
  try {
    const { data } = await axiosInstance.post(
      Routes.users.CREATE_USER,
      userData,
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
    throw handleApiError(error, 'Ocurrió un error al crear el usaurio. Inténtalo de nuevo más tarde.');
  }
};
