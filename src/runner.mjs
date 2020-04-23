import mri from 'mri';
import { format } from './format.mjs';

const args = mri(process.argv.slice(2), {
  alias: { p: 'path' },
});

(async function () {
  if (args.path === undefined) {
    console.log('You must specify a path either via --path or -p');
    return;
  }

  await format(args.path);
})();
