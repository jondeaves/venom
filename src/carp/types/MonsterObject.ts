import Vector2 from '../../core/helpers/Vector2';

export default interface MonsterObject {
  name: string;
  level: number;
  power: number;
  defense: number;
  currentHp: number;
  maxHp: number;
  rewardAp: number;
  info: string;
  position: Vector2;
  graphic: string;
}
