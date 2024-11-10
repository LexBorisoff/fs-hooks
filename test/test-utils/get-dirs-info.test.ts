import { beforeAll, expect, it, suite } from 'vitest';
import { buildOperations } from '../../src/operations/build-operations.js';
import type { FileTreeInterface } from '../../src/types/file-tree.types.js';
import { getDirsInfo } from '../get-dirs-info.js';
import { testSetup } from '../test-setup.js';
import { Test } from './constants.js';

const { setup, testPath } = testSetup(Test.GetDirsInfo, import.meta);

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
  beforeAll(() => setup());

  it('should return directories information array', () => {
    const operations = buildOperations(testPath, tree);

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

    expect(getDirsInfo(operations)).toEqual(dirsInfo);
  });
});
