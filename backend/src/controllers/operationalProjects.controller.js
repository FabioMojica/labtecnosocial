import { AppDataSource } from '../../data-source.js';
import { OperationalProject } from '../entities/OperationalProject.js';
import { User } from '../entities/User.js';
import { ProjectResponsible } from '../entities/ProjectResponsible.js';
import { ProjectIntegration } from '../entities/ProjectIntegration.js';
import { Program } from '../entities/Program.js';
import { BudgetRequest, BUDGET_REQUEST_STATUS } from '../entities/BudgetRequest.js';
import { BudgetRequestItem } from '../entities/BudgetRequestItem.js';
import { assignResponsibles } from '../utils/assignResponsibles.js';
import { createProjectIntegrations } from '../utils/createProjectIntegrations.js';
import fs from 'fs';
import path from 'path';
import { In } from 'typeorm';
import { canAccessProject } from '../utils/canAccessProject.js';
import { ERROR_CODES, errorResponse, successResponse } from '../utils/apiResponse.js';
import { ALLOWED_ROLES } from '../config/allowedStatesAndRoles.js';

const SUPPORTED_SOCIAL_PLATFORMS = new Set(['github', 'facebook', 'instagram']);

const normalizeEntityIds = (items = []) => {
  if (!Array.isArray(items)) return { ids: [], hasInvalid: false };

  const parsedIds = items.map((item) => {
    const idValue = item && typeof item === "object" ? item.id : item;
    return Number(idValue);
  });

  return {
    ids: parsedIds.filter((id) => Number.isInteger(id)),
    hasInvalid: parsedIds.some((id) => !Number.isInteger(id)),
  };
};

const parseBudgetAmount = (value) => {
  if (value === undefined || value === null || value === '') {
    return { value: null, hasValue: false, error: null };
  }

  const normalizedValue = typeof value === 'string'
    ? value.replace(',', '.').trim()
    : value;

  const parsedValue = Number(normalizedValue);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return {
      value: null,
      hasValue: true,
      error: 'El presupuesto del proyecto debe ser un número válido mayor o igual a 0.',
    };
  }

  return {
    value: Number(parsedValue.toFixed(2)),
    hasValue: true,
    error: null,
  };
};

const parseMoneyAmount = (value, label) => {
  const normalizedValue = typeof value === 'string'
    ? value.replace(',', '.').trim()
    : value;

  const parsedValue = Number(normalizedValue);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return {
      value: null,
      error: `${label} debe ser un número válido mayor o igual a 0.`,
    };
  }

  return {
    value: Number(parsedValue.toFixed(2)),
    error: null,
  };
};

const parsePositiveQuantity = (value) => {
  const normalizedValue = typeof value === 'string'
    ? value.replace(',', '.').trim()
    : value;

  const parsedValue = Number(normalizedValue);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return {
      value: null,
      error: 'La cantidad de cada Ã­tem debe ser un número válido mayor a 0.',
    };
  }

  return {
    value: Number(parsedValue.toFixed(2)),
    error: null,
  };
};

const normalizeBudgetRequestStatusLabel = (status) => {
  switch (status) {
    case BUDGET_REQUEST_STATUS.approved:
      return 'Aprobada';
    case BUDGET_REQUEST_STATUS.rejected:
      return 'Rechazada';
    case BUDGET_REQUEST_STATUS.pending:
    default:
      return 'Pendiente';
  }
};

const formatBudgetRequest = (budgetRequest, { includeRequester = true } = {}) => {
  const base = {
    id: budgetRequest.id,
    objective: budgetRequest.objective,
    status: budgetRequest.status,
    status_label: normalizeBudgetRequestStatusLabel(budgetRequest.status),
    total_amount: budgetRequest.total_amount !== null ? Number(budgetRequest.total_amount) : 0,
    created_at: budgetRequest.created_at,
    updated_at: budgetRequest.updated_at,
    items: (budgetRequest.items ?? []).map((item) => ({
      id: item.id,
      item_name: item.item_name,
      quantity: item.quantity !== null ? Number(item.quantity) : 0,
      unit_cost: item.unit_cost !== null ? Number(item.unit_cost) : 0,
      total_cost: item.total_cost !== null ? Number(item.total_cost) : 0,
      support_url: item.support_url ?? null,
    })),
  };

  if (includeRequester) {
    base.requested_by = budgetRequest.requestedBy
      ? {
          id: budgetRequest.requestedBy.id,
          firstName: budgetRequest.requestedBy.firstName,
          lastName: budgetRequest.requestedBy.lastName,
          email: budgetRequest.requestedBy.email,
          role: budgetRequest.requestedBy.role,
          state: budgetRequest.requestedBy.state,
          image_url: budgetRequest.requestedBy.image_url,
        }
      : null;
  }

  return base;
};

const parseBudgetRequestItems = (itemsRaw, files = []) => {
  const parsedItems = typeof itemsRaw === 'string' ? JSON.parse(itemsRaw) : itemsRaw;

  if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
    return { items: [], totalAmount: 0, error: 'Debes registrar al menos un Ã­tem en la solicitud.' };
  }

  let totalAmount = 0;

  const normalizedItems = parsedItems.map((item, index) => {
    const itemName = String(item?.item_name ?? item?.item ?? '').trim();

    if (!itemName) {
      throw new Error(`El ítem ${index + 1} debe tener un nombre.`);
    }

    if (itemName.length > 120) {
      throw new Error(`El nombre del Ã­tem ${index + 1} no puede exceder 120 caracteres.`);
    }

    const parsedQuantity = parsePositiveQuantity(item?.quantity);
    if (parsedQuantity.error) {
      throw new Error(parsedQuantity.error);
    }

    const parsedUnitCost = parseMoneyAmount(item?.unit_cost, `El costo unitario del Ã­tem ${index + 1}`);
    if (parsedUnitCost.error) {
      throw new Error(parsedUnitCost.error);
    }

    const totalCost = Number((parsedQuantity.value * parsedUnitCost.value).toFixed(2));
    totalAmount = Number((totalAmount + totalCost).toFixed(2));

    return {
      item_name: itemName,
      quantity: parsedQuantity.value,
      unit_cost: parsedUnitCost.value,
      total_cost: totalCost,
      support_url: files.find((file) => file.fieldname === `file_${index}`)?.optimizedPath || null,
    };
  });

  return { items: normalizedItems, totalAmount, error: null };
};

export const createOperationalProject = async (req, res) => {
  const queryRunner = AppDataSource.createQueryRunner();

  try {
    const {
      name,
      description,
      budget_amount,
      responsibles: responsiblesRaw,
      integrations: integrationsRaw
    } = req.body;

    if (!name || !description) {
      return errorResponse(
        res,
        ERROR_CODES.VALIDATION_ERROR,
        'Faltan datos requeridos: nombre y descripción de proyecto son obligatorios.',
        400
      );
    }

    const parsedBudget = parseBudgetAmount(budget_amount);

    if (parsedBudget.error) {
      return errorResponse(
        res,
        ERROR_CODES.VALIDATION_ERROR,
        parsedBudget.error,
        400
      );
    }

    if (parsedBudget.hasValue && req.user.role !== ALLOWED_ROLES.superAdmin) {
      return errorResponse(
        res,
        ERROR_CODES.USER_UNAUTHORIZED,
        'Solo un super administrador puede definir el presupuesto del proyecto.',
        403
      );
    }

    const responsibles = typeof responsiblesRaw === "string" ? JSON.parse(responsiblesRaw) : responsiblesRaw || [];
    const integrations = typeof integrationsRaw === "string" ? JSON.parse(integrationsRaw) : integrationsRaw || [];

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const projectRepository = queryRunner.manager.getRepository(OperationalProject);
    const userRepository = queryRunner.manager.getRepository(User);
    const responsibleRepository = queryRunner.manager.getRepository(ProjectResponsible);
    const integrationRepository = queryRunner.manager.getRepository(ProjectIntegration);
    const { ids: responsibleIds, hasInvalid: hasInvalidResponsibleIds } = normalizeEntityIds(responsibles);

    if (hasInvalidResponsibleIds) {
      await queryRunner.rollbackTransaction();
      return errorResponse(
        res,
        ERROR_CODES.VALIDATION_ERROR,
        'Existe un responsable con id inválido.',
        400
      );
    }

    // Admin puede asignar responsables de cualquier rol

    // Manejo de imagen
    const imagePath = req.files?.[0]?.optimizedPath || null;

    // Crear proyecto 

    const newProject = projectRepository.create({
      name,
      description,
      budget_amount: parsedBudget.value,
      image_url: imagePath
    });
    const savedProject = await projectRepository.save(newProject);

    // Asignar responsables si existen
    if (responsibleIds.length > 0) {
      await assignResponsibles(responsibleIds, savedProject.id, userRepository, responsibleRepository);
    }

    // Crear integraciones
    if (integrations.length > 0) {
      await createProjectIntegrations(integrations, savedProject, integrationRepository);
    }

    // Commit de transacción
    await queryRunner.commitTransaction();

    // Traer proyecto con relaciones para respuesta
    const projectWithRelations = await projectRepository.findOne({
      where: { id: savedProject.id },
      relations: ["integrations", "projectResponsibles"],
    });


    return (
      successResponse(
        res,
        projectWithRelations,
        'Proyecto creado exitosamente',
        200,
      )
    );

  } catch (error) {
    if (queryRunner.isTransactionActive) {
      await queryRunner.rollbackTransaction();
    }
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

export const getAllOperationalProjects = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const canSeeBudget =
      req.user.role === ALLOWED_ROLES.admin || req.user.role === ALLOWED_ROLES.superAdmin;

    const projectRepository = AppDataSource.getRepository(OperationalProject);

    let projects;

    if (req.user.role === ALLOWED_ROLES.superAdmin) {
      projects = await projectRepository.find({
        relations: {
          program: {
            objective: {
              strategicPlan: true,
            },
          },
          projectResponsibles: {
            user: true,
          },
          integrations: true,
        },
        order: { created_at: 'DESC' },
      });
    } else {
      projects = await projectRepository
        .createQueryBuilder('project')
        .leftJoinAndSelect('project.program', 'program')
        .leftJoinAndSelect('program.objective', 'objective')
        .leftJoinAndSelect('objective.strategicPlan', 'strategicPlan')
        .leftJoinAndSelect('project.projectResponsibles', 'projectResponsibles')
        .leftJoinAndSelect('projectResponsibles.user', 'user')
        .where(qb => {
          const subQuery = qb.subQuery()
            .select('pr.operational_project_id')
            .from('project_responsibles', 'pr')
            .where('pr.user_id = :userId')
            .getQuery();
          return 'project.id IN ' + subQuery;
        })
        .setParameter('userId', userId)
        .orderBy('project.created_at', 'DESC')
        .getMany();
    }

    const formattedProjects = projects.map((project) => {
      const base = {
        id: project.id,
        name: project.name,
        description: project.description,
        created_at: project.created_at,
        updated_at: project.updated_at,
        image_url: project.image_url,
        projectResponsibles: (project.projectResponsibles ?? []).map((r) => ({
          id: r.user.id,
          firstName: r.user.firstName,
          lastName: r.user.lastName,
          role: r.user.role,
          state: r.user.state,
          email: r.user.email,
          image_url: r.user.image_url,
        })),
        program: project.program ? {
          id: project.program.id,
          name: project.program.description,
          objective: project.program.objective ? {
            id: project.program.objective.id,
            title: project.program.objective.title,
            strategicPlan: project.program.objective.strategicPlan ? {
              id: project.program.objective.strategicPlan.id,
              year: project.program.objective.strategicPlan.year,
              mission: project.program.objective.strategicPlan.mission,
            } : null,
          } : null,
        } : null,
      };

      if (canSeeBudget) {
        base.budget_amount = project.budget_amount !== null ? Number(project.budget_amount) : null;
      }

      if (req.user.role === ALLOWED_ROLES.admin || req.user.role === ALLOWED_ROLES.superAdmin) {
        base.integrations = (project.integrations ?? [])
          .filter((i) => SUPPORTED_SOCIAL_PLATFORMS.has(i.platform))
          .map((i) => ({
          id: i.id,
          platform: i.platform,
          name: i.name,
          url: i.url,
        }));
      }

      return base;
    });

    return (
      successResponse(
        res,
        formattedProjects,
        'Proyectos recuperados exitosamente',
        200,
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

export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId, role } = req.user;
    const canSeeBudget = role === ALLOWED_ROLES.admin || role === ALLOWED_ROLES.superAdmin;

    const projectRepository = AppDataSource.getRepository(OperationalProject);
    const userRepository = AppDataSource.getRepository(User);

    const project = await projectRepository.findOne({
      where: { id: parseInt(id) },
      relations: {
        program: {
          objective: {
            strategicPlan: true,
          },
        },
        projectResponsibles: {
          user: true,
        },
        integrations: true,
      },
    });

    if (!project) {
      return errorResponse(
        res,
        ERROR_CODES.RESOURCE_NOT_FOUND,
        'Proyecto no encontrado en el sistema.',
        404
      );
    }

    // Ahora cualquier usuario autenticado puede ver el detalle del proyecto.

    const responsiblesWithCount = [];
    for (const r of project.projectResponsibles) {
      const user = await userRepository
        .createQueryBuilder("user")
        .leftJoin("user.projectResponsibles", "pr")
        .leftJoin("pr.operationalProject", "op")
        .select([
          "user.id",
          "user.firstName",
          "user.lastName",
          "user.email",
          "user.image_url",
          "user.state",
          "user.role",
        ])
        .addSelect("COUNT(pr.id)", "project_count")
        .addSelect(
          "COALESCE(JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('id', op.id, 'name', op.name, 'description', op.description, 'image_url', op.image_url)) FILTER (WHERE op.id IS NOT NULL), '[]')",
          "projects"
        )
        .where("user.id = :userId", { userId: r.user.id })
        .groupBy("user.id")
        .getRawOne();

      responsiblesWithCount.push({
        id: user.user_id,
        firstName: user.user_firstName,
        lastName: user.user_lastName,
        email: user.user_email,
        role: user.user_role,
        image_url: user.user_image_url,
        state: user.user_state,
        projectCount: parseInt(user.project_count, 10) || 0,
        projects: user.projects,
      });
    }

    const formattedProject = {
      id: project.id,
      name: project.name,
      description: project.description,
      created_at: project.created_at,
      updated_at: project.updated_at,
      image_url: project.image_url,
      projectResponsibles: responsiblesWithCount,
      operationalPlanVersion: project.operationalPlan_version,
      program: project.program
        ? {
          id: project.program.id,
          description: project.program.description,
          objective: project.program.objective
            ? {
              id: project.program.objective.id,
              title: project.program.objective.title,
              strategicPlan: project.program.objective.strategicPlan
                ? {
                  id: project.program.objective.strategicPlan.id,
                  year: project.program.objective.strategicPlan.year,
                  mission:
                    project.program.objective.strategicPlan.mission,
                }
                : null,
            }
            : null,
        }
        : null,
      integrations: project.integrations
        .filter((i) => SUPPORTED_SOCIAL_PLATFORMS.has(i.platform))
        .map((i) => ({
        id: i.integration_id,
        name: i.name,
        platform: i.platform,
        url: i.url,
      })),
    };

    if (canSeeBudget) {
      formattedProject.budget_amount = project.budget_amount !== null ? Number(project.budget_amount) : null;
    }

    return (
      successResponse(
        res,
        formattedProject,
        'Proyecto recuperado exitosamente.',
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

export const deleteProjectById = async (req, res) => {
  const { id } = req.params;

  try {
    const projectRepo = AppDataSource.getRepository(OperationalProject);

    const project = await projectRepo.findOne({ where: { id: Number(id) } });

    if (!project) {
      return errorResponse(
        res,
        ERROR_CODES.RESOURCE_NOT_FOUND,
        'Proyecto no encontrado en el sistema.',
        404
      );
    }

    await projectRepo.remove(project);

    return (
      successResponse(
        res,
        {},
        'Proyecto operativo eliminado exitosamente.',
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

export const getBudgetRequestsByProjectId = async (req, res) => {
  try {
    const projectId = Number(req.params.id);

    if (!Number.isInteger(projectId)) {
      return errorResponse(
        res,
        ERROR_CODES.VALIDATION_ERROR,
        'ID de proyecto inválido.',
        400
      );
    }

    if (![ALLOWED_ROLES.superAdmin, ALLOWED_ROLES.admin].includes(req.user.role)) {
      return errorResponse(
        res,
        ERROR_CODES.USER_UNAUTHORIZED,
        'No tienes permisos para ver solicitudes al presupuesto.',
        403
      );
    }

    const projectRepository = AppDataSource.getRepository(OperationalProject);
    const requestRepository = AppDataSource.getRepository(BudgetRequest);

    const project = await projectRepository.findOneBy({ id: projectId });

    if (!project) {
      return errorResponse(
        res,
        ERROR_CODES.RESOURCE_NOT_FOUND,
        'Proyecto no encontrado en el sistema.',
        404
      );
    }

    const where = req.user.role === ALLOWED_ROLES.superAdmin
      ? { project: { id: projectId } }
      : { project: { id: projectId }, requestedBy: { id: req.user.id } };

    const budgetRequests = await requestRepository.find({
      where,
      relations: {
        requestedBy: true,
        items: true,
      },
      order: {
        created_at: 'DESC',
        items: {
          id: 'ASC',
        },
      },
    });

    const includeRequester = req.user.role === ALLOWED_ROLES.superAdmin;

    return successResponse(
      res,
      {
        project_id: project.id,
        project_name: project.name,
        budget_amount: project.budget_amount !== null ? Number(project.budget_amount) : null,
        requests: budgetRequests.map((request) => formatBudgetRequest(request, { includeRequester })),
      },
      'Solicitudes al presupuesto recuperadas exitosamente.',
      200
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

export const createBudgetRequestByProjectId = async (req, res) => {
  const queryRunner = AppDataSource.createQueryRunner();

  try {
    const projectId = Number(req.params.id);

    if (!Number.isInteger(projectId)) {
      return errorResponse(
        res,
        ERROR_CODES.VALIDATION_ERROR,
        'ID de proyecto inválido.',
        400
      );
    }

    if (req.user.role !== ALLOWED_ROLES.admin) {
      return errorResponse(
        res,
        ERROR_CODES.USER_UNAUTHORIZED,
        'Solo un administrador puede crear solicitudes al presupuesto.',
        403
      );
    }

    const objective = String(req.body?.objective ?? '').trim();

    if (!objective) {
      return errorResponse(
        res,
        ERROR_CODES.VALIDATION_ERROR,
        'El objetivo de la solicitud es obligatorio.',
        400
      );
    }

    if (objective.length > 100) {
      return errorResponse(
        res,
        ERROR_CODES.VALIDATION_ERROR,
        'El objetivo de la solicitud no puede exceder 100 caracteres.',
        400
      );
    }

    let parsedItems;

    try {
      parsedItems = parseBudgetRequestItems(req.body?.items, req.files || []);
    } catch (error) {
      return errorResponse(
        res,
        ERROR_CODES.VALIDATION_ERROR,
        error.message,
        400
      );
    }

    if (parsedItems.error) {
      return errorResponse(
        res,
        ERROR_CODES.VALIDATION_ERROR,
        parsedItems.error,
        400
      );
    }

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const projectRepository = queryRunner.manager.getRepository(OperationalProject);
    const requestRepository = queryRunner.manager.getRepository(BudgetRequest);
    const itemRepository = queryRunner.manager.getRepository(BudgetRequestItem);
    const userRepository = queryRunner.manager.getRepository(User);

    const project = await projectRepository.findOneBy({ id: projectId });

    if (!project) {
      await queryRunner.rollbackTransaction();
      return errorResponse(
        res,
        ERROR_CODES.RESOURCE_NOT_FOUND,
        'Proyecto no encontrado en el sistema.',
        404
      );
    }

    const projectBudgetAmount = project.budget_amount !== null ? Number(project.budget_amount) : null;

    if (projectBudgetAmount === null) {
      await queryRunner.rollbackTransaction();
      return errorResponse(
        res,
        ERROR_CODES.VALIDATION_ERROR,
        'El proyecto no tiene un presupuesto definido para recibir solicitudes.',
        400
      );
    }

    if (parsedItems.totalAmount > projectBudgetAmount) {
      await queryRunner.rollbackTransaction();
      return errorResponse(
        res,
        ERROR_CODES.VALIDATION_ERROR,
        'El monto solicitado excede el presupuesto definido del proyecto.',
        400
      );
    }

    const requestedBy = await userRepository.findOneBy({ id: req.user.id });

    if (!requestedBy) {
      await queryRunner.rollbackTransaction();
      return errorResponse(
        res,
        ERROR_CODES.USER_NOT_FOUND,
        'Usuario solicitante no encontrado.',
        404
      );
    }

    const budgetRequest = requestRepository.create({
      objective,
      total_amount: parsedItems.totalAmount,
      status: BUDGET_REQUEST_STATUS.pending,
      project,
      requestedBy,
    });

    const savedRequest = await requestRepository.save(budgetRequest);

    const requestItems = parsedItems.items.map((item) =>
      itemRepository.create({
        ...item,
        budgetRequest: savedRequest,
      })
    );

    await itemRepository.save(requestItems);
    await queryRunner.commitTransaction();

    const requestWithRelations = await requestRepository.findOne({
      where: { id: savedRequest.id },
      relations: {
        requestedBy: true,
        items: true,
      },
    });

    return successResponse(
      res,
      formatBudgetRequest(requestWithRelations, { includeRequester: false }),
      'Solicitud al presupuesto creada exitosamente.',
      201
    );
  } catch (error) {
    if (queryRunner.isTransactionActive) {
      await queryRunner.rollbackTransaction();
    }

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

export const updateOperationalProject = async (req, res) => {
  const queryRunner = AppDataSource.createQueryRunner();

  try {
    const { id } = req.params;
    const parsedProjectId = Number(id);
    const {
      name,
      description,
      budget_amount,
      program_id,
      image_url,
      preEliminados,
      preAnadidos,
      intEliminados,
      intAnadidos
    } = req.body;
    const budgetAmountWasSent = Object.prototype.hasOwnProperty.call(req.body, 'budget_amount');

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
    const programRepository = queryRunner.manager.getRepository(Program);
    const userRepository = queryRunner.manager.getRepository(User);
    const responsibleRepository = queryRunner.manager.getRepository(ProjectResponsible);
    const integrationRepository = queryRunner.manager.getRepository(ProjectIntegration);

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
        'No tienes permisos para editar este proyecto.',
        403
      );
    }

    if (req.user.role === ALLOWED_ROLES.admin) {
      const adminAssignmentCount = await responsibleRepository.count({
        where: {
          user: { id: req.user.id },
          operationalProject: { id: parsedProjectId },
        }
      });

      if (adminAssignmentCount === 0) {
        await queryRunner.rollbackTransaction();
        return errorResponse(
          res,
          ERROR_CODES.USER_UNAUTHORIZED,
          'Un administrador solo puede editar proyectos en los que está asignado.',
          403
        );
      }
    }

    const parsedBudget = parseBudgetAmount(budget_amount);

    if (parsedBudget.error) {
      await queryRunner.rollbackTransaction();
      return errorResponse(
        res,
        ERROR_CODES.VALIDATION_ERROR,
        parsedBudget.error,
        400
      );
    }

    if (budgetAmountWasSent && req.user.role !== ALLOWED_ROLES.superAdmin) {
      await queryRunner.rollbackTransaction();
      return errorResponse(
        res,
        ERROR_CODES.USER_UNAUTHORIZED,
        'Solo un super administrador puede actualizar el presupuesto del proyecto.',
        403
      );
    }

    // Buscar el proyecto
    const project = await projectRepository.findOne({
      where: { id: parsedProjectId },
      relations: ["projectResponsibles"],
    });

    if (!project) {
      await queryRunner.rollbackTransaction();
      return errorResponse(
        res,
        ERROR_CODES.RESOURCE_NOT_FOUND,
        'Proyecto no encontrado en el sistema.',
        404
      );
    }

    // Validar el programa si se envÃ­a
    let program = null;
    if (program_id) {
      program = await programRepository.findOneBy({ id: parseInt(program_id) });
      if (!program) {
        await queryRunner.rollbackTransaction();
        return errorResponse(
          res,
          ERROR_CODES.RESOURCE_NOT_FOUND,
          'Programa no encontrado en el sistema.',
          404
        );
      }
    }

    const imagePath = req.files?.[0]?.optimizedPath || null;

    if (imagePath) {
      if (project.image_url) {
        const oldImage = project.image_url.startsWith("/uploads/")
          ? project.image_url.slice(9)
          : project.image_url;
        fs.unlink(path.join("uploads", oldImage), (err) => {
          if (err) console.error("âš ï¸ No se pudo eliminar imagen antigua:", err.message);
        });
      }

      project.image_url = imagePath;

    } else if (image_url === null || image_url === "null") {
      if (project.image_url) {
        const oldImage = project.image_url.startsWith("/uploads/")
          ? project.image_url.slice(9)
          : project.image_url;
        fs.unlink(path.join("uploads", oldImage), (err) => {
          if (err) console.error("âš ï¸ No se pudo eliminar imagen antigua:", err.message);
        });
      }
      project.image_url = null;
    }

    // Actualizar datos básicos
    project.name = name || project.name;
    project.description = description || project.description;
    project.program = program || project.program;
    if (budgetAmountWasSent) {
      project.budget_amount = parsedBudget.value;
    }

    // Guardar cambios del proyecto
    const updatedProject = await projectRepository.save(project);

    // Parsear JSON de responsables
    let parsedPreAnadidos = [];
    let parsedPreEliminados = [];
    let parsedIntEliminados = [];
    let parsedIntAnadidos = [];

    try {
      if (preAnadidos) parsedPreAnadidos = JSON.parse(preAnadidos);
      if (preEliminados) parsedPreEliminados = JSON.parse(preEliminados);
      if (intEliminados) parsedIntEliminados = JSON.parse(intEliminados);
      if (intAnadidos) parsedIntAnadidos = JSON.parse(intAnadidos);
    } catch (e) {
      console.error("âŒ Error al parsear preAnadidos o preEliminados:", e.message);
    }

    const { ids: preEliminadosIds, hasInvalid: hasInvalidPreEliminados } = normalizeEntityIds(parsedPreEliminados);
    const { ids: preAnadidosIds, hasInvalid: hasInvalidPreAnadidos } = normalizeEntityIds(parsedPreAnadidos);
    const uniquePreEliminadosIds = [...new Set(preEliminadosIds)];
    const uniquePreAnadidosIds = [...new Set(preAnadidosIds)];

    if (hasInvalidPreEliminados || hasInvalidPreAnadidos) {
      await queryRunner.rollbackTransaction();
      return errorResponse(
        res,
        ERROR_CODES.VALIDATION_ERROR,
        'Existe un responsable con id inválido.',
        400
      );
    }

    const usersToAdd = uniquePreAnadidosIds.length > 0
      ? await userRepository.find({ where: { id: In(uniquePreAnadidosIds) } })
      : [];

    const usersToUnassign = uniquePreEliminadosIds.length > 0
      ? await userRepository.find({ where: { id: In(uniquePreEliminadosIds) } })
      : [];

    // Admin puede asignar y desasignar responsables de cualquier rol

    if (uniquePreEliminadosIds.length > 0) {
      for (const userId of uniquePreEliminadosIds) {
        await responsibleRepository.delete({
          user: { id: userId },
          operationalProject: { id: project.id },
        });
      }
    }

    if (usersToAdd.length > 0) {
      for (const user of usersToAdd) {
        const newResponsible = responsibleRepository.create({
          user,
          operationalProject: project,
        });
        await responsibleRepository.save(newResponsible);
      }
    }

    if (Array.isArray(parsedIntEliminados) && parsedIntEliminados.length > 0) {
      for (const i of parsedIntEliminados) {
        const integration = await integrationRepository.findOne({
          where: {
            integration_id: i.id,
            project: { id: project.id },
          },
          relations: ["project"]
        });
        if (integration) {
          await integrationRepository.remove(integration);
        }
      }
    }

    if (Array.isArray(parsedIntAnadidos) && parsedIntAnadidos.length > 0) {
      for (const i of parsedIntAnadidos) {
        if (!SUPPORTED_SOCIAL_PLATFORMS.has(i?.platform)) {
          continue;
        }
        const newIntegration = integrationRepository.create({
          platform: i.platform,
          integration_id: i.id,
          name: i.name,
          url: i.url,
          project: project
        });
        await integrationRepository.save(newIntegration);
      }
    }

    await queryRunner.commitTransaction();

    return getProjectById(req, res);

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


