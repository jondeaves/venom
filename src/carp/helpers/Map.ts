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

  public toJSON(): string {
    const { width, height } = this;
    return JSON.stringify({ width, height });
  }

  public static fromJSON(value: string): Map {
    try {
      const parsed: MapObject = JSON.parse(value);
      const map = new Map();
      map.width = parsed.width;
      map.height = parsed.height;
      map.enter = parsed.enter;
      map.exit = parsed.exit;
      map.room_count = parsed.room_count;
      map.rooms = parsed.rooms;
      map.world = parsed.world;
      return map;
    } catch {
      return new Map(); // just a default map
    }
  }

  public isNull(): boolean {
    return this.width === 0 && this.height === 0;
  }
}
