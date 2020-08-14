import { injectable } from 'inversify';
import path from 'path';
import winston from 'winston';

// eslint-disable-next-line import/no-cycle
import container from '../../inversity.config';
import LogLevel from '../types/LogLevel';

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
        new winston.transports.File({
          filename: path.resolve(__dirname, '../../', 'logs', 'error.log'),
          level: 'error',
        }),
        new winston.transports.Console({
          format: winston.format.simple(),
        }),
      ],
    });
  }

  log(level: LogLevel, message: string, payload?: unknown): void {
    if (this._logger[level]) {
      this._logger.log(level, message, payload);
    } else {
      this._logger.info(message, payload);
    }
  }
}
