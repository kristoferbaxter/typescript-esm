import { suite } from 'uvu';
import { spawn } from '../promise-spawn.mjs';
import { tests, TSCONFIG_PATH } from './valid.mjs';
import { format } from '../../src/format.mjs';
import { config } from '../../src/config.mjs';

const api = suite('valid api');

api.before(async function () {
  await spawn('./node_modules/typescript/bin/tsc', ['-p', TSCONFIG_PATH]);
  await format(TSCONFIG_PATH, config(TSCONFIG_PATH));
});

for (const [key, value] of Object.entries(tests)) {
  api(key, value);
}

api.run();
