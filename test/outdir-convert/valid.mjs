import * as assert from 'uvu/assert';
import { basename, resolve } from 'path';
import { promises as fs } from 'fs';
import glob from 'fast-glob';
import validateSourceMap from 'sourcemap-validator';
import { formatter } from '../prettier.mjs';

/**
 * Asserts the formatted entries are consistent with fixtures by using prettier on both inputs before comparison.
 * @param {string} formattedEntries
 * @param {undefined|JSON} prettierOptions
 */
async function assertFormattedFilesMatchFixtures(formattedEntries, prettierOptions) {
  for (const formattedEntry of formattedEntries) {
    const formattedFileSystem = await fs.readFile(formattedEntry, 'utf8');
    const fixtureFileSystem = await fs.readFile(resolve('test/outdir-convert/fixtures', basename(formattedEntry)), 'utf8');
    assert.equal(await formatter(formattedFileSystem, prettierOptions), await formatter(fixtureFileSystem, prettierOptions));
  }
}

export const TSCONFIG_PATH = 'test/outdir-convert/tsconfig.json';

export const tests = {
  'renames .js to .mjs files': async function () {
    const jsFiles = await glob('test/outdir-convert/output/**/*.js');
    const mjsFiles = await glob('test/outdir-convert/output/**/*.mjs');
    assert.equal(jsFiles.length, 0, 'no js files remain');
    assert.equal(mjsFiles.length, 4, 'renames 4 files');
  },
  'renames .js.map to .mjs.map files': async function () {
    const jsMapFiles = await glob('test/outdir-convert/output/**/*.js.map');
    const mjsMapFiles = await glob('test/outdir-convert/output/**/*.mjs.map');
    assert.equal(jsMapFiles.length, 0, 'no js map files remain');
    assert.equal(mjsMapFiles.length, 4, 'renames 4 files');
  },
  'rewrites code import specifiers to .mjs': async function () {
    const mjsFiles = await glob('test/outdir-convert/output/**/*.mjs');
    assert.equal(mjsFiles.length, 4, 'rewrites 4 files');
    await assertFormattedFilesMatchFixtures(mjsFiles);
  },
  'rewrites sourcemap file pointer to .mjs': async function () {
    const mapFiles = await glob('test/outdir-convert/output/**/*.mjs.map');
    assert.equal(mapFiles.length, 4, 'rewrites 4 files');
    await assertFormattedFilesMatchFixtures(mapFiles, { parser: 'json' });
  },
  'generates valid sourcemaps': async function () {
    const mjsFiles = await glob('test/outdir-convert/output/**/*.mjs');
    const mjsMapFiles = await glob('test/outdir-convert/output/**/*.mjs.map');
    for (const mjsFilePath of mjsFiles) {
      const sourceMapFilePath = mjsMapFiles.find((m) => m.includes(mjsFilePath));
      const mjsFile = await fs.readFile(mjsFilePath, 'utf8');
      const sourceMapFile = await fs.readFile(sourceMapFilePath, 'utf8');
      assert.not.throws(() => {
        validateSourceMap(mjsFile, sourceMapFile);
      });
    }
  },
};
