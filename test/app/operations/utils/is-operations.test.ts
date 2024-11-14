import { beforeEach, expect, it, suite } from 'vitest';
import { buildOperations } from '@app/operations/build-operations.js';
import {
  isDirOperations,
  isFileOperations,
} from '@app/operations/utils/is-operations.js';
import type {
  FileTreeInterface,
  DirOperationsType,
  FileOperationsType,
} from '@app-types';
import { testSetup } from '@test-setup';
import { TestEnum } from './test.enum.js';

const { testPath } = testSetup(TestEnum.IsOperations, import.meta);

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
  let operations: DirOperationsType<typeof tree>;
  let files: FileOperationsType[];
  let dirs: DirOperationsType<any>[];

  beforeEach(() => {
    operations = buildOperations(testPath, tree);
    const { file1, dir1, dir2 } = operations;
    const { file2, dir3, dir4 } = dir2;
    const { file3, dir5, dir6 } = dir4;
    const { file4 } = dir6;
    files = [file1, file2, file3, file4];
    dirs = [operations, dir1, dir2, dir3, dir4, dir5, dir6];
  });

  it('should return true/false for file operations', () => {
    files.forEach((file) => {
      expect(isFileOperations(file)).toBe(true);
      expect(isDirOperations(file)).toBe(false);
    });
  });

  it('should return true/false for directory operations', () => {
    dirs.forEach((dir) => {
      expect(isDirOperations(dir)).toBe(true);
      expect(isFileOperations(dir)).toBe(false);
    });
  });
});
