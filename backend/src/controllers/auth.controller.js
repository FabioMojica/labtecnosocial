import { AppDataSource } from '../../data-source.js';
import { User } from '../entities/User.js';
import jwt from 'jsonwebtoken';
import { comparePassword } from '../utils/passwordUtils.js';
import { ERROR_CODES, errorResponse, successResponse } from '../utils/apiResponse.js';

const SECRET_KEY = 'tu_secreto_super_seguro';

export const me = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return ( 
        errorResponse(
          res,
          ERROR_CODES.TOKEN_MISSING,
          'Token no proveido.',
          401,
        )
      );
    };

    const token = authHeader.split(" ")[1];
    if (!token) {
      return (
        errorResponse(
          res,
          ERROR_CODES.TOKEN_INVALID,
          'Token inválido.',
          401,
        )
      );
    };

    const decoded = jwt.verify(token, SECRET_KEY);

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ id: decoded.id });

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

    return (
      successResponse(
        res,
        { user },
        'Verificación exitosa',
        200
      )
    );

  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      return errorResponse(
        res,
        ERROR_CODES.INVALID_TOKEN,
        'Token inválido o expirado.',
        401
      );
    }

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

export const refresh = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return (
    errorResponse(
      res,
      ERROR_CODES.TOKEN_MISSING,
      'Refresh Token no proveido.',
      401,
    ));
  }
 
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ id: decoded.id });
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
    const newToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role, sessionVersion: user.session_version },
      SECRET_KEY,
      { expiresIn: "20s" }
    );
    return (
      successResponse(
        res,
        { token: newToken, user },
        'Sesión refrescada exitosamente.',
        200
      )
    );
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

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return (
      errorResponse(
        res,
        ERROR_CODES.VALIDATION_ERROR,
        'El email y contraseña son requeridos.',
        400,
      )
    );
  }

  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ email });

    if (!user) {
      return (
        errorResponse(
          res,
          ERROR_CODES.USER_NOT_FOUND,
          'Usuario no encontrado en el sistema.',
          401,
        )
      );
    }

    if (user.state === 'deshabilitado' && user.role !== 'admin') {
      return (
        errorResponse(
          res,
          ERROR_CODES.USER_DISABLED,
          'Cuenta deshabilitada.',
          403,
        )
      );
    }

    const passwordMatch = await comparePassword(password, user.password);

    if (!passwordMatch) {
      return (
        errorResponse(
          res,
          ERROR_CODES.INVALID_CREDENTIALS,
          'Credenciales incorrectas.',
          401,
        )
      );
    }

    const accessToken = jwt.sign(
      {
        email: user.email,
        id: user.id,
        role: user.role,
        sessionVersion: user.session_version,
      },
      SECRET_KEY,
      { expiresIn: '20s' }
    );

    const refreshToken = jwt.sign(
      {
        email: user.email,
        id: user.id,
        role: user.role,
        sessionVersion: user.session_version,
      },
      SECRET_KEY,
      { expiresIn: '7d' }
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });

    return (
      successResponse(
        res,
        { user, accessToken },
        'Inicio de sesión exitoso',
        200
      )
    );

  } catch (error) {
    return errorResponse(
      res,
      ERROR_CODES.SERVER_ERROR,
      'Error del servidor',
      500
    );
  }
};

export const logout = (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
  });

  return (
    successResponse(
      res,
      {},
      'Logout exitoso.',
      200,
    )
  );
};