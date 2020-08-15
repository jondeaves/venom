import { AutowiredService, OnActivation } from 'alpha-dic';
import path from 'path';
import { createConnection, Connection, EntityManager } from 'typeorm';

import ConfigService from './config.service';
import LoggerService from './logger.service';

@AutowiredService('DatabaseService')
@OnActivation(async (dbService: DatabaseService) => {
  await dbService.connect();
  return dbService;
})
export default class DatabaseService {
  public _connection: Connection;

  public get manager(): EntityManager {
    return this._connection.manager;
  }

  constructor(private _configService: ConfigService, private _loggerService: LoggerService) {}

  async connect(): Promise<void> {
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
