import { AppDataSource } from '../../data-source.js';
import { StrategicPlan } from '../entities/StrategicPlan.js';
import { OperationalProject } from '../entities/OperationalProject.js';
import { Objective } from '../entities/Objetive.js';
import { Indicator } from '../entities/Indicator.js';
import { Program } from '../entities/Program.js';

export const getAllStrategicPlans = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(StrategicPlan);
    const plans = await repo.find({
      select: {
        id: true,
        year: true,
      },
      order: {
        year: 'ASC',
      },
    });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo planes estratégicos', error });
  }
};

export const getStrategicPlanByYear = async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    if (isNaN(year)) {
      return res.status(400).json({ message: 'Año inválido' });
    }

    const repo = AppDataSource.getRepository(StrategicPlan);
    const plan = await repo.createQueryBuilder('plan')
      .leftJoinAndSelect('plan.objectives', 'objective')
      .leftJoinAndSelect('objective.indicators', 'indicator')
      .leftJoinAndSelect('objective.programs', 'program')
      .leftJoinAndSelect('program.operationalProjects', 'operationalProject')
      .leftJoinAndSelect('operationalProject.operationalRows', 'operationalRow')
      .leftJoinAndSelect('operationalProject.projectResponsibles', 'projectResponsible')
      .where('plan.year = :year', { year })
      .getOne();

    if (!plan) {
      return res.status(404).json({ message: 'No se encontró plan estratégico para ese año' });
    }

    plan.objectives.forEach(objetivo => {
      objetivo.programs.forEach(programa => {
        programa.operationalProjects = programa.operationalProjects.map(proyecto => ({
          id: proyecto.id,
          name: proyecto.name,
          description: proyecto.description,
          image_url: proyecto.image_url,
        }));
      });
    });

    res.json(plan);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error obteniendo el plan estratégico para ese año', error });
  }
};

export const updateStrategicPlan = async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    if (isNaN(year)) {
      return res.status(400).json({ message: 'Año inválido' });
    }

    const { mission, objectives, plan_version: clientVersion } = req.body;
    const repo = AppDataSource.getRepository(StrategicPlan);

    let planTouched = false;
 
    let plan = await repo.findOne({
      where: { year },
      relations: [
        'objectives',
        'objectives.indicators',
        'objectives.programs',
        'objectives.programs.operationalProjects',
      ],
    });

    if (!plan) {
      plan = await repo.save({ year, mission, plan_version: 0 });
      planTouched = true;
    } else {
      if (plan.plan_version > clientVersion) {
        return res.status(409).json({
          message: "Error al actualizar el plan estratégico: asegúrate de estar trabajando sobre la última versión del plan refrescando la página.",
          currentVersion: plan.plan_version,
        });
      }

      plan.mission = mission;
      await repo.save(plan);
      planTouched = true;
    }

    const validIncomingObjectiveIds = (objectives || [])
      .map(o => parseInt(o.id))
      .filter(id => Number.isInteger(id) && id > 0);

    if (plan.objectives) {
      for (const oldObjective of plan.objectives) {
        if (!validIncomingObjectiveIds.includes(oldObjective.id)) {
          await AppDataSource.getRepository(Objective).delete(oldObjective.id);
          planTouched = true;
        }
      }
    }

    for (const objData of objectives || []) {
      const objectiveRepo = AppDataSource.getRepository(Objective);
      const indicatorRepo = AppDataSource.getRepository(Indicator);
      const programRepo = AppDataSource.getRepository(Program);
      const projectRepo = AppDataSource.getRepository(OperationalProject);

      const objId = parseInt(objData.id);
      const isExistingObjective = Number.isInteger(objId) && objId > 0;

      let objective = isExistingObjective
        ? await objectiveRepo.findOne({
          where: { id: objId },
          relations: ['indicators', 'programs', 'programs.operationalProjects'],
        })
        : null;

      if (!objective) {
        objective = await objectiveRepo.save({
          title: objData.objectiveTitle,
          strategicPlan: plan,
        });
        planTouched = true;
      } else {
        objective.title = objData.objectiveTitle;
        objective = await objectiveRepo.save(objective);
        planTouched = true;
      }

      const incomingIndicators = objData.indicators || [];
      const incomingIndicatorIds = incomingIndicators
        .map(i => parseInt(i.id))
        .filter(id => Number.isInteger(id) && id > 0);

      const existingIndicators = objective.indicators || [];
      for (const oldInd of existingIndicators) {
        if (!incomingIndicatorIds.includes(oldInd.id)) {
          await indicatorRepo.delete(oldInd.id);
          planTouched = true;
        }
      }

      for (const indData of incomingIndicators) {
        const indId = parseInt(indData.id);
        const isExistingIndicator = Number.isInteger(indId) && indId > 0;

        if (isExistingIndicator) {
          const existing = await indicatorRepo.findOneBy({ id: indId });
          if (existing) {
            existing.concept = indData.concept;
            existing.amount = indData.amount;
            await indicatorRepo.save(existing);
            planTouched = true;
          }
        } else {
          await indicatorRepo.save({
            concept: indData.concept,
            amount: indData.amount,
            objective: objective,
          });
          planTouched = true;
        }
      }

      const incomingPrograms = objData.programs || [];
      const incomingProgramIds = incomingPrograms
        .map(p => parseInt(p.id))
        .filter(id => Number.isInteger(id) && id > 0);

      const existingPrograms = objective.programs || [];
      for (const oldProg of existingPrograms) {
        if (!incomingProgramIds.includes(oldProg.id)) {
          await programRepo.delete(oldProg.id);
          planTouched = true;
        }
      }

      for (const progData of incomingPrograms) {
        const progId = parseInt(progData.id);
        const isExistingProgram = Number.isInteger(progId) && progId > 0;

        let program = isExistingProgram
          ? await programRepo.findOne({
            where: { id: progId },
            relations: ['operationalProjects'],
          })
          : null;

        if (!program) {
          program = await programRepo.save({
            description: progData.programDescription,
            objective: objective,
          });
          planTouched = true;
        } else {
          program.description = progData.programDescription;
          program = await programRepo.save(program);
          planTouched = true;
        }

        const incomingProjects = progData.operationalProjects || [];
        const incomingProjectIds = incomingProjects
          .map(p => parseInt(p.id))
          .filter(id => Number.isInteger(id) && id > 0);

        const existingProjects = program.operationalProjects || [];
        for (const oldProj of existingProjects) {
          if (!incomingProjectIds.includes(oldProj.id)) {
            oldProj.program = null;
            await projectRepo.save(oldProj);
            planTouched = true;
          }
        }

        for (const projData of incomingProjects) {
          const projId = parseInt(projData.id);
          const isExistingProject = Number.isInteger(projId) && projId > 0;

          if (!isExistingProject) continue;

          const project = await projectRepo.findOne({
            where: { id: projId },
            relations: ['program'],
          });

          if (project) {
            if (project.program && project.program.id !== program.id) {
              return res.status(400).json({
                message: 'El proyecto ya está asignado a un programa diferente.',
                projectName: project.name || project.title || 'Nombre no disponible',
                assignedProgramName:
                  project.program.description || project.program.name || 'Nombre programa no disponible',
                year,
              });
            }

            project.program = program;
            await projectRepo.save(project);
            planTouched = true;
          } else {
            console.warn(`Proyecto con ID ${projData.id} no encontrado`);
          }
        }
      }
    }

    if (planTouched) {
      await repo.increment({ id: plan.id }, 'plan_version', 1);
    }


    const updatedPlan = await repo.findOne({
      where: { year },
      relations: [
        'objectives',
        'objectives.indicators',
        'objectives.programs',
        'objectives.programs.operationalProjects',
      ],
    });

    const planIsEmpty = (!mission || mission.trim() === '') && (!updatedPlan?.objectives || updatedPlan.objectives.length === 0);

    if (planIsEmpty) {
      await repo.delete(plan.id);
      return res.status(200).json(null);
    }

    return res.status(200).json({
      ...updatedPlan,
      plan_version: updatedPlan.plan_version
    });

  } catch (error) { 
    console.error('Error al actualizar plan estratégico:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};


export const deleteStrategicPlanByYear = async (req, res) => {
  const { year } = req.params;

  try {
    const plan = await AppDataSource.getRepository(StrategicPlan).findOne({
      where: { year: parseInt(year) },
      relations: {
        objectives: {
          programs: {
            operationalProjects: true,
          },
        },
      },
    });

    if (!plan) {
      return res.status(404).json({ message: 'Plan estratégico no encontrado' });
    }

    for (const objective of plan.objectives || []) {
      for (const program of objective.programs || []) {
        for (const project of program.operationalProjects || []) {
          project.program = null;
          await AppDataSource.manager.save(OperationalProject, project);
        }
      }
    }

    await AppDataSource.getRepository(StrategicPlan).remove(plan);

    return res.status(200).json({ message: 'Plan estratégico eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar el plan estratégico:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};


export const deleteStrategicPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const repo = AppDataSource.getRepository(StrategicPlan);
    const result = await repo.delete(id);
    if (result.affected === 0) return res.status(404).json({ message: 'No se puedo eliminar el plan estratégico, no fué encontrado' });
    res.json({ message: 'Strategic plan deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el plan estratégico', error });
  }
};

