import path from 'path';
import winston from 'winston';

import LogLevel from '../types/LogLevel';

import ConfigService from './config.service';

export default class LoggerService {
  private _logger: winston.Logger;

  constructor(private _configService: ConfigService) {
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
