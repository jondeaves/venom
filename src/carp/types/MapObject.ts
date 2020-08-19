export default interface MapObject {
  width: number;
  height: number;
  enter: { x: number; y: number; room_id: number };
  exit: { x: number; y: number; room_id: number };
  room_count: number;
  rooms: {
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
  world: [[]];
}
