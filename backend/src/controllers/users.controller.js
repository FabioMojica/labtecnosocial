import { AppDataSource } from '../../data-source.js';
import { User } from '../entities/User.js';
import { In } from 'typeorm';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { comparePassword, hashPassword } from '../utils/passwordUtils.js';
import { ALLOWED_ROLES, ALLOWED_STATES } from '../config/allowedStatesAndRoles.js';
import { ERROR_CODES, errorResponse, successResponse } from '../utils/apiResponse.js';

export const createUser = async (req, res) => {
  try {
    const user = req.user;
    const { firstName, lastName, email, password, role, state } = req.body;

    if (!firstName || !lastName || !email || !password || !role) {
      return errorResponse(
        res,
        ERROR_CODES.FORBIDDEN,
        'Faltan datos requeridos para crear el usuario.',
        400
      );
    }

    const userRepository = AppDataSource.getRepository(User);

    const existingUser = await userRepository.findOneBy({ email });

    if (role === ALLOWED_ROLES.superAdmin) {
      const existingSuperAdmin = await userRepository.findOne({
        where: { role: ALLOWED_ROLES.superAdmin },
        select: ['id'],
      });

      if (existingSuperAdmin) {
        return errorResponse(
          res,
          ERROR_CODES.FORBIDDEN,
          'Error al crear el usuario: ya existe un super administrador en el sistema.',
          403
        );
      }
    }

    if (existingUser) {
      return (
        errorResponse(
          res,
          ERROR_CODES.VALIDATION_ERROR,
          "El correo que ingresaste ya pertenece a otro usuario. Prueba con uno diferente.",
          409
        )
      );
    }

    const hashedPassword = await hashPassword(password, 10);

    const imagePath = req.files?.[0]?.optimizedPath || null;

    const validatedState = ALLOWED_STATES.statesArray.includes(state) ? state : 'disabled';

    let createdBy = user?.id;

    if (role === ALLOWED_ROLES.superAdmin) {
      createdBy = null;
    }

    const newUser = userRepository.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      state: validatedState,
      image_url: imagePath,
      created_by: createdBy,
    });

    const savedUser = await userRepository.save(newUser);

    const { password: _, ...userWithoutPassword } = savedUser;

    return (
      successResponse(
        res,
        userWithoutPassword,
        'Usuario creado correctamente',
        200
      )
    );

  } catch (error) {
    return (
      errorResponse(
        res,
        ERROR_CODES.SERVER_ERROR,
        "Error del servidor.",
        500
      )
    );
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const userRepository = AppDataSource.getRepository(User);

    let query = await userRepository
      .createQueryBuilder('user')
      .leftJoin('user.projectResponsibles', 'pr')
      .leftJoin('pr.operationalProject', 'project')
      .select([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.email',
        'user.role',
        'user.state',
        'user.image_url',
        'user.created_at',
        'user.updated_at',
      ])
      .addSelect('COUNT(pr.id)', 'project_count')
      .addSelect(
        "COALESCE(JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('id', project.id, 'name', project.name, 'description', project.description, 'image_url', project.image_url)) FILTER (WHERE project.id IS NOT NULL), '[]')",
        'projects'
      )
      .groupBy('user.id')
      .addGroupBy('user.firstName')
      .addGroupBy('user.lastName')
      .addGroupBy('user.email')
      .addGroupBy('user.role')
      .addGroupBy('user.state')
      .addGroupBy('user.image_url')
      .addGroupBy('user.created_at')
      .addGroupBy('user.updated_at')

    const rawUsers = await query.getRawMany();

    const users = rawUsers.map(u => ({
      id: u.user_id,
      firstName: u.user_firstName,
      lastName: u.user_lastName,
      email: u.user_email,
      role: u.user_role,
      state: u.user_state,
      image_url: u.user_image_url,
      created_at: u.user_created_at,
      updated_at: u.user_updated_at,
      projectCount: parseInt(u.project_count, 10) || 0,
      projects: u.projects,
    }));

    return (successResponse(
      res,
      users,
      'Usuarios recuperados exitosamente',
      200,
    ));

  } catch (error) {
    return (
      errorResponse(
        res,
        ERROR_CODES.SERVER_ERROR,
        "Error del servidor.",
        500
      )
    );
  }
};

export const getAllAdmins = async (req, res) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const adminRoles = [ALLOWED_ROLES.admin, ALLOWED_ROLES.superAdmin];

    const admins = await userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.email',
        'user.image_url',
        'user.role',
        'user.state',
      ])
      .where('user.role IN (:...roles)', { roles: adminRoles })
      .getMany();

    return successResponse(res, admins, 'Administradores recuperados exitosamente', 200);

  } catch (error) {
    return errorResponse(res, ERROR_CODES.SERVER_ERROR, 'Error del servidor.', 500);
  }
};



export const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return (
        errorResponse(
          res,
          ERROR_CODES.VALIDATION_ERROR,
          'No se envió el email del usuario a obtener.',
          400,
        )
      );
    }

    const decodedEmail = decodeURIComponent(email);

    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: {
        email: decodedEmail,
        role: In(ALLOWED_ROLES.rolesArray),
      },
      relations: {
        projectResponsibles: {
          operationalProject: true,
        },
        creator: true,
        createdUsers: true,
      },
    });

    if (!user) {
      return (
        errorResponse(
          res,
          ERROR_CODES.USER_NOT_FOUND,
          'Usuario no encontrado en el sistema.',
          404,
        )
      );
    }

    const { password, id, projectResponsibles, creator, createdUsers, ...userData } = user;

    const assignedProjects = projectResponsibles.map(pr => {
      const { ...projectData } = pr.operationalProject;
      return projectData;
    });

    const responsibleData = creator
      ? {
        id: creator.id,
        firstName: creator.firstName,
        lastName: creator.lastName,
        email: creator.email,
        role: creator.role,
        state: creator.state,
        image_url: creator.image_url,
      }
      : null;


    const createdUsersData = createdUsers?.map(u => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      role: u.role,
      state: u.state,
      image_url: u.image_url,
    })) ?? [];

    return (
      successResponse(
        res,
        {
          ...userData,
          projects: assignedProjects,
          createdBy: responsibleData,
          createdUsers: createdUsersData
        },
        'Usuario recuperado exitosamente.',
        200
      )
    );

  } catch (error) {
    console.log(error)
    return (
      errorResponse(
        res,
        ERROR_CODES.SERVER_ERROR,
        'Error del servidor.',
        500,
      )
    );
  }
};

export const updateUser = async (req, res) => {
  try {
    const { originalEmail } = req.params;
    const {
      firstName,
      lastName,
      role,
      state,
      email: newEmail,
      newPassword,
      image_url,
      password,
      oldPassword,
    } = req.body;

    const requester = req.user;

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ email: originalEmail });
    const reqUser = await userRepository.findOneBy({ email: requester?.email });

    if (!user || !reqUser) {
      return (
        errorResponse(
          res,
          ERROR_CODES.USER_NOT_FOUND,
          'Usuario no encontrado en el sistema.',
          404,
        )
      );
    }


    if (!ALLOWED_ROLES.rolesArray.includes(requester.role)) {
      return (
        errorResponse(
          res,
          ERROR_CODES.USER_UNAUTHORIZED,
          'Rol no válido para esta acción.',
          403,
        )
      );
    }

    // CONTROL DE PERMISOS
    const isAdmin = requester.role === ALLOWED_ROLES.admin;
    const isSuperAdmin = requester.role === ALLOWED_ROLES.superAdmin;
    const isUser = requester.role === ALLOWED_ROLES.user;
    const isOwnProfile = requester.email === user.email;


    if (isAdmin && !isOwnProfile && user?.role === ALLOWED_ROLES.admin) {
      return (
        errorResponse(
          res,
          ERROR_CODES.USER_UNAUTHORIZED,
          'No tienes permisos para modificar este perfil.',
          403,
        )
      );
    }

    if (!isAdmin && !isSuperAdmin && !isOwnProfile) {
      return (
        errorResponse(
          res,
          ERROR_CODES.USER_UNAUTHORIZED,
          'No puedes modificar este perfil.',
          403,
        )
      );
    }

    if (isUser && isOwnProfile) {
      // coordinador solo puede actualizar su foto
      if (firstName || lastName || role || state || newEmail || password) {
        return errorResponse(
          res,
          ERROR_CODES.USER_UNAUTHORIZED,
          'Solo puedes actualizar tu foto de perfil.',
          403,
        )
      }
    }

    // VALIDAR ROL NUEVO SI SE INTENTA CAMBIAR
    if (role && !ALLOWED_ROLES.rolesArray.includes(role)) {
      return (
        errorResponse(
          res,
          ERROR_CODES.USER_UNAUTHORIZED,
          'Rol no válido.',
          400,
        )
      );
    }

    let sessionShouldInvalidate = false;

    // SOLO ADMIN PUEDE MODIFICAR ESTOS CAMPOS
    if (isAdmin || isSuperAdmin) {
      if (newEmail && newEmail !== user.email) {
        const existingEmailUser = await userRepository.findOneBy({ email: newEmail });
        if (existingEmailUser) {
          return (
            errorResponse(
              res,
              ERROR_CODES.VALIDATION_ERROR,
              'El email ya está en uso por otro usuario. Intéta con otro.',
              400,
            )
          );
        }
        user.email = newEmail;
        sessionShouldInvalidate = true;
      }

      if (firstName !== undefined) user.firstName = firstName;
      if (lastName !== undefined) user.lastName = lastName;

      if (role !== undefined && role !== user.role) {
        user.role = role;
        sessionShouldInvalidate = true;
      }

      if (state && ALLOWED_STATES.statesArray.includes(state)) {
        if (state !== user.state) {
          user.state = state;
          sessionShouldInvalidate = true;
        }
      }

      if (newPassword && oldPassword && newPassword.trim() !== '') {
        if (!oldPassword || oldPassword.trim() === '') {
          let message;
          if (isSuperAdmin) {
            message = "No se envió la contraseña de tu cuenta"
          } else {
            message = 'No se envió la contraseña antigua del usuario.'
          }
          return (
            errorResponse(
              res,
              ERROR_CODES.VALIDATION_ERROR,
              message,
              400,
            )
          );
        }

        if (isSuperAdmin) {
          if (isOwnProfile) {
            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
              return (
                errorResponse(
                  res,
                  ERROR_CODES.VALIDATION_ERROR,
                  'La contraseña antigua no coincide.',
                  400,
                )
              );
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
            sessionShouldInvalidate = true;
          } else {
            const isMatch = await bcrypt.compare(oldPassword, reqUser.password);
            if (!isMatch) {
              return (
                errorResponse(
                  res,
                  ERROR_CODES.VALIDATION_ERROR,
                  'La contraseña de tu cuenta no coincide.',
                  400,
                )
              );
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
            sessionShouldInvalidate = true;
          }
        } else {
          const isMatch = await bcrypt.compare(oldPassword, user.password);
          if (!isMatch) {
            return (
              errorResponse(
                res,
                ERROR_CODES.VALIDATION_ERROR,
                'La contraseña antigua no coincide.',
                400,
              )
            );
          }

          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(newPassword, salt);
          sessionShouldInvalidate = true;
        }
      }
    }

    const imagePath = req.files?.[0]?.optimizedPath || null;

    if (imagePath) {
      if (user.image_url) {
        const oldImage = user.image_url.startsWith('/uploads/')
          ? user.image_url.slice(9)
          : user.image_url;
        const oldPath = path.join('uploads', oldImage);
        fs.unlink(oldPath, (err) => {
          if (err) console.error('No se pudo eliminar imagen antigua:', err.message, oldPath);
        });
      }
      user.image_url = imagePath;
    } else if (
      image_url === null ||
      image_url === "null"
    ) {
      if (user.image_url) {
        const oldImage = user.image_url.startsWith('/uploads/')
          ? user.image_url.slice(9)
          : user.image_url;
        const oldPath = path.join('uploads', oldImage);
        fs.unlink(oldPath, (err) => {
          if (err) console.error('No se pudo eliminar imagen antigua:', err.message, oldPath);
        });
      }
      user.image_url = null;
    }

    if (sessionShouldInvalidate) user.session_version += 1;

    const updatedUser = await userRepository.save(user);


    // 🔹 Buscar de nuevo incluyendo proyectos
    const userWithProjects = await userRepository.findOne({
      where: { id: updatedUser.id },
      relations: {
        projectResponsibles: {
          operationalProject: true
        },
        creator: true,
        createdUsers: true,
      }
    });

    const { creator, createdUsers } = userWithProjects;

    const responsibleData = {
      id: creator?.id,
      firstName: creator?.firstName,
      lastName: creator?.lastName,
      email: creator?.email,
      role: creator?.role,
      state: creator?.state,
      image_url: creator?.image_url,
    } || null;

    const createdUsersData = createdUsers?.map(u => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      role: u.role,
      state: u.state,
      image_url: u.image_url,
    })) ?? [];

    const assignedProjects = userWithProjects.projectResponsibles.map(pr => pr.operationalProject);
    const { password: _, projectResponsibles, ...userWithoutPassword } = userWithProjects;

    return (
      successResponse(
        res,
        {
          ...userWithoutPassword,
          createdBy: responsibleData,
          createdUsers: createdUsersData,
          projects: assignedProjects
        },
        'Usuario actualizado exitosamente.',
        200
      )
    );

  } catch (error) {
    console.log(error)
    return (
      errorResponse(
        res,
        ERROR_CODES.SERVER_ERROR,
        'Error del servidor.',
        500,
      )
    );
  }
};

export const getCoordinators = async (req, res) => {
  try {
    const userRepository = AppDataSource.getRepository(User);

    const query = userRepository
      .createQueryBuilder('user')
      .leftJoin('user.projectResponsibles', 'pr')
      .where('user.role = :role', { role: 'coordinator' })
      .select([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.email',
        'user.role',
        'user.state',
        'user.image_url',
        'user.created_at',
        'user.updated_at',
      ])

      .addSelect('COUNT(pr.id)', 'project_count')
      .groupBy('user.id')
      .addGroupBy('user.firstName')
      .addGroupBy('user.lastName')
      .addGroupBy('user.email')
      .addGroupBy('user.role')
      .addGroupBy('user.state')
      .addGroupBy('user.image_url')
      .addGroupBy('user.created_at')
      .addGroupBy('user.updated_at')

    const coordinators = await query.getRawMany();

    const result = coordinators.map((c) => ({
      id: c.user_id,
      name: c.user_name,
      email: c.user_email,
      role: c.user_role,
      state: c.user_state,
      image_url: c.user_image_url,
      created_at: c.user_created_at,
      updated_at: c.user_updated_at,
      projectCount: parseInt(c.project_count, 10) || 0,
    }));

    return (
      successResponse(
        res,
        result,
        'Coordinadores recuperados exitosamente.',
        200
      )
    );

  } catch (error) {
    return (
      errorResponse(
        res,
        ERROR_CODES.SERVER_ERROR,
        "Error del servidor.",
        500
      )
    );
  }
};

export const deleteUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const { password } = req.body;

    const userRepository = AppDataSource.getRepository(User);

    if (!req.user) {
      return (
        errorResponse(
          res,
          ERROR_CODES.USER_NOT_FOUND,
          'Usuario solicitante no encontrado en el sistema.',
          404,
        )
      );
    }

    if (req.user.role === ALLOWED_ROLES.superAdmin) {
      if (!email || !password) {
        return (
          errorResponse(
            res,
            ERROR_CODES.VALIDATION_ERROR,
            'El email y la contraseña son requeridos.',
            400,
          )
        );
      }

      const userToDelete = await userRepository.findOne({
        where: { email },
        relations: ['projectResponsibles'],
      });

      if (!userToDelete) {
        return (
          errorResponse(
            res,
            ERROR_CODES.USER_NOT_FOUND,
            'Usuario a eliminar no encontrado en el sistema.',
            404,
          )
        );
      }

      if (userToDelete.email === req.user.email) {
        return (
          errorResponse(
            res,
            ERROR_CODES.USER_UNAUTHORIZED,
            'No puedes eliminar tu propia cuenta.',
            403,
          )
        );
      }

      const userSuperAdmin = await userRepository.findOne({
        where: { email: req.user.email },
      });

      const isPasswordValid = await comparePassword(password, userSuperAdmin.password);
      if (!isPasswordValid) {
        return (
          errorResponse(
            res,
            ERROR_CODES.VALIDATION_ERROR,
            'La contraseña ingresada no coincide.',
            401,
          )
        );
      }

      if (userToDelete.role === ALLOWED_ROLES.admin || userToDelete.role === ALLOWED_ROLES.user) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
          await queryRunner.manager
            .createQueryBuilder()
            .update(User)
            .set({ created_by: userSuperAdmin.id })
            .where("created_by = :adminId", { adminId: userToDelete.id })
            .execute();

          await queryRunner.manager.remove(User, userToDelete);

          await queryRunner.commitTransaction();

          return successResponse(
            res,
            {},
            'Administrador eliminado y ownership reasignado correctamente',
            200
          );
        } catch (error) {
          await queryRunner.rollbackTransaction();
          throw error;
        } finally {
          await queryRunner.release();
        }
      }

      await userRepository.remove(userToDelete);

      return (
        successResponse(
          res,
          {},
          'Usuario eliminado exitosamente del sistema',
          200
        )
      );
    } else if (req.user.role === ALLOWED_ROLES.admin) {
      if (!email || !password) {
        return (
          errorResponse(
            res,
            ERROR_CODES.VALIDATION_ERROR,
            'El email y la contraseña son requeridos.',
            400,
          )
        );
      }

      const userToDelete = await userRepository.findOne({
        where: { email },
        relations: ['projectResponsibles'],
      });

      if (!userToDelete) {
        return (
          errorResponse(
            res,
            ERROR_CODES.USER_NOT_FOUND,
            'Usuario no encontrado en el sistema.',
            404,
          )
        );
      }

      if (userToDelete.role === ALLOWED_ROLES.admin) {
        return (
          errorResponse(
            res,
            ERROR_CODES.USER_UNAUTHORIZED,
            'No puedes eliminar a otro administrador.',
            403,
          )
        );
      }

      if (userToDelete.email === req.user.email) {
        return (
          errorResponse(
            res,
            ERROR_CODES.USER_UNAUTHORIZED,
            'No puedes eliminar tu propia cuenta.',
            403,
          )
        );
      }

      const isPasswordValid = await comparePassword(password, userToDelete.password);
      if (!isPasswordValid) {
        return (
          errorResponse(
            res,
            ERROR_CODES.VALIDATION_ERROR,
            'Email o contraseña incorrectos.',
            401,
          )
        );
      }

      await userRepository.remove(userToDelete);

      return (
        successResponse(
          res,
          {},
          'Usuario eliminado exitosamente del sistema',
          200
        )
      );

    } else {
      return (
        errorResponse(
          res,
          ERROR_CODES.USER_UNAUTHORIZED,
          'No tienes permisos para realizar esta acción.',
          403,
        )
      );
    }
  } catch (error) {
    return (
      errorResponse(
        res,
        ERROR_CODES.SERVER_ERROR,
        'Error del servidor.',
        500,
      )
    );
  }
};

