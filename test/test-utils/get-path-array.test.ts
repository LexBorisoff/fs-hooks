import { expect, it, suite } from 'vitest';
import type { FileTreeInterface } from '../../src/types/file-tree.types.js';
import {
  getPathArray,
  type PathTreeDir,
  type PathTreeFile,
} from '../../test-utils/get-path-array.js';
import { testSetup } from '../test-setup.js';
import { Test } from './constants.js';

const { testPath, joinPath } = testSetup(Test.GetPathArray, import.meta);

const tree: FileTreeInterface = {
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
};

function pathTreeDir(path: string): PathTreeDir {
  return { type: 'dir', path };
}

function pathTreeFile(path: string): PathTreeFile {
  return { type: 'file', data: '', path };
}

suite('createPathArray function', () => {
  it('should return path array', () => {
    const result = getPathArray(tree, testPath);

    const pathArray = [
      pathTreeFile(joinPath('file1')),
      pathTreeDir(joinPath('dir1')),
      pathTreeFile(joinPath('dir1', 'file2')),
      pathTreeDir(joinPath('dir1', 'dir2')),
      pathTreeFile(joinPath('dir1', 'dir2', 'file3')),
      pathTreeDir(joinPath('dir1', 'dir2', 'dir3')),
      pathTreeFile(joinPath('dir1', 'dir2', 'dir3', 'file4')),
    ];

    expect(result).toEqual(pathArray);
  });
});
