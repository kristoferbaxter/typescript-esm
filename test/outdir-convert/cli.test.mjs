import { suite } from 'uvu';
import { spawn } from '../promise-spawn.mjs';
import { tests, TSCONFIG_PATH } from './valid.mjs';

const cli = suite('valid cli');

cli.before(async function () {
  await spawn('./node_modules/typescript/bin/tsc', ['-p', TSCONFIG_PATH]);
  await spawn('./dist/tsc-esm', ['-p', TSCONFIG_PATH]);
});

for (const [key, value] of Object.entries(tests)) {
  cli(key, value);
}

cli.run();
