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
        { '0': { id: 0, neighbors: [], doors: [], top: 0, left: 0, width: 0, height: 0, deadend: true } },
        [[]],
      );

      expect(result.width).to.be.equal(0);
      expect(result.height).to.be.equal(0);
    });
  });

  describe('Constructor', () => {
    it('should create a new Map with provided values', async () => {
      const result = new Map(
        12,
        55,
        { x: 22, y: 1, room_id: 0 },
        { x: 4, y: 2, room_id: 1 },
        0,
        { '0': { id: 0, neighbors: [], doors: [], top: 12, left: 6, width: 33, height: 2, deadend: true } },
        [[]],
      );

      expect(result.width).to.equal(12);
      expect(result.height).to.equal(55);
      expect(result.enter.x).to.equal(22);
      expect(result.exit.room_id).to.equal(1);
      expect(result.rooms['0'].top).to.equal(12);
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
        { '0': { id: 0, neighbors: [], doors: [], top: 0, left: 0, width: 0, height: 0, deadend: true } },
        [[]],
      );
      const result = map.toJSON();

      expect(result).to.equal(
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
        rooms: { '0': { sid: 0, neighbors: [], doors: [], top: 0, left: 0, width: 0, height: 0, deadend: true } },
        world: [[]],
      });
    });
  });

  describe('isNull', () => {
    it('should turn true if width and/or height equals zero', async () => {
      const map = new Map(
        1,
        0,
        { x: 0, y: 0, room_id: 0 },
        { x: 0, y: 0, room_id: 0 },
        0,
        { '0': { id: 0, neighbors: [], doors: [], top: 0, left: 0, width: 0, height: 0, deadend: true } },
        [[]],
      );
      expect(map.isNull()).to.equal(true);
    });

    it('should turn false if width and height do not equal zero', async () => {
      const map = new Map(
        1,
        1,
        { x: 0, y: 0, room_id: 0 },
        { x: 0, y: 0, room_id: 0 },
        0,
        { '0': { id: 0, neighbors: [], doors: [], top: 0, left: 0, width: 0, height: 0, deadend: true } },
        [[]],
      );

      expect(map.isNull()).to.equal(false);
    });
  });
});
