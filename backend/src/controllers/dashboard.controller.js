import { AppDataSource } from '../../data-source.js';
import { OperationalProject } from '../entities/OperationalProject.js';
import { User } from '../entities/User.js';
import { ProjectResponsible } from '../entities/ProjectResponsible.js';
import { ERROR_CODES, errorResponse, successResponse } from '../utils/apiResponse.js';
import { ALLOWED_ROLES } from '../config/allowedStatesAndRoles.js';

const SUPPORTED_SOCIAL_PLATFORMS = new Set(['github', 'facebook', 'instagram']);

export const getOperationalProjectsWithIntegrations = async (req, res) => {
  try {
    const requester = req.user;
    if (!requester?.id) {
      return errorResponse(
        res,
        ERROR_CODES.USER_UNAUTHORIZED,
        'Usuario no autenticado.',
        401
      );
    }

    const userRepository = AppDataSource.getRepository(User);
    const projectRepository = AppDataSource.getRepository(OperationalProject);

    const user = await userRepository.findOneBy({ id: requester.id });
    if (!user) {
      return errorResponse(
        res,
        ERROR_CODES.USER_NOT_FOUND,
        'Usuario no encontrado en el sistema.',
        404
      );
    }

    let projects;

    if (user.role === ALLOWED_ROLES.superAdmin) {
      // Todos los proyectos con integraciones
      projects = await projectRepository
        .createQueryBuilder('project')
        .leftJoinAndSelect('project.integrations', 'integrations')
        .leftJoinAndSelect('project.projectResponsibles', 'projectResponsibles')
        .leftJoinAndSelect('projectResponsibles.user', 'user')
        .where('integrations.id IS NOT NULL')
        .orderBy('project.created_at', 'DESC')
        .getMany();
    } else if (user.role === ALLOWED_ROLES.admin || user.role === ALLOWED_ROLES.user) {
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
      return errorResponse(
        res,
        ERROR_CODES.USER_UNAUTHORIZED,
        'No tienes permisos para realizar esta acción.',
        403
      );
    }

    // Formatear la respuesta
    const formattedProjects = projects.map(project => ({
      id: project.id,
      name: project.name,
      description: project.description,
      created_at: project.created_at,
      updated_at: project.updated_at,
      image_url: project.image_url,
      integrations: project.integrations
        .filter((i) => SUPPORTED_SOCIAL_PLATFORMS.has(i.platform))
        .map(i => ({
        id: i.id,
        name: i.name,
        integration_id: i.integration_id,
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

    return (
      successResponse(
        res,
        formattedProjects,
        'Proyecto con integraciones recuperado exitosamente.',
        200
      ));

  } catch (error) {
    return errorResponse(
      res,
      ERROR_CODES.SERVER_ERROR,
      'Error del servidor.',
      500
    );
  }
};
