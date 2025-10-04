import { EntitySchema } from 'typeorm';

export const Program = new EntitySchema({
  name: 'Program',
  tableName: 'programs',
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: 'increment',
    },
    description: {
      type: String,
      nullable: false,
    },
  },
  relations: {
    objective: {
      type: 'many-to-one',
      target: 'Objective',
      joinColumn: { name: 'objective_id' },
      nullable: false,
      onDelete: 'CASCADE',
    },
    operationalProjects: {
      name: 'operationalProjects',
      type: 'one-to-many',
      target: 'OperationalProject',
      inverseSide: (op) => op.program,
      cascade: true,
    },
  },
});
