import { expect, it, suite } from 'vitest';
import { buildOperations } from '../../../../src/operations/build-operations.js';
import {
  isDirOperations,
  isFileOperations,
} from '../../../../src/operations/utils/is-operations.js';
import type { FileTreeInterface } from '../../../../src/types/file-tree.types.js';
import { testSetup } from '../../../test-setup.js';
import { Test } from './constants.js';

const { testPath } = testSetup(Test.IsOperations, import.meta);

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

suite('is operations functions', () => {
  const operations = buildOperations(testPath, tree);

  const { file1, dir1, dir2 } = operations;
  const { file2, dir3, dir4 } = dir2;
  const { file3, dir5, dir6 } = dir4;
  const { file4 } = dir6;

  it('should return true/false for file operations', () => {
    [file1, file2, file3, file4].forEach((file) => {
      expect(isFileOperations(file)).toBe(true);
      expect(isDirOperations(file)).toBe(false);
    });
  });

  it('should return true/false for directory operations', () => {
    [operations, dir1, dir2, dir3, dir4, dir5, dir6].forEach((dir) => {
      expect(isDirOperations(dir)).toBe(true);
      expect(isFileOperations(dir)).toBe(false);
    });
  });
});
