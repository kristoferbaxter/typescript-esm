import * as assert from 'assert';
import { resolve, dirname } from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import JSON5 from 'json5';
import { config } from '../../src/config.mjs';
import { spawn } from '../promise-spawn.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const pre = async () => await spawn('./node_modules/typescript/bin/tsc', ['-p', 'test/outdir/tsconfig.json']);

export const tests = new Map([
  [
    'parses tsconfig.json',
    async function () {
      const specified = config('test/outdir/tsconfig.json');
      assert.ok(specified);
    },
  ],
  [
    'matches tsconfig.json content',
    async function () {
      const specified = config('test/outdir/tsconfig.json');
      const onFileSystem = JSON5.parse(await fs.readFile(resolve(__dirname, 'tsconfig.json'), 'utf8'));
      assert.deepEqual(specified, onFileSystem);
    },
  ],
]);
