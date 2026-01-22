import { ALLOWED_ROLES } from "../config/allowedStatesAndRoles.js";
import { ERROR_CODES, errorResponse } from "../utils/apiResponse.js";

export const authorizeRole = (roles = ALLOWED_ROLES.rolesArray) => {
  return (req, res, next) => {
    if (!req.user) {
      return (
        errorResponse(
          res,
          ERROR_CODES.USER_NOT_FOUND,
          'Usuario no proveído.',
          401, 
        )
      );
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(req.user.role)) { 
      return ( 
        errorResponse(
          res,
          ERROR_CODES.USER_UNAUTHORIZED,
          'NO tienes permisos para acceder a esta ruta.',
          403,
        )
      );
    }

    next();
  };
};
