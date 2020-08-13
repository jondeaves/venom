import path from 'path';
import dotenv from 'dotenv';
import { injectable } from "inversify";

import Config from '../types/Config';
import LogLevel from '../types/LogLevel';
import Environment from '../types/Environment';

@injectable()
export default class ConfigService {
  /**
   * Object that holds all config values used by the system
   *
   * @type {Config}
   * @memberof ConfigService
   */
  private config: Config;

  public get isProd(): boolean {
    return this.get('ENVIRONMENT') === 'production';
  }

  constructor() {
    this.load();
    this.setup();
  }

  private load(): void {
    dotenv.config({ path: path.resolve(__dirname, '../../', '.env') });
  }

  private setup(): void {
    this.config = {
      BOT_TRIGGER: process.env.BOT_TRIGGER || '!',
      DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
      MONGODB_URI: process.env.MONGODB_URI || '',
      MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || '',
      ENVIRONMENT: (process.env.NODE_ENV as Environment) || 'development',
      LOG_LEVEL: (process.env.LOG_LEVEL as LogLevel) || 'info',
    };
  }

  public get(key: keyof Config): any {
    return this.config[key];
  }
}
