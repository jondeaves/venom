import Coordinates2D from 'src/core/types/Vector2Position';

export enum WorldTile {
  Void = 0,
  Floor = 1,
  Wall = 2,
  Door = 3,
  SpecialDoor = 4,
  Entrance = 5,
  Exit = 6,
}

export const MapMarkers: Record<WorldTile, string> = {
  [WorldTile.Void]: ':white_large_square:',
  [WorldTile.Floor]: ':black_large_square:',
  [WorldTile.Wall]: ':white_large_square:',
  [WorldTile.Door]: ':door:',
  [WorldTile.SpecialDoor]: ':door:',
  [WorldTile.Entrance]: ':checkered_flag:',
  [WorldTile.Exit]: ':triangular_flag_on_post:',
};

export type World = WorldTile[][];

export type Rooms = Record<string, Room>;

export interface Room {
  doors: []; // TODO add element type
  neighbors: []; // TODO add element type
  id: number;
  top: number;
  left: number;
  width: number;
  height: number;
  deadend: boolean;
}

export interface RoomCoordinates extends Coordinates2D {
  room_id: number;
}

export default interface MapObject {
  width: number;
  height: number;
  enter: { x: number; y: number; room_id: number };
  exit: { x: number; y: number; room_id: number };
  room_count: number;
  rooms: Rooms;
  world: World;
}
