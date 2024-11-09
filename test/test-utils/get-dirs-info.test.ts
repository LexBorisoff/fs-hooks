import { beforeAll, expect, it, suite } from 'vitest';
import { testSetup } from '../test-setup.js';
import type { FileTreeInterface } from '../../src/types/file-tree.types.js';
import { buildOperations } from '../../src/operations/build-operations.js';
import { getDirsInfo } from '../get-dirs-info.js';

const { setup, testPath } = testSetup('getDirsInfo', import.meta);

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

  it('should be correct', () => {
    const operations = buildOperations(testPath, tree);
    const result = getDirsInfo(operations);

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

    expect(result).toEqual(dirsInfo);
  });
});
