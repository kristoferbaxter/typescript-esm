import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { extname, basename, resolve } from 'path';
import { promises as fs } from 'fs';
import glob from 'fast-glob';
import { config } from '../../src/config.mjs';
import { format } from '../../src/format.mjs';
import { spawn } from '../promise-spawn.mjs';
import { formatter } from '../prettier.mjs';

const TSCONFIG_PATH = 'test/outdir-convert/tsconfig.json';
const test = suite('valid');

test.before(async () => await spawn('./node_modules/typescript/bin/tsc', ['-p', TSCONFIG_PATH]));

test('renames extensions to mjs', async function () {
  const specified = config('test/outdir-convert/tsconfig.json');
  const formatted = await format('test/outdir-convert/tsconfig.json', specified);
  assert.equal(formatted.size, 4, 'api renames 4 .mjs files');
  for (const formattedEntry of formatted) {
    assert.equal(extname(formattedEntry), '.mjs');
  }
});

test('rewrites import specifiers to mjs', async function () {
  const specified = config('test/outdir-convert/tsconfig.json');
  const formatted = await format('test/outdir-convert/tsconfig.json', specified);
  for (const formattedEntry of formatted) {
    const formattedFileSystem = await fs.readFile(formattedEntry, 'utf8');
    const fixtureFileSystem = await fs.readFile(resolve('test/outdir-convert/fixtures', basename(formattedEntry)), 'utf8');
    assert.equal(formatter(formattedFileSystem), formatter(fixtureFileSystem));
  }
});

test('uses the cli version to rename and rewrite to mjs', async function () {
  await spawn('./dist/tsc-esm', ['-p', 'test/outdir-convert/tsconfig.json']);
  const formatted = await glob('test/outdir-convert/output/**/*.mjs');
  assert.equal(formatted.length, 4, 'cli renames 4 .mjs files');
  for (const formattedEntry of formatted) {
    const formattedFileSystem = await fs.readFile(formattedEntry, 'utf8');
    const fixtureFileSystem = await fs.readFile(resolve('test/outdir-convert/fixtures', basename(formattedEntry)), 'utf8');
    assert.equal(formatter(formattedFileSystem), formatter(fixtureFileSystem));
  }
});

test.run();
