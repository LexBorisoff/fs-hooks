import fs from 'node:fs';
import path from 'node:path';

import { dirHooks } from '@core-hooks/dir-hooks.js';
import { fileHooks } from '@core-hooks/file-hooks.js';

import { getFilesInfo, type FileInfo } from './get-files-info.js';

import type { FileHooks } from './hooks-objects.js';
import type { FsHooks } from '@app/fs-hooks.js';
import type { TreeInterface } from '@app-types/tree.types.js';

type UseFilesCb = (hooks: FileHooks, file: FileInfo) => void;

export type UseFilesFn = (cb: UseFilesCb) => void;

export function getUseFiles(fsHooks: FsHooks<TreeInterface>): UseFilesFn {
  const files = getFilesInfo(fsHooks);
  const hooks = fsHooks.useHooks({
    file: fileHooks,
    dir: dirHooks,
  });

  return function useFiles(cb) {
    files.forEach((fileInfo) => {
      const { pathDirs, fileName } = fileInfo;
      const dirPath = path.resolve(fsHooks.rootPath, ...pathDirs);

      fs.mkdirSync(dirPath, { recursive: true });

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

      const newDirName = 'dir-create';
      const newFileName = 'file-create';

      const createdFile1 = hooksDir.fileCreate(newFileName);
      if (createdFile1) {
        cb(createdFile1, {
          fileData: '',
          fileName: newFileName,
          pathDirs,
        });
      }

      const createdDir = hooksDir.dirCreate(newDirName, true);
      if (createdDir) {
        const createdFile2 = createdDir.fileCreate(newFileName);
        if (createdFile2) {
          cb(createdFile2, {
            fileData: '',
            fileName: newFileName,
            pathDirs: pathDirs.concat(newDirName),
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
