import { EntitySchema } from 'typeorm';

export const ProjectIntegration = new EntitySchema({
  name: 'ProjectIntegration',
  tableName: 'project_integrations',
  columns: {
    id: { type: Number, primary: true, generated: 'increment' },
    platform: { type: String, nullable: false }, 
    integration_id: { type: String, nullable: false },  
    name: { type: String, nullable: true },
    url: { type: String, nullable: true },
    created_at: { type: 'timestamp', createDate: true, default: () => 'NOW()' },
    updated_at: { type: 'timestamp', updateDate: true, default: () => 'NOW()' },
  },
  relations: {
    project: {
      type: 'many-to-one',
      target: 'OperationalProject',
      joinColumn: { name: 'project_id' },
      nullable: false,
      onDelete: 'CASCADE',
    },
  },
});
