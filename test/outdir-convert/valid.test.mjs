import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { extname, basename, resolve } from 'path';
import { promises as fs } from 'fs';
import glob from 'fast-glob';
import validateSourceMap from 'sourcemap-validator';
import { config } from '../../src/config.mjs';
import { format } from '../../src/format.mjs';
import { spawn } from '../promise-spawn.mjs';
import { formatter } from '../prettier.mjs';

const TSCONFIG_PATH = 'test/outdir-convert/tsconfig.json';
const api = suite('valid api');

api.before(async (context) => {
  await compileTypescript();
  context.formattedFiles = await formatViaApi();
});

api('renames .js to .mjs files', async (context) => {
  const mjsFiles = filterBy('.mjs', context.formattedFiles);
  assert.equal(mjsFiles.length, 4, 'renames 4 files');
});

api('renames .js to .mjs files 2', async (context) => {
  const mjsFiles = filterBy('.mjs', context.formattedFiles);
  assert.equal(mjsFiles.length, 4, 'renames 4 files');
});

api('rewrites code import specifiers to .mjs', async (context) => {
  const mjsFiles = filterBy('.mjs', context.formattedFiles);
  assert.equal(mjsFiles.length, 4, 'rewrites 4 files');
  assertFormattedFilesMatchFixtures(mjsFiles);
});

api('rewrites sourcemap file pointer to .mjs', async (context) => {
  const mapFiles = filterBy('.map', context.formattedFiles);
  assert.equal(mapFiles.length, 4, 'rewrites 4 files');
  assertFormattedFilesMatchFixtures(mapFiles, { parser: 'json' });
});

api('generates valid sourcemaps', async (context) => {
  await assertValidSourceMaps(context.formattedFiles);
});

api.run();

const cli = suite('valid cli');

cli.before(async (context) => {
  await compileTypescript();
  context.formattedFiles = await formatViaApi();
});

cli('renames .js to .mjs files', async (context) => {
  const mjsFiles = filterBy('.mjs', context.formattedFiles);
  assert.equal(mjsFiles.length, 4, 'renames 4 files');
});

cli('renames .js.map to .mjs.map files', async (context) => {
  const mapFiles = filterBy('.map', context.formattedFiles);
  assert.equal(mapFiles.length, 4, 'renames 4 files');
});

cli('rewrites code import specifiers to .mjs', async (context) => {
  const mjsFiles = filterBy('.mjs', context.formattedFiles);
  assert.equal(mjsFiles.length, 4, 'rewrites 4 files');
  await assertFormattedFilesMatchFixtures(mjsFiles);
});

cli('rewrites sourcemap file pointer to .mjs', async (context) => {
  const mapFiles = filterBy('.map', context.formattedFiles);
  assert.equal(mapFiles.length, 4, 'rewrites 4 files');
  await assertFormattedFilesMatchFixtures(mapFiles, { parser: 'json' });
});

cli('generates valid sourcemaps', async (context) => {
  await assertValidSourceMaps(context.formattedFiles);
});

cli.run();

async function compileTypescript() {
  await spawn('./node_modules/typescript/bin/tsc', ['-p', TSCONFIG_PATH]);
}

async function formatViaApi() {
  const specified = config('test/outdir-convert/tsconfig.json');
  const apiFormatted = await format('test/outdir-convert/tsconfig.json', specified);
  return apiFormatted;
}

async function formatViaCli() {
  await spawn('./dist/tsc-esm', ['-p', 'test/outdir-convert/tsconfig.json']);
  const cliFormatted = await glob('test/outdir-convert/output/**/*.mjs(.map)?');
  return cliFormatted;
}

function filterBy(extension, formatted) {
  return Array.from(formatted).filter((fileName) => extname(fileName) === extension);
}

async function assertFormattedFilesMatchFixtures(formattedEntries, prettierOptions) {
  for (const formattedEntry of formattedEntries) {
    const formattedFileSystem = await fs.readFile(formattedEntry, 'utf8');
    const fixtureFileSystem = await fs.readFile(resolve('test/outdir-convert/fixtures', basename(formattedEntry)), 'utf8');
    assert.equal(formatter(formattedFileSystem, prettierOptions), formatter(fixtureFileSystem, prettierOptions));
  }
}

async function assertValidSourceMaps(formattedFilePaths) {
  const mjsFiles = filterBy('.mjs', formattedFilePaths);
  const mapFiles = filterBy('.map', formattedFilePaths);
  for (const mjsFilePath of mjsFiles) {
    const mjsFile = await fs.readFile(mjsFilePath, 'utf8');
    const sourceMapFilePath = mapFiles.find((m) => m.includes(mjsFilePath));
    const sourceMapFile = await fs.readFile(sourceMapFilePath, 'utf8');
    assert.not.throws(() => {
      validateSourceMap(mjsFile, sourceMapFile);
    });
  }
}
