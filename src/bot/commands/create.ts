import Discord, { Collection } from 'discord.js';

import ConfigService from '../../core/services/config.service';
import DatabaseService from '../../core/services/database.service';
import MongoService from '../../core/services/mongo.service';

import container from '../../inversity.config';

import Character from '../../carp/character/character.entity';

import ICommand from './ICommand';

const prefix = container.resolve<ConfigService>(ConfigService).get('BOT_TRIGGER');

const command: ICommand = {
  name: 'create',
  aliases: ['make'],
  description: 'Creates a character that can be used to join a running or future campaign.',
  example: `\`${prefix}create Racg`,
  async execute(
    message: Discord.Message,
    args: string[],
    _prefix?: string,
    _commands?: Collection<string, ICommand>,
    _mongoService?: MongoService,
    dbService?: DatabaseService,
  ) {
    const matchedChar = await dbService.manager.findOne(Character, message.author.id);

    if (!matchedChar) {
      if (args[0]) {
        // await dbService.manager.query(`INSERT INTO "campaign" (id, roomId) VALUES ('${message.author.id}', '${message.channel.id}')`);
        await dbService.manager.query(
          `INSERT INTO "character" (uid, name) VALUES ('${message.author.id}', '${args[0]}')`,
        );
        return message.reply(`that's it! You now have a character named **${args[0]}**!`);
      }
      return message.reply(`you're gonna have to give me a character name, too!`);
    }
    return message.reply(`it looks like you're already set up with your character named **${matchedChar.name}**!`);
  },
};

export default command;
