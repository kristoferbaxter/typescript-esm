import prettier from 'prettier';

let prettierOptions = undefined;

/**
 * Use Prettier to format content.
 * Cache PrettierOptions in a singleton.
 * 
 * @param {string} content
 * @return {string}
 */
export async function formatter(content) {
  if (prettierOptions === undefined) {
    prettierOptions = await prettier.resolveConfig(await prettier.resolveConfigFile());
  }

  return prettier.format(content, prettierOptions);
}