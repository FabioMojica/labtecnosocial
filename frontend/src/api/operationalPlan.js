import { axiosInstance } from "./config";

import { loadAbort } from "../utils";
import { Routes } from "./config/routes";


export const getOperationalPlanOfProjectApi = async (id) => {
  const controller = loadAbort();
  try {
    const response = await axiosInstance.get(
      `${Routes.OPERATIONAL_PLAN}/${id}`,
      { signal: controller.signal }
    );

    if (response.status === 200) return response.data;
    return null;
  } catch (error) {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return null;
    if (error.response) throw new Error(error.response.data.message || "Error al obtener el plan operativo del proyecto");
    throw new Error("Error al intentar obtener el plan operativo del proyecto");
  }
};

export const saveOperationalRowsApi = async (projectId, rowsPayload) => {
  const controller = loadAbort();
  try { 
    const response = await axiosInstance.post(
      `${Routes.UPDATE_OPERATIONAL_PLAN}/${projectId}`,
      rowsPayload,
      { signal: controller.signal } 
    );
    if (response.status === 200) return response.data;
    return null;
  } catch (error) {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return null;
    if (error.response) throw new Error(error.response.data.message || "Error al guardar filas");
    throw new Error("Error al intentar guardar filas");
  }
};

export const deleteOperationalPlanningApi = async (projectId) => {
  const controller = loadAbort();
  try {
    const response = await axiosInstance.delete(`${Routes.DELETE_OPERATIONAL_PLAN}/${projectId}`, { signal: controller.signal });
    if (response.status === 200) return response.data;
    return null;
  } catch (error) {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return null;
    if (error.response) throw new Error(error.response.data.message || "Error al eliminar planificación operativa");
    throw new Error("Error al intentar eliminar planificación operativa");
  }
};
