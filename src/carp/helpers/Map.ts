import Coordinates2D from 'src/core/types/Vector2Position';
import ConfigService from '../../core/services/config.service';
import LoggerService from '../../core/services/logger.service';
import MapObject, { Rooms, World, RoomCoordinates, WorldTile } from '../types/MapObject';

const config = new ConfigService();
const loggerService = new LoggerService(config);

export default class Map implements MapObject {
  public width: number;

  public height: number;

  public enter: { x: number; y: number; room_id: number };

  public exit: { x: number; y: number; room_id: number };

  public room_count: number;

  private static logger = loggerService;

  public rooms: Rooms;

  public world: World;

  constructor(
    width: number,
    height: number,
    enter: RoomCoordinates,
    exit: RoomCoordinates,
    room_count: number,
    rooms: Rooms,
    world: World,
  ) {
    this.width = width;
    this.height = height;
    this.enter = enter;
    this.exit = exit;
    this.room_count = room_count;
    this.rooms = rooms;
    this.world = world;
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
    } catch (error) {
      this.logger.log('error', 'Could not parse map from JSON object', error);
      return new Map(0, 0, undefined, undefined, 0, undefined, undefined); // just a default map
    }
  }

  public isNull(): boolean {
    return this.width === 0 || this.height === 0;
  }

  public isWall(tile: Coordinates2D): boolean {
    return this.world[tile.y][tile.x] === WorldTile.Wall;
  }
}
