import jwt from 'jsonwebtoken';
import { AppDataSource } from '../../data-source.js';
import { User } from '../entities/User.js';
import { ERROR_CODES, errorResponse } from '../utils/apiResponse.js';

const SECRET_KEY = process.env.JWT_SECRET;

export const verifyJwt = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return (
      errorResponse(
        res,
        ERROR_CODES.TOKEN_MISSING,
        'Token no proveído.',
        403,
      ));
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const userRepo = AppDataSource.getRepository(User);
    const userInDb = await userRepo.findOneBy({ id: decoded.id });

    if (!userInDb) { 
      return (
        errorResponse(
          res,
          ERROR_CODES.USER_NOT_FOUND,
          'Usuario no encontrado en el sistema al verificar el token.',
          401,  
        ));
    }

    if (decoded.sessionVersion !== userInDb.session_version) {
      return (
        errorResponse(
          res,
          ERROR_CODES.SESSION_EXPIRED,
          'Sesión expirada por cambios en el perfil. Por favor vuelve a iniciar sesión.',
          401,
        ));
    }

    req.user = decoded;
    
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      return errorResponse(
        res,
        ERROR_CODES.INVALID_TOKEN,
        'Token inválido o expirado.',
        401
      );
    }

    return errorResponse(
      res,
      ERROR_CODES.SERVER_ERROR,
      'Error del servidor.',
      500
    );
  }
};

