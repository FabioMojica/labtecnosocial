import { EntitySchema } from 'typeorm';
import { z } from "zod";

const reportElementSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(["text", "image", "chart"]),
  content: z.string().optional(), 
  src: z.string().nullable().optional(),
  alt: z.string().optional(),
  width: z.number().optional(),
  imageKey: z.string().uuid().optional(), 
  height: z.number().optional(),
  data: z.any().optional(),
  integration_data: z.any().optional(),
  period: z.string().optional(),
  periodLabel: z.string().optional(),
  title: z.string().optional(),
  interval: z.string().optional(),
  position: z.number().optional(), 
  id_name: z.string().optional(),
});

export const reportSchema = z.object({
  title: z.string().min(1),

  elements: z.record(
    z.string().uuid(),      
    reportElementSchema    
  ),

  elementsOrder: z.array(z.string().uuid()),
});
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
      default: 'Reporte sin título',
    },
    data: {
      type: 'jsonb', 
      nullable: true,
      default: [],
    },
    report_version: {
      type: Number,
      default: 0,
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
});
