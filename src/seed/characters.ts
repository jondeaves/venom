/* tslint:disable:no-console */
import 'reflect-metadata';

import { Connection } from 'typeorm';
// eslint-disable-next-line import/no-extraneous-dependencies
import faker from 'faker';

import Character from '../carp/character/character.entity';
import { logSeedOutput } from './helpers';

export default async function seedCharacters(connection: Connection): Promise<Character[]> {
  try {
    // Clear our data
    await connection.manager.query('TRUNCATE TABLE "character" CASCADE;');

    const char1 = await generateCharacter(connection, 'Urthedak');
    const char2 = await generateCharacter(connection, 'Alithana');

    const characters = [char1, char2];

    return characters;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    return [];
  }
}

async function generateCharacter(connection: Connection, name: string, uid?: string): Promise<Character> {
  const character = new Character();
  // Discord id looks to be a 16 character number, so let's fake it
  character.uid =
    uid ||
    faker.random
      .number({
        min: 1000000000000000,
        max: 1999999999999999,
      })
      .toString();
  character.name = name;

  // Save data
  const newCharacter = await connection.manager.save(character);

  logSeedOutput('Character', newCharacter);

  return newCharacter;
}
