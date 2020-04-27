/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as path from 'path';
import {promises as fs} from 'fs';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const external = ['path', 'url', 'fs', 'fast-glob', 'util', 'process', 'typescript'];
const plugins = [
  tempFixRollupResolution(),
  resolve(),
  commonjs({ include: 'node_modules/**' }),
];

/**
 * This method will override the contents of 'parse.mjs' due to to an incompatibility
 * between rollup's node resolution implementation and Node's native one when running
 * in module mode.
 * 
 * This code should expire (be deleted) by August 1st 2020.
 * 
 * @expires {utc} 1596240000
 */
function tempFixRollupResolution() {
  return {
    load: async function (id) {
      if (path.basename(id) !== 'parse.mjs') {
        return null;
      }

      const parseContent = await fs.readFile(path.resolve('./src/parse.mjs'), 'utf8');
      return parseContent.replace("import acorn from 'acorn';", "import * as acorn from 'acorn';");
    }
  }
}

export default [
  {
    input: 'src/runner.mjs',
    output: {
      file: 'dist/tsc-esm',
      format: 'cjs',
      banner: '#!/usr/bin/env node',
    },
    external,
    plugins,
  },
  {
    input: 'src/format.mjs',
    output: {
      file: 'dist/format.mjs',
      format: 'esm',
    },
    external,
    plugins,
  },
  {
    input: 'src/format.mjs',
    output: {
      file: 'dist/format.js',
      format: 'cjs',
    },
    external,
    plugins,
  },
];
