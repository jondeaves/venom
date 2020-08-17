import Discord from 'discord.js';
import Command from './Command';

export default class PingCommand extends Command {
  async execute(message: Discord.Message): Promise<Discord.Message> {
    return message.reply('Pong!');
  }
}
