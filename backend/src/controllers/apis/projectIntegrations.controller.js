import { AppDataSource } from "../../../data-source.js";
import { OperationalProject } from "../../entities/OperationalProject.js";
import { ProjectIntegration } from "../../entities/ProjectIntegration.js";
import { canAccessProject } from "../../utils/canAccessProject.js";
import { ERROR_CODES, errorResponse, successResponse } from "../../utils/apiResponse.js";

const SUPPORTED_SOCIAL_PLATFORMS = new Set(["github", "facebook", "instagram"]);

export const updateProjectIntegrations = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { toCreate = [], toUpdate = [], toDelete = [] } = req.body;
    const parsedProjectId = Number(projectId);

    if (!Number.isInteger(parsedProjectId)) {
      return errorResponse(
        res,
        ERROR_CODES.VALIDATION_ERROR,
        "El id del proyecto no es valido.",
        400
      );
    }

    const projectRepository = AppDataSource.getRepository(OperationalProject);
    const integrationRepository = AppDataSource.getRepository(ProjectIntegration);

    const project = await projectRepository.findOne({
      where: { id: parsedProjectId },
      relations: ["integrations"],
    });

    if (!project) {
      return errorResponse(
        res,
        ERROR_CODES.RESOURCE_NOT_FOUND,
        "Proyecto no encontrado.",
        404
      );
    }

    const hasAccess = await canAccessProject({
      projectId: parsedProjectId,
      userId: req.user.id,
      role: req.user.role,
    });

    if (!hasAccess) {
      return errorResponse(
        res,
        ERROR_CODES.USER_UNAUTHORIZED,
        "No tienes permisos para modificar este proyecto.",
        403
      );
    }

    const existingById = new Map(project.integrations.map((integration) => [integration.id, integration]));
    const getIntegrationId = (item) => Number((item && typeof item === "object") ? item.id : item);

    for (const del of toDelete) {
      const integrationId = getIntegrationId(del);
      if (!Number.isInteger(integrationId)) {
        return errorResponse(
          res,
          ERROR_CODES.VALIDATION_ERROR,
          "Existe una integracion con id invalido para eliminar.",
          400
        );
      }

      if (!existingById.has(integrationId)) {
        return errorResponse(
          res,
          ERROR_CODES.USER_UNAUTHORIZED,
          "No puedes eliminar integraciones de otro proyecto.",
          403
        );
      }

      await integrationRepository.delete(integrationId);
    }

    for (const upd of toUpdate) {
      const integrationId = getIntegrationId(upd);
      if (!Number.isInteger(integrationId)) {
        return errorResponse(
          res,
          ERROR_CODES.VALIDATION_ERROR,
          "Existe una integracion con id invalido para actualizar.",
          400
        );
      }

      const existingIntegration = existingById.get(integrationId);
      if (!existingIntegration) {
        return errorResponse(
          res,
          ERROR_CODES.USER_UNAUTHORIZED,
          "No puedes actualizar integraciones de otro proyecto.",
          403
        );
      }

      existingIntegration.name = upd.name ?? existingIntegration.name;
      existingIntegration.url = upd.url ?? existingIntegration.url;
      await integrationRepository.save(existingIntegration);
    }

    if (toCreate.length) {
      const validToCreate = toCreate.filter((i) =>
        SUPPORTED_SOCIAL_PLATFORMS.has(i?.platform)
      );
      if (validToCreate.length) {
        const newIntegrations = validToCreate.map((i) =>
          integrationRepository.create({ ...i, project })
        );
        await integrationRepository.save(newIntegrations);
      }
    }

    await projectRepository.update(project.id, { updated_at: () => 'NOW()' });

    const updatedProject = await projectRepository.findOne({
      where: { id: project.id },
      relations: ["integrations"],
    });

    return successResponse(
      res,
      { project: updatedProject },
      "Integraciones actualizadas.",
      200
    );
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      ERROR_CODES.SERVER_ERROR,
      "Error al actualizar integraciones.",
      500
    );
  }
};
