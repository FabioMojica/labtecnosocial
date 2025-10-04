import { EntitySchema } from 'typeorm';

export const StrategicPlan = new EntitySchema({
  name: 'StrategicPlan',
  tableName: 'strategic_plans',
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: 'increment',
    },
    year: {
      type: Number,
      unique: true,
      nullable: false,
    },
    mission: {
      type: String,
      length: 3000,
      nullable: false,
    },
    created_at: {
      type: 'timestamp',
      createDate: true,
      default: () => 'NOW()',
    },
  },
  relations: {
    objectives: {
      type: 'one-to-many',
      target: 'Objective',
      inverseSide: 'strategicPlan',
      cascade: true,
    },
  },
});
