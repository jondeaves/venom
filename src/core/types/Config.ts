import LogLevel from './LogLevel';
import Environment from './Environment';

export default interface Config {
  BOT_TRIGGER: string;
  DISCORD_BOT_TOKEN: string;
  MONGODB_URI: string;
  MONGODB_DB_NAME: string;
  ENVIRONMENT: Environment;
  LOG_LEVEL: LogLevel;
}
