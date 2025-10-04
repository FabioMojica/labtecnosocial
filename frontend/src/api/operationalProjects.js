import { axiosInstance } from "./config";

import { loadAbort } from "../utils";
import { Routes } from "./config/routes";

export const createOperationalProjectApi = async (projectData) => {
  const controller = loadAbort();
  try {
    const response = await axiosInstance.post(
      Routes.CREATE_PROJECT,
      projectData,
      { signal: controller.signal }
    );

    if (response.status === 200) return response.data;
    return null;
  } catch (error) {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return null;
    if (error.response) throw new Error(error.response.data.message || "Error al crear el proyecto");
    throw new Error("Error al intentar crear el proyecto");
  }
};

export const getAllOperationalProjectsApi = async () => {
  const controller = loadAbort();
  try {
    const response = await axiosInstance.get(Routes.GET_ALL_PROJECTS, { signal: controller.signal });
    if (response.status === 200) return response.data.projects;
    return null;
  } catch (error) {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return null;
    if (error.response) throw new Error(error.response.data.message || "Error al obtener los proyectos");
    throw new Error("Error al intentar obtener los proyectos");
  }
};

export const getProjectByIdApi = async (id) => {
  const controller = loadAbort();
  try {
    const response = await axiosInstance.get(`${Routes.GET_PROJECT_BY_ID}/${id}`, { signal: controller.signal });
    if (response.status === 200) return response.data;
    return null;
  } catch (error) {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return null;
    if (error.response) throw new Error(error.response.data.message || "Error al obtener el proyecto");
    throw new Error("Error al intentar obtener el proyecto");
  }
};

export const deleteProjectByIdApi = async (id) => {
  const controller = loadAbort();
  try {
    const response = await axiosInstance.delete(`${Routes.DELETE_PROJECT}/${id}`, { signal: controller.signal });
    if (response.status === 200) return response.data;
    return null;
  } catch (error) {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return null;
    if (error.response) throw new Error(error.response.data.message || "Error al eliminar el proyecto");
    throw new Error("Error al intentar eliminar el proyecto");
  }
};

export const saveOperationalRowsApi = async (projectId, rowsPayload) => {
  const controller = loadAbort();
  try {
    const response = await axiosInstance.post(
      `${Routes.SAVE_ROWS}/${projectId}`,
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
    const response = await axiosInstance.delete(`${Routes.DELETE_OPERATIONAL_PLANNING}/${projectId}`, { signal: controller.signal });
    if (response.status === 200) return response.data;
    return null;
  } catch (error) {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return null;
    if (error.response) throw new Error(error.response.data.message || "Error al eliminar planificación operativa");
    throw new Error("Error al intentar eliminar planificación operativa");
  }
};

export const updateProjectApi = async (id, updatedData, file = null) => {
  const controller = loadAbort();
  try {
    const formData = new FormData();
    formData.append("name", updatedData.name);
    formData.append("description", updatedData.description);
    formData.append("image_url", updatedData.image_url || "");

    if (file) formData.append("file", file);
    else if (updatedData.image_url === "") formData.append("remove_image", "true");

    const response = await axiosInstance.patch(`${Routes.UPDATE_PROJECT}/${id}`, formData, { signal: controller.signal });
    if (response.status === 200) return response.data;
    return null;
  } catch (error) {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return null;
    if (error.response) throw new Error(error.response.data.message || "Error al actualizar proyecto");
    throw new Error("Error al intentar actualizar proyecto");
  }
};


export const removeResponsibleApi = async (projectId, responsibleId) => {
  const controller = loadAbort();
  try {
    const response = await axiosInstance.delete(`${Routes.REMOVE_RESPONSIBLE}/${projectId}/responsibles/${responsibleId}`, { signal: controller.signal });
    if (response.status === 200) return response.data;
    return null;
  } catch (error) {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return null;
    if (error.response) throw new Error(error.response.data.message || "Error al eliminar responsable");
    throw new Error("Error al intentar eliminar responsable");
  }
};

export const assignProjectResponsiblesApi = async ({ projectId, responsibles }) => {
  const controller = loadAbort();
  try {
    const response = await axiosInstance.post(
      `${Routes.ASSIGN_RESPONSIBLES}/${projectId}`,
      { responsibles },
      { signal: controller.signal }
    );
    if (response.status === 200) return response.data;
    return null;
  } catch (error) {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return null;
    if (error.response) throw new Error(error.response.data.message || "Error al asignar responsables");
    throw new Error("Error al intentar asignar responsables");
  }
};
