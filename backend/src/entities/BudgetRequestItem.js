import { EntitySchema } from 'typeorm';

export const BudgetRequestItem = new EntitySchema({
  name: 'BudgetRequestItem',
  tableName: 'budget_request_items',
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: 'increment',
    },
    item_name: {
      type: String,
      length: 120,
      nullable: false,
    },
    quantity: {
      type: 'decimal',
      precision: 12,
      scale: 2,
      nullable: false,
    },
    unit_cost: {
      type: 'decimal',
      precision: 14,
      scale: 2,
      nullable: false,
    },
    total_cost: {
      type: 'decimal',
      precision: 14,
      scale: 2,
      nullable: false,
    },
    support_url: {
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
  },
  relations: {
    budgetRequest: {
      type: 'many-to-one',
      target: 'BudgetRequest',
      inverseSide: 'items',
      joinColumn: { name: 'budget_request_id' },
      nullable: false,
      onDelete: 'CASCADE',
    },
  },
});
