import Discord from 'discord.js';

import Vector2 from '../../core/helpers/Vector2';

import Character from '../../carp/character/character.entity';

import Command from './Command';

export default class CharacterCommand extends Command {
  public commandData: {
    prefix: string;
  };

  async execute(message: Discord.Message, args: string[]): Promise<Discord.Message> {
    const matchedChar = await this.dependencies.databaseService.manager.findOne(Character, message.author.id);
    if (args[0]) {
      switch (args[0]) {
        default:
          if (matchedChar) {
            return message.reply(
              `your character **${matchedChar.name}** is alive and well.\nYou are assigned the graphic: ${matchedChar.graphic}.`,
            );
          }
          break;
        case 'delete':
          if (matchedChar) {
            await this.dependencies.databaseService.manager.delete(Character, message.author.id);
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
              character.position = Vector2.zero;
              character.graphic = args[2] ?? `:slight_smile:`;
              await this.dependencies.databaseService.manager.save(Character, character);
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
      return message.reply(
        `your character **${matchedChar.name}** is alive and well.\nYou are assigned the graphic: ${matchedChar.graphic}.`,
      );
    }
    return message.reply(
      `it doesn't look like you have a character set up, yet. Run \`${this.commandData.prefix}character create <name>\` to get started.`,
    );
  }
}
