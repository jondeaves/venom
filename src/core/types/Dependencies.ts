import ConfigService from '../services/config.service';
import DatabaseService from '../services/database.service';
import HttpService from '../services/http.service';
import LoggerService from '../services/logger.service';
import MongoService from '../services/mongo.service';

export default interface Dependencies {
  configService: ConfigService;
  databaseService: DatabaseService;
  httpService: HttpService;
  loggerService: LoggerService;
  mongoService: MongoService;
}
