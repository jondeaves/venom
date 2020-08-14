import Environment from './Environment';
import LogLevel from './LogLevel';

export default interface Config {
  BOT_TRIGGER: string;
  DISCORD_BOT_TOKEN: string;
  MONGODB_URI: string;
  MONGODB_DB_NAME: string;
  DATABASE_URL: string;
  NODE_ENV: Environment;
  LOG_LEVEL: LogLevel;
}
