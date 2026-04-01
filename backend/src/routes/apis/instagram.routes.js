import { Router } from 'express';
import { verifyJwt } from '../../middlewares/verifyJwt.js';
import { authorize } from '../../middlewares/authorize.js';
import { PERMISSIONS } from '../../config/rolePermissions.js';

import {
  getInstagramPages,
  getInstagramOverview,
  getInstagramInsights,
  getInstagramMedia,
} from '../../controllers/apis/instagram.controller.js';

const instagramRouter = Router();

instagramRouter.use(verifyJwt, authorize(PERMISSIONS.DASHBOARD.READ));

instagramRouter.get("/pages", getInstagramPages);
instagramRouter.get("/:instagramId/overview", getInstagramOverview);
instagramRouter.get("/:instagramId/insights", getInstagramInsights);
instagramRouter.get("/:instagramId/media", getInstagramMedia);

export default instagramRouter;
