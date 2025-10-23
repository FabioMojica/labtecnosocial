import { Router } from 'express';
import {
  getAllStrategicPlans,
  getStrategicPlanByYear,
  updateStrategicPlan,
  deleteStrategicPlanByYear,
} from '../controllers/strategicPlan.controller.js';
import { verifyJwt } from '../middlewares/verifyJwt.js';

const strategicPlanRoutes = Router();

strategicPlanRoutes.use(verifyJwt);

strategicPlanRoutes.get('/', getAllStrategicPlans);
strategicPlanRoutes.get('/:year', getStrategicPlanByYear);
strategicPlanRoutes.put('/:year', updateStrategicPlan);
strategicPlanRoutes.delete("/deleteStrategicPlan/:year", deleteStrategicPlanByYear);

export default strategicPlanRoutes;
