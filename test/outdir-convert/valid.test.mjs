import { extname, basename, resolve } from 'path';
import { promises as fs } from 'fs';
import glob from 'fast-glob';
import tap from 'tap';
import { config } from '../../src/config.mjs';
import { format } from '../../src/format.mjs';
import { spawn } from '../promise-spawn.mjs';
import { formatter } from '../prettier.mjs';

const TSCONFIG_PATH = 'test/outdir-convert/tsconfig.json';

tap.beforeEach(async () => await spawn('./node_modules/typescript/bin/tsc', ['-p', TSCONFIG_PATH]));

tap.test('renames extensions to mjs', async function (t) {
  const specified = config('test/outdir-convert/tsconfig.json');
  const formatted = await format('test/outdir-convert/tsconfig.json', specified);
  t.equal(formatted.size, 2);
  for (const formattedEntry of formatted) {
    t.equal(extname(formattedEntry), '.mjs');
  }
});

tap.test('rewrites import specifiers to mjs', async function (t) {
  const specified = config('test/outdir-convert/tsconfig.json');
  const formatted = await format('test/outdir-convert/tsconfig.json', specified);
  for (const formattedEntry of formatted) {
    const formattedFileSystem = await fs.readFile(formattedEntry, 'utf8');
    const fixtureFileSystem = await fs.readFile(resolve('test/outdir-convert/fixtures', basename(formattedEntry)), 'utf8');
    t.deepEqual(formatter(formattedFileSystem), formatter(fixtureFileSystem));
  }
});

tap.test('uses the cli version to rename and rewrite to mjs', async function (t) {
  await spawn('./dist/tsc-esm', ['-p', 'test/outdir-convert/tsconfig.json']);
  const formatted = await glob('test/outdir-convert/output/**/*.mjs');
  t.equal(formatted.length, 2);
  for (const formattedEntry of formatted) {
    const formattedFileSystem = await fs.readFile(formattedEntry, 'utf8');
    const fixtureFileSystem = await fs.readFile(resolve('test/outdir-convert/fixtures', basename(formattedEntry)), 'utf8');
    t.deepEqual(formatter(formattedFileSystem), formatter(fixtureFileSystem));
  }
});
