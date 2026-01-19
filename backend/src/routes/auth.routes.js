import { Router } from 'express';
import { login, logout, me, refresh } from '../controllers/auth.controller.js';
import { authorizeRole } from '../middlewares/authorizedRole.js';
import { verifyJwt } from '../middlewares/verifyJwt.js';
import { ALLOWED_ROLES } from '../config/allowedStatesAndRoles.js';

const authRoutes = Router();

authRoutes.post('/login', login);
authRoutes.post('/logout', logout);
authRoutes.get('/me', verifyJwt, authorizeRole(), me);
authRoutes.post('/refresh', verifyJwt, authorizeRole(), refresh);

export default authRoutes;
  