import { Router } from 'express';
import { login, logout, me, refresh, getSummaryData } from '../controllers/auth.controller.js';
import { verifyJwt } from '../middlewares/verifyJwt.js';
import { PERMISSIONS } from '../config/rolePermissions.js';
import { authorize } from '../middlewares/authorize.js';

const authRoutes = Router();

authRoutes.post('/login', login);
authRoutes.post('/logout', logout);
authRoutes.get('/me', verifyJwt, authorize(PERMISSIONS.AUTH.ME), me);
authRoutes.post('/refresh', verifyJwt, authorize(PERMISSIONS.AUTH.REFRESH), refresh);
authRoutes.get('/sumaryData/:id', verifyJwt, authorize(PERMISSIONS.SUMMARY_DATA.READ), getSummaryData);  

export default authRoutes;
     