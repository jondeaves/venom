import Discord, { Message } from 'discord.js';

import container from '../inversity.config';

import ConfigService from '../core/services/config.service';
import DatabaseService from '../core/services/database.service';
import LoggerService from '../core/services/logger.service';

import Campaign from './campaign/campaign.entity';

export default class CampaignManager {
  private _configService: ConfigService = container.resolve<ConfigService>(ConfigService);

  private _loggerService: LoggerService = container.resolve<LoggerService>(LoggerService);

  private _databaseService: DatabaseService;

  private _discordClient: Discord.Client;

  private _campaign: Campaign;

  constructor(databaseService: DatabaseService, discordClient: Discord.Client, campaign: Campaign) {
    this._databaseService = databaseService;
    this._discordClient = discordClient;
    this._campaign = campaign;
  }

  public async execute(message: Message): Promise<void> {
    const prefix = this._configService.get('CAMPAIGN_TRIGGER');

    if (!message.content.toLowerCase().startsWith(prefix)) {
      return;
    }

    const args = message.content.slice(prefix.length).trim().split(/ +/);

    // TODO: Handle commands better
    if (args[0]) {
      switch (args[0]) {
        default:
          message.reply(`I don't recognize that command. Try again or type \`help\` for a list of commands.`);
          break;
        case 'status':
          message.channel.send(`Welcome to campaign ${this._campaign.id}`);
          message.channel.send(`There are ${this._campaign.characters.length} weary travellers.`);
          break;
      }
    }
  }
}
