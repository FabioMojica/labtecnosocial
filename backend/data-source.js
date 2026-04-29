import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { User } from './src/entities/User.js';
import { StrategicPlan } from './src/entities/StrategicPlan.js';
import { Objective } from './src/entities/Objetive.js';
import { Indicator } from './src/entities/Indicator.js';
import { Program } from './src/entities/Program.js';
import { OperationalProject } from './src/entities/OperationalProject.js';
import { OperationalRow } from './src/entities/OperationalRow.js';
import { ProjectResponsible } from './src/entities/ProjectResponsible.js';
import { ProjectIntegration } from './src/entities/ProjectIntegration.js';
import { Report } from './src/entities/Report.js';
import { BudgetRequest } from './src/entities/BudgetRequest.js';
import { BudgetRequestItem } from './src/entities/BudgetRequestItem.js';

dotenv.config();

const isTest = process.env.NODE_ENV === 'test';
const isDev = process.env.NODE_ENV === 'development';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: isTest
    ? (process.env.DB_NAME_TEST || process.env.DB_NAME || 'labtecnosocial_db')
    : (process.env.DB_NAME || 'labtecnosocial_db'),

  // Solo limpia la DB en tests
  synchronize: process.env.DB_SYNCHRONIZE ? process.env.DB_SYNCHRONIZE === 'true' : true,
  dropSchema: isTest, 
  
  logging: process.env.DB_LOGGING ? process.env.DB_LOGGING === 'true' : isDev, 
  entities: [
    User,
    StrategicPlan,
    Objective,
    Indicator,
    Program,
    OperationalProject,
    OperationalRow,
    ProjectResponsible,
    ProjectIntegration,
    Report,
    BudgetRequest,
    BudgetRequestItem,
  ],
});
