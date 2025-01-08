import fs from 'node:fs';

import { coreHooks } from '@core-hooks/core-hooks.js';

import { getDirsInfo, type DirInfo } from './get-dirs-info.js';

import type { CoreHooks } from './hooks-objects.js';
import type { FsHooks } from '@app/fs-hooks.js';
import type { TreeInterface } from '@app-types/tree.types.js';

type UseDirsCb = (hooks: CoreHooks['dir'], dir: DirInfo) => void;

export type UseDirsFn = (cb: UseDirsCb) => void;

export const NEW_DIR_NAME = 'new-dir';

export function getUseDirs(fsHooks: FsHooks<TreeInterface>): UseDirsFn {
  const dirs = getDirsInfo(fsHooks);
  const hooks = fsHooks.useHooks(coreHooks);

  /**
   * Types of directories for testing
   * 1. from the tree
   * 2. created with dirCreate on tree directories
   */
  return function useDirs(cb) {
    dirs.forEach((dirInfo) => {
      const { pathDirs } = dirInfo;

      /**
       * Test directory from the tree
       */
      const dirHooks = hooks((root) => {
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

      cb(dirHooks, dirInfo);

      /**
       * Test directory created with dirCreate on a tree directory
       */
      const createdDir = dirHooks.dirCreate(NEW_DIR_NAME, true);

      if (createdDir) {
        cb(createdDir, {
          pathDirs: pathDirs.concat(NEW_DIR_NAME),
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
