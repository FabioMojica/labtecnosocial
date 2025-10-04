import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './src/entities/User.js';
import { StrategicPlan } from './src/entities/StrategicPlan.js';
import { Objective } from './src/entities/Objetive.js';
import { Indicator } from './src/entities/Indicator.js';
import { Program } from './src/entities/Program.js';
import { OperationalProject } from './src/entities/OperationalProject.js';
import { OperationalRow } from './src/entities/OperationalRow.js';
import { ProjectResponsible } from './src/entities/ProjectResponsible.js';
import { ProjectIntegration } from './src/entities/ProjectIntegration.js';

const isTest = process.env.NODE_ENV === 'test';
const isDev = process.env.NODE_ENV === 'development';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: isTest 
    ? 'labtecnosocial_test' 
    : 'labtecnosocial_db',

  // Solo limpia la DB en tests
  synchronize: true,
  dropSchema: isTest, 
  
  logging: isDev, // solo log en desarrollo
  entities: [
    User,
    StrategicPlan,
    Objective,
    Indicator,
    Program,
    OperationalProject,
    OperationalRow,
    ProjectResponsible,
    ProjectIntegration
  ],
});
