import path from 'node:path';

export function getFullPath(rootPath: string, ...fileNames: string[]): string {
  return path.resolve(rootPath, ...fileNames);
}
