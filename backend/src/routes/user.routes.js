import { Router } from 'express';
import { createUser, getCoordinators, getUserByEmail, updateUser, getAllUsers, deleteUserByEmail, getAllAdmins } from '../controllers/users.controller.js';
import { verifyJwt } from '../middlewares/verifyJwt.js';
import { uploadSingleFile } from '../utils/uploadSingleFiles.js';
import { authorize } from '../middlewares/authorize.js';
import { PERMISSIONS } from '../config/rolePermissions.js';
import { optimizeImage } from '../middlewares/optimizeImage.js';

const userRoutes = Router();

userRoutes.use(verifyJwt); 
 
userRoutes.post('/createUser', authorize(PERMISSIONS.USER.CREATE), uploadSingleFile, optimizeImage, createUser);
userRoutes.get('/coordinators', authorize(PERMISSIONS.USER.READ), getCoordinators);
 
userRoutes.get('/getAllUsers', authorize(PERMISSIONS.USER.READ), getAllUsers);
userRoutes.get('/getAllAdmins', authorize(PERMISSIONS.USER.READ_ALL_ADMINS), getAllAdmins);

userRoutes.get('/getUserByEmail/:email', authorize(PERMISSIONS.USER.READ), getUserByEmail); 
userRoutes.patch('/updateUser/:originalEmail', authorize(PERMISSIONS.USER.UPDATE), uploadSingleFile, optimizeImage, updateUser);
userRoutes.delete('/deleteUser/:email', authorize(PERMISSIONS.USER.DELETE), deleteUserByEmail);


export default userRoutes; 
  