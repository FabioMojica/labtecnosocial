import { Router } from 'express';
import { getOperationalProjectsWithIntegrations } from '../controllers/dashboard.controller.js';
import { verifyJwt } from '../middlewares/verifyJwt.js';
import { authorize } from '../middlewares/authorize.js';
import { PERMISSIONS } from '../config/rolePermissions.js';
  
const dashboardRoutes = Router();
  
dashboardRoutes.use(verifyJwt);
   
dashboardRoutes.get('/getProjectsWithIntegrations', authorize(PERMISSIONS.DASHBOARD.READ), getOperationalProjectsWithIntegrations);
  
export default dashboardRoutes;
  