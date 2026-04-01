import { ROLE_PERMISSIONS } from "../config/rolePermissions.js";
import { errorResponse, ERROR_CODES } from '../utils/apiResponse.js';

export const authorize = (requiredPermission) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user?.role) {
      return errorResponse(
        res,
        ERROR_CODES.AUTH_ERROR,
        'Usuario no autenticado.',
        401
      );
    } 

    const userPerms = ROLE_PERMISSIONS[user.role] || []; 

    if (!userPerms.includes(requiredPermission)) {
      return errorResponse( 
        res,
        ERROR_CODES.USER_UNAUTHORIZED,
        'No tienes permisos para realizar esta acción.',
        403
      );
    }
     
    next(); 
  };
};
