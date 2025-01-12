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
    exists(name: string): boolean {
      return exists(name);
    },

    dirCreate(dirName: string, recursive = false) {
      const dirPath = getPath(dirName);

      if (exists(dirName)) {
        return false;
      }

      createDir(dirPath, recursive);

      return dirHooks({
        type: 'dir',
        path: dirPath,
        children: {},
      });
    },
    dirDelete(dirName: string): void {
      if (exists(dirName)) {
        fs.rmSync(getPath(dirName), {
          recursive: true,
          force: true,
        });
      }
    },

    fileRead(fileName: string): string | null {
      return readFile(getPath(fileName));
    },
    fileWrite(fileName: string, fileData: string): void {
      fs.writeFileSync(getPath(fileName), fileData);
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
        path: getPath(fileName),
        data,
      });
    },
    fileDelete(fileName: string): void {
      if (exists(fileName)) {
        fs.rmSync(getPath(fileName));
      }
    },
  };
});
