import { Router } from 'express';
import { verifyJwt } from '../../middlewares/verifyJwt.js';
import { authorize } from '../../middlewares/authorize.js';
import { PERMISSIONS } from '../../config/rolePermissions.js';

import {
  getFacebookPages,
  getFacebookPageOverview,
  getFacebookPageInsights,
  getFacebookPagePosts,
} from "../../controllers/apis/facebook.controller.js";

const facebookRouter = Router(); 

facebookRouter.use(verifyJwt, authorize(PERMISSIONS.DASHBOARD.READ));

facebookRouter.get("/pages", getFacebookPages);
facebookRouter.get("/:pageId/overview", getFacebookPageOverview);
facebookRouter.get("/:pageId/insights", getFacebookPageInsights);
facebookRouter.get("/:pageId/posts", getFacebookPagePosts);

export default facebookRouter;
 
