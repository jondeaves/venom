import { Container } from "inversify";

import ConfigService from "./core/services/config.service";
import LoggerService from "./core/services/logger.service";

const container = new Container();
container.bind<ConfigService>(ConfigService).toSelf();
container.bind<LoggerService>(LoggerService).toSelf();

export default container;