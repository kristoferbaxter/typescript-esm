import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { resolve, dirname } from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import JSON5 from 'json5';
import { config } from '../../src/config.mjs';
import { spawn } from '../promise-spawn.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const test = suite('config');

test.before(async () => await spawn('./node_modules/typescript/bin/tsc', ['-p', 'test/outdir/tsconfig.json']));

test('parses tsconfig.json', async function () {
  const specified = config('test/outdir/tsconfig.json');
  assert.ok(specified);
});

test('matches tsconfig.json content', async function () {
  const specified = config('test/outdir/tsconfig.json');
  const onFileSystem = JSON5.parse(await fs.readFile(resolve(__dirname, 'tsconfig.json'), 'utf8'));
  assert.equal(specified, onFileSystem);
});

test.run();
