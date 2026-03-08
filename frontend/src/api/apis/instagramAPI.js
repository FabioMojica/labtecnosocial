import { Routes } from "../config";
import { handleApiError } from "../config/handleApiError";
import { axiosInstance } from "../config";

export const getInstagramOverview = async (instagramId) => {
  try {
    const { data } = await axiosInstance.get(
      Routes.instagram.PAGE_OVERVIEW(instagramId)
    );

    if (data?.success !== true) {
      throw {
        code: "INVALID_API_CONTRACT",
        message: "Respuesta inesperada del servidor.",
      };
    }

    return data?.data;
  } catch (error) {
    throw handleApiError(
      error,
      "Ocurrio un error inesperado al obtener el overview de Instagram."
    );
  }
};

export const getInstagramInsights = async (instagramId, timeRange) => {
  try {
    const { data } = await axiosInstance.get(
      Routes.instagram.PAGE_INSIGHTS(instagramId),
      {
        params: {
          range: timeRange,
        },
      }
    );

    if (data?.success !== true) {
      throw {
        code: "INVALID_API_CONTRACT",
        message: "Respuesta inesperada del servidor.",
      };
    }

    return data?.data;
  } catch (error) {
    throw handleApiError(
      error,
      "Ocurrio un error inesperado al obtener insights de Instagram."
    );
  }
};

export const getInstagramMedia = async (instagramId, timeRange) => {
  try {
    const { data } = await axiosInstance.get(
      Routes.instagram.PAGE_MEDIA(instagramId),
      {
        params: {
          range: timeRange,
        },
      }
    );

    if (data?.success !== true) {
      throw {
        code: "INVALID_API_CONTRACT",
        message: "Respuesta inesperada del servidor.",
      };
    }

    return data?.data;
  } catch (error) {
    throw handleApiError(
      error,
      "Ocurrio un error inesperado al obtener publicaciones de Instagram."
    );
  }
};
