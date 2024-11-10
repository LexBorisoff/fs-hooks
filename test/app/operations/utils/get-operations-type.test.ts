import { expect, it, suite } from 'vitest';
import { buildOperations } from '../../../../src/operations/build-operations.js';
import { getOperationsType } from '../../../../src/operations/utils/get-operations-type.js';
import { OperationsTypeEnum } from '../../../../src/operations/utils/operations-type.enum.js';
import type { FileTreeInterface } from '../../../../src/types/file-tree.types.js';
import { testSetup } from '../../../test-setup.js';
import { Test } from './constants.js';

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
    const result = buildOperations(testPath, tree);

    const { file1, dir1, dir2 } = result;
    const { file2, dir3, dir4 } = dir2;
    const { file3, dir5, dir6 } = dir4;
    const { file4 } = dir6;

    [result, dir1, dir2, dir3, dir4, dir5, dir6].forEach((dir) => {
      expect(getOperationsType(dir)).toBe(DirType);
    });

    [file1, file2, file3, file4].forEach((file) => {
      expect(getOperationsType(file)).toBe(FileType);
    });
  });
});
