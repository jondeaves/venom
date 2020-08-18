import Discord from 'discord.js';
import Command from './Command';

export default class SeeCommand extends Command {
  async execute(message: Discord.Message): Promise<Discord.Message> {
    return message.author.send(
      `Server: ${message.guild.name}\nYour username: ${message.author.username}\nYour ID: ${message.author.id}`,
    );
  }
}
