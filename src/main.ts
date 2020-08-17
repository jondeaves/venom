import 'reflect-metadata';

import dotenv from 'dotenv';
import { exit } from 'process';
import path from 'path';

import App from './app';

// Load config
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = new App();

function exitHandler(): void {
  // Cleans up the application
  app.exit();
  exit();
}

// do something when app is closing
process.on('exit', exitHandler);
// catches ctrl+c event
process.on('SIGINT', exitHandler);
// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler);
process.on('SIGUSR2', exitHandler);
// catches uncaught exceptions
process.on('uncaughtException', exitHandler);

app.start();
