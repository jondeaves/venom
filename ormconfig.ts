import path from 'path';
import { ConnectionOptions } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, 'src/', '.env') });

const config: ConnectionOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [path.resolve(__dirname, 'src/**/*.entity{.ts,.js}')],
  migrations: [path.resolve(__dirname, 'src/migrations/**/*.ts')],
  cli: {
    migrationsDir: 'src/migrations',
  },
};

export = config;
