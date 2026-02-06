import { AppDataSource } from '../../data-source.js';
import { OperationalProject } from '../entities/OperationalProject.js';
import { User } from '../entities/User.js';
import { ProjectResponsible } from '../entities/ProjectResponsible.js';
import { ProjectIntegration } from '../entities/ProjectIntegration.js';
import { Program } from '../entities/Program.js';
import { assignResponsibles } from '../utils/assignResponsibles.js';
import { createProjectIntegrations } from '../utils/createProjectIntegrations.js';
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
      return errorResponse(
        res,
        ERROR_CODES.VALIDATION_ERROR,
        'Faltan datos requeridos: nombre y descripción de proyecto son obligatorios.',
        400
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

    // Manejo de imagen
    const imagePath = req.files?.[0]?.optimizedPath || null;

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

    const imagePath = req.files?.[0]?.optimizedPath || null;

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
