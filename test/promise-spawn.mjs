import { spawn as childProcessSpawn } from 'child_process';

export function spawn(command, args) {
  return new Promise((resolve, reject) => {
    const process = childProcessSpawn(command, args);
    process.on('error', (err) => reject(err));
    process.on('close', (code) => (code === 0 ? resolve(code) : reject(code)));
  });
}
