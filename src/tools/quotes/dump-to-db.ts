/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
import csv from 'csv';
import fs from 'fs';
import path from 'path';
import mongodb from 'mongodb';
import dotenv from 'dotenv';
import { Quote } from './IQuote';

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

const CONNECTION_STRING = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME;

async function run(): Promise<void> {
  const outputDir = path.join(__dirname, '..', 'outputs');
  const parse = (csv.parse as unknown) as typeof csv.parse.default;
  fs.readFile(path.join(outputDir, 'quotes_clean.csv'), (fsErr, data) => {
    if (fsErr) throw fsErr;
    parse(
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
