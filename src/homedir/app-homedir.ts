import path from 'node:path';
import { getHomedir } from './homedir.js';

export function getAppHomedir(appName: string): string {
  if (appName === '') {
    throw new Error('Empty app name');
  }

  return path.join(getHomedir(), appName);
}
