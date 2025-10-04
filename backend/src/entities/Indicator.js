import { EntitySchema } from 'typeorm';

export const Indicator = new EntitySchema({
  name: 'Indicator',
  tableName: 'indicators',
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: 'increment',
    },
    amount: {
      type: 'numeric',
      nullable: true,
    },
    concept: {
      type: String,
      length: 500,
      nullable: true,
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
  },
});
