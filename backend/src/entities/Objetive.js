import { EntitySchema } from 'typeorm';

export const Objective = new EntitySchema({
  name: 'Objective',
  tableName: 'objectives',
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: 'increment',
    },
    title: {
      type: String,
      length: 1000,
      nullable: false,
    },
  },
  relations: {
    strategicPlan: {
      type: 'many-to-one',
      target: 'StrategicPlan',
      joinColumn: { name: 'strategic_plan_id' },
      nullable: false,
      onDelete: 'CASCADE',
    },
    indicators: {
      type: 'one-to-many',
      target: 'Indicator',
      inverseSide: 'objective',
      cascade: true,
    },
    programs: {
      type: 'one-to-many',
      target: 'Program',
      inverseSide: 'objective',
      cascade: true,
    },
  },
});
