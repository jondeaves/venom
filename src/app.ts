import { exit } from 'process';

import ConfigService from './core/services/config.service';
import DatabaseService from './core/services/database.service';
import HttpService from './core/services/http.service';
import LoggerService from './core/services/logger.service';
import MongoService from './core/services/mongo.service';

import Dependencies from './core/types/Dependencies';

import Bot from './bot/Bot';

export default class App {
  private _dependencies: Dependencies;

  // eslint-disable-next-line class-methods-use-this
  public async start(): Promise<void> {
    await this.loadDependencies();

    const bot = new Bot(this._dependencies);

    try {
      await bot.bind();
      this._dependencies.loggerService.log('info', 'Application started');
    } catch {
      exit(1);
    }
  }

  private async loadDependencies(): Promise<void> {
    // Create the services
    const configService = new ConfigService();
    const loggerService = new LoggerService(configService);
    const databaseService = new DatabaseService(configService, loggerService);
    const httpService = new HttpService(loggerService);
    const mongoService = new MongoService(configService, loggerService);

    // Load the async stuff
    if (!(await databaseService.connect())) {
      exit(1);
    }

    if (!(await mongoService.connect())) {
      exit(1);
    }

    this._dependencies = {
      configService,
      databaseService,
      httpService,
      loggerService,
      mongoService,
    };
  }

  public exit(): void {
    if (this._dependencies.mongoService) {
      this._dependencies.mongoService.disconnect();
    }

    if (this._dependencies.databaseService) {
      this._dependencies.databaseService.disconnect();
    }
  }
}
