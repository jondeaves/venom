import Discord, { Collection } from 'discord.js';

import ConfigService from '../../core/services/config.service';
import DatabaseService from '../../core/services/database.service';
import MongoService from '../../core/services/mongo.service';

import container from '../../inversity.config';

import Character from '../../carp/character/character.entity';

import ICommand from './ICommand';

const prefix = container.resolve<ConfigService>(ConfigService).get('BOT_TRIGGER');

const command: ICommand = {
  name: 'character',
  aliases: ['c'],
  description: 'Displays your character and its current statistics, if it exists.',
  example: `\`${prefix}addgreeting Welcome to the club {name}\``,
  async execute(
    message: Discord.Message,
    args: string[],
    _prefix?: string,
    _commands?: Collection<string, ICommand>,
    _mongoService?: MongoService,
    dbService?: DatabaseService,
  ) {
    // Just testing db stuff
    const matchedChar = await dbService.manager.findOne(Character, message.author.id);

    if (!matchedChar) {
      return message.reply(
        `it doesn't look like you have a character set up, yet. Run \`${prefix}create <name>\` to get started.`,
      );
    }
    if (args[0] === 'delete') {
      dbService.manager.delete(Character, message.author.id);
      return message.reply(`your character **${matchedChar.name}** has been deleted!`);
    }
    return message.reply(`your character **${matchedChar.name}** is alive and well.`);
  },
};

export default command;
