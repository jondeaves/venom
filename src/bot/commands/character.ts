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
  description:
    'Adds a string to the list greetings used when new users connect to server! Include `{name}` in your message to replace with the new users name.',
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
      return message.reply(`Doesn't look like you have joined this campaign`);
    }

    return message.reply(`Welcome back ${matchedChar.name}`);
  },
};

export default command;
