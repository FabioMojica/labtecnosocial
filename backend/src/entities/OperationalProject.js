import { EntitySchema } from 'typeorm';

export const OperationalProject = new EntitySchema({
  name: 'OperationalProject',
  tableName: 'operational_projects',
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: 'increment',
    }, 
    project_version: {
      type: Number,
      default: 0, 
    },
    operationalPlan_version: {
      type: Number, 
      default: 0,
    },
    name: { 
      type: String,
      length: 100,
      nullable: false,
    },
    description: {
      type: String,
      length: 300,
      nullable: true,
    },
    image_url: {
      type: String,
      nullable: true, 
    },
    created_at: {
      type: 'timestamp',
      createDate: true,
      default: () => 'NOW()',
    },
    updated_at: {
      type: 'timestamp',
      updateDate: true, 
      default: () => 'NOW()',
    },
    operationalPlan_created_at: {
      type: 'timestamp',
      nullable: true,  
    },
    operationalPlan_updated_at: {
      type: 'timestamp',
      nullable: true, 
    },
  },
  relations: {
    program: {
      name: 'program',
      type: 'many-to-one',
      target: 'Program',
      joinColumn: { name: 'program_id' },
      nullable: true,
      onDelete: 'SET NULL',
    },
    operationalRows: {
      type: 'one-to-many',
      target: 'OperationalRow',
      inverseSide: 'operationalProject',
      cascade: true,
    },
    projectResponsibles: {
      type: 'one-to-many',
      target: 'ProjectResponsible',
      inverseSide: 'operationalProject',
      cascade: true,
    },
    integrations: { 
      type: 'one-to-many',
      target: 'ProjectIntegration',
      inverseSide: 'project',
      cascade: true,
    },
  },
});
