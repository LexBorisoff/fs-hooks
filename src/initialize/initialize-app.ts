import fs from 'node:fs';
import type { FileStructure } from '../types/file-structure.types.js';
import { getAppHomedir } from '../homedir/app-homedir.js';
import { pathsMapper } from '../operations/mappers/paths.mapper.js';
import { createFiles } from './create-files.js';

export function initializeApp(
  appName: string,
  fileStructure: FileStructure,
): void {
  const appHome = getAppHomedir(appName);
  const pathStructure = pathsMapper(appHome, fileStructure);

  if (fs.existsSync(appHome)) {
    fs.rmSync(appHome, {
      recursive: true,
      force: true,
    });
  }

  fs.mkdirSync(appHome);
  createFiles(pathStructure);
}
