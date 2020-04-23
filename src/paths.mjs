import { promises as fs } from 'fs';
import allSettled from 'promise.allsettled';
import { log } from './log.mjs';

/**
 * Return if any of these paths exist.
 * @param {Array<string>} paths
 * @return {Promise<boolean>}
 */
export async function pathExists(paths) {
  try {
    await allSettled(paths.map((path) => fs.access(path)));
  } catch (e) {
    log('Paths Exist: Error', e);
  }

  return true;
}
