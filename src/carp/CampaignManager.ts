import Discord, { Message } from 'discord.js';
import roguelike from 'roguelike/level/roguelike';

import container from '../inversity.config';

import ConfigService from '../core/services/config.service';
import DatabaseService from '../core/services/database.service';
import LoggerService from '../core/services/logger.service';

import Campaign from './campaign/campaign.entity';
import Character from './character/character.entity';

export default class CampaignManager {
  private _configService: ConfigService = container.resolve<ConfigService>(ConfigService);

  private _loggerService: LoggerService = container.resolve<LoggerService>(LoggerService);

  private _databaseService: DatabaseService;

  private _discordClient: Discord.Client;

  private _campaign: Campaign;

  constructor(databaseService: DatabaseService, discordClient: Discord.Client, campaign: Campaign) {
    this._databaseService = databaseService;
    this._discordClient = discordClient;
    this._campaign = campaign;
  }

  public async execute(message: Message): Promise<void> {
    const prefix = this._configService.get('CAMPAIGN_TRIGGER');
    const modeRoleID = this._configService.get('CAMPAIGN_MODERATOR_ROLE_ID');
    const hasModPermissions = message.member.roles.cache.has(modeRoleID);

    if (!message.content.toLowerCase().startsWith(prefix)) {
      return;
    }

    const args = message.content.slice(prefix.length).trim().split(/ +/);

    // TODO: Handle commands better
    if (args[0]) {
      switch (args[0]) {
        default:
          message.reply(`I don't recognize that command. Try again or type \`help\` for a list of commands.`);
          break;
        case 'status': {
          message.channel.send(`Welcome to campaign ${this._campaign.id}`);
          message.channel.send(`There are ${this._campaign.characters.length} weary travellers.`);
          break;
        }
        case 'stop':
          if (hasModPermissions) {
            this._databaseService.manager.delete(Campaign, this._campaign.id);
            message.channel.send(`The campaign has ended!`);
          } else {
            message.reply(
              `unfortunately you do not have permission to run that command. Contact a moderator to discuss your intentions.`,
            );
          }
          break;
        case 'leave': {
          const matchedCharIndex = this._campaign.characters.findIndex((char) => char.uid === message.author.id);
          const matchedChar = await this._databaseService.manager.findOne(Character, message.author.id);
          if (matchedCharIndex >= 0) {
            this._campaign.characters.splice(matchedCharIndex, 1);
            this._databaseService.manager.save(this._campaign);
            message.reply(`your character **${matchedChar.name}** has left the campaign.`);
            return;
          }
          message.reply(`I couldn't find your character. Reach out to a moderator to help you out with this issue.`);
          break;
        }
        case 'walk': {
          if (args[1]) {
            const matchedChar = await this._databaseService.manager.findOne(Character, message.author.id);
            const map = JSON.parse(this._campaign.dungeon);
            const myPos = JSON.parse(matchedChar.position);
            switch (args[1]) {
              default:
                message.channel.send(`> ${matchedChar.name} remains in place.`);
                break;
              case 'n':
                if (myPos.y - 1 <= 0) {
                  message.channel.send(`> ${matchedChar.name} cannot pass that way.`);
                } else {
                  myPos.y -= 1;
                  message.channel.send(`> ${matchedChar.name} takes a step, northward.`);
                }
                break;
              case 'e':
                if (myPos.x + 1 >= map.width) {
                  message.channel.send(`> ${matchedChar.name} cannot pass that way.`);
                } else {
                  myPos.x += 1;
                  message.channel.send(`> ${matchedChar.name} takes a step, eastward.`);
                }
                break;
              case 'w':
                if (myPos.x - 1 <= 0) {
                  message.channel.send(`> ${matchedChar.name} cannot pass that way.`);
                } else {
                  myPos.x -= 1;
                  message.channel.send(`> ${matchedChar.name} takes a step, westward.`);
                }
                break;
              case 's':
                if (myPos.x + 1 >= map.height) {
                  message.channel.send(`> ${matchedChar.name} cannot pass that way.`);
                } else {
                  myPos.y += 1;
                  message.channel.send(`> ${matchedChar.name} takes a step, southward.`);
                }
                break;
            }
            matchedChar.position = JSON.stringify(myPos);
            await this._databaseService.manager.save(matchedChar);
          }
          break;
        }
        case 'map':
          {
            let map = JSON.parse(this._campaign.dungeon);
            if (args[1] && args[1] === 'loc') {
              const matchedChar = await this._databaseService.manager.findOne(Character, message.author.id);
              message.channel.send(matchedChar.position);
              break;
            }
            if (args[1] && args[1] === 'new') {
              if (hasModPermissions) {
                map = roguelike({
                  width: 25, // Max Width of the world
                  height: 25, // Max Height of the world
                  retry: 100, // How many times should we try to add a room?
                  special: false, // Should we generate a "special" room?
                  room: {
                    ideal: 8, // Give up once we get this number of rooms
                    min_width: 3,
                    max_width: 7,
                    min_height: 3,
                    max_height: 7,
                  },
                });

                this._campaign.dungeon = map;
                this._databaseService.manager.save(this._campaign);

                message.channel.send(`Alright, here's a new map:`);
              } else {
                message.reply(
                  `unfortunately you do not have permission to run that command. Contact a moderator to discuss your intentions.`,
                );
              }
            }
            const msg = [];

            const matchedChar = await this._databaseService.manager.findOne(Character, message.author.id);
            const allChar = await this._databaseService.manager.find(Character);
            const myPos = JSON.parse(matchedChar.position);

            const sight = args[1] && args[1] === 'all' ? -1 : 3;

            for (let i = 0; i < map.world.length; i += 1) {
              let line = '';
              let diffX = 0;
              let diffY = 0;
              for (let j = 0; j < map.world[i].length; j += 1) {
                let playerHere = false;
                let isMe = false;
                // eslint-disable-next-line no-restricted-syntax
                for (const char of allChar) {
                  playerHere = this.isPlayerHere(char, j, i);
                  if (playerHere) {
                    isMe = char.name === matchedChar.name;
                    break;
                  }
                }
                diffX = Math.abs(j - myPos.x);
                diffY = Math.abs(i - myPos.y);
                if ((diffX < sight && diffY < sight) || sight === -1) {
                  if (playerHere) {
                    line += isMe ? ':slight_smile:' : ':neutral_face:';
                    j += 1;
                  }
                  if (map.world[i][j] === 0) line += ':white_large_square:';
                  if (map.world[i][j] === 1) line += ':black_large_square:';
                  if (map.world[i][j] === 2) line += ':white_large_square:';
                  if (map.world[i][j] === 3) line += ':door:';
                  if (map.world[i][j] === 4) line += ':door:';
                  if (map.world[i][j] === 5) line += ':checkered_flag:';
                  if (map.world[i][j] === 6) line += ':triangular_flag_on_post:';
                }
              }
              msg.push(line);
            }
            message.channel.send(msg, { split: true });
          }
          break;
        case 'look': {
          const map = JSON.parse(this._campaign.dungeon);
          const matchedChar = await this._databaseService.manager.findOne(Character, message.author.id);
          const myPos = JSON.parse(matchedChar.position);
          message.channel.send(`> **${matchedChar.name}** looks around.`);

          const list = [];
          const surroundings = await this.getSurroundings(map.world, myPos.x, myPos.y, 4, message.author.id);
          surroundings.forEach((element) => {
            list.push(`**${element}**`);
          });
          if (list.length === 0) {
            message.channel.send(`> **${matchedChar.name}** sees nothing of note.`);
          } else if (list.length === 1) {
            message.channel.send(`> **${matchedChar.name}** sees ${list[0]}.`);
          } else {
            message.channel.send(`> **${matchedChar.name}** sees ${list.join(' and ')}.`);
          }
          break;
        }
        case 'examine':
          if (args[1]) {
            const matchedChar = await this._databaseService.manager.findOne(Character, message.author.id);
            const map = JSON.parse(this._campaign.dungeon);
            const myPos = JSON.parse(matchedChar.position);
            const surroundings = await this.getSurroundings(map.world, myPos.x, myPos.y, 4, message.author.id);
            const nextArgs = args.splice(1).join(' ');
            if (surroundings.find((obj) => obj === nextArgs)) {
              const allChar = await this._databaseService.manager.find(Character);
              const char = this.isPlayer(allChar, nextArgs);
              if (char) {
                const examine = await this._databaseService.manager.findOne(Character, char);
                message.channel.send(`> **${matchedChar.name}** examines **${examine.name}**.`);
                const extraInfo = [];
                if (examine.power > matchedChar.defense) extraInfo.push('They look pretty powerful.');
                else if (examine.power === matchedChar.power) extraInfo.push('We look equally strong.');
                else extraInfo.push("They don't look very strong.");
                if (examine.defense > matchedChar.power) extraInfo.push('They look pretty defensive.');
                else if (examine.defense === matchedChar.defense) extraInfo.push('We look equally guarded.');
                else extraInfo.push("They don't look very shielded.");
                if (examine.current_health === examine.max_health) extraInfo.push('They look very healthy.');
                else extraInfo.push("It looks like the're wounded.");
                if (extraInfo.length > 1) message.channel.send(`> ${extraInfo.join(' ')}`);
              } else {
                switch (nextArgs) {
                  default:
                    message.channel.send(`> There doesn't seem anything to be here.`);
                    break;
                  case 'door':
                    message.channel.send(`> The door seems accessile.`);
                    break;
                  case 'start flag':
                    message.channel.send(`> That's the start flag, it is where we all started in this crazy place.`);
                    break;
                }
              }
            } else {
              message.channel.send(`> **${matchedChar.name}** stares blankly in front of them.`);
            }
          }
          break;
      }
    }
  }

  isPlayerHere(char: Character, x: number, y: number): boolean {
    const pos = JSON.parse(char.position);
    if (pos.x === x && pos.y === y) return true;
    return false;
  }

  isPlayer(chars: Character[], name: string): Character {
    // eslint-disable-next-line no-restricted-syntax
    for (const char of chars) {
      if (char.name === name) {
        return char;
      }
    }
    // eslint-disable-next-line unicorn/no-null
    return null;
  }

  async getSurroundings(world: [[]], x: number, y: number, range: number, uid: string): Promise<string[]> {
    const result = [];
    const allChar = await this._databaseService.manager.find(Character);
    const self = await this._databaseService.manager.findOne(Character, uid);

    // eslint-disable-next-line unicorn/no-for-loop
    for (let i = 0; i < world.length; i += 1) {
      let diffX = 0;
      let diffY = 0;
      let player = '';
      for (let j = 0; j < world[i].length; j += 1) {
        diffX = Math.abs(j - x);
        diffY = Math.abs(i - y);
        if ((diffX < range && diffY < range) || range === -1) {
          let playerHere = false;
          // eslint-disable-next-line no-restricted-syntax
          for (const char of allChar) {
            if (char.name !== self.name) {
              playerHere = this.isPlayerHere(char, j, i);
              player = char.name;
              if (playerHere) break;
            }
          }
          if (playerHere) result.push(`${player}`);
          if (world[i][j] === 3 || world[i][j] === 4) result.push('door');
          if (world[i][j] === 5) result.push('start flag');
        }
      }
    }
    return result;
  }
}
