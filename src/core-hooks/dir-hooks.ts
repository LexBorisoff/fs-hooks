import fs from 'node:fs';
import path from 'node:path';

import { createDir } from '@utils/create-dir.js';
import { readFile } from '@utils/read-file.js';

import { FsHooks } from '../fs-hooks.js';

import { fileHooks } from './file-hooks.js';

import type {
  DirTargetInterface,
  FileTargetInterface,
  TreeInterface,
} from '@app-types/tree.types.js';

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

    dirCreate(
      dirName: string,
      recursive = false,
    ): ReturnType<typeof dirHooks> | false {
      const dirPath = getPath(dirName);
      const createdDir: DirTargetInterface<TreeInterface> = {
        type: 'dir',
        path: dirPath,
        children: {},
      };

      if (exists(dirName)) {
        return dirHooks(createdDir);
      }

      try {
        createDir(dirPath, recursive);
      } catch {
        return false;
      }

      return dirHooks(createdDir);
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
    fileCreate(
      fileName: string,
      data: string = '',
    ): ReturnType<typeof fileHooks> | false {
      const createdFile: FileTargetInterface = {
        type: 'file',
        path: getPath(fileName),
      };

      if (exists(fileName)) {
        return fileHooks(createdFile);
      }

      try {
        this.fileWrite(fileName, data);
      } catch {
        return false;
      }

      return fileHooks(createdFile);
    },
    fileDelete(fileName: string): void {
      if (exists(fileName)) {
        fs.rmSync(getPath(fileName));
      }
    },
  };
});
