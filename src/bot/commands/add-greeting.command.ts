import Discord from 'discord.js';
import { hasRoleByName } from 'src/utils/Discord.utils';
import Command from './Command';

export default class AddGreetingCommand extends Command {
  async execute(message: Discord.Message, args: string[]): Promise<Discord.Message> {
    const isPermitted = hasRoleByName(['staff', 'mod', 'bot-devs'], message);

    if (!isPermitted) {
      return message.author.send("Sorry but I can't let you add greetings!");
    }

    // Can't do much without a message
    if (args.length === 0) {
      return message.author.send('When adding a greeting you need to also provide a message!');
    }

    // Check for dupes
    const greetingStr = args.join(' ');
    const matchedMessages = await this.dependencies.mongoService.find(message.author.id, 'greetings', {
      message: greetingStr,
    });
    if (matchedMessages.length > 0) {
      return message.author.send('That greeting has already been added!');
    }

    const result = await this.dependencies.mongoService.insert(message.author.id, 'greetings', [
      { message: greetingStr },
    ]);

    if (!result) {
      return message.author.send("Uh-oh! Couldn't add that greeting!");
    }

    return message.author.send("I've added the greeting you told me about!");
  }
}
