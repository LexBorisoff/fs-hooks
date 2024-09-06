import fs from 'node:fs';
import type { FileTreeInterface } from '../types/file-tree.types.js';
import { getAppHomedir } from '../homedir/app-homedir.js';
import { pathsMapper } from '../mappers/paths.mapper.js';
import { createFiles } from './create-files.js';

export function initializeApp(
  appName: string,
  fileTree: FileTreeInterface,
): void {
  const appHome = getAppHomedir(appName);
  const pathTree = pathsMapper(appHome, fileTree);

  if (fs.existsSync(appHome)) {
    fs.rmSync(appHome, {
      recursive: true,
      force: true,
    });
  }

  fs.mkdirSync(appHome);
  createFiles(pathTree);
}
