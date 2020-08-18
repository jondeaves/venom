import Vector2Position from '../types/Vector2Position';

export default class Vector2 implements Vector2Position {
  public x: number;

  public y: number;

  constructor(_x: number, _y: number) {
    this.x = _x;
    this.y = _y;
  }

  public toJSON(): string {
    const { x, y } = this;
    return JSON.stringify({ x, y });
  }

  public static fromJSON(value: string): Vector2 {
    try {
      const parsed: Vector2Position = JSON.parse(value);
      return new Vector2(parsed.x, parsed.y);
    } catch {
      return Vector2.zero;
    }
  }

  public static get zero(): Vector2 {
    return new Vector2(0, 0);
  }
}
