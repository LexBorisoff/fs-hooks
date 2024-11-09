import { beforeAll, expect, it, suite } from 'vitest';
import { testSetup } from '../test-setup.js';
import type { FileTreeInterface } from '../../src/types/file-tree.types.js';
import { buildOperations } from '../../src/operations/build-operations.js';
import { getFilesInfo } from '../get-files-info.js';
import { Test } from './constants.js';

const { setup, testPath } = testSetup(Test.GetFilesInfo, import.meta);

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

suite('getFilesInfo function', () => {
  beforeAll(() => setup());

  it('should return files information array', () => {
    const operations = buildOperations(testPath, tree);
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

    expect(getFilesInfo(operations)).toEqual(filesInfo);
  });
});
