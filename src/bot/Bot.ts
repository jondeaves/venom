import Discord from 'discord.js';

import ConfigService from '../core/services/config.service';
import DatabaseService from '../core/services/database.service';
import LoggerService from '../core/services/logger.service';
import MongoService from '../core/services/mongo.service';

import rawCommands from './commands';
import ICommand from './commands/ICommand';

export default class Bot {
  private _discordClient: Discord.Client;

  private _commandList: Discord.Collection<string, ICommand>;

  constructor(
    private _configService: ConfigService,
    private _loggerService: LoggerService,
    private _mongoService: MongoService,
    private _databaseService: DatabaseService,
  ) {
    this._discordClient = new Discord.Client();
    this._commandList = new Discord.Collection<string, ICommand>();
  }

  /**
   * Binds event listeners and connects to the server.
   */
  public async bind(): Promise<void> {
    // Load in our commands for the command handler
    // TODO: Refactor this into a CommandHandler class?
    rawCommands.forEach((rawCommand) => {
      this._commandList.set(rawCommand.name, rawCommand);
    });

    // Bind our events
    this._discordClient.once('ready', this.onReady.bind(this)); // Triggers once after connecting to server
    this._discordClient.on('message', this.onMessage.bind(this)); // Triggers on every message the bot can see
    this._discordClient.on('guildMemberAdd', this.onGuildMemberAdd.bind(this)); // Triggers when a member joins server

    // Perform connect, throw the error if we can't
    try {
      await this._discordClient.login(this._configService.get('DISCORD_BOT_TOKEN'));
    } catch (error) {
      const errMsg = `Cannot initialise Discord client. Check the token: ${this._configService.get(
        'DISCORD_BOT_TOKEN',
      )}`;

      this._loggerService.log('error', errMsg, { error });

      throw new Error(errMsg);
    }
  }

  private onReady(): void {
    this._loggerService.log('info', 'Venom is connected to the Discord server');
  }

  private async onMessage(message: Discord.Message): Promise<void> {
    const prefix = this._configService.get('BOT_TRIGGER');

    // If the message either doesn't start with the prefix or was sent by a bot, exit early.
    if (!message.content.toLowerCase().startsWith(prefix.toLowerCase()) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command =
      this._commandList.get(commandName) ||
      this._commandList.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) {
      message.reply("looks like I haven't learned that trick yet!");
    } else {
      try {
        await command.execute(message, args, prefix, this._commandList, this._mongoService, this._databaseService);
      } catch (error) {
        this._loggerService.log('error', error.message);
        message.reply('there was an error trying to follow that command!');
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private onGuildMemberAdd(member: Discord.GuildMember): void {
    // base
    const greetings = ['Hello, {name}! CA greets you!', 'Welcome to CA, {name}!', 'Hi {name}! Welcome to CA!'];
    const greeting = greetings[Math.floor(Math.random() * greetings.length - 1)];
    // favor
    const flavors = [
      'As PROMISED, grab a free pie! Courtesy of {random}!',
      'The water is pure here! You should ask {random} for their water purified water for a sip!',
      'Home of the sane, the smart and {random}!',
    ];
    const randomMember = member.guild.members.cache.random();
    const flavor = flavors[Math.floor(Math.random() * flavors.length - 1)];
    // result
    member.guild.systemChannel.send(
      `${greeting.replace('{name}', member.displayName)} ${flavor.replace('{random}', randomMember.displayName)}`,
    );
  }
}
