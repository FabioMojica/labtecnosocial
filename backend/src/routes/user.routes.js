import { Router } from 'express';
import { createUser, getCoordinators, getUserByEmail, updateUser, getAllUsers, deleteUserByEmail } from '../controllers/users.controller.js';
import { upload } from '../middlewares/uploads.js';
import { verifyJwt } from '../middlewares/verifyJwt.js';
import { uploadSingleFile } from '../utils/uploadSingleFiles.js';
import { authorizeRole } from '../middlewares/authorizedRole.js';
import { ALLOWED_ROLES } from '../config/allowedStatesAndRoles.js';

const userRoutes = Router();

userRoutes.use(verifyJwt); 

userRoutes.post('/createUser', authorizeRole(ALLOWED_ROLES.onlyAdmins), uploadSingleFile, createUser);
userRoutes.get('/coordinators', authorizeRole(ALLOWED_ROLES.onlyAdmins), getCoordinators);
userRoutes.get('/getAllUsers', authorizeRole(ALLOWED_ROLES.onlyAdmins), getAllUsers);
userRoutes.get('/getUserByEmail/:email', authorizeRole(), getUserByEmail); 
userRoutes.patch('/updateUser/:originalEmail', authorizeRole(ALLOWED_ROLES.onlyAdmins), upload.single('file'), updateUser);
userRoutes.delete('/deleteUser/:email', authorizeRole(ALLOWED_ROLES.onlyAdmins), deleteUserByEmail);

export default userRoutes; 
 