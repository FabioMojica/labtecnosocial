import { Router } from 'express';

import { getGithubStats, getGitHubRepos, getGithubBranches } from '../../controllers/apis/github.controller.js';
import { verifyJwt } from '../../middlewares/verifyJwt.js';

const githubRouter = Router();

githubRouter.use(verifyJwt);
githubRouter.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

githubRouter.get("/repos", getGitHubRepos);
githubRouter.get("/:projectName/github-stats", getGithubStats);
githubRouter.get("/:projectName/branches", getGithubBranches);

export default githubRouter;
 
