import Discord, { Collection } from 'discord.js';

import ConfigService from '../../core/services/config.service';
import DatabaseService from '../../core/services/database.service';
import MongoService from '../../core/services/mongo.service';

import container from '../../inversity.config';

import Campaign from '../../carp/campaign/campaign.entity';

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
    if (message.member.roles.cache.has('743465073611243662')) {
      if (args[0]) {
        switch (args[0]) {
          default:
            return message.reply(`I don't recognize that sub-command for \`campaign\`.`);
        }
      } else {
        const runningCampaigns = await dbService.manager.findAndCount(Campaign);
        if (runningCampaigns[1] > 0) {
          return message.reply(`there are currently ${runningCampaigns[1]} campaigns active.`);
        }
        return message.reply(`there are currently no campaigns active.`);
      }
    }
    return message.reply(
      'unfortunately you do not have permission to manage campaigns. Message a moderator for information!',
    );
  },
};

export default command;
