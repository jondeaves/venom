import { exit } from 'process';
import Discord from 'discord.js';

import container from './inversity.config';

import ConfigService from './core/services/config.service';
import LoggerService from './core/services/logger.service';

import ICommand from './bot/commands/ICommand';
import rawCommands from './bot/commands';

export default class App {
  private _configService: ConfigService = container.resolve<ConfigService>(ConfigService);
  private _loggerService: LoggerService = container.resolve<LoggerService>(LoggerService);

  private _discordClient: Discord.Client;

  public async init(): Promise<void> {
    this._discordClient = new Discord.Client();
    const commandList = new Discord.Collection<string, ICommand>();

    rawCommands.forEach(rawCommand => {
      commandList.set(rawCommand.name, rawCommand);
    });

    // Triggers once after connecting to server
    this._discordClient.once('ready', () => {
      this._loggerService.log('info', "The Bot is connected to Discord server");
    });

    // Triggers on every message the bot can see
    this._discordClient.on('message', async message => {
      const prefix = this._configService.get('BOT_TRIGGER');

      // If the message either doesn't start with the prefix or was sent by a bot, exit early.
      if (!message.content.startsWith(prefix) || message.author.bot) return;

      const args = message.content.slice(prefix.length).trim().split(/ +/);
      const commandName = args.shift().toLowerCase();
      const command = commandList.get(commandName) || commandList.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

      if (!command) {
        return message.reply('Monkey no understand that command yet!');
      };

      try {
        await command.execute(message, args, prefix, commandList);
      } catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command!');
      }



      // Will trigger anytime a message is sent in channel
      // if (command === 'ping') {
      //   message.reply('pong');
      // } else if (command === 'see') {
      //   message.reply(`Server: ${message.guild.name}\nYour username: ${message.author.username}\nYour ID: ${message.author.id}`);
      // } else if (command === 'kick') {
      //   // grab the "first" mentioned user from the message
      //   // this will return a `User` object, just like `message.author`
      //   if (!message.mentions.users.size) {
      //     return message.reply('you need to tag a user in order to kick them!');
      //   }

      //   const taggedUser = message.mentions.users.first();

      //   message.channel.send(`You wanted to kick: ${taggedUser.username}`);
      // } else if (command === 'avatar') {
      //   if (!message.mentions.users.size) {
      //     return message.channel.send(`Your avatar: <${message.author.displayAvatarURL({ format: "png", dynamic: true })}>`);
      //   }

      //   const avatarList = message.mentions.users.map(user => {
      //     return `${user.username}'s avatar: <${user.displayAvatarURL({ format: "png", dynamic: true })}>`;
      //   });

      //   // send the entire array of strings as a message
      //   // by default, discord.js will `.join()` the array with `\n`
      //   message.channel.send(avatarList);
      // } else if (command === 'prune') {
      //   const amount = parseInt(args[0]) + 1;

      //   if (isNaN(amount)) {
      //     return message.reply('that doesn\'t seem to be a valid number.');
      //   } else if (amount <= 1 || amount > 100) {
      //     return message.reply('you need to input a number between 2 and 99.');
      //   }

      //   message.channel.bulkDelete(amount, true).catch((reason) => {
      //     if (reason.code === 50013) {
      //       message.reply('I don\'t have permission to do that.')
      //     } else {
      //       message.reply(`I couldn't do that because: ${reason.message}`)
      //     }
      //   });
      // }
    });

    this._discordClient.login(this._configService.get('DISCORD_BOT_TOKEN'))
      .catch((reason) => {
        this._loggerService.log('error', `Cannot initialise Discord client. Check the token: ${this._configService.get('DISCORD_BOT_TOKEN')}`);
        exit(1);
      });
  }
}
