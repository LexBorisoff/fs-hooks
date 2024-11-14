import { expect, it, suite } from 'vitest';
import { buildOperations } from '@app/operations/build-operations.js';
import { getOperationsType } from '@app/operations/utils/get-operations-type.js';
import { OperationsTypeEnum } from '@app/operations/utils/operations-type.enum.js';
import type { FileTreeInterface } from '@app-types';
import { testSetup } from '@test-setup';
import { Test } from './test.enum.js';

const { testPath } = testSetup(Test.GetOperationsType, import.meta);

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

const DirType = OperationsTypeEnum.Dir;
const FileType = OperationsTypeEnum.File;

suite('getOperationsType function', () => {
  it('should return operations type', () => {
    const operations = buildOperations(testPath, tree);

    const { file1, dir1, dir2 } = operations;
    const { file2, dir3, dir4 } = dir2;
    const { file3, dir5, dir6 } = dir4;
    const { file4 } = dir6;

    [operations, dir1, dir2, dir3, dir4, dir5, dir6].forEach((dir) => {
      expect(getOperationsType(dir)).toBe(DirType);
    });

    [file1, file2, file3, file4].forEach((file) => {
      expect(getOperationsType(file)).toBe(FileType);
    });
  });
});
