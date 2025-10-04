import { Router } from 'express';

import { getFacebookPages } from '../../controllers/apis/facebook.controller.js';

const facebookRouter = Router();

facebookRouter.get("/pages", getFacebookPages);

export default facebookRouter;
