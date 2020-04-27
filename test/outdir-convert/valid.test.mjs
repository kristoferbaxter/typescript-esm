import * as assert from 'assert';
import { extname, basename, resolve } from 'path';
import { promises as fs } from 'fs';
import { config } from '../../src/config.mjs';
import { format } from '../../src/format.mjs';
import { spawn } from '../promise-spawn.mjs';

export const pre = async() => await spawn('./node_modules/typescript/bin/tsc', ['-p', 'test/outdir-convert/tsconfig.json']);

export const tests = new Map([
  [
    'renames extensions to mjs',
    async function () {
      const specified = config('test/outdir-convert/tsconfig.json');
      const formatted = await format('test/outdir-convert/tsconfig.json', specified);
      assert.equal(formatted.size, 2);
      for (const formattedEntry of formatted) {
        assert.equal(extname(formattedEntry), '.mjs');
      }
    },
  ],
  [
    'rewrites import specifiers to mjs',
    async function (testContext) {
      const specified = config('test/outdir-convert/tsconfig.json');
      const formatted = await format('test/outdir-convert/tsconfig.json', specified);
      for (const formattedEntry of formatted) {
        const formattedFileSystem = await fs.readFile(formattedEntry, 'utf8');
        const fixtureFileSystem = await fs.readFile(resolve('test/outdir-convert/fixtures', basename(formattedEntry)), 'utf8');
        assert.deepEqual(testContext.format(formattedFileSystem), testContext.format(fixtureFileSystem));
      }
    }
  ]
]);
