import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import operationalProjectRoutes from './routes/operationalProject.routes.js';
import strategicPlanRoutes from './routes/strategicPlan.routes.js';
import githubRouter from './routes/apis/github.routes.js';
import facebookRouter from './routes/apis/facebook.routes.js';
import instagramRouter from './routes/apis/instagram.routes.js';

import dotenv from 'dotenv';
import projectIntegrationRouter from './routes/apis/projectIntegrations.routes.js';
import XRouter from './routes/apis/X.routes.js';
import cookieParser from 'cookie-parser';
import operationalPlanRoutes from './routes/operationalPlan.routes.js';

import multer from 'multer';

dotenv.config();

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://npml7czc-5173.brs.devtunnels.ms',
  'https://mi-dominio.com'
];

app.use(cors({
  // origin: function (origin, callback) {
  //   if (!origin || allowedOrigins.includes(origin)) {
  //     callback(null, true);
  //   } else {
  //     callback(new Error('No permitido por CORS'));
  //   }
  // },
  origin: true,
  credentials: true,
}));


app.use(cookieParser());

app.use(express.json());
// if (process.env.NODE_ENV !== 'test') {
//   app.use(morgan('dev')); 
// }

app.use(morgan('dev'));


app.use('/api/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', operationalProjectRoutes);  
app.use('/api/strategic-plans', strategicPlanRoutes);
app.use('/api/operational-plans', operationalPlanRoutes);
app.use('/api/apis/github', githubRouter);
app.use('/api/apis/facebook', facebookRouter);
app.use('/api/apis/instagram', instagramRouter);
app.use('/api/apis/X', XRouter);
app.use('/api/apis/project-integration', projectIntegrationRouter);

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        message: 'La imagen es demasiado pesada. Máximo permitido: 2MB'
      });
    } 
    
    return res.status(400).json({
      message: `Error al subir archivo: ${err.message}`
    });
  }

  if (err) {
    return res.status(500).json({
      message: err.message || 'Error interno del servidor'
    });
  }

  next();
});


export default app;
