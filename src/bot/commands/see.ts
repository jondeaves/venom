import Discord from 'discord.js';

import ICommand from './ICommand';
import ConfigService from '../../core/services/config.service'
import container from '../../inversity.config';
const prefix = container.resolve<ConfigService>(ConfigService).get('BOT_TRIGGER');

const command: ICommand = {
  name: 'see',
  description: 'This command allows you to check who you are... who you __really__ are!',
  example: `\`${prefix}see\``,
  async execute(message: Discord.Message, args: string[]) {
    message.reply(`Server: ${message.guild.name}\nYour username: ${message.author.username}\nYour ID: ${message.author.id}`);
  },
};

export default command;