import * as path from 'path';
import { promises as fs } from 'fs';
import glob from 'fast-glob';
import { asyncWalk as walk } from '@kristoferbaxter/estree-walker';
import { parse } from './parse.mjs';
import { log } from './log.mjs';
import { pathExists } from './paths.mjs';

/**
 * Update a path with a new extension.
 * @param {string} originalPath
 * @param {string} newExtension
 * @return {string} updated path with new extension
 */
function repath(originalPath, newExtension) {
  return path.join(path.dirname(originalPath), path.basename(originalPath, path.extname(originalPath)) + newExtension);
}

/**
 * convert `import from './foo'` or `export from './foo'` specifiers to include mjs extensions.
 * @param {string} dirname
 * @param {string} filePath
 * @return {Promise<string>}
 */
async function convertRelativeImportPaths(dirname, filePath) {
  const [program, magicString] = await parse(filePath);

  await walk(program, {
    enter: async function (node) {
      if (node.type === 'ImportDeclaration' || node.type === 'ExportNamedDeclaration') {
        const { source } = node;

        if (source === null || !source.value.startsWith('.')) {
          return;
        }

        // The first character of the module source is a dot, indicating this could be a path.
        const basePath = path.join(dirname, source.value);
        if (await pathExists([basePath + '.js', basePath + '.mjs'])) {
          // There is a existing filesystem entry for either an '.mjs' or '.js' version of the import.
          // It is safe to use the '.mjs' extension for this import.
          const [start, end] = source.range;
          magicString.overwrite(start, end, `'./${repath(source.value, '.mjs')}'`);
        }
      }
    },
  });

  return magicString.toString();
}

/**
 * Format each js file output by TypeScript
 * 1. With an `.mjs` extension.
 * 2. With each relative import location including an `.mjs` extension
 * @param {string} configFileLocation
 * @param {Object} config
 * @return {Promise<Set<string>>}
 */
export async function format(configFileLocation, config) {
  const basePath = path.resolve(path.dirname(configFileLocation), config.compilerOptions.outDir);
  const filePaths = await glob(basePath + '/**/*.js');
  const newFilePaths = new Set();

  log('prepare filePaths', { basePath, filePaths });
  for (const filePath of filePaths) {
    try {
      const newFilePath = repath(filePath, '.mjs');
      const fileDirName = path.dirname(filePath);
      const newFileContent = await convertRelativeImportPaths(fileDirName, filePath);

      newFilePaths.add(newFilePath);
      await fs.writeFile(newFilePath, newFileContent);
      await fs.unlink(filePath);
    } catch (e) {
      log(`Overall: Error preparing ${filePath}\n`);
      log(e);
    }
  }

  return newFilePaths;
}
