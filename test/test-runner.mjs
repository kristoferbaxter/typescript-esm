import glob from 'fast-glob';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { stdout, exit } from 'process';
import prettier from 'prettier';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

(async function () {
  const files = await glob(__dirname + '/**/*.test.mjs');
  const prettierOptions = await prettier.resolveConfig(await prettier.resolveConfigFile());
  const testContext = {
    format: (content) => prettier.format(content, prettierOptions),
  };
  let failure = false;

  if (files.length > 0) {
    stdout.write('Executing Tests\n');
  }
  for (const file of files) {
    try {
      const { pre = undefined, tests } = await import(file);
      for (const [name, test] of tests) {
        stdout.write(`.. ${name}`);
        try {
          if (pre) {
            await pre(testContext);
          }
          await test(testContext);
        } catch (err) {
          stdout.write(` - FAILURE\nErr: ${err}`);
          failure = true;
          continue;
        }
        stdout.write(' - SUCCESS\n');
      }
    } catch (e) {
      stdout.write(`TestLoader: failed to execute ${file}, verify its contents include a 'test' export.\n${e}\n`);
    }
  }

  if (failure) {
    exit(5);
  }
})();
