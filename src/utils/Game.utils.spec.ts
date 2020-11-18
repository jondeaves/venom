import 'mocha';
import { expect } from 'chai';
import { parseMovementArg } from './Game.utils';

describe('Game.utils', () => {
  describe('parseMovementArg', () => {
    it('should parse correctly', async () => {
      const args1 = 'n3we2';
      const args2 = 'neese3';
      const args3 = 'ws3';

      const res1 = parseMovementArg(args1);
      const res2 = parseMovementArg(args2);
      const res3 = parseMovementArg(args3);

      expect(res1).to.eql([
        ['n', 3],
        ['w', 1],
        ['e', 2],
      ]);
      expect(res2).to.eql([
        ['n', 1],
        ['e', 1],
        ['e', 1],
        ['s', 1],
        ['e', 3],
      ]);
      expect(res3).to.eql([
        ['w', 1],
        ['s', 3],
      ]);
    });
  });
});
