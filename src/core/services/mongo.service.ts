import mongodb, { FilterQuery } from 'mongodb';
import ConfigService from './config.service';
import LoggerService from './logger.service';

export default class MongoService {
  private _mongoClient: mongodb.MongoClient;

  public _db: mongodb.Db;

  constructor(private _configService: ConfigService, private _loggerService: LoggerService) {}

  public get dbInstance(): mongodb.Db {
    return this._db;
  }

  public async connect(): Promise<boolean> {
    const prom = new Promise((resolve, reject) => {
      this._mongoClient = new mongodb.MongoClient(this._configService.get('MONGODB_URI'), { useUnifiedTopology: true });

      this._mongoClient.connect((error) => {
        if (error) {
          reject(error);
        } else {
          this._db = this._mongoClient.db(this._configService.get('MONGODB_DB_NAME'));

          resolve();
        }
      });
    });

    try {
      await prom;

      this._loggerService.log('info', 'Venom is connected to MongoDB');

      return true;
    } catch (error) {
      this._loggerService.log('error', 'Venom could not connect to MongoDB', error);

      return false;
    }
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
  public async findOne<T>(userId: string, collection: string, query: FilterQuery<T>): Promise<T | undefined> {
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

      // eslint-disable-next-line unicorn/no-useless-undefined
      return undefined;
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
  public async find<T>(userId: string, collection: string, query: FilterQuery<T>): Promise<T[]> {
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
  public async insert<T>(userId: string, collection: string, payload: T[]): Promise<boolean> {
    try {
      this.verifyConnection();

      const resp = await this._db.collection(collection).insertMany(payload);

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
  public async updateMany<T>(
    userId: string,
    collection: string,
    query: FilterQuery<T>,
    payload: T[],
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
  public async deleteMany<T>(userId: string, collection: string, query: FilterQuery<T>): Promise<boolean> {
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
  public async count<T>(userId: string, collection: string, query: FilterQuery<T>): Promise<number> {
    try {
      this.verifyConnection();

      const resp = await this._db.collection(collection).count(query);

      this._loggerService.log('verbose', 'Counted documents in collection from MongoDB', {
        userId,
        collection,
        query,
        resp,
      });

      return resp;
    } catch (error) {
      this._loggerService.log('error', 'Could not count documents in collection', {
        userId,
        error,
        collection,
        query,
      });

      return 0;
    }
  }

  private verifyConnection(): void {
    if (!this._mongoClient.isConnected) {
      this._loggerService.log('error', 'No database connection available');
      throw new Error('No database connection available');
    }
  }
}
