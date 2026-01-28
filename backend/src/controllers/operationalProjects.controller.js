import { AppDataSource } from '../../data-source.js';
import { OperationalProject } from '../entities/OperationalProject.js';
import { User } from '../entities/User.js';
import { ProjectResponsible } from '../entities/ProjectResponsible.js';
import { ProjectIntegration } from '../entities/ProjectIntegration.js';
import { Program } from '../entities/Program.js';
import { assignResponsibles } from '../utils/assignResponsibles.js';
import { createProjectIntegrations } from '../utils/createProjectIntegrations.js';
import { StrategicPlan } from '../entities/StrategicPlan.js';
import { OperationalRow } from '../entities/OperationalRow.js';
import fs from 'fs';
import path from 'path';
import { canAccessProject } from '../utils/canAccessProject.js';
import { ERROR_CODES, errorResponse, successResponse } from '../utils/apiResponse.js';
import { ALLOWED_ROLES } from '../config/allowedStatesAndRoles.js';

export const createOperationalProject = async (req, res) => {
  const queryRunner = AppDataSource.createQueryRunner();

  try {
    const { name, description, responsibles: responsiblesRaw, integrations: integrationsRaw } = req.body;

    if (!name || !description) {
      return res.status(400).json({ message: "Faltan datos requeridos: nombre y descripción son obligatorios" });
    }

    const responsibles = typeof responsiblesRaw === "string" ? JSON.parse(responsiblesRaw) : responsiblesRaw || [];
    const integrations = typeof integrationsRaw === "string" ? JSON.parse(integrationsRaw) : integrationsRaw || [];

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const projectRepository = queryRunner.manager.getRepository(OperationalProject);
    const userRepository = queryRunner.manager.getRepository(User);
    const responsibleRepository = queryRunner.manager.getRepository(ProjectResponsible);
    const integrationRepository = queryRunner.manager.getRepository(ProjectIntegration);

    // Manejo de imagen
    const imagePath = req.file?.optimizedPath || null;

    // Crear proyecto 

    const newProject = projectRepository.create({ name, description, image_url: imagePath });
    const savedProject = await projectRepository.save(newProject);

    // Asignar responsables si existen
    if (responsibles.length > 0) {
      await assignResponsibles(responsibles, savedProject.id, userRepository, responsibleRepository);
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

    return res.status(201).json(projectWithRelations);

  } catch (error) {
    // Rollback solo si la transacción se inició
    if (queryRunner.isTransactionActive) {
      await queryRunner.rollbackTransaction();
    }
    console.error("Error al crear proyecto operativo:", error);
    return res.status(500).json({ message: error.message || "Error interno del servidor" });
  } finally {
    await queryRunner.release();
  }
};

export const getAllOperationalProjects = async (req, res) => {
  try {
    const { id: userId } = req.user;

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

      if (req.user.role === ALLOWED_ROLES.admin || req.user.role === ALLOWED_ROLES.superAdmin) {
        base.integrations = (project.integrations ?? []).map((i) => ({
          id: i.id,
          platform: i.platform,
          name: i.name,
          url: i.url,
        }));
      }

      return base;
    });

    return res.status(200).json({ projects: formattedProjects, status: 200 });
  } catch (error) {
    console.error('Error al obtener proyectos operativos:', error);
    res.status(500).json({ message: 'Error al obtener los proyectos operativos' });
  }
};


export const assignProjectResponsibles = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { responsibles } = req.body;

    if (!Array.isArray(responsibles) || responsibles.length === 0) {
      return res.status(400).json({ message: 'Debe enviar un array de IDs de responsables' });
    }

    const projectRepository = AppDataSource.getRepository(OperationalProject);
    const project = await projectRepository.findOneBy({ id: parseInt(projectId) });

    if (!project) {
      return res.status(404).json({ message: 'Proyecto operativo no encontrado' });
    }

    const userRepository = AppDataSource.getRepository('User');
    const responsibleRepository = AppDataSource.getRepository(ProjectResponsible);

    try {
      await assignResponsibles(responsibles, project.id, userRepository, responsibleRepository);

      project.updated_at = new Date();
      await projectRepository.save(project);

    } catch (error) {
      return res.status(404).json({ message: error.message });
    }

    return res.status(201).json({ message: 'Responsables asignados correctamente' });
  } catch (error) {
    console.error('Error al asignar responsables:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId, role } = req.user;

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

    const hasAccess = await canAccessProject({
      projectId: project.id,
      userId,
      role,
    });

    if (!hasAccess) {
      return errorResponse(
        res,
        ERROR_CODES.USER_UNAUTHORIZED,
        'No tienes permisos para acceder a este proyecto.',
        403
      );
    }

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
      integrations: project.integrations.map((i) => ({
        id: i.integration_id,
        name: i.name,
        platform: i.platform,
        url: i.url,
      })),
    };

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
      return res.status(404).json({ message: 'Proyecto operativo no encontrado' });
    }

    await projectRepo.remove(project);

    return res.json({ message: 'Proyecto operativo eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando proyecto operativo:', error);
    return res.status(500).json({ message: 'Error al eliminar el proyecto operativo' });
  }
};

export const updateOperationalProject = async (req, res) => {
  const queryRunner = AppDataSource.createQueryRunner();

  try {
    const { id } = req.params;
    const { name, description, program_id, image_url, preEliminados, preAnadidos, intEliminados, intAnadidos } = req.body;

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const projectRepository = queryRunner.manager.getRepository(OperationalProject);
    const programRepository = queryRunner.manager.getRepository(Program);
    const userRepository = queryRunner.manager.getRepository(User);
    const responsibleRepository = queryRunner.manager.getRepository(ProjectResponsible);
    const integrationRepository = queryRunner.manager.getRepository(ProjectIntegration);

    const hasAccess = await canAccessProject({
      projectId: id,
      userId: req.user.id,
      role: req.user.role,
    });

    if (!hasAccess) {
      return errorResponse(
        res,
        ERROR_CODES.USER_UNAUTHORIZED,
        'No tienes permisos para editar este proyecto.',
        403
      );
    }

    // Buscar el proyecto
    const project = await projectRepository.findOne({
      where: { id: parseInt(id) },
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

    // Validar el programa si se envía
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

    const imagePath = req.file?.optimizedPath || null;

    if (imagePath) {
      if (project.image_url) {
        const oldImage = project.image_url.startsWith("/uploads/")
          ? project.image_url.slice(9)
          : project.image_url;
        fs.unlink(path.join("uploads", oldImage), (err) => {
          if (err) console.error("⚠️ No se pudo eliminar imagen antigua:", err.message);
        });
      }

      project.image_url = imagePath; 

    } else if (image_url === null || image_url === "null") {
      if (project.image_url) {
        const oldImage = project.image_url.startsWith("/uploads/")
          ? project.image_url.slice(9)
          : project.image_url;
        fs.unlink(path.join("uploads", oldImage), (err) => {
          if (err) console.error("⚠️ No se pudo eliminar imagen antigua:", err.message);
        });
      }
      project.image_url = null;
    }

    // Actualizar datos básicos
    project.name = name || project.name;
    project.description = description || project.description;
    project.program = program || project.program;

    // Guardar cambios del proyecto
    const updatedProject = await projectRepository.save(project);

    // 🔍 Parsear JSON de responsables
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
      console.error("❌ Error al parsear preAnadidos o preEliminados:", e.message);
    }

    if (Array.isArray(parsedPreEliminados) && parsedPreEliminados.length > 0) {
      for (const r of parsedPreEliminados) {
        await responsibleRepository.delete({
          user: { id: r.id },
          operationalProject: { id: project.id },
        });
      }
    }

    if (Array.isArray(parsedPreAnadidos) && parsedPreAnadidos.length > 0) {
      for (const r of parsedPreAnadidos) {
        const user = await userRepository.findOneBy({ id: r.id });
        if (!user) continue;

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

export const removeProjectResponsible = async (req, res) => {
  try {
    const { projectId, responsibleId } = req.params;

    const responsibleRepository = AppDataSource.getRepository(ProjectResponsible);

    const projectResponsible = await responsibleRepository.findOne({
      where: {
        operationalProject: { id: parseInt(projectId) },
        user: { id: parseInt(responsibleId) },
      },
      relations: ['operationalProject', 'user'],
    });

    if (!projectResponsible) {
      return res.status(404).json({ message: 'Responsable no encontrado para el proyecto' });
    }

    await responsibleRepository.remove(projectResponsible);

    const projectRepository = AppDataSource.getRepository(OperationalProject);
    const project = await projectRepository.findOneBy({ id: parseInt(projectId) });
    if (project) {
      project.updated_at = new Date();
      await projectRepository.save(project);
    }

    return res.status(200).json({ message: 'Responsable eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar responsable:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getOperationalProjectRows = async (req, res) => {
  try {
    const { id } = req.params;

    const rowRepository = AppDataSource.getRepository(OperationalRow);

    const rows = await rowRepository.find({
      where: {
        operationalProject: { id: parseInt(id) }
      },
      order: {
        id: 'ASC'
      }
    });

    return res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener filas operativas del proyecto:', error);
    return res.status(500).json({ message: 'Error al obtener las filas operativas del proyecto' });
  }
};

export const saveOperationalRowsOfProject = async (req, res) => {
  const queryRunner = AppDataSource.createQueryRunner();

  try {
    const { id: projectId } = req.params;
    const { create = [], update = [], delete: deleteIds = [] } = req.body;

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const rowRepository = queryRunner.manager.getRepository(OperationalRow);
    const projectRepository = queryRunner.manager.getRepository(OperationalProject);

    const project = await projectRepository.findOneBy({ id: parseInt(projectId) });
    if (!project) {
      await queryRunner.rollbackTransaction();
      return res.status(404).json({ message: 'Proyecto operativo no encontrado' });
    }

    if (deleteIds.length > 0) {
      await rowRepository.delete(deleteIds);
    }

    for (const rowData of update) {
      const existingRow = await rowRepository.findOneBy({ id: rowData.id });
      if (!existingRow) {
        await queryRunner.rollbackTransaction();
        return res.status(404).json({ message: `Fila con id ${rowData.id} no encontrada` });
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
    }

    await queryRunner.commitTransaction();

    const savedRows = await rowRepository.find({
      where: { operationalProject: { id: parseInt(projectId) } },
    });

    return res.status(200).json(savedRows);
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('Error al guardar filas operativas:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  } finally {
    await queryRunner.release();
  }
};

export const deleteOperationalPlanning = async (req, res) => {
  const { id } = req.params;
  const queryRunner = AppDataSource.createQueryRunner();

  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const projectRepository = queryRunner.manager.getRepository(OperationalProject);
    const rowRepository = queryRunner.manager.getRepository(OperationalRow);

    const project = await projectRepository.findOneBy({ id: parseInt(id) });

    if (!project) {
      await queryRunner.rollbackTransaction();
      return res.status(404).json({ message: 'Proyecto operativo no encontrado' });
    }

    const rowsToDelete = await rowRepository.find({
      where: { operationalProject: { id: parseInt(id) } },
    });

    if (rowsToDelete.length === 0) {
      await queryRunner.rollbackTransaction();
      return res.status(400).json({ message: 'El proyecto no tiene filas operativas registradas' });
    }

    await rowRepository.remove(rowsToDelete);

    await queryRunner.commitTransaction();
    return res.status(200).json({ message: 'Planificación operativa eliminada correctamente' });
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('Error al eliminar planificación operativa:', error);
    return res.status(500).json({ message: 'Error al eliminar la planificación operativa' });
  } finally {
    await queryRunner.release();
  }
};

export const getSummaryData = async (req, res) => {
  try {
    const user = req.user;

    const userRepository = AppDataSource.getRepository(User);
    const projectResponsibleRepo = AppDataSource.getRepository(ProjectResponsible);

    if (user.role === ALLOWED_ROLES.superAdmin || user.role === ALLOWED_ROLES.admin) {
      const strategicPlanRepository = AppDataSource.getRepository(StrategicPlan);
      const operationalPlanRepository = AppDataSource.getRepository(Program);
      const projectRepository = AppDataSource.getRepository(OperationalProject);
      const integrationRepository = AppDataSource.getRepository(ProjectIntegration);

      const [userCount, strategicPlanCount, operationalPlanCount, projectCount] = await Promise.all([
        userRepository.count(),
        strategicPlanRepository.count(),
        operationalPlanRepository.count(),
        projectRepository.count(),
      ]);

      const integratedProjectRows = await integrationRepository
        .createQueryBuilder("integration")
        .select("DISTINCT integration.project_id")
        .getRawMany();
      const integratedProjectCount = integratedProjectRows.length;

      const summary = [
        { clave: "Cantidad de usuarios", valor: userCount },
        { clave: "Planes estratégicos registrados", valor: strategicPlanCount },
        { clave: "Planes operativos registrados", valor: operationalPlanCount },
        { clave: "Proyectos registrados", valor: projectCount },
        { clave: "Proyectos integrados con plataformas", valor: integratedProjectCount },
      ];

      return (
        successResponse(
          res,
          summary,
          'Obtención de resumen de datos exitosa.',
          200
        ));
    }

    if (user.role === ALLOWED_ROLES.user) {
      const strategicPlanRepository = AppDataSource.getRepository(StrategicPlan);

      const strategicPlanCount = await strategicPlanRepository.count();

      const assignedProjects = await projectResponsibleRepo.count({
        where: { user: { id: user.id } },
      });

      const summary = [
        { clave: "Planes estratégicos registrados", valor: strategicPlanCount },
        { clave: "Proyectos asignados", valor: assignedProjects },
      ];

      return (
        successResponse(
          res,
          summary,
          'Obtención de resumen de datos exitosa.',
          200
        ));
    }

  } catch (error) {
    console.log(error);
    return errorResponse(
      res,
      ERROR_CODES.SERVER_ERROR,
      'Error del servidor.',
      500
    );
  }
};

export const getOperationalProjectsWithIntegrations = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "Se requiere el email del usuario" });

    const userRepository = AppDataSource.getRepository(User);
    const projectRepository = AppDataSource.getRepository(OperationalProject);

    // 🔹 Verificamos el usuario y su rol
    const user = await userRepository.findOneBy({ email });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    let projects;

    if (user.role === 'admin') {
      // Todos los proyectos con integraciones
      projects = await projectRepository
        .createQueryBuilder('project')
        .leftJoinAndSelect('project.integrations', 'integrations')
        .leftJoinAndSelect('project.projectResponsibles', 'projectResponsibles')
        .leftJoinAndSelect('projectResponsibles.user', 'user')
        .where('integrations.id IS NOT NULL')
        .orderBy('project.created_at', 'DESC')
        .getMany();
    } else if (user.role === 'coordinator') {
      // Proyectos asignados al coordinador con integraciones
      projects = await projectRepository
        .createQueryBuilder('project')
        .leftJoinAndSelect('project.integrations', 'integrations')
        .leftJoinAndSelect('project.projectResponsibles', 'projectResponsibles')
        .leftJoinAndSelect('projectResponsibles.user', 'user')
        .where('integrations.id IS NOT NULL')
        .andWhere(qb => {
          const subQuery = qb.subQuery()
            .select('pr.operational_project_id')
            .from(ProjectResponsible, 'pr')
            .where('pr.user_id = :userId')
            .getQuery();
          return 'project.id IN ' + subQuery;
        })
        .setParameter('userId', user.id)
        .orderBy('project.created_at', 'DESC')
        .getMany();
    } else {
      return res.status(403).json({ message: 'Rol no autorizado' });
    }

    // Formatear la respuesta
    const formattedProjects = projects.map(project => ({
      id: project.id,
      name: project.name,
      description: project.description,
      created_at: project.created_at,
      updated_at: project.updated_at,
      image_url: project.image_url,
      integrations: project.integrations.map(i => ({
        id: i.id,
        name: i.name,
        platform: i.platform,
        url: i.url,
      })),
      projectResponsibles: project.projectResponsibles.map(r => ({
        id: r.user.id,
        firstName: r.user.firstName,
        lastName: r.user.lastName,
        role: r.user.role,
        email: r.user.email,
        image_url: r.user.image_url,
      })),
    }));

    console.log("holaaaaaaaaaaaaa")

    return res.status(200).json({ projects: formattedProjects });
  } catch (error) {
    console.error('Error al obtener proyectos con integraciones:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};
