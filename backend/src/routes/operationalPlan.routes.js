import { Router } from 'express';

import { verifyJwt } from '../middlewares/verifyJwt.js';
import { deleteOperationalPlanning, getOperationalProjectRows, saveOperationalRowsOfProject } from '../controllers/OperationalPlan.controller.js';
import { authorizeRole } from '../middlewares/authorizedRole.js';
import { ALLOWED_ROLES } from '../config/allowedStatesAndRoles.js';

const operationalPlanRoutes = Router();
 
operationalPlanRoutes.use(verifyJwt);

operationalPlanRoutes.get('/:id', authorizeRole(ALLOWED_ROLES.onlyAdmins), getOperationalProjectRows);
operationalPlanRoutes.post('/updateOperationalPlan/:id', authorizeRole(ALLOWED_ROLES.onlyAdmins), saveOperationalRowsOfProject);
operationalPlanRoutes.delete('/deleteOperationalPlan/:id', authorizeRole(ALLOWED_ROLES.onlyAdmins), deleteOperationalPlanning);

export default operationalPlanRoutes;
 