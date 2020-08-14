import Discord, { Collection } from 'discord.js';

import MongoService from '../../core/services/mongo.service';
import DatabaseService from '../../core/services/database.service';

export default interface ICommand {
  name: string;
  aliases?: string[];
  description: string;
  example?: string;
  execute: (
    message: Discord.Message,
    args: string[],
    prefix?: string,
    commands?: Collection<string, ICommand>,
    mongoService?: MongoService,
    databaseService?: DatabaseService,
  ) => Promise<void | Discord.Message>;
}
