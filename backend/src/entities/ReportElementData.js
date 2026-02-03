import { EntitySchema } from 'typeorm';

export const ReportElementData = new EntitySchema({
  name: 'ReportElementData',
  tableName: 'report_element_data',
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: 'increment',
    },
    data: {
      type: 'jsonb', 
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
    element: {
      type: 'one-to-one',
      target: 'ReportElement',
      joinColumn: { name: 'element_id' },
      nullable: false,
      onDelete: 'CASCADE',
    },
  },
});
