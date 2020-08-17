import Discord from 'discord.js';
import Command from './Command';

export default class EightBallCommand extends Command {
  async execute(message: Discord.Message, args: string[]): Promise<Discord.Message> {
    if (args.length === 0) {
      return message.reply("where's the question?");
    }

    const responses = [
      'as I see it, yes.',
      'err, ask again later.',
      'better not tell you now.',
      "that's hard to predict right now.",
      'concentrate... and ask again.',
      "don't count on it.",
      'it is certain.',
      'it is decidedly so, yes.',
      'most likely.',
      'no.',
      'likely not.',
      'my sources say no.',
      'hmm, outlook not so good.',
      'okay, outlook is good.',
      'not sure, ask again later.',
      'as dubealex commands it: maybe!',
      "googliano'd the answer and uh, it's a yes?",
      'careful, but yes',
      'signs point to a yes.',
      'very doubtful, very doubtful.',
      'without a doubt.',
      'yes.',
      'yes - definitely.',
      'yeah, you can rely on it.',
    ];

    return message.reply(responses[Math.floor(Math.random() * responses.length - 1)]);
  }
}
