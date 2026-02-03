import { EntitySchema } from 'typeorm';

export const ReportElement = new EntitySchema({
  name: 'ReportElement',
  tableName: 'report_elements',
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: 'increment',
    },
    type: {
      type: String, // 'text' | 'chart'
      nullable: false,
    },
    content: {
      type: 'text', // contenido del texto o título del chart
      nullable: true,
    },
    position: {
      type: Number, // para ordenar los elementos en el editor
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
  },
  relations: {
    report: {
      type: 'many-to-one',
      target: 'Report',
      joinColumn: { name: 'report_id' },
      nullable: false,
      onDelete: 'CASCADE',
    },
    chartData: {
      type: 'one-to-one',
      target: 'ReportElementData',
      inverseSide: 'element',
      cascade: true, // guarda automáticamente los datos de la gráfica
    },
  },
});
