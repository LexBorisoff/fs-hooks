import { expect, it, suite } from 'vitest';

import { buildOperations } from '@app/operations/build-operations.js';
import { getOperationsType } from '@app/operations/utils/get-operations-type.js';
import { OperationsTypeEnum } from '@app/operations/utils/operations-type.enum.js';
import { testSetup } from '@test-setup';

import { TestEnum } from './test.enum.js';

import type { FileTreeInterface } from '@app-types/file-tree.types.js';

const { testPath } = testSetup(TestEnum.GetOperationsType, import.meta);

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

  it('should return undefined if value is not object or is null', () => {
    const values = [undefined, null, 1, 'a', true, Symbol()];
    values.forEach((value) => {
      expect(getOperationsType(value)).toBe(undefined);
    });
  });
});
