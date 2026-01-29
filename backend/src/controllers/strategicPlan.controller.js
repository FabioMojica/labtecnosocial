import { AppDataSource } from '../../data-source.js';
import { StrategicPlan } from '../entities/StrategicPlan.js';
import { OperationalProject } from '../entities/OperationalProject.js';
import { Objective } from '../entities/Objetive.js';
import { Indicator } from '../entities/Indicator.js';
import { Program } from '../entities/Program.js';
import { ERROR_CODES, errorResponse, successResponse } from '../utils/apiResponse.js';

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
    return (
      successResponse(
        res,
        plans,
        'Planes estratégicos recuperados exitosamente.',
        200
      )
    );
  } catch (error) {
    return errorResponse(
      res,
      ERROR_CODES.SERVER_ERROR,
      'Error del servidor.',
      500
    );
  }
};

export const getStrategicPlanByYear = async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    if (isNaN(year)) {
      return errorResponse(
        res,
        ERROR_CODES.VALIDATION_ERROR,
        'Año inválido.',
        400
      );
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
      return errorResponse(
        res,
        ERROR_CODES.RESOURCE_NOT_FOUND,
        'No se encontró plan estratégico para ese año.',
        404
      );
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

    return (
      successResponse(
        res,
        plan,
        'Planes estratégicos recuperados exitosamente.',
        200
      )
    );

  } catch (error) {
    return errorResponse(
      res,
      ERROR_CODES.SERVER_ERROR,
      'Error del servidor.',
      500
    );
  }
};

export const updateStrategicPlan = async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    if (isNaN(year)) {
      return errorResponse(
        res,
        ERROR_CODES.VALIDATION_ERROR,
        'Año inválido.',
        400
      );
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
        return errorResponse(
          res,
          ERROR_CODES.VERSION_ERROR,
          'Error al actualizar el plan estratégico: asegúrate de estar trabajando sobre la última versión del plan refrescando la página.',
          409
        );
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
              return errorResponse(
                res,
                ERROR_CODES.RESOURCE_ERROR,
                {
                  message: 'El proyecto ya está asignado a un programa diferente.',
                  projectName: project.name || project.title || 'Nombre no disponible',
                  assignedProgramName:
                    project.program.description || project.program.name || 'Nombre programa no disponible',
                  year,
                },
                400
              );
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
      return (
        successResponse(
          res,
          null,
          'El plan se ha limpiado exitosamente.',
          200
        )
      );
    }

    return (
      successResponse(
        res,
        { ...updatedPlan, plan_version: updatedPlan.plan_version },
        'Plan estratégico actualizado correctemente.',
        200
      )
    );

  } catch (error) {
    return errorResponse(
      res,
      ERROR_CODES.SERVER_ERROR,
      'Error del servidor.',
      500
    );
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
      return errorResponse(
        res,
        ERROR_CODES.RESOURCE_NOT_FOUND,
        'Plan estratégico no encontrado.',
        404
      );
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

    return (
      successResponse(
        res,
        null,
        'Plan estratégico eliminado exitosamente.',
        200
      )
    );
  } catch (error) {
    return errorResponse(
      res,
      ERROR_CODES.SERVER_ERROR,
      'Error del servidor.',
      500
    );
  }
};