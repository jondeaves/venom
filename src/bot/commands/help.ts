import Discord, { Collection } from 'discord.js';
import ICommand from './ICommand';
import ConfigService from '../../core/services/config.service'
import container from '../../inversity.config';

const prefix = container.resolve<ConfigService>(ConfigService).get('BOT_TRIGGER');
const command: ICommand = {
  name: 'help',
  aliases: ['commands'],
  example: `\`${prefix}help ping\``,
  description: 'Lists available commands!',
  async execute(message: Discord.Message, args: string[], prefix: string, commands: Collection<string, ICommand>) {
    const data = [];

    if (!args.length) {
      // Get for all commands
      data.push('here\'s a list of all my commands:\n');

      const cmds = commands.map(command => command.name);
      let cmd;
      cmds.forEach(element => {
        cmd = commands.get(element) || commands.find(c => c.aliases && c.aliases.includes(element));
        let response = `\`${prefix}${cmd.name}\` `;
        if (cmd.description) {
          response += `**${cmd.description}** `;
        }
        if (cmd.aliases) {
          response += `\n\t\t\t*alternatively:* \`${prefix}${cmd.aliases.join(`\`, \`${prefix}`)}\``;
        }
        data.push(response);
        data.push(cmd.example ? `\t\t\t*for example:* ${cmd.example}\n` : '');
      });
      data.push(`\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`);
    } else {
      // Get description of single command
      const name = args[0].toLowerCase();
      const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

      if (!command) {
        message.reply('that\'s not a valid command!');
      } else {
        data.push(`**Name:** ${command.name}`);

        if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
        if (command.description) data.push(`**Description:** ${command.description}`);
      }
    }

    try {
      //await message.author.send(data, { split: true });
      //if (message.channel.type === 'dm')
      //  return;
     // message.reply('I\'ve sent you a DM with all my commands!');
     message.reply(data, { split: true })
    }
    catch (error) {
      console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
      message.reply('it seems like I can\'t DM you! Do you have DMs disabled?');
    }
  },
};

export default command;