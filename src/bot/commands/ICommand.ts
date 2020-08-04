import Discord, { Collection } from 'discord.js';

export default interface ICommand {
  name: string;
  aliases?: string[];
  description: string;
  execute: (message: Discord.Message, args: string[], prefix?: string, commands?: Collection<string, ICommand>) => Promise<void>,
}