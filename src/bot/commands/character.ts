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
    const matchedChar = await dbService.manager.findOne(Character, message.author.id);
    if (args[0]) {
      switch (args[0]) {
        default:
          if (matchedChar) {
            return message.reply(`your character **${matchedChar.name}** is alive and well.`);
          }
          break;
        case 'delete':
          if (matchedChar) {
            dbService.manager.delete(Character, message.author.id);
            return message.reply(`your character **${matchedChar.name}** has been deleted!`);
          }
          break;
        case 'create':
          if (!matchedChar) {
            if (args[1]) {
              const character = new Character();
              const characterName = args[1];
              character.name = characterName;
              character.uid = message.author.id;
              character.power = 1;
              character.defense = 1;
              character.max_health = 5;
              character.current_health = 5;
              character.position = { x: 0, y: 0 };
              character.graphic = args[2] ?? `:slight_smile:`;
              await dbService.manager.save(Character, character);
              return message.reply(`that's it! You now have a character named **${args[1]}**!`);
            }
            return message.reply(`you're gonna have to give me a character name, too!`);
          }
          return message.reply(
            `it looks like you're already set up with your character named **${matchedChar.name}**!`,
          );
      }
    }
    if (matchedChar) {
      return message.reply(`your character **${matchedChar.name}** is alive and well.`);
    }
    return message.reply(
      `it doesn't look like you have a character set up, yet. Run \`${prefix}character create <name>\` to get started.`,
    );
  },
};

export default command;
