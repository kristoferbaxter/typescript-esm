import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { config } from '../../src/config.mjs';
import { format } from '../../src/format.mjs';
import { compileTypescript, assertFormattedFilesMatchFixtures, assertValidSourceMaps, filterBy } from './valid.mjs';

const test = suite('valid api');

test.before(async (context) => {
  await compileTypescript();
  const specified = config('test/outdir-convert/tsconfig.json');
  const apiFormatted = await format('test/outdir-convert/tsconfig.json', specified);
  context.formattedFiles = apiFormatted;
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
  assertFormattedFilesMatchFixtures(mjsFiles);
});

test('rewrites sourcemap file pointer to .mjs', async (context) => {
  const mapFiles = filterBy('.map', context.formattedFiles);
  assert.equal(mapFiles.length, 4, 'rewrites 4 files');
  assertFormattedFilesMatchFixtures(mapFiles, { parser: 'json' });
});

test('generates valid sourcemaps', async (context) => {
  await assertValidSourceMaps(context.formattedFiles);
});

test.run();
