import { AppDataSource } from "../../data-source.js";
import { ALLOWED_ROLES } from "../config/allowedStatesAndRoles.js";
import { ProjectResponsible } from "../entities/ProjectResponsible.js";

export const canAccessProject = async ({ projectId, userId, role }) => {
  const normalizedProjectId = Number(projectId);
  if (!Number.isInteger(normalizedProjectId)) return false;

  if (role === ALLOWED_ROLES.superAdmin || role === ALLOWED_ROLES.admin) {
    return true;
  }

  if (role !== ALLOWED_ROLES.user) return false;

  const count = await AppDataSource
    .getRepository(ProjectResponsible)
    .count({
      where: {
        operationalProject: { id: normalizedProjectId },
        user: { id: userId },
      },
    });

  return count > 0;
};
