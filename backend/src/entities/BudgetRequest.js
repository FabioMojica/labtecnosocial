import { EntitySchema } from 'typeorm';

export const BUDGET_REQUEST_STATUS = {
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected',
};

export const BudgetRequest = new EntitySchema({
  name: 'BudgetRequest',
  tableName: 'budget_requests',
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: 'increment',
    },
    objective: {
      type: String,
      length: 100,
      nullable: false,
    },
    total_amount: {
      type: 'decimal',
      precision: 14,
      scale: 2,
      nullable: false,
    },
    status: {
      type: 'enum',
      enum: Object.values(BUDGET_REQUEST_STATUS),
      default: BUDGET_REQUEST_STATUS.pending,
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
    project: {
      type: 'many-to-one',
      target: 'OperationalProject',
      inverseSide: 'budgetRequests',
      joinColumn: { name: 'project_id' },
      nullable: false,
      onDelete: 'CASCADE',
    },
    requestedBy: {
      type: 'many-to-one',
      target: 'User',
      inverseSide: 'budgetRequests',
      joinColumn: { name: 'requested_by_user_id' },
      nullable: false,
      onDelete: 'CASCADE',
    },
    items: {
      type: 'one-to-many',
      target: 'BudgetRequestItem',
      inverseSide: 'budgetRequest',
      cascade: true,
    },
  },
});
