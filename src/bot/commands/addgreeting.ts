import Discord, { Collection } from 'discord.js';

import ConfigService from '../../core/services/config.service';
import MongoService from '../../core/services/mongo.service';

import container from '../../inversity.config';

import ICommand from './ICommand';

const prefix = container.resolve<ConfigService>(ConfigService).get('BOT_TRIGGER');

const command: ICommand = {
  name: 'addgreeting',
  aliases: ['ag'],
  description:
    'Adds a string to the list greetings used when new users connect to server! Include `{name}` in your message to replace with the new users name.',
  example: `\`${prefix}addgreeting Welcome to the club {name}\``,
  async execute(
    message: Discord.Message,
    args: string[],
    _prefix?: string,
    _commands?: Collection<string, ICommand>,
    dbService?: MongoService,
  ) {
    // Only certain users can use this command
    // TODO: Better handling of permissions for commands in a generic way
    const permittedRoles = new Set(['staff', 'mod', 'bot-devs']);
    const isPermitted = message.member.roles.cache.some((r) => permittedRoles.has(r.name));

    if (!isPermitted) {
      return message.author.send("Sorry but I can't let you add greetings!");
    }

    // Can't do much without a message
    if (args.length === 0) {
      return message.author.send('When adding a greeting you need to also provide a message!');
    }

    // Check for dupes
    const greetingStr = args.join(' ');
    const matchedMessages = await dbService.find(message.author.id, 'greetings', { message: greetingStr });
    if (matchedMessages.length > 0) {
      return message.author.send('That greeting has already been added!');
    }

    const result = await dbService.insert(message.author.id, 'greetings', [{ message: greetingStr }]);

    if (!result) {
      return message.author.send("Uh-oh! Couldn't add that greeting!");
    }

    return message.author.send("I've added the greeting you told me about!");
  },
};

export default command;
