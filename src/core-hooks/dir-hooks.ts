import fs from 'node:fs';
import path from 'node:path';

import { createDir } from '@utils/create-dir.js';
import { readFile } from '@utils/read-file.js';

import { FsHooks } from '../fs-hooks.js';

import { fileHooks } from './file-hooks.js';

export const dirHooks = FsHooks.dirHooks((targetDir) => {
  function getPath(name: string): string {
    return path.resolve(targetDir.path, name);
  }

  function exists(name: string): boolean {
    return fs.existsSync(getPath(name));
  }

  return {
    getPath(): string {
      return targetDir.path;
    },
    exists(fileName: string): boolean {
      return exists(fileName);
    },
    dirCreate(dirName: string, recursive = false) {
      const dirPath = getPath(dirName);

      if (exists(dirName)) {
        return false;
      }

      createDir(dirPath, recursive);

      return dirHooks({
        type: 'dir',
        path: getPath(dirName),
        children: {},
      });
    },
    dirDelete(dirName: string): void {
      fs.rmSync(getPath(dirName), {
        recursive: true,
        force: true,
      });
    },

    fileClear(fileName: string): void {
      if (exists(fileName)) {
        this.fileWrite(fileName, '');
      }
    },
    fileCreate(fileName: string, data = '') {
      if (exists(fileName)) {
        return false;
      }

      this.fileWrite(fileName, data);

      return fileHooks({
        type: 'file',
        data,
        path: getPath(fileName),
      });
    },
    fileDelete(fileName: string) {
      fs.rmSync(getPath(fileName));
    },
    fileRead(fileName: string) {
      return readFile(getPath(fileName));
    },
    fileWrite(fileName: string, fileData: string) {
      fs.writeFileSync(getPath(fileName), fileData);
    },
  };
});
