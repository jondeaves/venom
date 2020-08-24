import Discord, { Message } from 'discord.js';
import { getRepository } from 'typeorm';
import random from 'roguelike/utility/random';

import { hasRoleByID } from 'src/utils/Discord.utils';
import Vector2 from '../core/helpers/Vector2';

import Dependencies from '../core/types/Dependencies';

import Campaign from './campaign/campaign.entity';
import Character from './character/character.entity';
import Monster from './character/monster.entity';

import Map from './helpers/Map';
import Player from './character/player.entity';

export default class CampaignManager {
  private _dependencies: Dependencies;

  private _campaign: Campaign;

  GameState = {
    Playing: 1,
    Finished: 2,
    GivenUp: 3,
  };

  constructor(dependencies: Dependencies, campaign: Campaign) {
    this._dependencies = dependencies;
    this._campaign = campaign;
  }

  public async execute(message: Message): Promise<void> {
    const prefix = this._dependencies.configService.get('CAMPAIGN_TRIGGER');

    if (!message.content.toLowerCase().startsWith(prefix)) {
      return;
    }

    const args = message.content.slice(prefix.length).trim().split(/ +/);

    if (args[0]) {
      switch (args[0]) {
        default:
          this.missingCommand(message);
          break;
        case 'info': {
          this.infoCommand(message);
          break;
        }
        case 'status': {
          this.statusCommand(message);
          break;
        }
        case 'stop':
          this.stopCommand(message);
          break;
        case 'leave': {
          this.leaveCommmand(message);
          break;
        }
        case 'w':
        case 'walk': {
          this.walkCommand(message, args);
          break;
        }
        case 'map':
          this.mapCommand(message, args);
          break;
        case 'look': {
          this.lookCommand(message);
          break;
        }
        case 'examine':
          this.examineCommand(message, args);
          break;
        case 'attack': {
          this.attackCommand(message, args);
        }
      }
    }
  }

  private missingCommand(message: Discord.Message): void {
    message.reply(`I don't recognize that command. Try again or type \`help\` for a list of commands.`);
  }

  private givenUpCommand(message: Discord.Message): void {
    message.reply(`unfortunately you have given up and cannot do that anymore.`);
  }

  private winnerCommand(message: Discord.Message): void {
    message.reply(`you won't need to do that - you've already escaped this time!`);
  }

  private infoCommand(message: Discord.Message): void {
    message.channel.send(`Welcome to campaign ${this._campaign.id}`);
    message.channel.send(`There are ${this._campaign.characters.length} weary travellers.`);
  }

  private lookCommand(message: Discord.Message): void {
    const [matchedChar] = this.findCharInMessage(message);
    if (matchedChar.gameState === this.GameState.GivenUp) {
      this.givenUpCommand(message);
      return;
    }
    if (matchedChar.gameState === this.GameState.Finished) {
      this.winnerCommand(message);
      return;
    }
    const currentMap = this._campaign.dungeon;

    message.channel.send(`> **${matchedChar.name}** looks around.`);
    const list = this.getSurroundings(
      currentMap.world,
      new Vector2(matchedChar.position.x, matchedChar.position.y),
      3,
      message.author.id,
    );
    message.channel.send(`> **${matchedChar.name}** sees \`${this.formatListToString(list)}\`.`);
  }

  private statusCommand(message: Discord.Message): void {
    const [matchedChar] = this.findCharInMessage(message);

    const msg = [];
    msg.push(`> **${matchedChar.name}** stops for a moment to look at themselves.`);
    if (matchedChar.gameState === this.GameState.GivenUp) {
      msg.push(`> Your thoughts are not your own, you are fated to roam the halls of the asylum forever.`);
      msg.push(`> You have **given up**.`);
    } else {
      msg.push(
        `> HP: ${':heart:'.repeat(matchedChar.current_health)}${':broken_heart:'.repeat(
          matchedChar.max_health - matchedChar.current_health,
        )}`,
      );
      msg.push(`> :crossed_swords: ${matchedChar.power} :shield: ${matchedChar.defense}`);
    }
    message.channel.send(msg.join(`\n`));
  }

  private async stopCommand(message: Discord.Message): Promise<void> {
    const hasModPermissions = hasRoleByID(this._dependencies.configService.get('CAMPAIGN_MODERATOR_ROLE_ID'), message);

    if (hasModPermissions) {
      message.channel.send(
        `> Hurrily, the escapees scramble to find an exit when an inexplicably bright light consumes the floor... `,
      );
      message.channel.send(`The campaign has **ended**! Thank you for participating!`);
      message.channel.send(`All players are awarded **5 AP** for the effort to escape this asylum.`);

      const playerRepo = getRepository(Player);
      this._campaign.characters.forEach(async (char: Character) => {
        const result = await playerRepo.find({
          where: { uid: char.uid },
          relations: ['characters'],
        });
        if (result.length > 0) {
          result[0].ap += 5;
          await this._dependencies.databaseService.manager.save(Player, result[0]);
        }
      });
      await this._dependencies.databaseService.manager.delete(Campaign, this._campaign.id);
    } else {
      message.reply(
        `unfortunately you do not have permission to run that command. Contact a moderator to discuss your intentions.`,
      );
    }
  }

  private async leaveCommmand(message: Discord.Message): Promise<void> {
    const [matchedChar, matchedCharIndex] = this.findCharInMessage(message);
    if (matchedChar.gameState === this.GameState.GivenUp) {
      this.givenUpCommand(message);
      return;
    }
    if (matchedChar.gameState === this.GameState.Finished) {
      this.winnerCommand(message);
      return;
    }
    if (matchedCharIndex >= 0) {
      matchedChar.gameState = this.GameState.GivenUp;
      message.reply(`your character **${matchedChar.name}** has given up...`);
      await this._dependencies.databaseService.manager.save(matchedChar);
      return;
    }
    message.reply(`I couldn't find your character. Reach out to a moderator to help you out with this issue.`);
  }

  private async attackCommand(message: Discord.Message, args: string[]): Promise<void> {
    const [matchedChar] = this.findCharInMessage(message);
    if (matchedChar.gameState === this.GameState.GivenUp) {
      this.givenUpCommand(message);
      return;
    }
    if (matchedChar.gameState === this.GameState.Finished) {
      this.winnerCommand(message);
      return;
    }
    const currentMap = this._campaign.dungeon;

    if (args[1]) {
      const nextArgs = args.splice(1).join(' ');
      const allChar = this._campaign.characters;
      const allMon = this._campaign.monsters;
      const char = this.isPlayer(allChar, nextArgs);
      const mon = this.isMonster(allMon, nextArgs);
      let damage = 0;

      if (char) {
        damage = Math.max(0, matchedChar.power - char.defense);
        char.current_health -= damage;
        message.channel.send(`> **${matchedChar.name}** attacks **${nextArgs}** for ${damage} damage!`);
        if (char.current_health <= 0) {
          message.channel.send(`> **${char.name}** lets out a deathly scream and drops dead on the floor.`);
        }
        this._dependencies.databaseService.manager.save(char);
        return;
      }
      if (mon) {
        if (this.isInRange(matchedChar.position, mon.position, 2) && allMon.find((obj) => obj.name === nextArgs)) {
          damage = Math.max(0, matchedChar.power - mon.defense);
          message.channel.send(`> **${matchedChar.name}** attacks **${mon.name}** for ${damage} damage!`);
          mon.current_health -= damage;
          if (mon.current_health <= 0) {
            message.channel.send(`> **${mon.name}** is defeated!\n> **${matchedChar.name}** gets ${mon.expvalue} EXP!`);
            const matchedMonIndex = this._campaign.monsters.findIndex((m) => m.id === mon.id);
            this._campaign.monsters.splice(matchedMonIndex, 1);
            await this._dependencies.databaseService.manager.save(this._campaign);
            // TODO: add exp, level up, etc
            return;
          }
        }
      }
      message.channel.send(`> **${matchedChar.name}** swings widely into the air, hitting nothing.`);
      this.monsterTurn(message.channel, currentMap, 2);
    }
  }

  private async examineCommand(message: Discord.Message, args: string[]): Promise<void> {
    const [matchedChar] = this.findCharInMessage(message);
    if (matchedChar.gameState === this.GameState.GivenUp) {
      this.givenUpCommand(message);
      return;
    }
    if (matchedChar.gameState === this.GameState.Finished) {
      this.winnerCommand(message);
      return;
    }
    if (args[1]) {
      const currentMap = this._campaign.dungeon;
      const surroundings = await this.getSurroundings(currentMap.world, matchedChar.position, 4, message.author.id);
      const nextArgs = args.splice(1).join(' ').toLowerCase();

      if (surroundings.find((obj) => obj.toLowerCase() === nextArgs)) {
        const allChar = this._campaign.characters;
        const allMons = this._campaign.monsters;
        const char = this.isPlayer(allChar, nextArgs);
        const mon = this.isMonster(allMons, nextArgs);
        if (char) {
          const examine = await this._dependencies.databaseService.manager.findOne(Character, char);
          message.channel.send(`> **${matchedChar.name}** examines **${examine.name}**.`);
          const extraInfo = [];
          if (examine.power > matchedChar.defense) {
            extraInfo.push('They look pretty powerful.');
          } else if (examine.power === matchedChar.power) {
            extraInfo.push('We look equally strong.');
          } else {
            extraInfo.push("They don't look very strong.");
          }
          if (examine.defense > matchedChar.power) {
            extraInfo.push('They look pretty defensive.');
          } else if (examine.defense === matchedChar.defense) {
            extraInfo.push('We look equally guarded.');
          } else {
            extraInfo.push("They don't look very shielded.");
          }
          if (examine.current_health === examine.max_health) {
            extraInfo.push('They look very healthy.');
          } else {
            extraInfo.push("It looks like the're wounded.");
            if (extraInfo.length > 1) message.channel.send(`> ${extraInfo.join(' ')}`);
          }
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
  }

  private mapCommand(message: Discord.Message, args: string[]): void {
    const [matchedChar] = this.findCharInMessage(message);
    if (matchedChar.gameState === this.GameState.GivenUp) {
      this.givenUpCommand(message);
      return;
    }
    if (matchedChar.gameState === this.GameState.Finished) {
      this.winnerCommand(message);
      return;
    }
    const currentMap = this._campaign.dungeon;

    if (args[1] && args[1] === 'loc') {
      message.channel.send(matchedChar.position);
      return;
    }
    const msg = [];
    const sight = args[1] && args[1] === 'all' ? -1 : 3;

    const mapMarkers = {
      0: ':white_large_square:',
      1: ':black_large_square:',
      2: ':white_large_square:',
      3: ':door:',
      4: ':door:',
      5: ':checkered_flag:',
      6: ':triangular_flag_on_post:',
    };

    for (let i = 0; i < currentMap.world.length; i += 1) {
      let line = '';
      for (let j = 0; j < currentMap.world[i].length; j += 1) {
        const vec = new Vector2(j, i);
        const playerHere = this._campaign.characters.find((char) => this.isPlayerHere(char, vec));
        const monsterHere = this._campaign.monsters.find((mon) => this.isMonsterHere(mon, vec));
        if (this.isInRange(matchedChar.position, vec, sight) || sight === -1) {
          if (playerHere) {
            line += playerHere.graphic;
          } else if (monsterHere) {
            line += monsterHere.graphic;
          } else {
            line += mapMarkers[currentMap.world[i][j]];
          }
        }
      }
      msg.push(line);
    }
    message.channel.send(msg, { split: true });
  }

  private async walkCommand(message: Discord.Message, args: string[]): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [matchedChar, charIndex, player] = this.findCharInMessage(message);
    if (matchedChar.gameState === this.GameState.GivenUp) {
      this.givenUpCommand(message);
      return;
    }
    if (matchedChar.gameState === this.GameState.Finished) {
      this.winnerCommand(message);
      return;
    }
    const currentMap = this._campaign.dungeon;

    if (args[1]) {
      switch (args[1]) {
        default:
          message.channel.send(`> **${matchedChar.name}** remains in place.`);
          break;
        case 'n':
          if (
            matchedChar.position.y - 1 <= 0 ||
            currentMap.world[matchedChar.position.y - 1][matchedChar.position.x] === 2
          ) {
            message.channel.send(`> **${matchedChar.name}** cannot pass that way.`);
          } else {
            // eslint-disable-next-line no-param-reassign
            matchedChar.position.y -= 1;
            message.channel.send(`> **${matchedChar.name}** takes a step, northward.`);
          }
          break;
        case 'e':
          if (
            matchedChar.position.x + 1 >= currentMap.width ||
            currentMap.world[matchedChar.position.y][matchedChar.position.x + 1] === 2
          ) {
            message.channel.send(`> **${matchedChar.name}** cannot pass that way.`);
          } else {
            // eslint-disable-next-line no-param-reassign
            matchedChar.position.x += 1;
            message.channel.send(`> **${matchedChar.name}** takes a step, eastward.`);
          }
          break;
        case 'w':
          if (
            matchedChar.position.x - 1 <= 0 ||
            currentMap.world[matchedChar.position.y][matchedChar.position.x - 1] === 2
          ) {
            message.channel.send(`> **${matchedChar.name}** cannot pass that way.`);
          } else {
            // eslint-disable-next-line no-param-reassign
            matchedChar.position.x -= 1;
            message.channel.send(`> **${matchedChar.name}** takes a step, westward.`);
          }
          break;
        case 's':
          if (
            matchedChar.position.y + 1 >= currentMap.height ||
            currentMap.world[matchedChar.position.y + 1][matchedChar.position.x] === 2
          ) {
            message.channel.send(`> **${matchedChar.name}** cannot pass that way.`);
          } else {
            // eslint-disable-next-line no-param-reassign
            matchedChar.position.y += 1;
            message.channel.send(`> **${matchedChar.name}** takes a step, southward.`);
          }
          break;
      }
      if (matchedChar.position.equals(new Vector2(currentMap.exit.x, currentMap.exit.y))) {
        if (matchedChar.gameState !== this.GameState.Finished) {
          message.channel.send(`> **${matchedChar.name}** reached the exit and _leaves the asylum!_`);
          message.reply(`you are awarded **10 AP** for your escape!`);
          matchedChar.gameState = this.GameState.Finished; // finished
          const playerRepo = getRepository(Player);
          const result = await playerRepo.find({
            where: { uid: matchedChar.uid },
            relations: ['characters'],
          });
          if (result.length > 0) {
            result[0].ap += 10;
            await this._dependencies.databaseService.manager.save(Player, result[0]);
          }
        }
      }
      await this._dependencies.databaseService.manager.save(matchedChar);
      await this.monsterTurn(message.channel, currentMap);
    }
  }

  formatListToString(list: string[]): string {
    const [sep, lastSep] = [`\`, \``, `\` and\``];
    return list.length > 2 ? list.slice(0, -1).join(sep) + lastSep + list[list.length - 1] : list.join(lastSep);
  }

  isPlayerHere(char: Character, vec: Vector2): boolean {
    if (char.position.equals(vec) && char.gameState === this.GameState.Playing) return true;
    return false;
  }

  isMonsterHere(mon: Monster, vec: Vector2): boolean {
    if (mon.position.equals(vec)) return true;
    return false;
  }

  isAnyPlayerHere(vec: Vector2): boolean {
    return this._campaign.characters.some(
      (char) => char.gameState === this.GameState.Playing && char.current_health > 0 && this.isPlayerHere(char, vec),
    );
  }

  isPlayer(chars: Character[], name: string): Character | null {
    return chars.find((char) => char.name === name && char.gameState === this.GameState.Playing);
  }

  isMonster(chars: Monster[], name: string): Monster | null {
    return chars.find((char) => char.name === name);
  }

  async monsterTurn(
    channel: Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel,
    map: Map,
    favoredAction = 0,
  ): Promise<void> {
    this._campaign.monsters.forEach((monster) => {
      // TODO: monsters or other AI will take a turn here.
      // the AI should be capable of:
      // 1) damaging a player that is one tile next to them (non diagonal)
      // 2) moving one tile around if no player is near
      // if the AI has 0 zero health, it will be removed from the game
      const action = favoredAction && random.dice('d20') > 12 ? favoredAction : random.dice('d2');
      const charuid = this.isNearPlayers(this._campaign.characters, monster.position); // nearest player

      const matchedChar = this._campaign.characters.find((char) => char.uid === charuid);
      switch (action) {
        default:
          // nothing
          if (matchedChar) {
            channel.send(`> An eerie silence fills the room...`);
          } // if a monster moves near a player, they will know
          break;
        case 1: {
          // move
          const dir = random.dice('d4');
          const newPos = monster.position;
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
          this.updateMonsterPos(map, newPos, monster);
          if (matchedChar) {
            channel.send(`> **${matchedChar.name}** sees **${monster.name}** going ${cardinal}!`); // if a monster moves near a player, they will know
          }
          break;
        }
        case 2: // attack
          if (matchedChar) {
            channel.send(`> **${matchedChar.name}** is hit by **${monster.name}**!`);
            matchedChar.current_health -= 1;
            if (matchedChar.current_health <= 0) {
              channel.send(`> **${matchedChar.name}** lets out a deathly scream, and drops dead to the floor...`);
              // const matchedCharIndex = this._campaign.characters.findIndex((chara) => chara.uid === char.uid);
              // this._campaign.characters.slice(matchedCharIndex, 1);
            }
          }
          break;
      }
    });
    await this._dependencies.databaseService.manager.save(this._campaign);
  }

  updateMonsterPos(map: Map, newPos: Vector2, monster: Monster): void {
    if (
      newPos.y >= 0 &&
      newPos.y <= map.height &&
      newPos.x >= 0 &&
      newPos.x <= map.width &&
      map.world[newPos.y][newPos.x] !== 2
    ) {
      // now let's check if no players are here
      const anyPlayerhere = this.isAnyPlayerHere(newPos);
      if (!anyPlayerhere) {
        const updMonster = monster;
        updMonster.position = new Vector2(newPos.x, newPos.y);
        this._dependencies.databaseService.manager.save(updMonster);
      }
    }
  }

  isNearPlayers(chars: Character[], vec: Vector2): string {
    let result = '';
    chars.forEach((char) => {
      if (char.current_health > 0) {
        if (this.isInRange(char.position, vec, 1) && char.gameState === this.GameState.Playing) {
          result = char.uid;
        }
      }
    });
    return result;
  }

  isNearPlayer(char: Character, vec: Vector2): string {
    let result = '';
    if (char.current_health > 0) {
      if (this.isInRange(char.position, vec, 1) && char.gameState === this.GameState.Playing) {
        result = char.uid;
      }
    }
    return result;
  }

  isInRange(myVec: Vector2, targetVec: Vector2, range: number): boolean {
    const dist = Math.sqrt((myVec.x - targetVec.x) ** 2 + (myVec.y - targetVec.y) ** 2);
    if (Math.abs(Math.floor(dist)) < range) {
      return true;
    }
    return false;
  }

  getSurroundings(world: [[]], vec: Vector2, range: number, uid: string): string[] {
    const result = [];
    const allChar = this._campaign.characters;
    const allMon = this._campaign.monsters;

    const playersInRange = allChar.filter(
      (char) =>
        char.uid !== uid &&
        this.isInRange(vec, new Vector2(char.position.x, char.position.y), range === -1 ? 999 : range),
    );
    playersInRange.forEach((index) => {
      result.push(`**${index.name}**`);
    });
    const monstersInRange = allMon.filter((mon) =>
      this.isInRange(vec, new Vector2(mon.position.x, mon.position.y), range === -1 ? 999 : range),
    );
    monstersInRange.forEach((index) => {
      result.push(`**${index.name} (Lv.${index.level})**`);
    });

    world.forEach((column, y) => {
      column.forEach((row, x) => {
        const diffX = Math.abs(row[x] - vec.x);
        const diffY = Math.abs(column[y] - vec.y);

        if ((diffX < range && diffY < range) || range === -1) {
          if (world[y][x] === 3 || world[y][x] === 4) result.push('**door**');
          if (world[y][x] === 5) result.push('**start flag**');
        }
      });
    });
    return result;
  }

  findCharInMessage(message: Discord.Message): [Character, number, Player] {
    const matchedCharIndex = this._campaign.characters.findIndex((char) => char.uid === message.author.id);
    const matchedChar = this._campaign.characters[matchedCharIndex];
    const matchedPlayer = this._campaign.characters[matchedCharIndex].player;
    return [matchedChar, matchedCharIndex, matchedPlayer];
  }
}
