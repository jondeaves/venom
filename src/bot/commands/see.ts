import Discord from 'discord.js';

import ICommand from './ICommand';

const command: ICommand = {
  name: 'see',
  description: 'See!',
  async execute(message: Discord.Message, args: string[]) {
    message.reply(`Server: ${message.guild.name}\nYour username: ${message.author.username}\nYour ID: ${message.author.id}`);
  },
};

export default command;