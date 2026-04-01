import { axiosInstance, Routes } from "./config";
import { loadAbort } from "../utils";

export const getGitHubRepositoriesApi = async () => {
  const controller = loadAbort();
  try {
    const response = await axiosInstance.get(Routes.github.REPOS, { signal: controller.signal });
    if (response.status === 200) return response.data;
    return null;
  } catch (error) {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return null;
    if (error.response)
      throw new Error(error.response.data.message || "Ocurrio un problema al obtener los repositorios de GitHub, intentalo de nuevo mas tarde");
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
