export default interface Map {
  width: number;
  height: number;
  enter: { x: number; y: number; room_id: number };
  exit: { x: number; y: number; room_id: number };
  room_count: number;
  rooms: unknown;
  world: [[]];
}
