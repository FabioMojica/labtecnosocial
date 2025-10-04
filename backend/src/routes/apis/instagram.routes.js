import { Router } from 'express';

import { getInstagramPages } from '../../controllers/apis/instagram.controller.js';

const instagramRouter = Router();

instagramRouter.get("/pages", getInstagramPages);

export default instagramRouter;
