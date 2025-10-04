import { EntitySchema } from 'typeorm';

export const ProjectResponsible = new EntitySchema({
  name: 'ProjectResponsible',
  tableName: 'project_responsibles',
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: 'increment',
    },
  },
  relations: {
    user: {
      type: 'many-to-one',
      target: 'User',
      inverseSide: 'projectResponsibles',
      joinColumn: { name: 'user_id' },
      nullable: false,
      onDelete: 'CASCADE',
    },
    operationalProject: {
      type: 'many-to-one',
      target: 'OperationalProject',
      joinColumn: { name: 'operational_project_id' },
      nullable: false,
      onDelete: 'CASCADE',
    },
  },
});
