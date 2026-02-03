import { Routes } from "../config";
import { handleApiError } from "../config/handleApiError";
import { axiosInstance } from "../config";

export const getFacebookPageOverview = async (pageId) => {
  try {
    const { data } = await axiosInstance.get(
      Routes.facebook.PAGE_OVERVIEW(pageId)
    )

    if (data?.success !== true) {
      throw {
        code: 'INVALID_API_CONTRACT',
        message: 'Respuesta inesperada del servidor.',
      };
    }

    return data?.data;

  } catch (error) {
    throw handleApiError(error, "Ocurrió un error inesperado al obtener la descripción general de la página de facebook. Inténtalo de nuevo más tarde");
  }
};

export const getFacebookPageInsights = async (pageId, timeRange) => {
  try {
    const { data } = await axiosInstance.get(
      Routes.facebook.PAGE_INSIGHTS(pageId),
      {
        params: { 
          range: timeRange,
        }, 
      }
    )

    if (data?.success !== true) {
      throw {
        code: 'INVALID_API_CONTRACT',
        message: 'Respuesta inesperada del servidor.',
      };
    }

    return data?.data;

  } catch (error) {
    throw handleApiError(error, "Ocurrió un error inesperado al obtener la descripción general de la página de facebook. Inténtalo de nuevo más tarde");
  }
};

export const getFacebookPagePosts = async (pageId, timeRange) => {
  try {
    const { data } = await axiosInstance.get(
      Routes.facebook.PAGE_POSTS(pageId),
      {
        params: { 
          range: timeRange,
        }, 
      }
    )

    if (data?.success !== true) {
      throw {
        code: 'INVALID_API_CONTRACT',
        message: 'Respuesta inesperada del servidor.',
      };
    }

    return data?.data;

  } catch (error) {
    throw handleApiError(error, "Ocurrió un error inesperado al obtener la descripción general de la página de facebook. Inténtalo de nuevo más tarde");
  }
};