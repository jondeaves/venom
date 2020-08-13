import 'reflect-metadata';

import App from './app';
import { exit } from 'process';

const app = new App();

try {
  app.init();

  function exitHandler() {
    // Cleans up the application
    app.exit();
    exit();
  }

  // do something when app is closing
  process.on('exit', exitHandler);

  //catches ctrl+c event
  process.on('SIGINT', exitHandler);

  // catches "kill pid" (for example: nodemon restart)
  process.on('SIGUSR1', exitHandler);
  process.on('SIGUSR2', exitHandler);

  //catches uncaught exceptions
  process.on('uncaughtException', exitHandler);
} catch (e) {
  exit(1);
}