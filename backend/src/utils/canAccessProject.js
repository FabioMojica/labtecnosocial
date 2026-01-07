import { AppDataSource } from "../../data-source.js";
import { ProjectResponsible } from "../entities/ProjectResponsible.js";

export const canAccessProject = async ({ projectId, userId, role }) => {
  if (role === "admin") return true;

  if (role === "coordinator") {
    const count = await AppDataSource
      .getRepository(ProjectResponsible)
      .count({
        where: {
          operationalProject: { id: projectId },
          user: { id: userId },
        },
      });

    return count > 0;
  }

  return false;
};
