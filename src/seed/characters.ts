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

    const character = new Character();
    // Discord id looks to be a 16 character number, so let's fake it
    character.uid = faker.random
      .number({
        min: 1000000000000000,
        max: 1999999999999999,
      })
      .toString();
    character.name = 'Urthedak';

    // Save data
    const newCharacter = await connection.manager.save(character);

    logSeedOutput('Character', newCharacter);

    return [newCharacter];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    return [];
  }
}
