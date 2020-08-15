import Discord, { Message } from 'discord.js';

import container from '../inversity.config';

import ConfigService from '../core/services/config.service';
import DatabaseService from '../core/services/database.service';
import LoggerService from '../core/services/logger.service';

import Campaign from './campaign/campaign.entity';
import Character from './character/character.entity';

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
    const moderatorPermission = message.member.roles.cache.has('743465073611243662');

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
        case 'status': {
          message.channel.send(`Welcome to campaign ${this._campaign.id}`);
          message.channel.send(`There are ${this._campaign.characters.length} weary travellers.`);
          break;
        }
        case 'stop':
          if (moderatorPermission) {
            this._databaseService.manager.delete(Campaign, this._campaign.id);
            message.channel.send(`The campaign has ended!`);
          } else {
            message.reply(
              `unfortunately you do not have permission to run that command. Contact a moderator to discuss your intentions.`,
            );
          }
          break;
        case 'leave': {
          const matchedCharIndex = this._campaign.characters.findIndex((char) => char.uid === message.author.id);
          const matchedChar = await this._databaseService.manager.findOne(Character, message.author.id);
          if (matchedCharIndex >= 0) {
            this._campaign.characters.splice(matchedCharIndex, 1);
            this._databaseService.manager.save(this._campaign);
            message.reply(`your character **${matchedChar.name}** has left the campaign.`);
            return;
          }
          message.reply(`I couldn't find your character. Reach out to a moderator to help you out with this issue.`);
          break;
        }
      }
    }
  }
}
