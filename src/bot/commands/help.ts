import Discord, { Collection } from 'discord.js';

import ICommand from './ICommand';

const command: ICommand = {
  name: 'help',
  aliases: ['commands'],
  description: 'Lists available commands.',
  async execute(message: Discord.Message, args: string[], prefix: string, commands: Collection<string, ICommand>) {
    const data = [];

    if (!args.length) {
      // Get for all commands
      data.push('Here\'s a list of all my commands:\n');
      data.push(commands.map(command => command.name).join(', '));
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
      await message.author.send(data, { split: true });
      if (message.channel.type === 'dm')
        return;
      message.reply('I\'ve sent you a DM with all my commands!');
    }
    catch (error) {
      console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
      message.reply('it seems like I can\'t DM you! Do you have DMs disabled?');
    }
  },
};

export default command;