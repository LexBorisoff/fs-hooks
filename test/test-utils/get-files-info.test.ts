import { beforeEach, expect, it, suite } from 'vitest';

import { buildOperations } from '@app/operations/build-operations.js';
import { testSetup } from '@test-setup';
import { getFilesInfo } from '@test-utils/get-files-info.js';

import { TestEnum } from './test.enum.js';

import type { FileTreeInterface } from '@app-types/file-tree.types.js';
import type { DirOperationsType } from '@app-types/operation.types.js';

const { testPath } = testSetup(TestEnum.GetFilesInfo, import.meta);

const tree = {
  file1: 'file 1 data',
  dir1: {
    file2: 'file 2 data',
    dir2: {
      file3: 'file 3 data',
      dir3: {
        file4: 'file 4 data',
      },
    },
  },
} satisfies FileTreeInterface;

suite('getFilesInfo function', () => {
  let operations: DirOperationsType<typeof tree>;

  beforeEach(() => {
    operations = buildOperations(testPath, tree);
  });

  it('should return files information array', () => {
    const files = getFilesInfo(operations);
    const filesInfo = [
      {
        file: operations.file1,
        fileName: 'file1',
        treeFile: tree.file1,
        dir: operations,
        pathDirs: [],
      },
      {
        file: operations.dir1.file2,
        fileName: 'file2',
        treeFile: tree.dir1.file2,
        dir: operations.dir1,
        pathDirs: ['dir1'],
      },
      {
        file: operations.dir1.dir2.file3,
        fileName: 'file3',
        treeFile: tree.dir1.dir2.file3,
        dir: operations.dir1.dir2,
        pathDirs: ['dir1', 'dir2'],
      },
      {
        file: operations.dir1.dir2.dir3.file4,
        fileName: 'file4',
        treeFile: tree.dir1.dir2.dir3.file4,
        dir: operations.dir1.dir2.dir3,
        pathDirs: ['dir1', 'dir2', 'dir3'],
      },
    ];

    expect(files).toEqual(filesInfo);
  });
});
