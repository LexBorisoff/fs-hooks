import fs from 'node:fs';

export function isDirectory(dirPath: string): boolean {
  return fs.statSync(dirPath).isDirectory();
}
