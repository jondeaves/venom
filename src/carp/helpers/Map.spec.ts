import 'mocha';
import { expect } from 'chai';

import Map from './Map';

describe('Map', () => {
  describe('Undefined', () => {
    it('should return a map with zero values', async () => {
      const result = new Map(
        0,
        0,
        { x: 0, y: 0, room_id: 0 },
        { x: 0, y: 0, room_id: 0 },
        0,
        { '0': { neighbors: [], doors: [], top: 0, left: 0, width: 0, height: 0, deadend: true } },
        [[]],
      );

      expect(result.width).to.deep.equal(0);
      expect(result.height).to.deep.equal(0);
    });
  });

  describe('toJSON', () => {
    it('should turn Map into string', async () => {
      const map = new Map(
        1,
        1,
        { x: 0, y: 0, room_id: 0 },
        { x: 0, y: 0, room_id: 0 },
        0,
        { '0': { neighbors: [], doors: [], top: 0, left: 0, width: 0, height: 0, deadend: true } },
        [[]],
      );
      const result = map.toJSON();

      expect(result).to.be.equal(
        '{"width":1,"height":1,"enter":{"x":0,"y":0,"room_id":0},"exit":{"x":0,"y":0,"room_id":0},"room_count":0,"rooms":{"0":{"neighbors":[],"doors":[],"top":0,"left":0,"width":0,"height":0,"deadend":true}},"world":[[]]}',
      );
    });
  });

  describe('fromJSON', () => {
    it('should turn string into Map', async () => {
      const str = `{"width":1,"height":1,"enter":{"x":0,"y":0,"room_id":0},"exit":{"x":0,"y":0,"room_id":0},"room_count":0,"rooms":{"0":{"neighbors":[],"doors":[],"top":0,"left":0,"width":0,"height":0,"deadend":true}},"world":[[]]}`;
      const result = Map.fromJSON(str);

      expect(result).to.deep.equal({
        width: 1,
        height: 1,
        enter: { x: 0, y: 0, room_id: 0 },
        exit: { x: 0, y: 0, room_id: 0 },
        room_count: 0,
        rooms: { '0': { neighbors: [], doors: [], top: 0, left: 0, width: 0, height: 0, deadend: true } },
        world: [[]],
      });
    });
  });
});
