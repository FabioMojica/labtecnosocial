import { Router } from 'express';
import { login, logout, me, refresh } from '../controllers/auth.controller.js';

const authRoutes = Router();

authRoutes.post('/login', login);
authRoutes.post('/logout', logout);
authRoutes.get('/me', me);
authRoutes.post('/refresh', refresh);

export default authRoutes;
 