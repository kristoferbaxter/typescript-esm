import * as assert from 'uvu/assert';
import { promises as fs } from 'fs';
import { extname, basename, resolve } from 'path';
import validateSourceMap from 'sourcemap-validator';
import { formatter } from '../prettier.mjs';
import { spawn } from '../promise-spawn.mjs';

export async function compileTypescript() {
  const TSCONFIG_PATH = 'test/outdir-convert/tsconfig.json';
  await spawn('./node_modules/typescript/bin/tsc', ['-p', TSCONFIG_PATH]);
}

export function filterBy(extension, formatted) {
  return Array.from(formatted).filter((fileName) => extname(fileName) === extension);
}

export async function assertFormattedFilesMatchFixtures(formattedEntries, prettierOptions) {
  for (const formattedEntry of formattedEntries) {
    const formattedFileSystem = await fs.readFile(formattedEntry, 'utf8');
    const fixtureFileSystem = await fs.readFile(resolve('test/outdir-convert/fixtures', basename(formattedEntry)), 'utf8');
    const input = await formatter(formattedFileSystem, prettierOptions);
    const fixture = await formatter(fixtureFileSystem, prettierOptions);
    assert.equal(input, fixture);
  }
}

export async function assertValidSourceMaps(formattedFilePaths) {
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
