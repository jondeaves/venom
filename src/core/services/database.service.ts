import { injectable } from 'inversify';
import path from 'path';
import { createConnection, Connection, EntityManager } from 'typeorm';

// eslint-disable-next-line import/no-cycle
import container from '../../inversity.config';

import ConfigService from './config.service';
// eslint-disable-next-line import/no-cycle
import LoggerService from './logger.service';

@injectable()
export default class DatabaseService {
  private _configService: ConfigService = container.resolve<ConfigService>(ConfigService);

  private _loggerService: LoggerService = container.resolve<LoggerService>(LoggerService);

  public _connection: Connection;

  public get manager(): EntityManager {
    return this._connection.manager;
  }

  public async connect(): Promise<void> {
    this._connection = await createConnection({
      type: 'postgres',
      url: this._configService.get('DATABASE_URL'),
      entities: [path.resolve(__dirname, '../../**/*.entity{.ts,.js}')],
      synchronize: true,
    });

    this._loggerService.log('info', 'Venom is connected to Postgres');
  }

  public disconnect(): void {
    if (this._connection && this._connection.isConnected) {
      this._connection.close();
    }
  }
}
