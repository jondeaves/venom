import Discord, { Collection } from 'discord.js';
import { getRepository } from 'typeorm';

import roguelike from 'roguelike/level/roguelike';

import ConfigService from '../../core/services/config.service';
import DatabaseService from '../../core/services/database.service';
import MongoService from '../../core/services/mongo.service';

import container from '../../inversity.config';

import Campaign from '../../carp/campaign/campaign.entity';
import Character from '../../carp/character/character.entity';

import ICommand from './ICommand';

const prefix = container.resolve<ConfigService>(ConfigService).get('BOT_TRIGGER');

const command: ICommand = {
  name: 'campaign',
  aliases: ['rpg'],
  description: 'Manages campaign settings such as starting a campaign and stopping a campaign.',
  example: `\`${prefix}campaign start`,
  async execute(
    message: Discord.Message,
    args: string[],
    _prefix?: string,
    _commands?: Collection<string, ICommand>,
    _mongoService?: MongoService,
    dbService?: DatabaseService,
  ) {
    const moderatorPermission = message.member.roles.cache.has(
      container.resolve<ConfigService>(ConfigService).get('CAMPAIGN_MODERATOR_ROLE_ID'),
    );
    if (args[0]) {
      switch (args[0]) {
        default:
          return message.reply(
            `it looks like that sub-command is not something I can handle. Try \`${prefix}check <channel>\` if you want to know if a campaign is active, or simply \`${prefix}campaign\` for status!`,
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

            // eslint-disable-next-line global-require
            const level = roguelike({
              width: 25, // Max Width of the world
              height: 25, // Max Height of the world
              retry: 100, // How many times should we try to add a room?
              special: false, // Should we generate a "special" room?
              room: {
                ideal: 8, // Give up once we get this number of rooms
                min_width: 3,
                max_width: 7,
                min_height: 3,
                max_height: 7,
              },
            });

            // TODO: we can iterate through the level and add monsters and/or treasure

            const campaign = new Campaign();
            campaign.characters = [];

            campaign.roomId = room.id;
            campaign.dungeon = level;

            await dbService.manager.save(campaign);

            return message.reply(`${args[1]} has begun a campaign! To join, create a character first.`);
          }
          return message.reply(`don't forget to assign a channel!`);
        }
        case 'check': {
          if (args[1] && args[1].includes('#')) {
            const roomId = args[1].replace('<', '').replace('>', '').replace('#', '');
            const room = message.guild.channels.cache.find((channel) => channel.id === roomId);

            if (!room) {
              return message.reply(`that channel doesn't exist.`);
            }

            const campaignRepository = getRepository(Campaign);
            const result = await campaignRepository.find({
              where: { roomId: room.id },
            });
            if (result.length > 0) {
              return message.reply(`yes, there is an active campaign in ${args[1]}!`);
            }
            return message.reply(`there is no active campaign in ${args[1]}!`);
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

            const matchedChar = await dbService.manager.findOne(Character, message.author.id);
            if (!matchedChar) {
              return message.reply(
                `it looks like you don't have a character yet! Create one using \`${prefix}character create <name>\` and try again!`,
              );
            }

            const campaignRepository = getRepository(Campaign);
            const result = await campaignRepository.find({
              where: { roomId: room.id },
              relations: ['characters'],
            });

            if (result.length > 0) {
              const campaign = result[0];

              // eslint-disable-next-line consistent-return
              let alreadyJoined = false;
              campaign.characters.forEach((char) => {
                if (char.name === matchedChar.name) {
                  alreadyJoined = true;
                }
              });

              if (!alreadyJoined) {
                const currentMap = JSON.parse(campaign.dungeon);
                const myPos = JSON.parse(matchedChar.position);

                myPos.x = currentMap.enter.x;
                myPos.y = currentMap.enter.y;

                matchedChar.position = JSON.stringify(myPos);
                await dbService.manager.save(matchedChar);

                if (typeof campaign.characters === 'undefined' || campaign.characters === null) {
                  campaign.characters = [];
                }

                campaign.characters.push(matchedChar);
                await dbService.manager.save(campaign);
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
      const runningCampaigns = await dbService.manager.findAndCount(Campaign);
      if (runningCampaigns[1] > 0) {
        return message.reply(`there are currently ${runningCampaigns[1]} campaigns active.`);
      }
      return message.reply(`there are currently no campaigns active.`);
    }
    return message.reply(`I'm not sure what happened, but your request failed.`);
  },
};

export default command;
