import { Container } from "inversify";

import ConfigService from "./core/services/config.service";
import LoggerService from "./core/services/logger.service";
import MongoService from "./core/services/mongo.service";

const container = new Container();
container.bind<ConfigService>(ConfigService).toSelf();
container.bind<LoggerService>(LoggerService).toSelf();
container.bind<MongoService>(MongoService).toSelf();

export default container;