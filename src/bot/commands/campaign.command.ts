import Discord, { Collection } from 'discord.js';
import { getRepository } from 'typeorm';

import roguelike from 'roguelike/level/roguelike';
import random from 'roguelike/utility/random';

import { hasRoleByID } from 'src/utils/Discord.utils';
import Vector2 from '../../core/helpers/Vector2';

import Campaign from '../../carp/campaign/campaign.entity';

import Command from './Command';
import Map from '../../carp/helpers/Map';
import Player from '../../carp/character/player.entity';
import Ghost from '../../carp/monsters/Ghost';
import Rat from '../../carp/monsters/Rat';

export default class CampaignCommand extends Command {
  public commandData: {
    commandList: Discord.Collection<string, Command>;
    prefix: string;
  };

  async execute(message: Discord.Message, args: string[]): Promise<Discord.Message> {
    const moderatorPermission = hasRoleByID(this.dependencies.configService.get('CAMPAIGN_MODERATOR_ROLE_ID'), message);
    if (args[0]) {
      switch (args[0]) {
        default:
          return message.reply(
            `it looks like that sub-command is not something I can handle. Try \`${this.commandData.prefix}check <channel>\` if you want to know if a campaign is active, or simply \`${this.commandData.prefix}campaign\` for status!`,
          );
        case 'start': {
          if (!moderatorPermission) {
            return message.reply(
              'unfortunately you do not have permission to manage campaigns. Message a moderator for information!',
            );
          }
          if (args[1] && args[1].includes('#')) {
            const roomId = args[1].replace('<', '').replace('>', '').replace('#', '');
            const room = message.guild.channels.cache.find((channel) => channel.id === roomId);

            if (!room) {
              const roomName = args[1].replace('#', '');
              message.guild.channels
                .create(roomName)
                .then(() => message.reply(`#${roomName} has been created!`))
                .catch(() => message.reply('problem creating that channel. Do I have any rights?'));
            }

            const level = roguelike({
              width: 25, // Max Width of the world
              height: 30, // Max Height of the world
              retry: 100, // How many times should we try to add a room?
              special: false, // Should we generate a "special" room?
              room: {
                ideal: 12, // Give up once we get this number of rooms
                min_width: 3,
                max_width: 7,
                min_height: 3,
                max_height: 7,
              },
            });

            // TODO: add proper monsters and/treasure here
            let monsters = 0;
            const monstersDb = [];
            for (let index = 0; index < level.room_count; index += 1) {
              const randomRoom = level.rooms[`${index}`];
              // eslint-disable-next-line no-continue
              if (randomRoom.id === level.enter.room_id) continue; // skip entrance room for monsters

              const roomSize = randomRoom.width * randomRoom.height;
              const amount = random.dice(`d${Math.max(1, Math.ceil(roomSize / 10))}`);
              for (let count = 0; count < amount; count += 1) {
                const roll = random.dice('d20');
                const hasMonster = roll > 1;
                if (hasMonster) {
                  const randomX = randomRoom.left + Math.floor(Math.random() * randomRoom.width);
                  const randomY = randomRoom.top + Math.floor(Math.random() * randomRoom.height);
                  if (randomX < level.width && randomY < level.height) {
                    if (monstersDb.find((m) => m.position === new Vector2(randomX, randomY))) count -= 1;
                    // TODO: should make a look-up database for archetypes
                    const randMonster = random.dice('d2');
                    let mon;
                    if (randMonster === 1) {
                      mon = new Ghost(1, new Vector2(randomX, randomY));
                    } else if (randMonster === 2) {
                      mon = new Rat(1, new Vector2(randomX, randomY));
                    }

                    monstersDb.push(mon);
                    monsters += 1;
                  }
                }
              }
            }
            await this.dependencies.databaseService.manager.save(monstersDb);

            const campaign = new Campaign();
            campaign.characters = [];
            campaign.roomId = room.id;
            campaign.monsters = monstersDb;

            const map = new Map(
              level.width,
              level.height,
              level.enter,
              level.exit,
              level.room_count,
              level.rooms,
              level.world,
            );

            campaign.dungeon = map;

            message.reply(`debug: distributed ${monsters} monsters over ${level.room_count} rooms.`);
            await this.dependencies.databaseService.manager.save(campaign);
            return message.reply(`${args[1]} has begun a campaign! To join, create a character first.`);
          }
          return message.reply(`don't forget to assign a channel!`);
        }
        case 'check': {
          const campaignRepository = getRepository(Campaign);
          if (args[1] && args[1].includes('#')) {
            const roomId = args[1].replace('<', '').replace('>', '').replace('#', '');
            const room = message.guild.channels.cache.find((channel) => channel.id === roomId);

            if (!room) {
              return message.reply(`that channel doesn't exist.`);
            }

            const result = await campaignRepository.find({
              where: { roomId: room.id },
            });
            if (result.length > 0) {
              return message.reply(`yes, there is an active campaign in ${args[1]}!`);
            }
            return message.reply(`there is no active campaign in ${args[1]}!`);
          }
          const result = await campaignRepository.findAndCount();
          if (result[1] > 0) {
            const msg = [`there are ${result[1]} campaigns active:`];
            // eslint-disable-next-line no-restricted-syntax
            for (const campaign of result[0]) {
              const room = message.guild.channels.cache.find((channel) => channel.id === campaign.roomId);
              const characters = typeof campaign.characters === 'undefined' ? 0 : campaign.characters.length;
              msg.push(`:scroll: ${room.toString()} (${characters} players)`);
            }
            return message.reply(msg);
          }
          return message.reply(`don't forget to give me a channel name to check.`);
        }
        case 'join': {
          if (args[1] && args[1].includes('#')) {
            const roomId = args[1].replace('<', '').replace('>', '').replace('#', '');
            const room = message.guild.channels.cache.find((channel) => channel.id === roomId);

            if (!room) {
              return message.reply(`that channel doesn't exist.`);
            }

            if (!args[2]) {
              return message.reply(
                `you need to let me know with what character you'll join! The full command is: \`${this.commandData.prefix}campaign join <channel> <name>\`, thank you!`,
              );
            }

            const playerRepo = getRepository(Player);
            const playerResult = await playerRepo.find({
              where: { uid: message.author.id },
              relations: ['characters'],
            });

            if (playerResult.length === 0) {
              return message.reply(
                `it looks like you don't have any characters yet! Create one using \`${this.commandData.prefix}character create <name>\` and try again!`,
              );
            }

            const matchedChar = playerResult[0].characters.find((char) => char.name === args[2]);
            if (!matchedChar) {
              return message.reply(
                `it looks like you don't have a character with that name, yet! Create one using \`${this.commandData.prefix}character create <name>\` and try again!`,
              );
            }

            const campaignRepository = getRepository(Campaign);
            const result = await campaignRepository.find({
              where: { roomId: room.id },
              relations: ['characters'],
            });

            if (result.length > 0) {
              const campaign = result[0];
              const alreadyJoined = campaign.characters.some((char) => char.name === matchedChar.name);

              if (!alreadyJoined) {
                const currentMap = campaign.dungeon;
                matchedChar.position = new Vector2(currentMap.enter.x, currentMap.enter.y);

                await this.dependencies.databaseService.manager.save(matchedChar);

                if (typeof campaign.characters === 'undefined' || campaign.characters === null) {
                  campaign.characters = [];
                }

                campaign.characters.push(matchedChar);
                await this.dependencies.databaseService.manager.save(campaign);
                return message.reply(`you have joined the campaign with your character **${matchedChar.name}**!`);
              }
              return message.reply(`you already joined that campaign with your character **${matchedChar.name}**!`);
            }
            return message.reply(
              `it looks like there's no campaign going on there, yet! Reach out to a moderator to start one.`,
            );
          }
        }
      }
    } else {
      const runningCampaigns = await this.dependencies.databaseService.manager.findAndCount(Campaign);
      if (runningCampaigns[1] > 0) {
        return message.reply(`there are currently ${runningCampaigns[1]} campaigns active.`);
      }
      return message.reply(`there are currently no campaigns active.`);
    }
    return message.reply(`I'm not sure what happened, but your request failed.`);
  }
}
