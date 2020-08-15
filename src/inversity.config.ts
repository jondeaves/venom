import 'reflect-metadata';

import { Container } from 'inversify';

import ConfigService from './core/services/config.service';
import HttpService from './core/services/http.service';
// eslint-disable-next-line import/no-cycle
import LoggerService from './core/services/logger.service';
// eslint-disable-next-line import/no-cycle
import MongoService from './core/services/mongo.service';
// eslint-disable-next-line import/no-cycle
import DatabaseService from './core/services/database.service';

export const DI_TYPES = {
  ConfigService: Symbol('ConfigService'),
  HttpService: Symbol('HttpService'),
  LoggerService: Symbol('LoggerService'),
  MongoService: Symbol('MongoService'),
  DatabaseService: Symbol('DatabaseService'),
};

const container = new Container();

container.bind<ConfigService>(DI_TYPES.ConfigService).to(ConfigService);
// container.bind<ConfigService>(ConfigService).toSelf();
container.bind<HttpService>(HttpService).toSelf();
container.bind<LoggerService>(LoggerService).toSelf();
container.bind<MongoService>(MongoService).toSelf();
container.bind<DatabaseService>(DatabaseService).toSelf();

export default container;
