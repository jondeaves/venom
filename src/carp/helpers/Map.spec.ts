import 'mocha';
import { expect } from 'chai';

import Map from './Map';

describe('Map', () => {
  describe('Undefined', () => {
    it('should return a map with zero values', async () => {
      const result = new Map();

      expect(result.isNull).to.deep.equal(true);
    });
  });

  describe('toJSON', () => {
    it('should turn Map into string', async () => {
      const map = new Map();
      map.width = 1;
      map.height = 1;
      const result = map.toJSON();

      expect(result).to.be.equal('{"width":1,"height":1}');
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
