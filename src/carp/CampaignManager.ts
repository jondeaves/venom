import Discord, { Message } from 'discord.js';
import { getRepository } from 'typeorm';
import random from 'roguelike/utility/random';
import { hasRoleByID } from 'src/utils/Discord.utils';
import { parseMovementArg, MovementDirection, AllMovementDirections, GameState } from 'src/utils/Game.utils';
import { arraySum } from 'src/utils/Array.utils';
import Vector2 from '../core/helpers/Vector2';
import Dependencies from '../core/types/Dependencies';
import Campaign from './campaign/campaign.entity';
import Character from './character/character.entity';
import Monster from './character/monster.entity';
import Map from './helpers/Map';
import Player from './character/player.entity';
import { World, MapMarkers } from './types/MapObject';

const MAX_BATCH_MOVES = 5;

export default class CampaignManager {
  private dependencies: Dependencies;

  private campaign: Campaign;

  constructor(dependencies: Dependencies, campaign: Campaign) {
    this.dependencies = dependencies;
    this.campaign = campaign;
  }

  public async execute(message: Message): Promise<void> {
    const prefix = this.dependencies.configService.CAMPAIGN_TRIGGER;

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
    message.channel.send(`Welcome to campaign ${this.campaign.id}`);
    message.channel.send(`There are ${this.campaign.characters.length} weary travellers.`);
  }

  private lookCommand(message: Discord.Message): void {
    const [player] = this.findCharInMessage(message);
    if (player.gameState === GameState.GivenUp) {
      this.givenUpCommand(message);
      return;
    }
    if (player.gameState === GameState.Finished) {
      this.winnerCommand(message);
      return;
    }
    const currentMap = this.campaign.dungeon;

    message.channel.send(`> **${player.name}** looks around.`);
    const list = this.getSurroundings(
      currentMap.world,
      new Vector2(player.position.x, player.position.y),
      3,
      message.author.id,
    );
    message.channel.send(`> **${player.name}** sees \`${this.formatListToString(list)}\`.`);
  }

  private statusCommand(message: Discord.Message): void {
    const [player] = this.findCharInMessage(message);

    const msg = [];
    msg.push(`> **${player.name}** stops for a moment to look at themselves.`);
    if (player.gameState === GameState.GivenUp) {
      msg.push(`> Your thoughts are not your own, you are fated to roam the halls of the asylum forever.`);
      msg.push(`> You have **given up**.`);
    } else {
      msg.push(
        `> HP: ${':heart:'.repeat(player.current_health)}${':broken_heart:'.repeat(
          player.max_health - player.current_health,
        )}`,
      );
      msg.push(`> :crossed_swords: ${player.power} :shield: ${player.defense}`);
    }
    message.channel.send(msg.join(`\n`));
  }

  private async stopCommand(message: Discord.Message): Promise<void> {
    const hasModPermissions = hasRoleByID(this.dependencies.configService.CAMPAIGN_MODERATOR_ROLE_ID, message);

    if (hasModPermissions) {
      message.channel.send(
        `> Hurrily, the escapees scramble to find an exit when an inexplicably bright light consumes the floor... `,
      );
      message.channel.send(`The campaign has **ended**! Thank you for participating!`);
      message.channel.send(`All players are awarded **5 AP** for the effort to escape this asylum.`);

      const playerRepo = getRepository(Player);
      this.campaign.characters.forEach(async (char: Character) => {
        const result = await playerRepo.find({
          where: { uid: char.uid },
          relations: ['characters'],
        });
        if (result.length > 0) {
          result[0].ap += 5;
          await this.dependencies.databaseService.manager.save(Player, result[0]);
        }
      });
      await this.dependencies.databaseService.manager.delete(Campaign, this.campaign.id);
    } else {
      message.reply(
        `unfortunately you do not have permission to run that command. Contact a moderator to discuss your intentions.`,
      );
    }
  }

  private async leaveCommmand(message: Discord.Message): Promise<void> {
    const [player, playerIdx] = this.findCharInMessage(message);
    if (player.gameState === GameState.GivenUp) {
      this.givenUpCommand(message);
      return;
    }
    if (player.gameState === GameState.Finished) {
      this.winnerCommand(message);
      return;
    }
    if (playerIdx >= 0) {
      player.gameState = GameState.GivenUp;
      message.reply(`your character **${player.name}** has given up...`);
      await this.dependencies.databaseService.manager.save(player);
      return;
    }
    message.reply(`I couldn't find your character. Reach out to a moderator to help you out with this issue.`);
  }

  private async attackCommand(message: Discord.Message, args: string[]): Promise<void> {
    const [player] = this.findCharInMessage(message);
    if (player.gameState === GameState.GivenUp) {
      this.givenUpCommand(message);
      return;
    }
    if (player.gameState === GameState.Finished) {
      this.winnerCommand(message);
      return;
    }
    const currentMap = this.campaign.dungeon;

    if (args[1]) {
      const nextArgs = args.splice(1).join(' ');
      const allChar = this.campaign.characters;
      const allMon = this.campaign.monsters;
      const char = this.isPlayer(allChar, nextArgs);
      const mon = this.isMonster(allMon, nextArgs);
      let damage = 0;

      if (char) {
        damage = Math.max(0, player.power - char.defense);
        char.current_health -= damage;
        message.channel.send(`> **${player.name}** attacks **${nextArgs}** for ${damage} damage!`);
        if (char.current_health <= 0) {
          message.channel.send(`> **${char.name}** lets out a deathly scream and drops dead on the floor.`);
        }
        this.dependencies.databaseService.manager.save(char);
        return;
      }
      if (mon) {
        if (this.isInRange(player.position, mon.position, 2) && allMon.find((obj) => obj.name === nextArgs)) {
          damage = Math.max(0, player.power - mon.defense);
          message.channel.send(`> **${player.name}** attacks **${mon.name}** for ${damage} damage!`);
          mon.current_health -= damage;
          if (mon.current_health <= 0) {
            message.channel.send(`> **${mon.name}** is defeated!\n> **${player.name}** gets ${mon.expvalue} EXP!`);
            const matchedMonIndex = this.campaign.monsters.findIndex((m) => m.id === mon.id);
            this.campaign.monsters.splice(matchedMonIndex, 1);
            await this.dependencies.databaseService.manager.save(this.campaign);
            // TODO: add exp, level up, etc
            return;
          }
        }
      }
      message.channel.send(`> **${player.name}** swings widely into the air, hitting nothing.`);
      this.monsterTurn(message.channel, currentMap, 2);
    }
  }

  private async examineCommand(message: Discord.Message, args: string[]): Promise<void> {
    const [player] = this.findCharInMessage(message);

    if (player.gameState === GameState.GivenUp) {
      this.givenUpCommand(message);
      return;
    }

    if (player.gameState === GameState.Finished) {
      this.winnerCommand(message);
      return;
    }

    if (args[1]) {
      const currentMap = this.campaign.dungeon;
      const surroundings = await this.getSurroundings(currentMap.world, player.position, 4, message.author.id);
      const nextArgs = args.splice(1).join(' ').toLowerCase();

      if (surroundings.find((obj) => obj.toLowerCase() === nextArgs)) {
        const allChar = this.campaign.characters;
        const allMons = this.campaign.monsters;
        const char = this.isPlayer(allChar, nextArgs);
        const mon = this.isMonster(allMons, nextArgs);

        if (char) {
          const examine = await this.dependencies.databaseService.manager.findOne(Character, char);
          message.channel.send(`> **${player.name}** examines **${examine.name}**.`);
          const extraInfo = [];
          if (examine.power > player.defense) {
            extraInfo.push('They look pretty powerful.');
          } else if (examine.power === player.power) {
            extraInfo.push('We look equally strong.');
          } else {
            extraInfo.push("They don't look very strong.");
          }
          if (examine.defense > player.power) {
            extraInfo.push('They look pretty defensive.');
          } else if (examine.defense === player.defense) {
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
        message.channel.send(`> **${player.name}** stares blankly in front of them.`);
      }
    }
  }

  private mapCommand(message: Discord.Message, args: string[]): void {
    const [player] = this.findCharInMessage(message);
    if (player.gameState === GameState.GivenUp) {
      this.givenUpCommand(message);
      return;
    }
    if (player.gameState === GameState.Finished) {
      this.winnerCommand(message);
      return;
    }
    const currentMap = this.campaign.dungeon;

    if (args[1] && args[1] === 'loc') {
      message.channel.send(player.position);
      return;
    }
    const msg = [];
    const sight = args[1] && args[1] === 'all' ? -1 : 3;

    for (let i = 0; i < currentMap.world.length; i += 1) {
      let line = '';
      for (let j = 0; j < currentMap.world[i].length; j += 1) {
        const vec = new Vector2(j, i);
        const playerHere = this.campaign.characters.find((char) => this.isPlayerHere(char, vec));
        const monsterHere = this.campaign.monsters.find((mon) => this.isMonsterHere(mon, vec));
        if (this.isInRange(player.position, vec, sight) || sight === -1) {
          if (playerHere) {
            line += playerHere.graphic;
          } else if (monsterHere) {
            line += monsterHere.graphic;
          } else {
            line += MapMarkers[currentMap.world[i][j]];
          }
        }
      }
      msg.push(line);
    }
    message.channel.send(msg, { split: true });
  }

  private async walkCommand(message: Discord.Message, args: string[]): Promise<void> {
    const [player] = this.findCharInMessage(message);

    if (player.gameState === GameState.GivenUp) {
      this.givenUpCommand(message);
      return;
    }
    if (player.gameState === GameState.Finished) {
      this.winnerCommand(message);
      return;
    }

    const currentMap = this.campaign.dungeon;

    if (args[1]) {
      const moves = parseMovementArg(args[1]);
      const totalMoves = arraySum(moves, (cur) => cur[1]);

      if (totalMoves > MAX_BATCH_MOVES) {
        message.channel.send(`> Too many moves in one go! Pace yourself, don't get yourself too tired.`);
        return;
      }

      for (const [direction, amount] of moves) {
        if (AllMovementDirections.includes(direction) && !Number.isNaN(amount)) {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          for await (const _i of new Array(amount)) {
            switch (direction) {
              default:
                message.channel.send(`> **${player.name}** remains in place.`);
                break;
              case MovementDirection.North:
                if (
                  player.position.y - 1 <= 0 ||
                  currentMap.isWall({ x: player.position.x, y: player.position.y - 1 })
                ) {
                  message.channel.send(`> **${player.name}** cannot pass that way.`);
                } else {
                  // eslint-disable-next-line no-param-reassign
                  player.position.y -= 1;
                  message.channel.send(`> **${player.name}** takes a step, northward.`);
                }
                break;
              case MovementDirection.East:
                if (
                  player.position.x + 1 >= currentMap.width ||
                  currentMap.isWall({ x: player.position.x + 1, y: player.position.y })
                ) {
                  message.channel.send(`> **${player.name}** cannot pass that way.`);
                } else {
                  // eslint-disable-next-line no-param-reassign
                  player.position.x += 1;
                  message.channel.send(`> **${player.name}** takes a step, eastward.`);
                }
                break;
              case MovementDirection.West:
                if (
                  player.position.x - 1 <= 0 ||
                  currentMap.isWall({ x: player.position.x - 1, y: player.position.y })
                ) {
                  message.channel.send(`> **${player.name}** cannot pass that way.`);
                } else {
                  // eslint-disable-next-line no-param-reassign
                  player.position.x -= 1;
                  message.channel.send(`> **${player.name}** takes a step, westward.`);
                }
                break;
              case MovementDirection.South:
                if (
                  player.position.y + 1 >= currentMap.height ||
                  currentMap.isWall({ x: player.position.x, y: player.position.y + 1 })
                ) {
                  message.channel.send(`> **${player.name}** cannot pass that way.`);
                } else {
                  // eslint-disable-next-line no-param-reassign
                  player.position.y += 1;
                  message.channel.send(`> **${player.name}** takes a step, southward.`);
                }
                break;
            }

            if (player.position.equals(new Vector2(currentMap.exit.x, currentMap.exit.y))) {
              if (player.gameState !== GameState.Finished) {
                message.channel.send(`> **${player.name}** reached the exit and _leaves the asylum!_`);
                message.reply(`you are awarded **10 AP** for your escape!`);
                player.gameState = GameState.Finished; // finished
                const playerRepo = getRepository(Player);
                const result = await playerRepo.find({
                  where: { uid: player.uid },
                  relations: ['characters'],
                });
                if (result.length > 0) {
                  result[0].ap += 10;
                  await this.dependencies.databaseService.manager.save(Player, result[0]);
                }
              }
            }
            await this.dependencies.databaseService.manager.save(player);
            await this.monsterTurn(message.channel, currentMap);
          }
        } else {
          message.channel.send(`> **${player.name}** cannot make that move.`);
        }
      }
    }
  }

  formatListToString(list: string[]): string {
    const [sep, lastSep] = [`\`, \``, `\` and\``];
    return list.length > 2 ? list.slice(0, -1).join(sep) + lastSep + list[list.length - 1] : list.join(lastSep);
  }

  isPlayerHere(char: Character, vec: Vector2): boolean {
    if (char.position.equals(vec) && char.gameState === GameState.Playing) return true;
    return false;
  }

  isMonsterHere(mon: Monster, vec: Vector2): boolean {
    if (mon.position.equals(vec)) return true;
    return false;
  }

  isAnyPlayerHere(vec: Vector2): boolean {
    return this.campaign.characters.some(
      (char) => char.gameState === GameState.Playing && char.current_health > 0 && this.isPlayerHere(char, vec),
    );
  }

  isPlayer(chars: Character[], name: string): Character | null {
    return chars.find((char) => char.name === name && char.gameState === GameState.Playing);
  }

  isMonster(chars: Monster[], name: string): Monster | null {
    return chars.find((char) => char.name === name);
  }

  async monsterTurn(
    channel: Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel,
    map: Map,
    favoredAction = 0,
  ): Promise<void> {
    this.campaign.monsters.forEach((monster) => {
      // TODO: monsters or other AI will take a turn here.
      // the AI should be capable of:
      // 1) damaging a player that is one tile next to them (non diagonal)
      // 2) moving one tile around if no player is near
      // if the AI has 0 zero health, it will be removed from the game
      const action = favoredAction && random.dice('d20') > 12 ? favoredAction : random.dice('d2');
      const charuid = this.isNearPlayers(this.campaign.characters, monster.position); // nearest player

      const matchedChar = this.campaign.characters.find((char) => char.uid === charuid);
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
    await this.dependencies.databaseService.manager.save(this.campaign);
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
        this.dependencies.databaseService.manager.save(updMonster);
      }
    }
  }

  isNearPlayers(chars: Character[], vec: Vector2): string {
    let result = '';
    chars.forEach((char) => {
      if (char.current_health > 0) {
        if (this.isInRange(char.position, vec, 1) && char.gameState === GameState.Playing) {
          result = char.uid;
        }
      }
    });
    return result;
  }

  isNearPlayer(char: Character, vec: Vector2): string {
    let result = '';
    if (char.current_health > 0) {
      if (this.isInRange(char.position, vec, 1) && char.gameState === GameState.Playing) {
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

  getSurroundings(world: World, vec: Vector2, range: number, uid: string): string[] {
    const result = [];
    const allChar = this.campaign.characters;
    const allMon = this.campaign.monsters;

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
    const matchedCharIndex = this.campaign.characters.findIndex((char) => char.uid === message.author.id);
    const matchedChar = this.campaign.characters[matchedCharIndex];
    const matchedPlayer = this.campaign.characters[matchedCharIndex].player;
    return [matchedChar, matchedCharIndex, matchedPlayer];
  }
}
