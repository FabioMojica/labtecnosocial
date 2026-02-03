import { EntitySchema } from 'typeorm';

export const Report = new EntitySchema({
  name: 'Report',
  tableName: 'reports',
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: 'increment',
    },
    title: {
      type: String,
      length: 100,
      nullable: false,
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
    report_version: {
      type: Number,
      default: 0,
    },
  },
  relations: {
    elements: {
      type: 'one-to-many',
      target: 'ReportElement',
      inverseSide: 'report',
      cascade: true, 
    },
  },
});
