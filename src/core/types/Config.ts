import Environment from './Environment';
import LogLevel from './LogLevel';

export default class Config {
  BOT_TRIGGER: string;

  CAMPAIGN_TRIGGER: string;

  CAMPAIGN_MODERATOR_ROLE_ID: string;

  DISCORD_BOT_TOKEN: string;

  MONGODB_URI: string;

  MONGODB_DB_NAME: string;

  DATABASE_URL: string;

  NODE_ENV: Environment;

  LOG_LEVEL: LogLevel;
}

export type IConfig = { [k in keyof Config]: Config[k] };
