import { beforeAll, beforeEach, expect, it, suite, vi } from 'vitest';

import { buildOperations } from '@app/operations/build-operations.js';
import { testSetup } from '@test-setup';
import { anyFunction } from '@test-utils/any-function.js';
import {
  getUseDirs,
  NEW_DIR_NAME,
  type UseDirsFn,
} from '@test-utils/use-dirs.js';

import { TestEnum } from './test.enum.js';

import type { FileTreeInterface } from '@app-types/file-tree.types.js';
import type { DirOperationsType } from '@app-types/operation.types.js';
import type { DirInfo } from '@test-utils/get-dirs-info.js';

const { setup, joinPath, testPath } = testSetup(TestEnum.UseDirs, import.meta);

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
} satisfies FileTreeInterface;

type DirInfoType = DirInfo<any, undefined, undefined>;
type DirMeta = Pick<DirInfoType, 'children' | 'pathDirs'>;
type DirOperations = DirInfoType['dir'];

suite('getUseDirs function', () => {
  beforeAll(() => setup());

  function getDescribePath(...args: string[]): string {
    return joinPath(...args);
  }

  let operations: DirOperationsType<typeof tree>;
  let dirs: DirInfo<any, undefined, undefined>[];
  let useDirs: UseDirsFn<undefined, undefined>;

  beforeEach(() => {
    operations = buildOperations(testPath, tree);
    useDirs = getUseDirs<undefined, undefined>(
      operations as DirOperations,
      getDescribePath,
    );

    dirs = [
      {
        dir: operations,
        children: ['file1', 'dir1', 'dir2'],
        pathDirs: [],
      },
      {
        dir: operations.dir1,
        children: [],
        pathDirs: ['dir1'],
      },
      {
        dir: operations.dir2,
        children: ['file2', 'dir3', 'dir4'],
        pathDirs: ['dir2'],
      },
      {
        dir: operations.dir2.dir3,
        children: [],
        pathDirs: ['dir2', 'dir3'],
      },
      {
        dir: operations.dir2.dir4,
        children: ['file3', 'dir5', 'dir6'],
        pathDirs: ['dir2', 'dir4'],
      },
      {
        dir: operations.dir2.dir4.dir5,
        children: [],
        pathDirs: ['dir2', 'dir4', 'dir5'],
      },
      {
        dir: operations.dir2.dir4.dir6,
        children: ['file4'],
        pathDirs: ['dir2', 'dir4', 'dir6'],
      },
    ];
  });

  function treeDirParams(index: number): [DirOperations, DirMeta] {
    const { dir, children, pathDirs } = dirs[index];
    return [dir, { children, pathDirs }];
  }

  function createdDirParams(index: number): [object, DirMeta] {
    const [dir, { pathDirs }] = treeDirParams(index);
    const meta: DirMeta = {
      children: [],
      pathDirs: pathDirs.concat(NEW_DIR_NAME),
    };
    return [anyFunction(dir.$dirCreate(NEW_DIR_NAME)), meta];
  }

  it('should be a function', () => {
    expect(useDirs).toBeTypeOf('function');
  });

  it('should call the callback', () => {
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
