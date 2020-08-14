import Discord from 'discord.js';

import ConfigService from '../../core/services/config.service';
import container from '../../inversity.config';

import ICommand from './ICommand';

const prefix = container.resolve<ConfigService>(ConfigService).get('BOT_TRIGGER');

const command: ICommand = {
  name: 'see',
  example: `\`${prefix}see\``,
  description: 'Sends a DM telling you information about your user on given server.',
  async execute(message: Discord.Message, args: string[]) {
    message.author.send(
      `Server: ${message.guild.name}\nYour username: ${message.author.username}\nYour ID: ${message.author.id}`,
    );
  },
};

export default command;
