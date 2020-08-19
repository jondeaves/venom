import Monster from './Monster';
import Vector2 from '../../core/helpers/Vector2';

export default class Ghost extends Monster {
  public name = 'Ghost';

  public maxHp = 2;

  public info = `The hostile ghost of an asylum inmate that never managed to escape!`;

  public graphic = ':ghost:';
}
