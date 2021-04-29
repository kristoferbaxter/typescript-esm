import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import glob from 'fast-glob';
import { spawn } from '../promise-spawn.mjs';
import { compileTypescript, assertFormattedFilesMatchFixtures, assertValidSourceMaps, filterBy } from './valid.mjs';

const test = suite('valid cli');

test.before(async (context) => {
  await compileTypescript();
  await spawn('./dist/tsc-esm', ['-p', 'test/outdir-convert/tsconfig.json']);
  const cliFormatted = await glob('test/outdir-convert/output/**/*.mjs(.map)?');
  context.formattedFiles = cliFormatted;
});

test('renames .js to .mjs files', async (context) => {
  const mjsFiles = filterBy('.mjs', context.formattedFiles);
  assert.equal(mjsFiles.length, 4, 'renames 4 files');
});

test('renames .js.map to .mjs.map files', async (context) => {
  const mapFiles = filterBy('.map', context.formattedFiles);
  assert.equal(mapFiles.length, 4, 'renames 4 files');
});

test('rewrites code import specifiers and sourceMappingURL to .mjs', async (context) => {
  const mjsFiles = filterBy('.mjs', context.formattedFiles);
  assert.equal(mjsFiles.length, 4, 'rewrites 4 files');
  await assertFormattedFilesMatchFixtures(mjsFiles);
});

test('rewrites sourcemap file pointer to .mjs', async (context) => {
  const mapFiles = filterBy('.map', context.formattedFiles);
  assert.equal(mapFiles.length, 4, 'rewrites 4 files');
  await assertFormattedFilesMatchFixtures(mapFiles, { parser: 'json' });
});

test('generates valid sourcemaps', async (context) => {
  await assertValidSourceMaps(context.formattedFiles);
});

test.run();
