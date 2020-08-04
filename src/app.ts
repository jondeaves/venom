import Discord from 'discord.js';

import container from './inversity.config';

import ConfigService from './core/services/config.service';
import LoggerService from './core/services/logger.service';
import { exit } from 'process';

export default class App {
  private _configService: ConfigService = container.resolve<ConfigService>(ConfigService);
  private _loggerService: LoggerService = container.resolve<LoggerService>(LoggerService);

  private _discordClient: Discord.Client;

  public async init(): Promise<void> {
    this._discordClient = new Discord.Client();

    this._discordClient.once('ready', () => {
      this._loggerService.log('info', "The Bot is connected to Discord server");
    });

    this._discordClient.login(this._configService.get('DISCORD_BOT_TOKEN'))
      .catch((reason) => {
        this._loggerService.log('error', `Cannot initialise Discord client. Check the token: ${this._configService.get('DISCORD_BOT_TOKEN')}`);
        exit(1);
      });
  }
}
