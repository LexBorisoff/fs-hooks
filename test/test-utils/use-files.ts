import fs from 'node:fs';
import path from 'node:path';

import { dirHooks } from '@core-hooks/dir-hooks.js';
import { fileHooks } from '@core-hooks/file-hooks.js';

import { getFilesInfo, type FileInfo } from './get-files-info.js';
import { NEW_DIR_NAME } from './use-dirs.js';

import type { FileHooks } from './hooks-objects.js';
import type { FsHooks } from '@app/fs-hooks.js';
import type { TreeInterface } from '@app-types/tree.types.js';

type UseFilesCb = (hooks: FileHooks, file: FileInfo) => void;

export type UseFilesFn = (cb: UseFilesCb) => void;

export const NEW_FILE_NAME = 'new-file';
export const NEW_FILE_DATA = 'new file data';

export function getUseFiles(fsHooks: FsHooks<TreeInterface>): UseFilesFn {
  const files = getFilesInfo(fsHooks);
  const hooks = fsHooks.useHooks({
    file: fileHooks,
    dir: dirHooks,
  });

  /**
   * Types of files for testing:
   * 1. from the tree
   * 2. created with fileCreate on tree directories
   * 3. created with dirCreate + fileCreate combination
   */
  return function useFiles(cb) {
    files.forEach((fileInfo) => {
      const { pathDirs, fileName } = fileInfo;
      const dirPath = path.resolve(fsHooks.rootPath, ...pathDirs);

      fs.mkdirSync(dirPath, { recursive: true });

      /**
       * Test file from the tree
       */
      const hooksFile = hooks((root) => {
        let currentDir: TreeInterface = root;

        pathDirs.forEach((dirName) => {
          if (
            Object.keys(currentDir).includes(dirName) &&
            typeof currentDir[dirName] === 'object'
          ) {
            currentDir = currentDir[dirName];
          }
        });

        return currentDir[fileName] as string;
      });

      cb(hooksFile, fileInfo);

      /**
       * Tree directory
       */
      const hooksDir = hooks((root) => {
        let currentDir: TreeInterface = root;

        pathDirs.forEach((dirName) => {
          if (
            Object.keys(currentDir).includes(dirName) &&
            typeof currentDir[dirName] === 'object'
          ) {
            currentDir = currentDir[dirName];
          }
        });

        return currentDir;
      });

      /**
       * Test file created with fileCreate on a tree directory
       */
      const createdFile1 = hooksDir.fileCreate(NEW_FILE_NAME, NEW_FILE_DATA);
      if (createdFile1) {
        cb(createdFile1, {
          fileName: NEW_FILE_NAME,
          fileData: NEW_FILE_DATA,
          pathDirs,
        });
      }

      /**
       * Test file created with dirCreate + fileCreate combination
       */
      const createdDir = hooksDir.dirCreate(NEW_DIR_NAME, true);
      if (createdDir) {
        const createdFile2 = createdDir.fileCreate(
          NEW_FILE_NAME,
          NEW_FILE_DATA,
        );
        if (createdFile2) {
          cb(createdFile2, {
            fileName: NEW_FILE_NAME,
            fileData: NEW_FILE_DATA,
            pathDirs: pathDirs.concat(NEW_DIR_NAME),
          });
        }
      }

      fs.rmSync(dirPath, {
        force: true,
        recursive: true,
      });
    });
  };
}
