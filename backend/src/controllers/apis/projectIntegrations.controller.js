import { AppDataSource } from "../../../data-source.js";
import { OperationalProject } from "../../entities/OperationalProject.js";
import { ProjectIntegration } from "../../entities/ProjectIntegration.js";

export const updateProjectIntegrations = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { toCreate = [], toUpdate = [], toDelete = [] } = req.body;

    const projectRepository = AppDataSource.getRepository(OperationalProject);
    const integrationRepository = AppDataSource.getRepository(ProjectIntegration);

    const project = await projectRepository.findOne({
      where: { id: parseInt(projectId) },
      relations: ["integrations"],
    });

    if (!project) return res.status(404).json({ message: "Proyecto no encontrado" });

    for (const del of toDelete) {
      await integrationRepository.delete(del.id);
    }

    for (const upd of toUpdate) {
      await integrationRepository.update(upd.id, { name: upd.name, url: upd.url });
    }

    if (toCreate.length) {
      const newIntegrations = toCreate.map(i => integrationRepository.create({ ...i, project }));
      await integrationRepository.save(newIntegrations);
    }

    await projectRepository.update(project.id, { updated_at: () => 'NOW()' });

    const updatedProject = await projectRepository.findOne({
      where: { id: project.id },
      relations: ["integrations"],
    });

    return res.json({ message: "Integraciones actualizadas", project: updatedProject });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al actualizar integraciones" });
  }
};