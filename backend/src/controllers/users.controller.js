import { AppDataSource } from '../../data-source.js';
import { User } from '../entities/User.js';
import { In } from 'typeorm';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { comparePassword, hashPassword } from '../utils/passwordUtils.js';

export const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, state } = req.body;

    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({ message: 'Faltan datos requeridos' });
    }

    const userRepository = AppDataSource.getRepository(User);

    const existingUser = await userRepository.findOneBy({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'El correo ya está registrado' });
    }

    const hashedPassword = await hashPassword(password, 10);

    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }
    const allowedStates = ['habilitado', 'deshabilitado', 'eliminado'];

    const validatedState = allowedStates.includes(state) ? state : 'deshabilitado';

    const newUser = userRepository.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      state: validatedState,
      image_url: imageUrl,
    });

    const savedUser = await userRepository.save(newUser);

    const { password: _, ...userWithoutPassword } = savedUser;

    return res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const userRepository = AppDataSource.getRepository(User);

    const rawUsers = await userRepository
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
      .getRawMany();

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

    return res.json({ users: users, status: 200 });
  } catch (error) {
    console.error('Error al obtener todos los usuarios con proyectos:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ message: 'Falta el parámetro email' });
    }

    const decodedEmail = decodeURIComponent(email);

    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: {
        email: decodedEmail,
        role: In(['coordinator', 'admin']),
      },
      relations: {
        projectResponsibles: {
          operationalProject: true,
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const { password, id, projectResponsibles, ...userData } = user;

    const assignedProjects = projectResponsibles.map(pr => {
      const { id, ...projectData } = pr.operationalProject;
      return projectData;
    });

    return res.json({
      ...userData,
      projects: assignedProjects,
    });

  } catch (error) {
    console.error('Error al obtener el usuario por email:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { email } = req.params;
    const {
      firstName,
      lastName,
      role,
      state,
      email: newEmail,
      password,
      image_url,
    } = req.body;

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ email });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const allowedRoles = ['admin', 'coordinator'];
    const requester = req.user;


    if (!allowedRoles.includes(requester.role)) {
      return res.status(403).json({ message: 'Rol no válido para esta acción' });
    }

    // CONTROL DE PERMISOS
    const isAdmin = requester.role === 'admin';
    const isOwnProfile = requester.email === email;

    if (!isAdmin && !isOwnProfile) {
      return res.status(403).json({ message: 'No puedes modificar este perfil' });
    }

    if (!isAdmin && isOwnProfile) {
      // coordinador solo puede actualizar su foto
      if (firstName || lastName || role || state || newEmail || password) {
        return res.status(403).json({ message: 'Coordinador solo puede actualizar su foto' });
      }
    }

    // VALIDAR ROL NUEVO SI SE INTENTA CAMBIAR
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Rol no válido' });
    }

    let sessionShouldInvalidate = false;

    // SOLO ADMIN PUEDE MODIFICAR ESTOS CAMPOS
    if (isAdmin) {
      if (newEmail && newEmail !== email) {
        const existingEmailUser = await userRepository.findOneBy({ email: newEmail });
        if (existingEmailUser) {
          return res.status(400).json({ message: 'El email ya está en uso por otro usuario' });
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

      if (state && ['habilitado', 'deshabilitado', 'eliminado'].includes(state)) {
        if (state !== user.state) {
          user.state = state;
          sessionShouldInvalidate = true;
        }
      }

      if (password && password.trim() !== '') {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        sessionShouldInvalidate = true;
      }
    }

    if (req.file) {
      if (user.image_url) {
        const oldImage = user.image_url.startsWith('/uploads/')
          ? user.image_url.slice(9)
          : user.image_url;
        const oldPath = path.join('uploads', oldImage);
        fs.unlink(oldPath, (err) => {
          if (err) console.error('No se pudo eliminar imagen antigua:', err.message, oldPath);
        });
      }
      user.image_url = `/uploads/${req.file.filename}`;
    } else if (image_url === '') {
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
    const { password: _, ...userWithoutPassword } = updatedUser;

    return res.json(userWithoutPassword);

  } catch (error) {
    console.error('Error actualizando usuario:', error);
    return res.status(500).json({ message: 'Error del servidor' });
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
    return res.json(result);
  } catch (error) {
    console.error('Error fetching coordinators with project counts:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const deleteUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const { password, requesterEmail } = req.body;

    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permisos para realizar esta acción.' });
    }

    if (!email || !password || !requesterEmail) {
      return res.status(400).json({ message: 'Email, contraseña y requesterEmail son requeridos.' });
    }

    const userRepository = AppDataSource.getRepository(User);

    const userToDelete = await userRepository.findOne({
      where: { email },
      relations: ['projectResponsibles'],
    });

    if (!userToDelete) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const requestingUser = await userRepository.findOneBy({ email: requesterEmail });

    if (!requestingUser || requestingUser.role !== 'admin') {
      return res.status(403).json({ message: 'Solicitud no autorizada.' });
    }

    if (
      userToDelete.role === 'admin' &&
      userToDelete.email !== requestingUser.email
    ) {
      return res.status(403).json({
        message: 'No puedes eliminar otro administrador, solo tu propia cuenta.',
      });
    }

    const isPasswordValid = await comparePassword(password, userToDelete.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    await userRepository.remove(userToDelete);

    return res.status(200).json({ message: 'Usuario eliminado correctamente.' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

