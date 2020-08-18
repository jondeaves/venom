import 'mocha';
import { expect } from 'chai';

import Vector2 from './Vector2';

describe('Vector2', () => {
  describe('Zero', () => {
    it('should return a Vector2 with zero values', async () => {
      const result = Vector2.zero;

      expect(result).to.deep.equal({ x: 0, y: 0 });
    });
  });

  describe('Constructor', () => {
    it('should create a new Vector2 with provided values', async () => {
      const result = new Vector2(1, 1);

      expect(result).to.deep.equal({ x: 1, y: 1 });
    });
  });

  describe('toJSON', () => {
    it('should turn Vector2 into string', async () => {
      const vec = new Vector2(1, 1);
      const result = vec.toJSON();

      expect(result).to.be.equal('{"x":1,"y":1}');
    });
  });

  describe('fromJSON', () => {
    it('should turn string into Vector2', async () => {
      const str = '{"x":1,"y":1}';
      const result = Vector2.fromJSON(str);

      expect(result).to.deep.equal({ x: 1, y: 1 });
    });

    it('should fall back to Zero vector when string is not valid', async () => {
      const str = '{"x":"123","y":NaN}';
      const result = Vector2.fromJSON(str);

      expect(result).to.deep.equal({ x: 0, y: 0 });
    });
  });

  describe('equals', () => {
    it('should turn true when two vector objects have equal values', async () => {
      const vec = new Vector2(1, 1);
      const otherVec = new Vector2(1, 1);

      expect(vec.equals(otherVec)).to.be.equal(true);
    });

    it('should turn false when two vector objects do not match', async () => {
      const vec = new Vector2(1, 1);
      const otherVec = new Vector2(2, 4);

      expect(vec.equals(otherVec)).to.be.equal(false);
    });
  });
});
