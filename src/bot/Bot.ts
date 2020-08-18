import Discord from 'discord.js';

import Dependencies from '../core/types/Dependencies';

import Command from './commands/Command';
import AddGreetingCommand from './commands/add-greeting.command';
import CharacterCommand from './commands/character.command';
import EightBallCommand from './commands/eight-ball.command';
import HelpCommand from './commands/help.command';
import PingCommand from './commands/ping.command';
import SeeCommand from './commands/see.command';
import QuotesCommand from './commands/quotes.command';

export default class Bot {
  private _discordClient: Discord.Client;

  private _commandList: Discord.Collection<string, Command>;

  constructor(private _dependencies: Dependencies) {
    this._discordClient = new Discord.Client();
    this._commandList = new Discord.Collection<string, Command>();
  }

  private setCommands(): void {
    const prefix = this._dependencies.configService.get('BOT_TRIGGER');

    // Load in our commands for the command handler
    // TODO: Refactor this into a CommandHandler class?
    const addGreetingCmd = new AddGreetingCommand(
      this._dependencies,
      'addgreeting',
      ['ag'],
      'Adds a string to the list greetings used when new users connect to server! Include `{name}` in your message to replace with the new users name.',
      [`\`${prefix}addgreeting Welcome to the club {name}\``],
    );
    const characterCmd = new CharacterCommand(
      this._dependencies,
      'character',
      ['c'],
      'Adds a string to the list greetings used when new users connect to server! Include `{name}` in your message to replace with the new users name.',
      [`\`${prefix}addgreeting Welcome to the club {name}\``],
    );
    const eightBallCmd = new EightBallCommand(
      this._dependencies,
      '8ball',
      ['eightball', 'magicball', 'ball', 'wisdomball'],
      'Ask the magic eightball for advice.',
      [`\`${prefix} 8ball will I be awesome today?\``],
    );
    const helpCmd = new HelpCommand(
      this._dependencies,
      'help',
      ['commands'],
      'Lists available commands and their usage.',
      [`\`${prefix}help\``, `\`${prefix}help ping\``],
    );
    const pingCmd = new PingCommand(
      this._dependencies,
      'ping',
      ['hello'],
      'Responds, kind of like telling you the bot is alive.',
      [`\`${prefix}ping\``],
    );
    const seeCmd = new SeeCommand(
      this._dependencies,
      'see',
      ['me'],
      'Sends a DM telling you information about your user on given server.',
      [`\`${prefix}see\``],
    );
    const quoteCmd = new QuotesCommand(
      this._dependencies,
      'quotes',
      ['quote', 'quotes', 'q'],
      'Get random quotes from people in chat, or add quotes to the list.',
      [
        `\`${prefix}quote @author quote\` or \`${prefix}quote add @author quote\` - Adds "quote" by @author. @author can be Discord mention or any string that terminates with ' ' (space).`,
        `\`${prefix}quote search key words\` - Search "key words" and give you results of that quote.`,
        `\`${prefix}quote\` (with no arguments) - gets a random quote.`,
        `\`${prefix}quote #quoteId\` - Gets specific quote with ID #quoteId`,
      ],
    );

    this._commandList.set(addGreetingCmd.name, addGreetingCmd);
    this._commandList.set(characterCmd.name, characterCmd);
    this._commandList.set(eightBallCmd.name, eightBallCmd);
    this._commandList.set(pingCmd.name, pingCmd);
    this._commandList.set(seeCmd.name, seeCmd);
    this._commandList.set(helpCmd.name, helpCmd);
    this._commandList.set(quoteCmd.name, quoteCmd);

    // Set custom data on commands
    this._commandList.get('help').commandData = {
      commandList: this._commandList,
      prefix,
    };
  }

  /**
   * Binds event listeners and connects to the server.
   */
  public async bind(): Promise<void> {
    this.setCommands();

    // Bind our events
    this._discordClient.once('ready', this.onReady.bind(this)); // Triggers once after connecting to server
    this._discordClient.on('message', this.onMessage.bind(this)); // Triggers on every message the bot can see
    this._discordClient.on('guildMemberAdd', this.onGuildMemberAdd.bind(this)); // Triggers when a member joins server

    // Perform connect, throw the error if we can't
    try {
      await this._discordClient.login(this._dependencies.configService.get('DISCORD_BOT_TOKEN'));
    } catch (error) {
      const errMsg = `Cannot initialise Discord client. Check the token: ${this._dependencies.configService.get(
        'DISCORD_BOT_TOKEN',
      )}`;

      this._dependencies.loggerService.log('error', errMsg, { error });

      throw new Error(errMsg);
    }
  }

  private onReady(): void {
    this._dependencies.loggerService.log('info', 'Venom is connected to the Discord server');
  }

  private async onMessage(message: Discord.Message): Promise<void> {
    const prefix = this._dependencies.configService.get('BOT_TRIGGER');

    // If the message either doesn't start with the prefix or was sent by a bot, exit early.
    if (!message.content.toLowerCase().startsWith(prefix.toLowerCase()) || message.author.bot) {
      return;
    }

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command =
      this._commandList.get(commandName) ||
      this._commandList.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) {
      message.reply("looks like I haven't learned that trick yet!");
    } else {
      try {
        // await command.execute(message, args, prefix, this._commandList, this._mongoService, this._databaseService);

        await command.execute(message, args);
      } catch (error) {
        this._dependencies.loggerService.log('error', error.message);
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
