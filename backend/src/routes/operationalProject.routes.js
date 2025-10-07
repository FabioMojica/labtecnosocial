import { Router } from 'express';
import { createOperationalProject, getAllOperationalProjects, assignProjectResponsibles, updateOperationalProject, getProjectById, deleteProjectById,removeProjectResponsible, getOperationalProjectRows, saveOperationalRowsOfProject, deleteOperationalPlanning, getSummaryData } from '../controllers/operationalProjects.controller.js';
import { upload } from '../middlewares/uploads.js';
import { verifyJwt } from '../middlewares/verifyJwt.js';
import { authorizeRole } from '../middlewares/authorizedRole.js';

const operationalProjectRoutes = Router();
 
operationalProjectRoutes.use(verifyJwt);

operationalProjectRoutes.get('/getAll', authorizeRole(["admin"]),getAllOperationalProjects);

operationalProjectRoutes.post('/create', upload.single('file'), createOperationalProject);

operationalProjectRoutes.post('/assign-responsible/:projectId', assignProjectResponsibles);
operationalProjectRoutes.delete('/delete-responsible/:projectId/responsibles/:responsibleId', removeProjectResponsible);
operationalProjectRoutes.patch('/:id', upload.single('file'), updateOperationalProject);
operationalProjectRoutes.get('/getProjectById/:id', getProjectById);
operationalProjectRoutes.delete('/:id', deleteProjectById);
operationalProjectRoutes.get('/complete-project/:id', getOperationalProjectRows);

operationalProjectRoutes.post('/complete-project/save-rows/:id', saveOperationalRowsOfProject);
operationalProjectRoutes.delete('/delete-operational-planning/:id', deleteOperationalPlanning);

operationalProjectRoutes.get('/sumaryData/:id', getSummaryData); 
 
export default operationalProjectRoutes;
 