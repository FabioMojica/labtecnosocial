import { Router } from 'express';

import { getGithubStats, getGitHubRepos, getGithubBranches } from '../../controllers/apis/github.controller.js';
import { verifyJwt } from '../../middlewares/verifyJwt.js';

const githubRouter = Router();

githubRouter.use(verifyJwt);

githubRouter.get("/repos", getGitHubRepos);
githubRouter.get("/:projectName/github-stats", getGithubStats);
githubRouter.get("/:projectName/branches", getGithubBranches);

export default githubRouter;
