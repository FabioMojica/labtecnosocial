import { Routes } from "../config";
import { handleApiError } from "../config/handleApiError";
import { axiosInstance } from "../config";

export const getXOverview = async (accountId) => {
  try {
    const { data } = await axiosInstance.get(
      Routes.x.ACCOUNT_OVERVIEW(accountId)
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
      "Ocurrio un error inesperado al obtener el overview de X."
    );
  }
};

export const getXTweets = async (accountId, timeRange) => {
  try {
    const { data } = await axiosInstance.get(
      Routes.x.ACCOUNT_TWEETS(accountId),
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
      "Ocurrio un error inesperado al obtener tweets de X."
    );
  }
};
