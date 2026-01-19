import { Router } from 'express';
import {
  getAllStrategicPlans,
  getStrategicPlanByYear,
  updateStrategicPlan,
  deleteStrategicPlanByYear,
} from '../controllers/strategicPlan.controller.js';
import { verifyJwt } from '../middlewares/verifyJwt.js';
import { authorizeRole } from '../middlewares/authorizedRole.js';
import { ALLOWED_ROLES } from '../config/allowedStatesAndRoles.js';

const strategicPlanRoutes = Router();

strategicPlanRoutes.use(verifyJwt); 
   
strategicPlanRoutes.get('/', authorizeRole(), getAllStrategicPlans);
strategicPlanRoutes.get('/:year', authorizeRole(), getStrategicPlanByYear);
strategicPlanRoutes.put('/:year', authorizeRole(ALLOWED_ROLES.onlyAdmins), updateStrategicPlan);
strategicPlanRoutes.delete("/deleteStrategicPlan/:year", authorizeRole(ALLOWED_ROLES.superAdmin), deleteStrategicPlanByYear);

export default strategicPlanRoutes; 
