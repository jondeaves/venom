import { exit } from 'process';
import 'reflect-metadata';

import App from './app';

const app = new App();


function exitHandler(): void {
  // Cleans up the application
  app.exit();
  exit();
}

try {
  app.init();

  // do something when app is closing
  process.on('exit', exitHandler);

  // catches ctrl+c event
  process.on('SIGINT', exitHandler);

  // catches "kill pid" (for example: nodemon restart)
  process.on('SIGUSR1', exitHandler);
  process.on('SIGUSR2', exitHandler);

  // catches uncaught exceptions
  process.on('uncaughtException', exitHandler);
} catch {
  exit(1);
}
