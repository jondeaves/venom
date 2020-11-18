import Vector2 from '../../core/helpers/Vector2';
import MonsterObject from '../types/MonsterObject';

export default class Monster implements MonsterObject {
  public name = 'Monster';

  public level = 1;

  public power = 1;

  public defense = 0;

  public currentHp = 1;

  public maxHp = 1;

  public rewardAp = 0;

  public info = `[placeholder]`;

  public position: Vector2;

  public graphic = ':ghost:';

  constructor(lvl: number, pos: Vector2) {
    this.level = lvl;
    this.position = pos;

    this.maxHp = lvl * 2;
    this.currentHp = this.maxHp;
    this.power = Math.max(0, Math.ceil(lvl / 2));
    this.defense = Math.max(0, Math.ceil(this.power / 2));

    this.rewardAp = this.power + this.defense;
  }
}
