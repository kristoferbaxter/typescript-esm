import { resolve, dirname } from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import tap from 'tap';
import JSON5 from 'json5';
import { config } from '../../src/config.mjs';
import { spawn } from '../promise-spawn.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

tap.beforeEach(async () => await spawn('./node_modules/typescript/bin/tsc', ['-p', 'test/outdir/tsconfig.json']));

tap.test('parses tsconfig.json', async function (t) {
  const specified = config('test/outdir/tsconfig.json');
  t.ok(specified);
});

tap.test('matches tsconfig.json content', async function (t) {
  const specified = config('test/outdir/tsconfig.json');
  const onFileSystem = JSON5.parse(await fs.readFile(resolve(__dirname, 'tsconfig.json'), 'utf8'));
  t.deepEqual(specified, onFileSystem);
});
