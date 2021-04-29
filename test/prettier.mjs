import prettier from 'prettier';

/**
 * Use Prettier to format content.
 * Cache PrettierOptions in a singleton.
 *
 * @param {string} content
 * @return {string}
 */
export async function formatter(content, prettierOptions) {
  if (prettierOptions === undefined) {
    prettierOptions = await prettier.resolveConfig(await prettier.resolveConfigFile());
  }

  return prettier.format(content, prettierOptions);
}
