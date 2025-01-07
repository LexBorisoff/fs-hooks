import fs from 'node:fs';

import { dirHooks } from '@core-hooks/dir-hooks.js';

import { getDirsInfo, type DirInfo } from './get-dirs-info.js';

import type { DirHooks } from './hooks-objects.js';
import type { FsHooks } from '@app/fs-hooks.js';
import type { TreeInterface } from '@app-types/tree.types.js';

type UseDirsCb = (hooks: DirHooks, dir: DirInfo) => void;

export type UseDirsFn = (cb: UseDirsCb) => void;

export function getUseDirs(fsHooks: FsHooks<TreeInterface>): UseDirsFn {
  const dirs = getDirsInfo(fsHooks);
  const hooks = fsHooks.useHooks({ dir: dirHooks });

  /**
   * Types of directories for testing
   * 1. from the tree
   * 2. created with dirCreate hook
   */
  return function useDirs(cb) {
    dirs.forEach((dirInfo) => {
      const { pathDirs } = dirInfo;
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

      cb(hooksDir, dirInfo);

      const dirName = 'new-dir';
      const createdDir = hooksDir.dirCreate(dirName, true);

      if (createdDir) {
        cb(createdDir, {
          pathDirs: pathDirs.concat(dirName),
          children: [],
        });

        fs.rmSync(createdDir.getPath(), {
          force: true,
          recursive: true,
        });
      }
    });
  };
}
