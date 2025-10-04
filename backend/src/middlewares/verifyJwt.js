import jwt from 'jsonwebtoken';
import { AppDataSource } from '../../data-source.js';
import { User } from '../entities/User.js';

const SECRET_KEY = 'tu_secreto_super_seguro';

export const verifyJwt = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(403).json({ message: 'Token requerido' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const userRepo = AppDataSource.getRepository(User);
    const userInDb = await userRepo.findOneBy({ id: decoded.id });

    if (!userInDb) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    if (decoded.sessionVersion !== userInDb.session_version) {
      return res.status(401).json({ message: 'Sesión expirada por cambios en el perfil. Por favor vuelve a iniciar sesión.' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};

