import { Router } from 'express';
import { createReport, deleteReport, getAllReports, getReportById, updateReport } from '../controllers/reports.controller.js';
import { verifyJwt } from '../middlewares/verifyJwt.js';
import { uploadSingleFile } from '../utils/uploadSingleFiles.js';
import { authorize } from '../middlewares/authorize.js';
import { PERMISSIONS } from '../config/rolePermissions.js';
import { optimizeImage } from '../middlewares/optimizeImage.js';

const reportRoutes = Router();

reportRoutes.use(verifyJwt); 

reportRoutes.get(
  '/',
  authorize(PERMISSIONS.REPORT.READ_ALL),
  getAllReports
);

reportRoutes.get(
  '/:reportId',
  authorize(PERMISSIONS.REPORT.READ_REPORT),
  getReportById
);


reportRoutes.post(
  '/createReport',
  authorize(PERMISSIONS.REPORT.CREATE),
  uploadSingleFile,
  optimizeImage,
  createReport 
);

reportRoutes.put(
  '/:reportId',
  authorize(PERMISSIONS.REPORT.CREATE),
  uploadSingleFile,
  optimizeImage,
  updateReport 
);

reportRoutes.delete(
  '/:reportId',
  authorize(PERMISSIONS.REPORT.DELETE),
  deleteReport
);


export default reportRoutes; 
  