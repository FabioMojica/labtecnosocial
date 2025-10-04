import { Router } from 'express';

import { getXAccounts } from '../../controllers/apis/X.controller.js';

const XRouter = Router();

XRouter.get("/accounts", getXAccounts);

export default XRouter;
