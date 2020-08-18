import { exit } from 'process';

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
      this._loggerService.log('info', 'Venom is running');
    } catch {
      exit(1);
    }
  }

  public exit(): void {
    this._mongoService.disconnect();
    this._databaseService.disconnect();
  }
}
