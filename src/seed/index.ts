import 'reflect-metadata';

import path from 'path';
import dotenv from 'dotenv';

import { createConnection } from 'typeorm';

import seedCharacters from './characters';

dotenv.config({ path: path.resolve(__dirname, '../', '.env') });

async function seed(): Promise<void> {
  try {
    const connection = await createConnection({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [path.resolve(__dirname, '../../**/*.entity{.ts,.js}')],
      synchronize: true,
    });

    // These perform the actual seeding
    const characters = await seedCharacters(connection);

    // eslint-disable-next-line no-console
    console.log(characters);

    // Close things off
    await connection.close();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
}

seed();
