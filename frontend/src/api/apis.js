import { axiosInstance, Routes } from "./config";
import { loadAbort } from "../utils";

export const getGitHubRepositoriesApi = async () => {
  const controller = loadAbort();
  try {
    const response = await axiosInstance.get(Routes.GET_GITHUB_REPOS, { signal: controller.signal });
    if (response.status === 200) return response.data;
    return null;
  } catch (error) {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return null;
    if (error.response)
      throw new Error(error.response.data.message || "Ocurrió un problema al obtener los repositorios de GitHub, inténtalo de nuevo más tarde");
    throw new Error("Error al intentar obtener los repositorios de GitHub");
  }
}; 

export const getFacebookPagesApi = async () => {
  const controller = loadAbort();
  try {
    const response = await axiosInstance.get(Routes.GET_FACEBOOK_PAGES, { signal: controller.signal });
    if (response.status === 200) return response.data;
    return null;
  } catch (error) {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return null;
    if (error.response)
      throw new Error(error.response.data.message || "Ocurrió un problema al obtener las páginas de Facebook, inténtalo de nuevo más tarde");
    throw new Error("Error al intentar obtener las páginas de Facebook");
  }
};

export const getInstagramPagesApi = async () => {
  const controller = loadAbort();
  try {
    const response = await axiosInstance.get(Routes.GET_INSTAGRAM_PAGES, { signal: controller.signal });
    if (response.status === 200) return response.data;
    return null;
  } catch (error) {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return null;
    if (error.response)
      throw new Error(error.response.data.message || "Ocurrió un problema al obtener las páginas de Instagram, inténtalo de nuevo más tarde");
    throw new Error("Error al intentar obtener las páginas de Instagram");
  }
};

export const getXAccountsApi = async () => {
  const controller = loadAbort();
  try {
    const response = await axiosInstance.get(Routes.GET_X_ACCOUNTS, { signal: controller.signal });
    if (response.status === 200) return response.data;
    return null;
  } catch (error) {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return null;
    if (error.response)
      throw new Error(error.response.data.message || "Ocurrió un problema al obtener las cuentas de X, inténtalo de nuevo más tarde");
    throw new Error("Error al intentar obtener las cuentas de X");
  }
};
