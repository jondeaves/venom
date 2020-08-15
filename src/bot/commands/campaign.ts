import Discord, { Collection } from 'discord.js';
import { getRepository } from 'typeorm';

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
          if (moderatorPermission) {
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

            const campaign = new Campaign();
            campaign.roomId = room.id;
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
              return message.reply(`Doesn't look like you have joined this campaign`);
            }

            const campaignRepository = getRepository(Campaign);
            const result = await campaignRepository.find({
              where: { roomId: room.id },
            });
            if (result.length > 0) {
              if (result[0].characters) {
                result[0].characters.push(matchedChar);
              } else {
                const characters = [matchedChar];
                result[0].characters = characters;
              }
              campaignRepository.save(result[0]);
              return message.reply(`you have joined the campaign with your character **${matchedChar.name}**!`);
            }
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
