import { axiosInstance } from "./config";
import { loadAbort } from "../utils";
import { Routes } from "./config/routes";

// Obtener todo
export const getAllStrategicPlansApi = async () => {
  const controller = loadAbort();
  try {
    const response = await axiosInstance.get(Routes.STRATEGIC_PLAN, { signal: controller.signal });
    if (response.status === 200) return response.data;
    return null;
  } catch (error) {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return null;
    if (error.response) throw new Error(error.response.data.message || "Error al obtener planes estratégicos");
    throw new Error("Error al intentar obtener planes estratégicos");
  }
};

// Obtener por año
export const getStrategicPlanByYearApi = async (year) => {
  const controller = loadAbort();
  try {
    const response = await axiosInstance.get(`${Routes.STRATEGIC_PLAN}/${year}`, { signal: controller.signal });
    if (response.status === 200) return response.data;
    return null;
  } catch (error) {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return null;
    if (error.response) throw new Error(error.response.data.message || "Error al obtener el plan estratégico");
    throw new Error("Error al intentar obtener el plan estratégico");
  }
};

// Actualizar o Crear
export const updateStrategicPlanApi = async (year, updatedData) => {
  const controller = loadAbort();
  try {
    console.log('Requesting URL:', `${Routes.STRATEGIC_PLAN}/${year}`);
    console.log('With data:', updatedData);
    
    const response = await axiosInstance.put(`${Routes.STRATEGIC_PLAN}/${year}`, updatedData);
    
    if (response.status === 200) {
      return response.data;
    }
    return null;
  } catch (error) {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return null;
    if (error.response) throw new Error(error.response.data.message || "Error al actualizar el plan estratégico");
    throw new Error("Error al intentar actualizar el plan estratégico");
  }
};

// Eliminar 
export const deleteStrategicPlanApi = async (year) => {
  const controller = loadAbort();
  try {
    const response = await axiosInstance.delete(`${Routes.DELETE_STRATEGIC_PLAN}/${year}`, { signal: controller.signal });
    if (response.status === 200) return response.data;
    return null;
  } catch (error) {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return null;
    if (error.response) throw new Error(error.response.data.message || "Error al eliminar el plan estratégico");
    throw new Error("Error al intentar eliminar el plan estratégico");
  }
};
