/* tslint:disable:no-console */
import 'reflect-metadata';

import { Connection } from 'typeorm';

import Campaign from '../carp/campaign/campaign.entity';
import Character from '../carp/character/character.entity';

import { logSeedOutput } from './helpers';

export default async function seedCampaigns(connection: Connection, characters: Character[]): Promise<Campaign[]> {
  try {
    // Clear our data
    await connection.manager.query('TRUNCATE TABLE "campaign_characters_character" CASCADE;');
    await connection.manager.query('TRUNCATE TABLE "campaign" CASCADE;');

    const campaign = new Campaign();
    campaign.roomId = '743964332710428804';
    campaign.characters = characters;

    // Save data
    const newCampaign = await connection.manager.save(campaign);

    logSeedOutput('Campaign', newCampaign);

    return [newCampaign];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    return [];
  }
}
