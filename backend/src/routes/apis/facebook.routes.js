import { Router } from 'express';

import {
  getFacebookPages,
  getFacebookPageOverview,
  getFacebookPageInsights,
  getFacebookPagePosts,
} from "../../controllers/apis/facebook.controller.js";

const facebookRouter = Router(); 

facebookRouter.get("/pages", getFacebookPages);
facebookRouter.get("/:pageId/overview", getFacebookPageOverview);
facebookRouter.get("/:pageId/insights", getFacebookPageInsights);
facebookRouter.get("/:pageId/posts", getFacebookPagePosts);

export default facebookRouter;
 