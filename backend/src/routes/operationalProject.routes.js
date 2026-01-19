import { Router } from 'express';
import { createOperationalProject, getAllOperationalProjects, assignProjectResponsibles, updateOperationalProject, getProjectById, deleteProjectById,removeProjectResponsible, getOperationalProjectRows, saveOperationalRowsOfProject, deleteOperationalPlanning, getSummaryData, getOperationalProjectsWithIntegrations } from '../controllers/operationalProjects.controller.js';
import { upload } from '../middlewares/uploads.js';
import { verifyJwt } from '../middlewares/verifyJwt.js';
import { authorizeRole } from '../middlewares/authorizedRole.js';
import { ALLOWED_ROLES } from '../config/allowedStatesAndRoles.js';
 
const operationalProjectRoutes = Router();
 
operationalProjectRoutes.use(verifyJwt);

operationalProjectRoutes.get('/getAll', authorizeRole(), getAllOperationalProjects);
 
operationalProjectRoutes.post('/create', authorizeRole(ALLOWED_ROLES.onlyAdmins),upload.single('file'), createOperationalProject);

operationalProjectRoutes.post('/assign-responsible/:projectId', authorizeRole(ALLOWED_ROLES.onlyAdmins), assignProjectResponsibles);

operationalProjectRoutes.patch('/:id', authorizeRole(ALLOWED_ROLES.onlyAdmins), upload.single('file'), updateOperationalProject);

operationalProjectRoutes.get('/getProjectById/:id', authorizeRole(ALLOWED_ROLES.onlyAdmins), getProjectById);
operationalProjectRoutes.delete('/:id', authorizeRole(ALLOWED_ROLES.onlyAdmins),deleteProjectById);
operationalProjectRoutes.get('/complete-project/:id', authorizeRole(ALLOWED_ROLES.onlyAdmins),getOperationalProjectRows);

operationalProjectRoutes.post('/complete-project/save-rows/:id', authorizeRole(ALLOWED_ROLES.onlyAdmins),saveOperationalRowsOfProject);
operationalProjectRoutes.delete('/delete-operational-planning/:id', authorizeRole(ALLOWED_ROLES.onlyAdmins),deleteOperationalPlanning);

operationalProjectRoutes.get('/sumaryData/:id', authorizeRole(ALLOWED_ROLES.onlyAdmins), getSummaryData); 
 

operationalProjectRoutes.get('/getProjectsWithIntegrations',authorizeRole(ALLOWED_ROLES.onlyAdmins), getOperationalProjectsWithIntegrations);
 
export default operationalProjectRoutes;
  