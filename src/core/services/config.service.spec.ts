import 'mocha';
import { expect } from 'chai';

import ConfigService from './config.service';

describe('ConfigService', () => {
  let configService: ConfigService;

  beforeEach(() => {});

  describe('isProd', () => {
    it('should return true when environment is production', async () => {
      process.env.NODE_ENV = 'production';

      configService = new ConfigService();

      const result = configService.isProd;

      expect(result).to.be.equal(true);
    });

    it('should return false when environment is development', async () => {
      process.env.NODE_ENV = 'development';

      configService = new ConfigService();

      const result = configService.isProd;

      expect(result).to.be.equal(false);
    });

    it('should return false when environment is testing', async () => {
      process.env.NODE_ENV = 'testing';

      configService = new ConfigService();

      const result = configService.isProd;

      expect(result).to.be.equal(false);
    });
  });

  describe('get', () => {
    before(() => {
      process.env = {
        BOT_TRIGGER: '1',
        DISCORD_BOT_TOKEN: '2',
        MONGODB_URI: '3',
        MONGODB_DB_NAME: '4',
        NODE_ENV: '5',
        LOG_LEVEL: '6',
      };

      configService = new ConfigService();
    });

    it('should return correct value for BOT_TRIGGER', async () => {
      expect(configService.get('BOT_TRIGGER')).to.be.equal('1');
    });

    it('should return correct value for DISCORD_BOT_TOKEN', async () => {
      expect(configService.get('DISCORD_BOT_TOKEN')).to.be.equal('2');
    });

    it('should return correct value for MONGODB_URI', async () => {
      expect(configService.get('MONGODB_URI')).to.be.equal('3');
    });

    it('should return correct value for MONGODB_DB_NAME', async () => {
      expect(configService.get('MONGODB_DB_NAME')).to.be.equal('4');
    });

    it('should return correct value for NODE_ENV', async () => {
      expect(configService.get('NODE_ENV')).to.be.equal('5');
    });

    it('should return correct value for LOG_LEVEL', async () => {
      expect(configService.get('LOG_LEVEL')).to.be.equal('6');
    });
  });
});
