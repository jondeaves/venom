import LogLevel from "./LogLevel";
import Environment from "./Environment";

export default interface Config {
  BOT_TRIGGER: string;
  DISCORD_BOT_TOKEN: string;
  ENVIRONMENT: Environment;
  LOG_LEVEL: LogLevel;
}
