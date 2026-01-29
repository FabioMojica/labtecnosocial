import { Router } from 'express';
import { createOperationalProject, getAllOperationalProjects, updateOperationalProject, getProjectById, deleteProjectById } from '../controllers/operationalProjects.controller.js';
import { verifyJwt } from '../middlewares/verifyJwt.js';
import { optimizeImage } from '../middlewares/optimizeImage.js';
import { uploadSingleFile } from '../utils/uploadSingleFiles.js';
import { authorize } from '../middlewares/authorize.js';
import { PERMISSIONS } from '../config/rolePermissions.js';
  
const operationalProjectRoutes = Router();
  
operationalProjectRoutes.use(verifyJwt);
   
operationalProjectRoutes.get('/getAll', authorize(PERMISSIONS.OPERATIONAL_PROJECT.READ), getAllOperationalProjects); 
  
operationalProjectRoutes.post('/create', authorize(PERMISSIONS.OPERATIONAL_PROJECT.CREATE), uploadSingleFile, optimizeImage, createOperationalProject);

operationalProjectRoutes.patch('/:id', authorize(PERMISSIONS.OPERATIONAL_PROJECT.UPDATE), uploadSingleFile, optimizeImage, updateOperationalProject);

operationalProjectRoutes.get('/getProjectById/:id', authorize(PERMISSIONS.OPERATIONAL_PROJECT.READ), getProjectById);  

operationalProjectRoutes.delete('/:id', authorize(PERMISSIONS.OPERATIONAL_PROJECT.DELETE),deleteProjectById);
  
export default operationalProjectRoutes;
 