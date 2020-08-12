import { exit } from 'process';
import Discord from 'discord.js';

import container from './inversity.config';

import ConfigService from './core/services/config.service';
import LoggerService from './core/services/logger.service';

import ICommand from './bot/commands/ICommand';
import rawCommands from './bot/commands';

export default class App {
  private _configService: ConfigService = container.resolve<ConfigService>(ConfigService);
  private _loggerService: LoggerService = container.resolve<LoggerService>(LoggerService);

  private _discordClient: Discord.Client;

  public async init(): Promise<void> {
    this._discordClient = new Discord.Client();
    const commandList = new Discord.Collection<string, ICommand>();

    rawCommands.forEach(rawCommand => {
      commandList.set(rawCommand.name, rawCommand);
    });

    // Triggers once after connecting to server
    this._discordClient.once('ready', () => {
      this._loggerService.log('info', 'The Bot is connected to Discord server');
    });

    // Triggers on every message the bot can see
    this._discordClient.on('message', async message => {
      const prefix = this._configService.get('BOT_TRIGGER');

      // If the message either doesn't start with the prefix or was sent by a bot, exit early.
      if (!message.content.startsWith(prefix) || message.author.bot) return;

      const args = message.content.slice(prefix.length).trim().split(/ +/);
      const commandName = args.shift().toLowerCase();
      const command = commandList.get(commandName) || commandList.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

      if (!command) {
        return message.reply('Monkey no understand that command yet!');
      };

      try {
        await command.execute(message, args, prefix, commandList);
      } catch (error) {
        this._loggerService.log('error', error.message);
        message.reply('there was an error trying to execute that command!');
      }
    });

    this._discordClient.login(this._configService.get('DISCORD_BOT_TOKEN'))
      .catch((reason) => {
        this._loggerService.log('error', `Cannot initialise Discord client. Check the token: ${this._configService.get('DISCORD_BOT_TOKEN')}`);
        exit(1);
      });
  }
}
