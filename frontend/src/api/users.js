import { loadAbort } from "../utils";
import { axiosInstance } from "./config";
import { Routes } from "./config";

// Obtener todos los usuarios
export const getAllUsersApi = async () => {
  const controller = loadAbort();
  try { 
    const response = await axiosInstance.get(Routes.GET_ALL_USERS, { signal: controller.signal });
    console.log(response);
    if (response.status === 200) return response.data.users;
    return null;
  } catch (error) {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return null;
    if (error.response) throw new Error(error.response.data.message || "Error al obtener usuarios");
    throw new Error("Error al intentar obtener usuarios");
  }
};

// Obtener coordinadores
export const fetchCoordinatorsApi = async () => {
  const controller = loadAbort();
  try {
    const response = await axiosInstance.get(Routes.GET_COORDINATORS, { signal: controller.signal });
    if (response.status === 200) return response.data;
    return null;
  } catch (error) {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return null;
    if (error.response) throw new Error(error.response.data.message || "Error al obtener coordinadores");
    throw new Error("Error al intentar obtener coordinadores");
  }
};

// Obtener usuario por email
export const fetchUserByEmailApi = async (email) => {
  const controller = loadAbort();
  try {
    const response = await axiosInstance.get(`${Routes.GET_USER_BY_EMAIL}/${encodeURIComponent(email)}`, { signal: controller.signal });
    if (response.status === 200) return response.data;
    return null;
  } catch (error) {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return null;
    if (error.response) throw new Error(error.response.data.message || "Error al obtener el usuario");
    throw new Error("Error al intentar obtener el usuario");
  }
};

// Actualizar usuario
export const updateUserApi = async (email, data) => {
  const controller = loadAbort();
  try {
    const response = await axiosInstance.patch(`${Routes.UPDATE_USER}/${encodeURIComponent(email)}`, data, { signal: controller.signal });
    if (response.status === 200) return response.data;
    return null;
  } catch (error) {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return null;
    if (error.response) throw new Error(error.response.data.message || "Error al actualizar el usuario");
    throw new Error("Error al intentar actualizar el usuario");
  }
};

// Eliminar usuario
export const deleteUserApi = async ({ email, password, requesterEmail }) => {
  const controller = loadAbort();
  try {
    const response = await axiosInstance.delete(`${Routes.DELETE_USER}/${encodeURIComponent(email)}`, {
      data: { password, requesterEmail },
      signal: controller.signal,
    });
    if (response.status === 200) return response.data;
    return null;
  } catch (error) {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return null;
    if (error.response) throw new Error(error.response.data.message || "Error al eliminar el usuario");
    throw new Error("Error al intentar eliminar el usuario");
  }
};
