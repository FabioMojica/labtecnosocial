import { Router } from 'express';
import {
  getAllStrategicPlans,
  getStrategicPlanByYear,
  updateStrategicPlan,
  deleteStrategicPlanByYear,
} from '../controllers/strategicPlan.controller.js';
import { verifyJwt } from '../middlewares/verifyJwt.js';
import { authorize } from '../middlewares/authorize.js';
import { PERMISSIONS } from '../config/rolePermissions.js';

const strategicPlanRoutes = Router();

strategicPlanRoutes.use(verifyJwt);  
   
strategicPlanRoutes.get('/', authorize(PERMISSIONS.STRATEGIC_PLAN.READ), getAllStrategicPlans);

strategicPlanRoutes.get('/:year', authorize(PERMISSIONS.STRATEGIC_PLAN.READ), getStrategicPlanByYear); 

strategicPlanRoutes.put('/:year', authorize(PERMISSIONS.STRATEGIC_PLAN.UPDATE), updateStrategicPlan);

strategicPlanRoutes.delete("/deleteStrategicPlan/:year", authorize(PERMISSIONS.STRATEGIC_PLAN.DELETE), deleteStrategicPlanByYear);

export default strategicPlanRoutes; 
 