import Discord, { Message } from 'discord.js';
import roguelike from 'roguelike/level/roguelike';
import random from 'roguelike/utility/random';

import container from '../inversity.config';

import ConfigService from '../core/services/config.service';
import DatabaseService from '../core/services/database.service';
import LoggerService from '../core/services/logger.service';

import Campaign from './campaign/campaign.entity';
import Character from './character/character.entity';
import Monster from './character/monster.entity';

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
    const matchedChar = await this._databaseService.manager.findOne(Character, message.author.id);

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
        case 'info': {
          message.channel.send(`Welcome to campaign ${this._campaign.id}`);
          message.channel.send(`There are ${this._campaign.characters.length} weary travellers.`);
          break;
        }
        case 'status': {
          const msg = [];
          msg.push(`> **${matchedChar.name}** stops for a moment to look at themselves.`);
          msg.push(
            `> HP: ${':heart:'.repeat(matchedChar.current_health)}${':broken_heart:'.repeat(
              matchedChar.max_health - matchedChar.current_health,
            )}`,
          );
          msg.push(`> :crossed_swords: ${matchedChar.power} :shield: ${matchedChar.defense}`);
          message.channel.send(msg.join(`\n`));
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
          if (matchedCharIndex >= 0) {
            this._campaign.characters.splice(matchedCharIndex, 1);
            this._databaseService.manager.save(this._campaign);
            message.reply(`your character **${matchedChar.name}** has left the campaign.`);
            return;
          }
          message.reply(`I couldn't find your character. Reach out to a moderator to help you out with this issue.`);
          break;
        }
        case 'w':
        case 'walk': {
          if (args[1]) {
            const map = JSON.parse(this._campaign.dungeon);
            const myPos = JSON.parse(matchedChar.position);
            switch (args[1]) {
              default:
                message.channel.send(`> ${matchedChar.name} remains in place.`);
                break;
              case 'n':
                if (myPos.y - 1 <= 0 || map.world[myPos.y - 1][myPos.x] === 2) {
                  message.channel.send(`> ${matchedChar.name} cannot pass that way.`);
                } else {
                  myPos.y -= 1;
                  message.channel.send(`> ${matchedChar.name} takes a step, northward.`);
                }
                break;
              case 'e':
                if (myPos.x + 1 >= map.width || map.world[myPos.y][myPos.x + 1] === 2) {
                  message.channel.send(`> ${matchedChar.name} cannot pass that way.`);
                } else {
                  myPos.x += 1;
                  message.channel.send(`> ${matchedChar.name} takes a step, eastward.`);
                }
                break;
              case 'w':
                if (myPos.x - 1 <= 0 || map.world[myPos.y][myPos.x - 1] === 2) {
                  message.channel.send(`> ${matchedChar.name} cannot pass that way.`);
                } else {
                  myPos.x -= 1;
                  message.channel.send(`> ${matchedChar.name} takes a step, westward.`);
                }
                break;
              case 's':
                if (myPos.y + 1 >= map.height || map.world[myPos.y + 1][myPos.x] === 2) {
                  message.channel.send(`> ${matchedChar.name} cannot pass that way.`);
                } else {
                  myPos.y += 1;
                  message.channel.send(`> ${matchedChar.name} takes a step, southward.`);
                }
                break;
            }
            matchedChar.position = JSON.stringify(myPos);
            await this._databaseService.manager.save(matchedChar);
            await this.monsterTurn(message.channel, map);
          }
          break;
        }
        case 'map':
          {
            let map = JSON.parse(this._campaign.dungeon);
            if (args[1] && args[1] === 'loc') {
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
            const myPos = JSON.parse(matchedChar.position);
            const sight = args[1] && args[1] === 'all' ? -1 : 3;

            for (let i = 0; i < map.world.length; i += 1) {
              let line = '';
              for (let j = 0; j < map.world[i].length; j += 1) {
                const playerHere = this._campaign.characters.find((char) => this.isPlayerHere(char, j, i));
                const isMe = this.isPlayerHere(matchedChar, j, i);
                const monsterHere = this._campaign.monsters.find((mon) => this.isMonsterHere(mon, j, i));
                if (this.isInRange(myPos.x, myPos.y, j, i, sight) || sight === -1) {
                  if (playerHere) line += isMe ? ':slight_smile:' : ':neutral_face:';
                  else if (monsterHere) line += ':ghost:';
                  else if (map.world[i][j] === 0) line += ':white_large_square:';
                  else if (map.world[i][j] === 1) line += ':black_large_square:';
                  else if (map.world[i][j] === 2) line += ':white_large_square:';
                  else if (map.world[i][j] === 3) line += ':door:';
                  else if (map.world[i][j] === 4) line += ':door:';
                  else if (map.world[i][j] === 5) line += ':checkered_flag:';
                  else if (map.world[i][j] === 6) line += ':triangular_flag_on_post:';
                }
              }
              msg.push(line);
            }
            message.channel.send(msg, { split: true });
          }
          break;
        case 'look': {
          const map = JSON.parse(this._campaign.dungeon);
          const myPos = JSON.parse(matchedChar.position);
          message.channel.send(`> **${matchedChar.name}** looks around.`);

          const list = await this.getSurroundings(map.world, myPos.x, myPos.y, 3, message.author.id);
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
            const map = JSON.parse(this._campaign.dungeon);
            const myPos = JSON.parse(matchedChar.position);
            const surroundings = await this.getSurroundings(map.world, myPos.x, myPos.y, 4, message.author.id);
            const nextArgs = args.splice(1).join(' ').toLowerCase();
            if (surroundings.find((obj) => obj.toLowerCase() === nextArgs)) {
              const allChar = this._campaign.characters;
              const allMons = this._campaign.monsters;
              const char = this.isPlayer(allChar, nextArgs);
              const mon = this.isMonster(allMons, nextArgs);
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
              } else if (mon) {
                message.channel.send(`> That's a hostile **${mon.name}**!`);
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
        case 'attack': {
          if (args[1]) {
            const map = JSON.parse(this._campaign.dungeon);
            const nextArgs = args.splice(1).join(' ');
            const myPos = JSON.parse(matchedChar.position);

            const allChar = this._campaign.characters;
            const allMon = this._campaign.monsters;
            const char = this.isPlayer(allChar, nextArgs);
            const mon = this.isMonster(allMon, nextArgs);

            if (char) {
              char.current_health -= Math.max(0, matchedChar.power - char.defense);
              message.channel.send(
                `> **${matchedChar.name}** attacks **${nextArgs}** for ${Math.max(
                  0,
                  matchedChar.power - char.defense,
                )} damage!`,
              );
              if (char.current_health <= 0) {
                message.channel.send(`> **${char.name}** lets out a deathly scream and drops dead on the floor.`);
              }
              await this._databaseService.manager.save(char);
              break;
            } else if (mon) {
              const monPos = JSON.parse(mon.position);
              if (
                this.isInRange(myPos.x, myPos.y, monPos.x, monPos.y, 2) &&
                allMon.find((obj) => obj.name === nextArgs)
              ) {
                const damage = Math.max(0, matchedChar.power - mon.defense);
                message.channel.send(`> **${matchedChar.name}** attacks **${mon.name}** for ${damage} damage!`);
                mon.current_health -= damage;
                if (mon.current_health <= 0) {
                  message.channel.send(
                    `> **${mon.name}** is defeated!\n> **${matchedChar.name}** gets ${mon.expvalue} EXP!`,
                  );
                  const matchedMonIndex = this._campaign.monsters.findIndex((m) => m.id === mon.id);
                  this._campaign.monsters.splice(matchedMonIndex, 1);
                  await this._databaseService.manager.save(this._campaign);
                  // TODO: add exp, level up, etc
                  break;
                }
              }
            }
            message.channel.send(`> **${matchedChar.name}** swings widely into the air, hitting nothing.`);
            await this.monsterTurn(message.channel, map, 2); // favor attack
          }
        }
      }
    }
  }

  isPlayerHere(char: Character, x: number, y: number): boolean {
    const pos = JSON.parse(char.position);
    if (pos.x === x && pos.y === y) return true;
    return false;
  }

  isMonsterHere(mon: Monster, x: number, y: number): boolean {
    const pos = JSON.parse(mon.position);
    if (pos.x === x && pos.y === y) return true;
    return false;
  }

  isAnyPlayerHere(x: number, y: number): boolean {
    // eslint-disable-next-line no-restricted-syntax
    for (const char of this._campaign.characters) {
      if (char.current_health > 0) {
        if (this.isPlayerHere(char, x, y)) return true;
      }
    }
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

  isMonster(chars: Monster[], name: string): Monster {
    // eslint-disable-next-line no-restricted-syntax
    for (const char of chars) {
      if (char.name === name) {
        return char;
      }
    }
    // eslint-disable-next-line unicorn/no-null
    return null;
  }

  async monsterTurn(
    channel: Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel,
    map: any,
    favoredAction = 0,
  ): Promise<void> {
    // eslint-disable-next-line unicorn/no-for-loop
    for (let i = 0; i < this._campaign.monsters.length; i += 1) {
      // TODO: monsters or other AI will take a turn here.
      // the AI should be capable of:
      // 1) damaging a player that is one tile next to them (non diagonal)
      // 2) moving one tile around if no player is near
      // if the AI has 0 zero health, it will be removed from the game

      let action = random.dice('d2'); // random action

      if (favoredAction > 0 && action !== favoredAction) {
        // if there's a favored action
        // let's reroll for advantage
        if (random.dice('d20') > 12) action = favoredAction;
      }

      const charuid = this.isNearPlayers(
        this._campaign.characters,
        JSON.parse(this._campaign.monsters[i].position).x,
        JSON.parse(this._campaign.monsters[i].position).y,
      ); // nearest player
      // eslint-disable-next-line no-await-in-loop
      const matchedChar = this._campaign.characters.find((char) => char.uid === charuid);
      switch (action) {
        default:
          // nothing
          if (matchedChar) channel.send(`> An eerie silence fills the room...`); // if a monster moves near a player, they will know
          break;
        case 1: {
          // move
          const dir = random.dice('d4');
          const newPos = JSON.parse(
            `{ "x":${JSON.parse(this._campaign.monsters[i].position).x}, "y":${
              JSON.parse(this._campaign.monsters[i].position).y
            } }`,
          );
          let cardinal = '';
          switch (dir) {
            default:
              break;
            case 1: // up
              if (newPos.y - 1 >= 0 || map.world[newPos.y - 1][newPos.x] === 2) {
                newPos.y -= 1;
                cardinal = 'north';
              }
              break;
            case 2: // right;
              if (newPos.x + 1 <= map.width || map.world[newPos.y][newPos.x + 1] === 2) {
                newPos.x += 1;
                cardinal = 'east';
              }
              break;
            case 3: // down
              if (newPos.y + 1 <= map.height || map.world[newPos.y + 1][newPos.x] === 2) {
                newPos.y += 1;
                cardinal = 'south';
              }
              break;
            case 4: // left
              if (newPos.x - 1 >= 0 || map.world[newPos.y][newPos.x - 1] === 2) {
                newPos.x -= 1;
                cardinal = 'west';
              }
              break;
          }
          // eslint-disable-next-line no-await-in-loop
          await this.updateMonsterPos(map, newPos, this._campaign.monsters[i]);
          if (matchedChar) {
            channel.send(`> **${matchedChar.name}** sees **${this._campaign.monsters[i].name}** going ${cardinal}!`); // if a monster moves near a player, they will know
          }
          break;
        }
        case 2: // attack
          if (matchedChar) {
            channel.send(`> **${matchedChar.name}** is hit by **${this._campaign.monsters[i].name}**!`);
            matchedChar.current_health -= 1;
            if (matchedChar.current_health <= 0) {
              channel.send(`> **${matchedChar.name}** lets out a deathly scream, and drops dead to the floor...`);
              // const matchedCharIndex = this._campaign.characters.findIndex((chara) => chara.uid === char.uid);
              // this._campaign.characters.slice(matchedCharIndex, 1);
            }
          }
          break;
      }
    }
    await this._databaseService.manager.save(this._campaign);
  }

  updateMonsterPos(map: any, newPos: any, monster: any): void {
    // TODO: can we pass here
    if (
      newPos.y >= 0 &&
      newPos.y <= map.height &&
      newPos.x >= 0 &&
      newPos.x <= map.width &&
      map.world[newPos.y][newPos.x] !== 2
    ) {
      // now let's check if no players are here
      const anyPlayerhere = this.isAnyPlayerHere(newPos.x, newPos.y);
      if (!anyPlayerhere) {
        // eslint-disable-next-line no-param-reassign
        map.world[monster.y][monster.x] = 1;
        // eslint-disable-next-line no-param-reassign
        map.world[newPos.y][newPos.x] = 99;
        this._campaign.dungeon = JSON.stringify(map);
      }
    }
  }

  isNearPlayers(chars: Character[], x: number, y: number): string {
    // eslint-disable-next-line consistent-return
    let result = '';
    chars.forEach((char) => {
      if (char.current_health > 0) {
        const pos = JSON.parse(char.position);
        const dist = Math.sqrt((pos.x - x) ** 2 + (pos.y - y) ** 2);
        if (Math.abs(Math.floor(dist)) <= 1) {
          result = char.uid;
        }
      }
    });
    return result;
  }

  isNearPlayer(char: Character, x: number, y: number): string {
    // eslint-disable-next-line consistent-return
    let result = '';
    if (char.current_health > 0) {
      const pos = JSON.parse(char.position);
      const dist = Math.sqrt((pos.x - x) ** 2 + (pos.y - y) ** 2);
      if (Math.abs(Math.floor(dist)) <= 1) {
        result = char.uid;
      }
    }
    return result;
  }

  isInRange(myx: number, myy: number, targetx: number, targety: number, range: number): boolean {
    const dist = Math.sqrt((myx - targetx) ** 2 + (myy - targety) ** 2);
    if (Math.abs(Math.floor(dist)) < range) {
      return true;
    }
    return false;
  }

  async getSurroundings(world: [[]], x: number, y: number, range: number, uid: string): Promise<string[]> {
    const result = [];
    const allChar = await this._campaign.characters;
    const allMon = await this._campaign.monsters;

    const playersInRange = allChar.filter(
      (char) =>
        char.uid !== uid &&
        this.isInRange(x, y, JSON.parse(char.position).x, JSON.parse(char.position).y, range === -1 ? 999 : range),
    );
    playersInRange.forEach((index) => {
      result.push(`**${index.name}**`);
    });
    const monstersInRange = allMon.filter((mon) =>
      this.isInRange(x, y, JSON.parse(mon.position).x, JSON.parse(mon.position).y, range === -1 ? 999 : range),
    );
    console.log(monstersInRange);
    monstersInRange.forEach((index) => {
      result.push(`**${index.name} (Lv.${index.level})**`);
    });

    // eslint-disable-next-line unicorn/no-for-loop
    for (let i = 0; i < world.length; i += 1) {
      let diffX = 0;
      let diffY = 0;
      for (let j = 0; j < world[i].length; j += 1) {
        diffX = Math.abs(j - x);
        diffY = Math.abs(i - y);
        if ((diffX < range && diffY < range) || range === -1) {
          if (world[i][j] === 3 || world[i][j] === 4) result.push('**door**');
          if (world[i][j] === 5) result.push('**start flag**');
        }
      }
    }
    return result;
  }
}
