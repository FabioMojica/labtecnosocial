import { EntitySchema } from 'typeorm';

export const OperationalRow = new EntitySchema({
  name: 'OperationalRow',
  tableName: 'operational_rows',
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: 'increment',
    },
    objective: {
      type: String,
      nullable: true,
      length: 300, 
    },
    indicator_amount: {
      type: 'numeric',
      nullable: true,
    },
    indicator_concept: {
      type: String,
      nullable: true,
      length: 300, 
    },
    team: {
      type: 'text',
      array: true,
      nullable: true,
    },
    resources: {
      type: 'text',
      array: true,
      nullable: true,
    },
    budget_amount: {
      type: 'numeric',
      nullable: true,
    },
    budget_description: {
      type: String,
      nullable: true,
    },
    period_start: {
      type: 'date',
      nullable: true,
    },
    period_end: {
      type: 'date',
      nullable: true,
    },
  },
  relations: {
    operationalProject: {
      type: 'many-to-one',
      target: 'OperationalProject',
      joinColumn: { name: 'operational_project_id' },
      nullable: false,
      onDelete: 'CASCADE',
    },
  },
});