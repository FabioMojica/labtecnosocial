import { Router } from 'express';
import { updateProjectIntegrations } from '../../controllers/apis/projectIntegrations.controller.js';
import { verifyJwt } from '../../middlewares/verifyJwt.js';
import { authorize } from '../../middlewares/authorize.js';
import { PERMISSIONS } from '../../config/rolePermissions.js';

const projectIntegrationRouter = Router();

projectIntegrationRouter.use(verifyJwt, authorize(PERMISSIONS.OPERATIONAL_PROJECT.UPDATE));

projectIntegrationRouter.put(
  '/:projectId/integrations',
  updateProjectIntegrations
);

export default projectIntegrationRouter;
