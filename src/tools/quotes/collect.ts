/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
import csv from 'csv';
import fs from 'fs';
import path from 'path';
import { getHTMLPage } from '../http-tools';
import { Quote } from './IQuote';

const PAGE_SIZE = 15;
const MAX_PAGE = 35;

const quotes: Quote[] = [];

async function run(): Promise<void> {
  const url = 'https://www.creationasylum.net/index.php?act=quotes&CODE=01';
  const outputDir = path.join(__dirname, '..', 'outputs');
  fs.exists(outputDir, (exists) => {
    if (!exists) {
      fs.mkdir(outputDir, (err) => {
        if (err) throw err;
      });
    }
  });

  for (let i = 0; i < PAGE_SIZE * MAX_PAGE; i += PAGE_SIZE) {
    const urlWithPage = `${url}&st=${i}`;
    console.log(`fetching: ${urlWithPage}`);

    const struct = await getHTMLPage(urlWithPage);

    struct('#ucpcontent table.ipbtable tr').each((j, row) => {
      const author = struct('td:first-child', row).text();
      const quote = struct('td:nth-child(2)', row).text();
      if (!author && !quote) return;
      console.log(`Found: ${author}: "${quote}"`);
      quotes.push({ author, quote });
    });
  }

  fs.writeFile(path.join(outputDir, 'quotes.json'), JSON.stringify(quotes), (err) => {
    if (err) throw err;
    console.log('Wrote output.');
  });

  const csvOut = [['author', 'quote']];
  for (const row of quotes) {
    csvOut.push(
      [row.author, row.quote].map((v) => {
        v = v.replace(/(\n+)/g, '\n').replace(/"/g, '""').trim();
        return v.includes(' ') || v.includes('\t') ? `"${v}"` : v;
      }),
    );
  }

  csv.stringify.default(quotes, (err, out) => {
    if (err) throw err;
    fs.writeFile(path.join(outputDir, 'quotes.csv'), out, (_err) => {
      if (_err) throw _err;
      console.log('Wrote output.');
    });
  });
}

run();
