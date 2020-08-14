import Discord from 'discord.js';
import ICommand from './ICommand';

const command: ICommand = {
  name: 'ping',
  aliases: ['hello', 'hi'],
  description: 'Responds, kind of like telling you the bot is alive.',
  async execute(message: Discord.Message) {
    return message.reply('Pong!');
  },
};

export default command;
