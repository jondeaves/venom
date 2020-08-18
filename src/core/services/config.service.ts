import Config from '../types/Config';
import Environment from '../types/Environment';
import LogLevel from '../types/LogLevel';

export default class ConfigService {
  /**
   * Object that holds all config values used by the system
   *
   * @type {Config}
   * @memberof ConfigService
   */
  private config: Config;

  public get isProd(): boolean {
    return this.get('NODE_ENV') === 'production';
  }

  constructor() {
    this.config = {
      BOT_TRIGGER: process.env.BOT_TRIGGER || '!',
      DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
      MONGODB_URI: process.env.MONGODB_URI || '',
      MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || '',
      DATABASE_URL: process.env.DATABASE_URL || '',
      NODE_ENV: (process.env.NODE_ENV as Environment) || 'development',
      LOG_LEVEL: (process.env.LOG_LEVEL as LogLevel) || 'info',
    };
  }

  public get(key: keyof Config): string {
    return this.config[key];
  }
}
