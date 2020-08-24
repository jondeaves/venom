import Config from '../types/Config';

export default class ConfigService extends Config {
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
    super();
    this.config = {} as never;
    this.takeEnv('BOT_TRIGGER', '!');
    this.takeEnv('CAMPAIGN_TRIGGER', '>');
    this.takeEnv('CAMPAIGN_MODERATOR_ROLE_ID', '');
    this.takeEnv('DISCORD_BOT_TOKEN');
    this.takeEnv('MONGODB_URI', '');
    this.takeEnv('MONGODB_DB_NAME', '');
    this.takeEnv('DATABASE_URL', '');
    this.takeEnv('NODE_ENV', 'development');
    this.takeEnv('LOG_LEVEL', 'info');
  }

  private takeEnv<K extends keyof Config>(key: K, defaultValue?: Config[K]): void {
    // eslint-disable-next-line no-underscore-dangle, @typescript-eslint/no-this-alias, @typescript-eslint/naming-convention
    const _this: ConfigService = this;
    this.config[key] = (process.env[key] ?? defaultValue ?? '') as Config[K];

    Object.assign(this, {
      get [key]() {
        return _this.config[key];
      },
      set [key](value: Config[K]) {
        _this.config[key] = value;
      },
    });
  }

  public get<K extends keyof Config>(key: K): Config[K] {
    return this.config[key];
  }
}
