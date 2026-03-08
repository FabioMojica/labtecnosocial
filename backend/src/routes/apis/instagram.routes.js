import { Router } from 'express';

import {
  getInstagramPages,
  getInstagramOverview,
  getInstagramInsights,
  getInstagramMedia,
} from '../../controllers/apis/instagram.controller.js';

const instagramRouter = Router();

instagramRouter.get("/pages", getInstagramPages);
instagramRouter.get("/:instagramId/overview", getInstagramOverview);
instagramRouter.get("/:instagramId/insights", getInstagramInsights);
instagramRouter.get("/:instagramId/media", getInstagramMedia);

export default instagramRouter;
