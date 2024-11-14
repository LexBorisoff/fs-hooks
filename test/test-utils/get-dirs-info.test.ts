import { beforeEach, expect, it, suite } from 'vitest';
import { buildOperations } from '@app/operations/build-operations.js';
import type { FileTreeInterface, DirOperationsType } from '@app-types';
import { testSetup } from '@test-setup';
import { getDirsInfo } from '@test-utils/get-dirs-info.js';
import { Test } from './test.enum.js';

const { testPath } = testSetup(Test.GetDirsInfo, import.meta);

const tree = {
  file1: '',
  dir1: {
    file2: '',
    dir2: {
      file3: '',
      dir3: {
        file4: '',
      },
    },
  },
} satisfies FileTreeInterface;

suite('getDirsInfo function', () => {
  let operations: DirOperationsType<typeof tree>;

  beforeEach(() => {
    operations = buildOperations(testPath, tree);
  });

  it('should return directories information array', () => {
    const dirs = getDirsInfo<undefined, undefined>(operations);
    const dirsInfo = [
      {
        dir: operations,
        children: ['file1', 'dir1'],
        pathDirs: [],
      },
      {
        dir: operations.dir1,
        children: ['file2', 'dir2'],
        pathDirs: ['dir1'],
      },
      {
        dir: operations.dir1.dir2,
        children: ['file3', 'dir3'],
        pathDirs: ['dir1', 'dir2'],
      },
      {
        dir: operations.dir1.dir2.dir3,
        children: ['file4'],
        pathDirs: ['dir1', 'dir2', 'dir3'],
      },
    ];

    expect(dirs).toEqual(dirsInfo);
  });
});
