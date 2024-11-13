import { beforeAll, beforeEach, expect, it, suite, vi } from 'vitest';
import { buildOperations } from '../../src/operations/build-operations.js';
import type { FileTreeInterface } from '../../src/types/file-tree.types.js';
import type { DirOperationsType } from '../../src/types/operation.types.js';
import { anyFunction } from '../any-function.js';
import { testSetup } from '../test-setup.js';
import { getUseDirs, NEW_DIR_NAME, type UseDirsFn } from '../use-dirs.js';
import { Test } from './constants.js';

const { setup, joinPath, testPath } = testSetup(Test.UseDirs, import.meta);

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

interface DirInfo {
  pathDirs: string[];
  children: string[];
}

type DirOperations = DirOperationsType<any, undefined, undefined>;

suite('getUseDirs function', () => {
  beforeAll(() => setup());

  function getDescribePath(...args: string[]): string {
    return joinPath(...args);
  }

  let operations: DirOperationsType<typeof tree>;
  let dirs: ({ dir: DirOperations } & DirInfo)[];
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

  function treeDir(index: number): [DirOperations, DirInfo] {
    const { dir, children, pathDirs } = dirs[index];
    return [dir, { children, pathDirs }];
  }

  function createdDir(index: number): [object, DirInfo] {
    const [dir, { pathDirs }] = treeDir(index);
    const info = {
      children: [],
      pathDirs: pathDirs.concat(NEW_DIR_NAME),
    };
    return [anyFunction(dir.$dirCreate(NEW_DIR_NAME)), info];
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
      expect(cb).toHaveBeenNthCalledWith(callNum++, ...treeDir(i));
      expect(cb).toHaveBeenNthCalledWith(callNum++, ...createdDir(i));
    });
  });
});
