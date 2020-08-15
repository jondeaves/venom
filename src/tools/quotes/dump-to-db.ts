/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
import csv from 'csv';
import fs from 'fs';
import path from 'path';
import mongodb from 'mongodb';
import { Quote } from './IQuote';

const CONNECTION_STRING = 'mongodb://localhost:27017';
const DB_NAME = 'venom';

async function run(): Promise<void> {
  const outputDir = path.join(__dirname, '..', 'outputs');
  fs.readFile(path.join(outputDir, 'quotes_clean.csv'), (fsErr, data) => {
    if (fsErr) throw fsErr;
    ((csv.parse as unknown) as typeof csv.parse.default)(
      data.toString(),
      {
        columns: true,
      },
      (csvErr, rows: Quote[]) => {
        if (csvErr) throw csvErr;
        const client = new mongodb.MongoClient(CONNECTION_STRING, { useUnifiedTopology: true });
        client.connect(async (mongoClientErr) => {
          if (mongoClientErr) throw mongoClientErr;
          const db = client.db(DB_NAME);
          console.log('Start dumping...');
          console.debug(rows.slice(5));

          try {
            await db.collection('quotes').insertMany(rows);
            console.log('Done dumping.');
          } catch (error) {
            console.error(error);
          }
        });
      },
    );
  });
}

run();
