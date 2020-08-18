import { exit } from 'process';
import { getRepository } from 'typeorm';

import container from './inversity.config';

import ConfigService from './core/services/config.service';
import DatabaseService from './core/services/database.service';
import LoggerService from './core/services/logger.service';
import MongoService from './core/services/mongo.service';

import Bot from './bot/Bot';

export default class App {
  private _configService: ConfigService = container.resolve<ConfigService>(ConfigService);

  private _loggerService: LoggerService = container.resolve<LoggerService>(LoggerService);

  private _mongoService: MongoService = container.resolve<MongoService>(MongoService);

  private _databaseService: DatabaseService = container.resolve<DatabaseService>(DatabaseService);

  private _bot: Bot;

  public async init(): Promise<void> {
    try {
      await this._mongoService.connect();
      await this._databaseService.connect();
    } catch (error) {
      this._loggerService.log('error', 'Cannot connect to database, exiting.', { error });
      exit(1);
    }

    try {
      this._bot = new Bot(this._configService, this._loggerService, this._mongoService, this._databaseService);
      await this._bot.bind();
    } catch {
      exit(1);
    }
  }

  public exit(): void {
    this._mongoService.disconnect();
    this._databaseService.disconnect();
  }

  // eslint-disable-next-line class-methods-use-this
  private async handleRPG(message: Message): Promise<boolean> {
    // Check if this is for an rpg campaign first
    const campaignRepository = getRepository(Campaign);
    const prefix = this._configService.get('BOT_TRIGGER');
    const result = await campaignRepository.find({
      where: { roomId: message.channel.id },
      relations: ['characters'],
    });

    if (!result || result.length === 0) {
      return false;
    }

    const campaign = result[0];
    const matchedChar = campaign.characters.findIndex((char) => char.uid === message.author.id);

    if (matchedChar === -1) {
      message.reply(
        `it looks like you're not part of this campaign to see any information. Try \`${prefix}character create <name>\` to set up a character, first.`,
      );
    } else {
      // Pass through to campaign manager
      const campaignManager = new CampaignManager(this._databaseService, this._discordClient, campaign);
      await campaignManager.execute(message);
    }
    return true;
  }

  private async handleBot(message: Message, commandList: Discord.Collection<string, ICommand>): Promise<void> {
    const prefix = this._configService.get('BOT_TRIGGER');

    // If the message either doesn't start with the prefix or was sent by a bot, exit early.
    if (!message.content.toLowerCase().startsWith(prefix.toLowerCase()) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command =
      commandList.get(commandName) || commandList.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) {
      message.reply("looks like I haven't learned that trick yet!");
    } else {
      try {
        await command.execute(message, args, prefix, commandList, this._mongoService, this._databaseService);
      } catch (error) {
        this._loggerService.log('error', error.message);
        message.reply('there was an error trying to follow that command!');
      }
    }
  }
}
