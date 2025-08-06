import fs from 'node:fs';
import path from 'node:path';

import { createDir } from '@utils/create-dir.js';
import { getFileData } from '@utils/get-file-data.js';
import { readFile } from '@utils/read-file.js';

import { FsHooks } from '../fs-hooks.js';

import { fileHooks } from './file-hooks.js';

import type {
  DirTargetInterface,
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
    /**
     * Returns the path of the target directory.
     */
    getPath(): string {
      return targetDir.path;
    },

    /**
     * Checks if a file or directory exists inside the target directory.
     *
     * @param name file or directory name to check
     */
    exists(name: string): boolean {
      return exists(name);
    },

    /**
     * Creates a new directory inside the target directory.
     *
     * @param dirName directory name to create
     * @param recursive indicates whether parent folders should be created
     *
     * @returns
     * - The created directory hooks
     * - The directory hooks if the directory already exists
     * - `false` if the directory could not be created
     *
     */
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

    /**
     * Deletes a directory inside the target directory.
     *
     * @param dirName directory name to delete
     */
    dirDelete(dirName: string): void {
      if (exists(dirName)) {
        fs.rmSync(getPath(dirName), {
          recursive: true,
          force: true,
        });
      }
    },

    /**
     * Creates a new file inside the target directory.
     *
     * @param fileName file name to create
     * @param data data string to write. If this argument is provided and the file already exists, the file will be overwritten
     *
     * @returns
     * - The created file hooks
     * - The file hooks if it already exists
     * - `false` if the file could not be created
     */
    fileCreate(
      fileName: string,
      data: unknown = '',
    ): ReturnType<typeof fileHooks> | false {
      try {
        this.fileWrite(fileName, data);
      } catch {
        return false;
      }

      return fileHooks({
        type: 'file',
        path: getPath(fileName),
      });
    },

    /**
     * Deletes a file inside the target directory.
     *
     * @param fileName file name to delete
     */
    fileDelete(fileName: string): void {
      if (exists(fileName)) {
        fs.rmSync(getPath(fileName));
      }
    },

    /**
     * Reads the contents of a file inside the target directory.
     *
     * @param fileName file name to read
     *
     * @returns
     * - file data as a `string`
     * - `null` if the file cannot be read
     */
    fileRead(fileName: string): string | null {
      return readFile(getPath(fileName));
    },

    /**
     * Writes new data to a file inside the target directory.
     *
     * @param fileName file name to write data to
     * @param data data string to write
     */
    fileWrite(fileName: string, data: unknown): void {
      fs.writeFileSync(getPath(fileName), getFileData(data));
    },

    /**
     * Clears the contents of a file inside the target directory.
     *
     * @param fileName file name to clear
     */
    fileClear(fileName: string): void {
      if (exists(fileName)) {
        this.fileWrite(fileName, '');
      }
    },
  };
});
