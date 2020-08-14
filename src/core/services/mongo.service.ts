import { injectable } from 'inversify';
import mongodb, { Collection, CollectionInsertOneOptions } from 'mongodb';

// eslint-disable-next-line import/no-cycle
import container from '../../inversity.config';

import ConfigService from './config.service';
// eslint-disable-next-line import/no-cycle
import LoggerService from './logger.service';

@injectable()
export default class MongoService {
  private _configService: ConfigService = container.resolve<ConfigService>(ConfigService);

  private _loggerService: LoggerService = container.resolve<LoggerService>(LoggerService);

  private _mongoClient: mongodb.MongoClient;

  public _db: mongodb.Db;

  public async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this._mongoClient = new mongodb.MongoClient(this._configService.get('MONGODB_URI'), { useUnifiedTopology: true });

      this._mongoClient.connect((err) => {
        if (err) {
          this._loggerService.log('error', 'Venom could not connect to MongoDB', err);
          reject();
        } else {
          this._loggerService.log('info', 'Venom is connected to MongoDB');

          this._db = this._mongoClient.db(this._configService.get('MONGODB_DB_NAME'));

          resolve();
        }
      });
    });
  }

  public disconnect(): void {
    if (this._mongoClient && this._mongoClient.isConnected) {
      this._loggerService.log('info', 'Closing connection to MongoDB');
      this._mongoClient.close();
    }
  }

  /**
   * Fetches the first document that matches the query
   *
   * @param collection String identifier for collection document belongs to
   * @param query key/value pairs of search conditions
   *
   * @returns Returns matched document
   *
   * @example findOne('123456', 'collectionName', { ident: 'generated-slug' })
   */
  public async findOne(
    userId: string,
    collection: string,
    query: mongodb.FilterQuery<number | string | boolean>,
  ): Promise<Collection | boolean> {
    try {
      this.verifyConnection();

      const resp = await this._db.collection(collection).findOne(query);

      this._loggerService.log('verbose', 'Fetched single document from MongoDB', {
        userId,
        collection,
        query,
        resp,
      });

      return resp;
    } catch (error) {
      this._loggerService.log('error', 'Could not find document', {
        userId,
        error,
        collection,
        query,
      });

      return false;
    }
  }

  /**
   * Fetches all documents that match the query
   *
   * @param collection String identifier for collection documents belong to
   * @param query key/value pairs of search conditions
   *
   * @returns Returns matched document
   *
   * @example find('123456', 'collectionName', { key: 'value' })
   */
  public async find(
    userId: string,
    collection: string,
    query: mongodb.FilterQuery<number | string | boolean>,
  ): Promise<Collection[]> {
    try {
      this.verifyConnection();

      const resp = await this._db.collection(collection).find(query).toArray();

      this._loggerService.log('verbose', 'Fetched documents matching query from MongoDB', {
        userId,
        collection,
        query,
        resp,
      });

      return resp;
    } catch (error) {
      this._loggerService.log('error', 'Could not find documents', {
        userId,
        error,
        collection,
        query,
      });

      return [];
    }
  }

  /**
   * Adds one or more documents to given collection
   *
   * @param collection String identifier for collection document is to be stored again
   * @param payload Array of objects containing the key/value pairs to be stored
   *
   * @returns Returns true for successful insert
   *
   * @example `insert('123456', 'collectionName', [{ body: 'This is a document!' }])`
   */
  public async insert(userId: string, collection: string, payload: unknown[]): Promise<boolean> {
    try {
      this.verifyConnection();

      const resp = await this._db.collection(collection).insert(payload);

      if (resp.result.ok !== 1 || resp.insertedCount !== payload.length) {
        throw new Error(JSON.stringify(resp));
      }

      this._loggerService.log('verbose', `Inserted ${resp.insertedCount} documents into ${collection}`, {
        userId,
        collection,
        payload,
        resp,
      });

      return true;
    } catch (error) {
      this._loggerService.log('error', 'Could not insert documents to database', {
        userId,
        error,
        collection,
        payload,
      });

      return false;
    }
  }

  /**
   * Update single document from MongoDB
   *
   * @param collection String identifier for collection documents belong to
   * @param query key/value pairs of search conditions
   * @param payload Objects containing the key/value pairs to be stored against existing documents
   *
   * @returns Returns true for successful update
   *
   * @example `updateMany('123456', 'collectionName', { ident: 'generated-slug' }, { secondKey: 'new data'})`
   */
  public async updateMany(
    userId: string,
    collection: string,
    query: mongodb.FilterQuery<number | string | boolean>,
    payload: unknown[],
  ): Promise<boolean> {
    try {
      this.verifyConnection();

      const resp = await this._db.collection(collection).updateMany(query, { $set: payload });

      if (resp.result.ok !== 1) {
        throw new Error(JSON.stringify(resp));
      }

      this._loggerService.log('verbose', `Updated documents into ${collection} with id ${resp.upsertedId}`, {
        userId,
        collection,
        query,
        payload,
        resp,
      });

      return true;
    } catch (error) {
      this._loggerService.log('error', 'Could not update documents', {
        userId,
        collection,
        query,
        payload,
        error,
      });

      return false;
    }
  }

  /**
   * Remove documents from MongoDB matching query
   *
   * @param collection String identifier for collection documents belong to
   * @param query key/value pairs of search conditions
   *
   * @returns Returns true for successful delete
   *
   * @example `deleteMany('123456', 'collectionName', { ident: 'generated-slug' })`
   */
  public async deleteMany(
    userId: string,
    collection: string,
    query: mongodb.FilterQuery<number | string | boolean>,
  ): Promise<boolean> {
    try {
      this.verifyConnection();

      const resp = await this._db.collection(collection).deleteMany(query);

      if (resp.result.ok !== 1) {
        throw new Error(JSON.stringify(resp));
      }

      this._loggerService.log('verbose', `Deleted documents from ${collection}`, {
        userId,
        collection,
        query,
        resp,
      });

      return true;
    } catch (error) {
      this._loggerService.log('error', 'Could not delete documents', {
        userId,
        collection,
        query,
        error,
      });

      return false;
    }
  }

  private verifyConnection(): void {
    if (!this._mongoClient.isConnected) {
      this._loggerService.log('error', 'No database connection available');
      throw new Error('No database connection available');
    }
  }
}
