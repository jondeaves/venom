import Discord from 'discord.js';

import ICommand from './ICommand';

const command: ICommand = {
  name: '8ball',
  aliases: ['eightball', 'magicball', 'ball', 'wisdomball'],
  description: 'Ask the magic eightball for advice!',
  async execute(message: Discord.Message, args: string[]) {
      const responses = ["as I see it, yes.", "err, ask again later.", "better not tell you now.", "that's hard to predict right now.",
        "concentrate... and ask again.", "don't count on it.", "it is certain.", "it is decidedly so.", "most likely.", "no.",
        "likely not.", "my sources say no.", "hmm, outlook not so good.", "outlook is good.", "not sure, try again.",
        "as dubealex commands it: maybe!", "googliano'd the answer and uh, it's a yes?", "careful, but yes",
        "signs point to yes.", "very doubtful.", "without a doubt.","yes.", "yes - definitely.", "yeah, you can rely on it."];
        message.reply(responses[Math.floor(Math.random() * responses.length)]);
  },
};

export default command;