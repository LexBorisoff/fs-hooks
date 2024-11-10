import { beforeAll, expect, it, suite } from 'vitest';
import { buildOperations } from '../../../../src/operations/build-operations.js';
import { getOperationsType } from '../../../../src/operations/utils/get-operations-type.js';
import { OperationsTypeEnum } from '../../../../src/operations/utils/operations-type.enum.js';
import type { FileTreeInterface } from '../../../../src/types/file-tree.types.js';
import { testSetup } from '../../../test-setup.js';
import { Test } from './constants.js';

const { setup, testPath } = testSetup(Test.GetOperationsType, import.meta);

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
  beforeAll(() => setup());

  it('should return operations type', () => {
    const result = buildOperations(testPath, tree);

    const { file1, dir1, dir2 } = result;
    const { file2, dir3, dir4 } = dir2;
    const { file3, dir5, dir6 } = dir4;
    const { file4 } = dir6;

    expect(getOperationsType(result)).toBe(DirType);
    expect(getOperationsType(dir1)).toBe(DirType);
    expect(getOperationsType(dir2)).toBe(DirType);
    expect(getOperationsType(dir3)).toBe(DirType);
    expect(getOperationsType(dir4)).toBe(DirType);
    expect(getOperationsType(dir5)).toBe(DirType);
    expect(getOperationsType(dir6)).toBe(DirType);

    expect(getOperationsType(file1)).toBe(FileType);
    expect(getOperationsType(file2)).toBe(FileType);
    expect(getOperationsType(file3)).toBe(FileType);
    expect(getOperationsType(file4)).toBe(FileType);
  });
});
