import MapObject from '../types/MapObject';

export default class Map implements MapObject {
  public width: number;

  public height: number;

  public enter: { x: number; y: number; room_id: number };

  public exit: { x: number; y: number; room_id: number };

  public room_count: number;

  public rooms: {
    [id: string]: {
      doors: [];
      neighbors: [];
      id: number;
      top: number;
      left: number;
      width: number;
      height: number;
      deadend: boolean;
    };
  };

  public world: [[]];

  constructor(_width: number, _height: number, _enter: any, _exit: any, _room_count: number, _rooms: any, _world: any) {
    this.width = _width;
    this.height = _height;
    this.enter = _enter;
    this.exit = _exit;
    this.room_count = _room_count;
    this.rooms = _rooms;
    this.world = _world;
  }

  public toJSON(): string {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { width, height, enter, exit, room_count, rooms, world } = this;
    return JSON.stringify({ width, height, enter, exit, room_count, rooms, world });
  }

  public static fromJSON(value: string): Map {
    try {
      const parsed: MapObject = JSON.parse(value);
      return new Map(
        parsed.width,
        parsed.height,
        parsed.enter,
        parsed.exit,
        parsed.room_count,
        parsed.rooms,
        parsed.world,
      );
    } catch {
      return new Map(0, 0, undefined, undefined, 0, undefined, undefined); // just a default map
    }
  }

  public isNull(): boolean {
    return this.width === 0 || this.height === 0;
  }
}
