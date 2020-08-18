import Discord from 'discord.js';
import Command from './Command';

export default class HelpCommand extends Command {
  public commandData: {
    commandList: Discord.Collection<string, Command>;
    prefix: string;
  };

  async execute(message: Discord.Message, args: string[]): Promise<Discord.Message> {
    const data = [];

    if (!args || args.length === 0) {
      // Get for all commands
      data.push("here's a list of all my commands:\n");

      const cmds = this.commandData.commandList.map((c) => c.name);
      cmds.forEach((element) => {
        const cmd =
          this.commandData.commandList.get(element) ||
          this.commandData.commandList.find((c) => c.aliases && c.aliases.includes(element));
        let response = `\`${this.commandData.prefix}${cmd.name}\` `;
        if (cmd.description) {
          response += `**${cmd.description}** `;
        }
        if (cmd.aliases) {
          response += `\n\t\t\t*alternatively:* \`${this.commandData.prefix}${cmd.aliases.join(
            `\`, \`${this.commandData.prefix}`,
          )}\``;
        }
        data.push(response);

        cmd.examples.forEach((example) => {
          data.push(`\t\t\t*for example:* ${example}`);
        });

        data.push('\n');
      });
      data.push(`You can send \`${this.commandData.prefix}help [command name]\` to get info on a specific command!`);
    } else {
      // Get description of single command
      const name = args[0].toLowerCase();
      const cmd =
        this.commandData.commandList.get(name) ||
        this.commandData.commandList.find((c) => c.aliases && c.aliases.includes(name));

      if (!cmd) {
        message.reply("that's not a valid command!");
      } else {
        data.push(`**Name:** ${cmd.name}`);

        if (cmd.aliases) {
          data.push(`**Aliases:** ${cmd.aliases.join(', ')}`);
        }

        if (cmd.description) {
          data.push(`**Description:** ${cmd.description}`);
        }
      }
    }

    try {
      return message.reply(data, { split: true });
    } catch (error) {
      this.dependencies.loggerService.log('error', `Could not send help DM to ${message.author.tag}.\n`, error);

      return message.reply("it seems like I can't DM you! Do you have DMs disabled?");
    }
  }
}
