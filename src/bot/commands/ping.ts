import Discord from 'discord.js';

import ICommand from './ICommand';

const command: ICommand = {
  name: 'ping',
  aliases: ['hello'],
  description: 'Ping!',
  async execute(message: Discord.Message, args: string[]) {
    message.reply('Pong.');
  },
};

export default command;