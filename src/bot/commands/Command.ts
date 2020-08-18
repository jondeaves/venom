import Discord from 'discord.js';

import Dependencies from '../../core/types/Dependencies';

export default abstract class Command {
  /**
   * The main trigger word for the command
   */
  public name: string;

  /**
   * Alternative trigger words for the command
   */
  public aliases: string[];

  /**
   * Information about the command, useful for use in the help command
   */
  public description: string;

  /**
   * A sample of how to use the command, useful for use in the help command
   */
  public examples: string[];

  /**
   * Services this command can make use of
   */
  protected dependencies: Dependencies;

  /**
   * Extra data that the command is storing
   */
  public commandData: { [x: string]: unknown };

  constructor(dependencies: Dependencies, name: string, aliasis: string[], description: string, examples: string[]) {
    this.dependencies = dependencies;
    this.name = name;
    this.aliases = aliasis;
    this.description = description;
    this.examples = examples;
    this.commandData = {};
  }

  abstract async execute(message: Discord.Message, args: string[]): Promise<Discord.Message | void>;
}
