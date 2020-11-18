import Discord from 'discord.js';

import { getRepository } from 'typeorm';

import Vector2 from '../../core/helpers/Vector2';

import Character from '../../carp/character/character.entity';

import Player from '../../carp/character/player.entity';

import Command from './Command';

export default class CharacterCommand extends Command {
  public commandData: {
    prefix: string;
  };

  async execute(message: Discord.Message, args: string[]): Promise<Discord.Message> {
    const matchedPlayer = await this.createPlayerIfNull(message);

    if (args[0]) {
      switch (args[0]) {
        default: {
          const matchedChar = matchedPlayer.characters.find((c) => c.name === args[0]);
          if (!matchedChar) {
            return message.reply(
              `it doesn't look like you have any characters set up, yet. Run \`${this.commandData.prefix}character create <name>\` to get started.`,
            );
          }
          return this.doCharacterCommands(message, matchedChar, args);
        }
        case 'all': {
          const msg = [];
          if (typeof matchedPlayer.characters !== 'undefined' && matchedPlayer.characters.length > 0) {
            msg.push(`These are your characters, ${message.author}:`);
            matchedPlayer.characters.forEach((element) => {
              msg.push(
                `:bust_in_silhouette: ${element.graphic} **${element.name}**, :heart: ${element.current_health} / ${element.max_health}`,
              );
            });
          } else {
            msg.push('you do not have any characters, yet.');
          }
          return message.channel.send(msg, { split: true });
        }
        case 'create': {
          if (args[1]) {
            const matchedChar = matchedPlayer.characters.some((c) => c.name === args[1]);
            if (matchedChar) {
              return message.reply(`you already have a character named **${args[1]}**!`);
            }
            const character = new Character();
            const characterName = args[1];
            character.name = characterName;
            character.uid = matchedPlayer.uid;
            character.power = 1;
            character.defense = 1;
            character.max_health = 5;
            character.current_health = 5;
            character.position = Vector2.zero;
            character.graphic = args[2] ?? `:slight_smile:`;
            character.gameState = 0;
            character.player = matchedPlayer;
            await this.dependencies.databaseService.manager.save(Character, character);
            return message.reply(`that's it! You now have a character named **${args[1]}**!`);
          }
          return message.reply(`you're gonna have to give me a character name, too!`);
        }
        case 'delete':
          if (args[1]) {
            const matchedChar = matchedPlayer.characters.find((char) => char.name === args[1]);
            if (matchedChar) {
              await this.dependencies.databaseService.manager.delete(Character, matchedChar.id);
              return message.reply(`your character **${matchedChar.name}** has been deleted!`);
            }
            return message.reply(`that character doesn't exist on your account!`);
          }
          return message.reply(`you're gonna have to give me a character name, too!`);
      }
    }
    return message.reply(
      `are you trying to check your character? Use \`${this.commandData.prefix}character <name>\` instead.`,
    );
  }

  async doCharacterCommands(message: Discord.Message, char: Character, args: string[]): Promise<Discord.Message> {
    const matchedChar = char;
    if (args[1]) {
      switch (args[1]) {
        default:
          if (matchedChar) {
            return message.reply(
              `your character **${matchedChar.name}** is alive and well.\nYou are assigned the graphic: ${matchedChar.graphic}.`,
            );
          }
          break;

        case 'assign':
          if (args[2] && matchedChar) {
            const emote = args[2];
            matchedChar.graphic = emote;
            await this.dependencies.databaseService.manager.save(Character, matchedChar);
            return message.reply(`your character **${matchedChar.name}** has a new graphic: ${matchedChar.graphic}!`);
          }
          break;
      }
    }
    if (matchedChar) {
      return message.reply(
        `your character **${matchedChar.name}** is alive and well.\nYou are assigned the graphic: ${matchedChar.graphic}.`,
      );
    }
    return message.reply(`I'm not sure I have that subcommand... try again?`);
  }

  async createPlayerIfNull(message: Discord.Message): Promise<Player> {
    const playerRepo = getRepository(Player);
    const result = await playerRepo.find({
      where: { uid: message.author.id },
      relations: ['characters'],
    });

    if (result.length === 0) {
      const newPlayer = new Player();
      newPlayer.ap = 0;
      newPlayer.uid = message.author.id;
      await this.dependencies.databaseService.manager.save(Player, newPlayer);
      return newPlayer;
    }
    return result[0];
  }
}
