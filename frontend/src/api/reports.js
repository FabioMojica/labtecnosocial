import { axiosInstance } from "./config";
import { loadAbort } from "../utils";
import { Routes } from "./config/routes";
import { handleApiError } from "./config/handleApiError";

// Obtener todo
export const getAllReportsApi = async () => {
  const controller = loadAbort();
  try {
    const { data } = await axiosInstance.get(Routes.reports.REPORTS, { signal: controller.signal });

    if (data?.success !== true) {
      throw { 
        code: 'INVALID_API_CONTRACT',
        message: 'Respuesta inesperada del servidor.', 
      };
    }

    return data?.data;
  } catch (error) {
    throw handleApiError(error, 'Error al intentar obtener los reportes. Inténtalo de nuevo más tarde.');
  }
};

export const getReportByIdApi = async (reportId) => {
  const controller = loadAbort();
  try {
    const { data } = await axiosInstance.get(Routes.reports.GET_REPORT(reportId), { signal: controller.signal });
    
    if (data?.success !== true) {
      throw {
        code: 'INVALID_API_CONTRACT',
        message: 'Respuesta inesperada del servidor.',
      };
    }
    return data?.data;
  } catch (error) {
    throw handleApiError(error, 'Error al intentar obtener el plan estratégico del año.');
  }
};

export const createReportApi = async (updatedData) => {
  const controller = loadAbort();
  try {
    const { data } = await axiosInstance.post(Routes.reports.CREATE_REPORT, updatedData);

    if (data?.success !== true) {
      throw {
        code: 'INVALID_API_CONTRACT',
        message: 'Respuesta inesperada del servidor.',
      };
    }

    return data?.data;

  } catch (error) { 
    throw handleApiError(error, 'Error al intentar crear el reporte. Inténtalo de nuevo más tarde.');
  }
};
 

export const updateReportApi = async (reportId, updatedData) => {
    console.log("akakakakaa", reportId)
  const controller = loadAbort();
  try {
    const { data } = await axiosInstance.put(Routes.reports.SAVE_REPORT(reportId), updatedData);

    if (data?.success !== true) {
      throw {
        code: 'INVALID_API_CONTRACT',
        message: 'Respuesta inesperada del servidor.',
      };
    }

    return data?.data;

  } catch (error) { 
    throw handleApiError(error, 'Error al intentar guardar el reporte. Inténtalo de nuevo más tarde.');
  }
};

export const deleteReportApi = async (reportId) => {
  const controller = loadAbort();
  try {
    const { data } = await axiosInstance.delete(Routes.reports.DELETE_REPORT(reportId), { signal: controller.signal });

    if (data?.success !== true) {
      throw {
        code: 'INVALID_API_CONTRACT',
        message: 'Respuesta inesperada del servidor.',
      };
    }

    return data?.data;
 
  } catch (error) { 
    console.log(error);
    throw handleApiError(error, 'Error al intentar eliminar el reporte. Inténtalo de nuevo más tarde.');
  }
};
