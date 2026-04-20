import { AppDataSource } from '../../data-source.js';
import { OperationalProject } from '../entities/OperationalProject.js';
import { OperationalRow } from '../entities/OperationalRow.js';
import { In } from 'typeorm';
import { isRowEmpty } from '../utils/isRowEmpty.js';
import { canAccessProject } from '../utils/canAccessProject.js';
import { errorResponse, successResponse, ERROR_CODES } from "../utils/apiResponse.js"


export const getOperationalPlanOfProject = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedProjectId = Number(id);

    if (!Number.isInteger(parsedProjectId)) {
      return errorResponse(
        res,
        ERROR_CODES.VALIDATION_ERROR,
        'ID de proyecto inválido.',
        400
      );
    }

    const rowRepository = AppDataSource.getRepository(OperationalRow);
    const projectRepository = AppDataSource.getRepository(OperationalProject);

    const project = await projectRepository.findOneBy({ id: parsedProjectId });
    if (!project) {
      return errorResponse(
        res,
        ERROR_CODES.RESOURCE_NOT_FOUND,
        'No se encontró el proyecto para obtener su plan operativo.',
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
        'No tienes permisos para acceder a este plan operativo.',
        403
      );
    }

    const rows = await rowRepository.find({
      where: { operationalProject: { id: parsedProjectId } },
      order: { id: 'ASC' },
    });

    return (
      successResponse(
        res,
        {
          rows,
          operationalPlan_version: project.operationalPlan_version,
          operationalPlan_created_at: project.operationalPlan_created_at,
          operationalPlan_updated_at: project.operationalPlan_updated_at,
        },
        'Plan operativo recuperado exitosamente.',
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

export const saveOperationalPlanOfProject = async (req, res) => {
  const queryRunner = AppDataSource.createQueryRunner();

  try {
    const { id: projectId } = req.params;
    const parsedProjectId = Number(projectId);
    const {
      operationalPlan_version: clientVersion,
      create = [],
      update = [],
      delete: deleteIds = []
    } = req.body;

    if (!Number.isInteger(parsedProjectId)) {
      return errorResponse(
        res,
        ERROR_CODES.VALIDATION_ERROR,
        'ID de proyecto inválido.',
        400
      );
    }

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const rowRepository = queryRunner.manager.getRepository(OperationalRow);
    const projectRepository = queryRunner.manager.getRepository(OperationalProject);

    const project = await projectRepository.findOneBy({ id: parsedProjectId });

    if (!project) {
      await queryRunner.rollbackTransaction();
      return errorResponse(
        res,
        ERROR_CODES.RESOURCE_NOT_FOUND,
        'No se encontró el proyecto para guardar su plan operativo.',
        404
      );
    }

    const hasAccess = await canAccessProject({
      projectId: parsedProjectId,
      userId: req.user.id,
      role: req.user.role,
    });

    if (!hasAccess) {
      await queryRunner.rollbackTransaction();
      return errorResponse(
        res,
        ERROR_CODES.USER_UNAUTHORIZED,
        'No tienes permisos para editar este plan operativo.',
        403
      );
    }

    if (clientVersion < project.operationalPlan_version) {
      await queryRunner.rollbackTransaction();
      return errorResponse(
        res,
        ERROR_CODES.VERSION_ERROR,
        "Error al actualizar el plan operativo: asegurate de estar trabajando sobre la ultima version del plan refrescando la pagina.",
        409
      );
    }

    if (deleteIds.length > 0) {
      const normalizedDeleteIds = deleteIds.map((id) => Number(id));
      const hasInvalidDeleteIds = normalizedDeleteIds.some((id) => !Number.isInteger(id));

      if (hasInvalidDeleteIds) {
        await queryRunner.rollbackTransaction();
        return errorResponse(
          res,
          ERROR_CODES.VALIDATION_ERROR,
          'Existe una fila con id inválido para eliminar.',
          400
        );
      }

      const rowsBelongingToProject = await rowRepository.find({
        where: {
          id: In(normalizedDeleteIds),
          operationalProject: { id: parsedProjectId },
        },
      });

      if (rowsBelongingToProject.length !== normalizedDeleteIds.length) {
        await queryRunner.rollbackTransaction();
        return errorResponse(
          res,
          ERROR_CODES.USER_UNAUTHORIZED,
          'No puedes eliminar filas de otro proyecto.',
          403
        );
      }

      await rowRepository.delete(normalizedDeleteIds);
    }

    for (const rowData of update) {
      if (isRowEmpty(rowData)) {
        continue;
      }

      const rowId = Number(rowData.id);
      if (!Number.isInteger(rowId)) {
        await queryRunner.rollbackTransaction();
        return (
          errorResponse(
            res,
            ERROR_CODES.VALIDATION_ERROR,
            'Existe una fila con id inválido para actualizar.',
            400,
          )
        );
      }

      const existingRow = await rowRepository.findOne({
        where: {
          id: rowId,
          operationalProject: { id: parsedProjectId },
        }
      });
      if (!existingRow) {
        await queryRunner.rollbackTransaction();
        return (
          errorResponse(
            res,
            ERROR_CODES.RESOURCE_NOT_FOUND,
            `Fila del plan operativo ${rowData.id} no encontrada`,
            404,
          )
        );
      }

      existingRow.objective = rowData.objective;
      existingRow.indicator_amount = rowData.indicator_amount;
      existingRow.indicator_concept = rowData.indicator_concept;
      existingRow.team = rowData.team;
      existingRow.resources = rowData.resources;
      existingRow.budget_amount = rowData.budget_amount;
      existingRow.budget_description = rowData.budget_description;
      existingRow.period_start = rowData.period_start;
      existingRow.period_end = rowData.period_end;

      await rowRepository.save(existingRow);
    }

    for (const rowData of create) {
      if (isRowEmpty(rowData)) {
        continue;
      }
      const newRow = rowRepository.create({
        objective: rowData.objective,
        indicator_amount: rowData.indicator_amount,
        indicator_concept: rowData.indicator_concept,
        team: rowData.team,
        resources: rowData.resources,
        budget_amount: rowData.budget_amount,
        budget_description: rowData.budget_description,
        period_start: rowData.period_start,
        period_end: rowData.period_end,
        operationalProject: project,
      });
      await rowRepository.save(newRow);

      if (!project.operationalPlan_created_at) {
        project.operationalPlan_created_at = new Date();
      }
    }
    project.operationalPlan_updated_at = new Date();

    await projectRepository.save(project);
    await projectRepository.increment({ id: project.id }, 'operationalPlan_version', 1);
    const updatedProject = await projectRepository.findOneBy({ id: project.id });

    await queryRunner.commitTransaction();

    const savedRows = await rowRepository.find({
      where: { operationalProject: { id: parsedProjectId } },
    });

    return (
      successResponse(
        res,
        {
          savedRows,
          operationalPlan_version: updatedProject.operationalPlan_version,
          operationalPlan_created_at: updatedProject.operationalPlan_created_at,
          operationalPlan_updated_at: updatedProject.operationalPlan_updated_at,
        },
        'Plan operativo guardado exitosamente.',
        200
      )
    );
  } catch (error) {
    await queryRunner.rollbackTransaction();
    return errorResponse(
      res,
      ERROR_CODES.SERVER_ERROR,
      'Error del servidor.',
      500
    );
  } finally {
    await queryRunner.release();
  }
};


export const deleteOperationalPlanOfProject = async (req, res) => {
  const { id } = req.params;
  const parsedProjectId = Number(id);
  const queryRunner = AppDataSource.createQueryRunner();

  try {
    if (!Number.isInteger(parsedProjectId)) {
      return errorResponse(
        res,
        ERROR_CODES.VALIDATION_ERROR,
        'ID de proyecto inválido.',
        400
      );
    }

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const projectRepository = queryRunner.manager.getRepository(OperationalProject);
    const rowRepository = queryRunner.manager.getRepository(OperationalRow);

    const project = await projectRepository.findOneBy({ id: parsedProjectId });

    if (!project) {
      await queryRunner.rollbackTransaction();
      return errorResponse(
        res,
        ERROR_CODES.RESOURCE_NOT_FOUND,
        'Error al eliminar el plan operativo: No se encontró el proyecto seleccionado en el sistema.',
        404
      );
    }

    const hasAccess = await canAccessProject({
      projectId: parsedProjectId,
      userId: req.user.id,
      role: req.user.role,
    });

    if (!hasAccess) {
      await queryRunner.rollbackTransaction();
      return errorResponse(
        res,
        ERROR_CODES.USER_UNAUTHORIZED,
        'No tienes permisos para eliminar este plan operativo.',
        403
      );
    }

    const rowsToDelete = await rowRepository.find({
      where: { operationalProject: { id: parsedProjectId } },
    });

    if (rowsToDelete.length === 0) {
      await queryRunner.rollbackTransaction();
      return errorResponse(
        res,
        ERROR_CODES.RESOURCE_NOT_FOUND,
        'Error al eliminar el plan operativo: No se encontró un plan operativo para el proyecto seleccionado.',
        404
      );
    }
    await rowRepository.remove(rowsToDelete);

    project.operationalPlan_created_at = null;
    project.operationalPlan_updated_at = null;
    project.operationalPlan_version = 0;

    await projectRepository.save(project);


    await queryRunner.commitTransaction();

     return (
      successResponse(
        res,
        {},
        'Plan operativo eliminado exitosamente.',
        200
      )
    );
  } catch (error) {
    await queryRunner.rollbackTransaction();
    return errorResponse(
      res,
      ERROR_CODES.SERVER_ERROR,
      'Error del servidor.',
      500
    );
  } finally {
    await queryRunner.release();
  }
};
