import 'mocha';
import { expect } from 'chai';

import Map from './Map';

describe('Map', () => {
  describe('Undefined', () => {
    it('should return a map with zero values', async () => {
      const result = new Map(0, 0, undefined, undefined, 0, undefined, undefined);

      expect(result.isNull).to.deep.equal(true);
    });
  });

  describe('toJSON', () => {
    it('should turn Map into string', async () => {
      const map = new Map(1, 1, undefined, undefined, 0, undefined, undefined);
      const result = map.toJSON();

      expect(result).to.be.equal(
        '{"width":1,"height":1, "enter":undefined, "exit":undefined, "room_count":0, "rooms":undefined, "world":undefined}',
      );
    });
  });

  describe('fromJSON', () => {
    it('should turn string into Map', async () => {
      const str = '{"width":1,"height":1}';
      const result = Map.fromJSON(str);

      expect(result).to.deep.equal({ width: 1, height: 1 });
    });

    it('should fall back to Zero vector when string is not valid', async () => {
      const str = '{"width":"123","height":NaN}';
      const result = Map.fromJSON(str);

      expect(result.isNull).to.deep.equal(true);
    });
  });
});
