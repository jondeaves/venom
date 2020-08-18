import Discord from 'discord.js';

import Character from '../../carp/character/character.entity';

import Command from './Command';

export default class CharacterCommand extends Command {
  async execute(message: Discord.Message): Promise<Discord.Message> {
    // Just testing db stuff
    const matchedChar = await this.dependencies.databaseService.manager.findOne(Character, message.author.id);

    if (!matchedChar) {
      return message.reply(`Doesn't look like you have joined this campaign`);
    }

    return message.reply(`Welcome back ${matchedChar.name}`);
  }
}
