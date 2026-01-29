import { Router } from 'express';

import {
  getFacebookPages,
  getFacebookPageOverview,
  getFacebookPageInsights,
  getFacebookPagePosts,
} from "../../controllers/apis/facebook.controller.js";

const facebookRouter = Router();

facebookRouter.get("/pages", getFacebookPages);

facebookRouter.get("/pages/:pageId/overview", getFacebookPageOverview);
facebookRouter.get("/pages/:pageId/insights", getFacebookPageInsights);
facebookRouter.get("/pages/:pageId/posts", getFacebookPagePosts);

export default facebookRouter;
