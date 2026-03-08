import { Router } from 'express';

import {
  getXAccounts,
  getXOverview,
  getXTweets,
} from '../../controllers/apis/X.controller.js';

const XRouter = Router();

XRouter.get("/accounts", getXAccounts);
XRouter.get("/:accountId/overview", getXOverview);
XRouter.get("/:accountId/tweets", getXTweets);

export default XRouter;
