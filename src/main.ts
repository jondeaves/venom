import 'reflect-metadata';

import dotenv from 'dotenv';
import { exit } from 'process';
import path from 'path';

// import './Dependencies';
import container from './Dependencies';

import App from './app';

// Load config
dotenv.config({ path: path.resolve(__dirname, './', '.env') });

// I got no idea why but it doesn't work without this line
// eslint-disable-next-line no-new
new App();

async function execute(): Promise<void> {
  const app = await container.get<App>('App');

  await app.start();

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
}

execute();
