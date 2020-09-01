import Coordinates2D from '../types/Vector2Position';

export default class Vector2 implements Coordinates2D {
  public x: number;

  public y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public toJSON(): string {
    const { x, y } = this;
    return JSON.stringify({ x, y });
  }

  public static fromJSON(value: string): Vector2 {
    try {
      const parsed: Coordinates2D = JSON.parse(value);
      return new Vector2(parsed.x, parsed.y);
    } catch {
      return Vector2.zero;
    }
  }

  public static get zero(): Vector2 {
    return new Vector2(0, 0);
  }

  public equals(vec: Coordinates2D): boolean {
    return this.x === vec.x && this.y === vec.y;
  }
}
