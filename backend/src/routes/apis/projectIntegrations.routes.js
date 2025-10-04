import { Router } from 'express';
import { updateProjectIntegrations } from '../../controllers/apis/projectIntegrations.controller.js';

const projectIntegrationRouter = Router();

projectIntegrationRouter.put(
  '/:projectId/integrations',
  updateProjectIntegrations
);

export default projectIntegrationRouter;