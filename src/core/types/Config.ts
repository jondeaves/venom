import LogLevel from "./LogLevel";
import Environment from "./Environment";

export default interface Config {
  DISCORD_BOT_TOKEN: string;
  ENVIRONMENT: Environment;
  LOG_LEVEL: LogLevel;
}
