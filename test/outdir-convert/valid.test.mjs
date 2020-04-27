import * as assert from 'assert';
import { resolve, dirname, extname, basename } from 'path';
import { stdout } from 'process';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import JSON5 from 'json5';
import { config } from '../../src/config.mjs';
import { format } from '../../src/format.mjs';
import { spawn } from '../promise-spawn.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const pre = async() => await spawn('./node_modules/typescript/bin/tsc', ['-p', 'test/outdir-convert/tsconfig.json']);

export const tests = new Map([
  [
    'renames extensions to mjs',
    async function () {
      const specified = config('test/outdir-convert/tsconfig.json');
      const formatted = await format(specified);
      for (const formattedEntry of formatted) {
        assert.equal(extname(formattedEntry), 'mjs');
      }
    },
  ],
  [
    'rewrites import specifiers to mjs',
    async function () {
      const specified = config('test/outdir-convert/tsconfig.json');
      const formatted = await format(specified);
      for await (const formattedEntry of formatted) {
        const formattedFileSystem = await fs.readFile(formattedEntry, 'utf8');
        const fixtureFileSystem = await fs.readFile(path.resolve('./fixtures', basename(formattedEntry) + '.mjs'));
        assert.deepEqual(formattedFileSystem, fixtureFileSystem);
      }
    }
  ]
]);
