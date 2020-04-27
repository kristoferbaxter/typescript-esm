import { resolve } from 'path';
import { cwd } from 'process';
import typescript from 'typescript';

export function config(project) {
  const configFilePath = project ? resolve(cwd(), project) : typescript.findConfigFile(cwd(), typescript.sys.fileExists);
  const configFile = typescript.readConfigFile(configFilePath, typescript.sys.readFile);

  if (configFile.error) {
    throw configFile.error;
  }
  return configFile.config;
}
