import { Router } from 'express';
import { createUser, getCoordinators, getUserByEmail, updateUser, getAllUsers, deleteUserByEmail } from '../controllers/users.controller.js';
import { upload } from '../middlewares/uploads.js';
import { verifyJwt } from '../middlewares/verifyJwt.js';
import { uploadSingleFile } from '../utils/uploadSingleFiles.js';
import { authorizeRole } from '../middlewares/authorizedRole.js';

const userRoutes = Router();

userRoutes.use(verifyJwt); 

userRoutes.post('/createUser', uploadSingleFile, authorizeRole(["admin"]), createUser);
userRoutes.get('/coordinators',getCoordinators);
userRoutes.get('/getAllUsers', authorizeRole(["admin"]), getAllUsers);
userRoutes.get('/getUserByEmail/:email', getUserByEmail);
userRoutes.patch('/updateUser/:originalEmail', upload.single('file'), updateUser);
userRoutes.delete('/deleteUser/:email', deleteUserByEmail);

export default userRoutes;
 