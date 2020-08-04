import path from 'path';
import winston from 'winston';
import { injectable } from 'inversify';

import LogLevel from '../types/LogLevel';
import container from '../../inversity.config';

import ConfigService from './config.service';

@injectable()
export default class LoggerService {
  private _configService: ConfigService = container.resolve<ConfigService>(ConfigService);

  private _logger: winston.Logger;

  constructor() {
    this._logger = winston.createLogger({
      level: this._configService.get('LOG_LEVEL'),
      format: winston.format.json(),
      transports: [
        new winston.transports.File({ filename: path.resolve(__dirname, '../../', 'logs', 'error.log'), level: 'error' }),
        new winston.transports.Console({
          format: winston.format.simple(),
        }),
      ],
    });
  }

  log(level: LogLevel, message: string, payload?: object) {
    if (this._logger[level]) {
      this._logger.log(level, message, payload);
    } else {
      this._logger.info(message, payload);
    }
  }
}
