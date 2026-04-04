import { axiosInstance, Routes } from "./config";
import { loadAbort } from "../utils";

export const getGitHubRepositoriesApi = async () => {
  const controller = loadAbort();
  try {
    const response = await axiosInstance.get(Routes.github.REPOS, { signal: controller.signal });
    if (response.status === 200) {
      const payload = response.data;

      if (Array.isArray(payload)) return payload; // backward compatibility
      if (payload?.success === true && Array.isArray(payload?.data)) return payload.data;

      throw new Error("Respuesta inesperada al obtener repositorios de GitHub");
    }
    return null;
  } catch (error) {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return null;
    if (error.response) {
      const apiMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.message;
      throw new Error(apiMessage || "Ocurrio un problema al obtener los repositorios de GitHub, intentalo de nuevo mas tarde");
    }
    throw new Error("Error al intentar obtener los repositorios de GitHub");
  }
};

export const getFacebookPagesApi = async () => {
  const controller = loadAbort();
  try {
    const response = await axiosInstance.get(Routes.facebook.PAGES, { signal: controller.signal });
    if (response.status === 200) return response.data;
    return null;
  } catch (error) {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return null;
    if (error.response)
      throw new Error(error.response.data.message || "Ocurrio un problema al obtener las paginas de Facebook, intentalo de nuevo mas tarde");
    throw new Error("Error al intentar obtener las paginas de Facebook");
  }
};

export const getInstagramPagesApi = async () => {
  const controller = loadAbort();
  try {
    const response = await axiosInstance.get(Routes.instagram.PAGES, { signal: controller.signal });
    if (response.status === 200) return response.data;
    return null;
  } catch (error) {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return null;
    if (error.response)
      throw new Error(error.response.data.message || "Ocurrio un problema al obtener las paginas de Instagram, intentalo de nuevo mas tarde");
    throw new Error("Error al intentar obtener las paginas de Instagram");
  }
};
