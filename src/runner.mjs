import mri from 'mri';
import { config } from './config.mjs';
import { format } from './format.mjs';

const args = mri(process.argv.slice(2), {
  alias: { p: 'project' },
});

(async function () {
  if (args.project === undefined) {
    console.log('You must specify a project either via --project or -p');
    return;
  }

  const configuration = config(args.project);
  await format(configuration);
})();
