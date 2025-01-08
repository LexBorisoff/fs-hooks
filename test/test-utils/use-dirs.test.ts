import { beforeAll, beforeEach, expect, it, suite, vi } from 'vitest';

import { FsHooks } from '@app/fs-hooks.js';
import { dirHooks } from '@core-hooks/dir-hooks.js';
import { testSetup } from '@test-setup';
import { anyFunction } from '@test-utils/any-function.js';
import {
  getUseDirs,
  NEW_DIR_NAME,
  type UseDirsFn,
} from '@test-utils/use-dirs.js';

import { TestEnum } from './test.enum.js';

import type { DirHooks } from './hooks-objects.js';
import type { TreeInterface } from '@app-types/tree.types.js';
import type { DirInfo } from '@test-utils/get-dirs-info.js';

const { setup, testPath } = testSetup(TestEnum.UseDirs, import.meta);

const tree = {
  file1: '',
  dir1: {},
  dir2: {
    file2: '',
    dir3: {},
    dir4: {
      file3: '',
      dir5: {},
      dir6: {
        file4: '',
      },
    },
  },
} satisfies TreeInterface;

interface DirInterface extends DirInfo {
  hooks: DirHooks;
}

suite('getUseDirs function', () => {
  beforeAll(() => setup());

  let fsHooks: FsHooks<typeof tree>;
  let dirs: DirInterface[];
  let useDirs: UseDirsFn;

  beforeEach(() => {
    fsHooks = new FsHooks(testPath, tree);
    useDirs = getUseDirs(fsHooks);
    const hooks = fsHooks.useHooks({ dir: dirHooks });

    dirs = [
      {
        hooks: hooks((root) => root),
        children: ['file1', 'dir1', 'dir2'],
        pathDirs: [],
      },
      {
        hooks: hooks((root) => root.dir1),
        children: [],
        pathDirs: ['dir1'],
      },
      {
        hooks: hooks((root) => root.dir2),
        children: ['file2', 'dir3', 'dir4'],
        pathDirs: ['dir2'],
      },
      {
        hooks: hooks((root) => root.dir2.dir3),
        children: [],
        pathDirs: ['dir2', 'dir3'],
      },
      {
        hooks: hooks((root) => root.dir2.dir4),
        children: ['file3', 'dir5', 'dir6'],
        pathDirs: ['dir2', 'dir4'],
      },
      {
        hooks: hooks((root) => root.dir2.dir4.dir5),
        children: [],
        pathDirs: ['dir2', 'dir4', 'dir5'],
      },
      {
        hooks: hooks((root) => root.dir2.dir4.dir6),
        children: ['file4'],
        pathDirs: ['dir2', 'dir4', 'dir6'],
      },
    ];
  });

  it('should be a function', () => {
    expect(useDirs).toBeTypeOf('function');
  });

  it('should call the callback', () => {
    function treeDirParams(index: number): [object, DirInfo] {
      const { hooks, ...rest } = dirs[index];
      return [anyFunction(hooks), rest];
    }

    function createdDirParams(index: number): [object, DirInfo] {
      const { hooks, pathDirs } = dirs[index];
      const info: DirInfo = {
        children: [],
        pathDirs: pathDirs.concat(NEW_DIR_NAME),
      };

      const createdDir = hooks.dirCreate(NEW_DIR_NAME);
      return [anyFunction(createdDir || {}), info];
    }

    const cb = vi.fn();
    const numOfDirs = dirs.length;
    const callsPerDir = 2;

    useDirs(cb);
    expect(cb).toHaveBeenCalledTimes(numOfDirs * callsPerDir);

    let callNum = 1;
    Array.from({ length: numOfDirs }).forEach((_, i) => {
      expect(cb).toHaveBeenNthCalledWith(callNum++, ...treeDirParams(i));
      expect(cb).toHaveBeenNthCalledWith(callNum++, ...createdDirParams(i));
    });
  });
});
