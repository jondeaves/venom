import Discord from 'discord.js';

import ICommand from './ICommand';

const command: ICommand = {
  name: 'see',
  description: 'Sends a DM telling you information about your user on given server.',
  async execute(message: Discord.Message, args: string[]) {
    message.author.send(`Server: ${message.guild.name}\nYour username: ${message.author.username}\nYour ID: ${message.author.id}`);
  },
};

export default command;