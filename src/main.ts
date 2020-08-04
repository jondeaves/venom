import 'reflect-metadata';

import App from './app';
import { exit } from 'process';

const app = new App();

try {
  app.init();
} catch (e) {
  exit(1);
}