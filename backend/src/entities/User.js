import { EntitySchema } from 'typeorm';

export const User = new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: 'increment',
    },
    firstName: {
      type: String,
      length: 100,
      nullable: false,
    },
    lastName: {
      type: String,
      length: 100,
      nullable: false,
    },
    role: {
      type: 'enum',
      enum: ['super-admin', 'admin', 'coordinator'],
      nullable: false,
    },
    email: {
      type: String,
      length: 255,
      unique: true,
      nullable: false,
    },
    password: { 
      type: String,
      nullable: false,
    },
    image_url: {
      type: String,
      nullable: true,
    },
    state: {
      type: 'enum',
      enum: ['enabled', 'disabled'],
      default: 'enabled',
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
    session_version: {
      type: Number,
      nullable: false,
      default: 1,
    },
  },
  relations: {
    projectResponsibles: {
      type: 'one-to-many',
      target: 'ProjectResponsible',
      inverseSide: 'user',
    },
  },
});
