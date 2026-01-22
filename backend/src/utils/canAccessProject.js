import { AppDataSource } from "../../data-source.js";
import { ALLOWED_ROLES } from "../config/allowedStatesAndRoles.js";
import { ProjectResponsible } from "../entities/ProjectResponsible.js";

export const canAccessProject = async ({ projectId, userId, role }) => {
  console.log(projectId, userId, role);
  if (ALLOWED_ROLES.superAdmin) return true;

  if (role === ALLOWED_ROLES.user) {
    const count = await AppDataSource
      .getRepository(ProjectResponsible)
      .count({
        where: {
          operationalProject: { id: projectId },
          user: { id: userId },
        },
      });

    console.log("count", count);

    return count > 0;
  }
 
  return false;
};
