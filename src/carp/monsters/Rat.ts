import Monster from './Monster';
import Vector2 from '../../core/helpers/Vector2';

export default class Rat extends Monster {
  public name = 'Rat';

  public maxHp = 1;

  public info = `A giant gross rat!`;

  public graphic = ':rat:';
}
