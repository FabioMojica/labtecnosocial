import { Router } from 'express';

import { verifyJwt } from '../middlewares/verifyJwt.js';
import { deleteOperationalPlanOfProject, getOperationalPlanOfProject, saveOperationalPlanOfProject } from '../controllers/OperationalPlan.controller.js';
import { authorize } from '../middlewares/authorize.js';
import { PERMISSIONS } from '../config/rolePermissions.js';


const operationalPlanRoutes = Router(); 
 
operationalPlanRoutes.use(verifyJwt);

operationalPlanRoutes.get('/:id', authorize(PERMISSIONS.OPERATIONAL_PLAN.READ), getOperationalPlanOfProject);
operationalPlanRoutes.post('/updateOperationalPlan/:id', authorize(PERMISSIONS.OPERATIONAL_PLAN.UPDATE), saveOperationalPlanOfProject);
operationalPlanRoutes.delete('/deleteOperationalPlan/:id', authorize(PERMISSIONS.OPERATIONAL_PLAN.DELETE), deleteOperationalPlanOfProject);

export default operationalPlanRoutes;
  