import { exit } from 'process';
import { AutowiredService } from 'alpha-dic';

import ConfigService from './core/services/config.service';
import DatabaseService from './core/services/database.service';
import LoggerService from './core/services/logger.service';
import MongoService from './core/services/mongo.service';

import Bot from './bot/Bot';

@AutowiredService('App')
export default class App {
  private _bot: Bot;

  constructor(
    private _configService?: ConfigService,
    private _loggerService?: LoggerService,
    private _databaseService?: DatabaseService,
    private _mongoService?: MongoService,
  ) {
    // this._bot = new Bot(this._configService, this._loggerService, this._mongoService, this._databaseService);
  }

  // eslint-disable-next-line class-methods-use-this
  public async start(): Promise<void> {
    try {
      this._loggerService.log('info', 'Application started');
      // this._bot = new Bot(this._configService, this._loggerService, this._mongoService, this._databaseService);
      // await this._bot.bind();
    } catch {
      exit(1);
    }
  }

  public exit(): void {
    this._mongoService.disconnect();
    this._databaseService.disconnect();
  }
}
