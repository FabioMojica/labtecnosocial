import { Router } from 'express';

import { verifyJwt } from '../middlewares/verifyJwt.js';
import { deleteOperationalPlanning, getOperationalProjectRows, saveOperationalRowsOfProject } from '../controllers/OperationalPlan.controller.js';

const operationalPlanRoutes = Router();
 
operationalPlanRoutes.use(verifyJwt);

operationalPlanRoutes.get('/:id', getOperationalProjectRows);
operationalPlanRoutes.post('/updateOperationalPlan/:id', saveOperationalRowsOfProject);
operationalPlanRoutes.delete('/deleteOperationalPlan/:id', deleteOperationalPlanning);

export default operationalPlanRoutes;
 