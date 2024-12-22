import { beforeEach, describe, expect, it, suite } from 'vitest';

import { buildOperations } from '@app/operations/build-operations.js';
import {
  getTreeDir,
  getTreeFile,
} from '@app/operations/utils/get-tree-value.js';
import { testSetup } from '@test-setup';

import { TestEnum } from './test.enum.js';

import type { FileTreeInterface } from '@app-types/file-tree.types.js';
import type { DirOperationsType } from '@app-types/operation.types.js';

const { testPath } = testSetup(TestEnum.GetTreeValue, import.meta);

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

suite('get tree value functions', () => {
  let operations: DirOperationsType<typeof tree, undefined, undefined>;

  beforeEach(() => {
    operations = buildOperations(testPath, tree);
  });

  describe('getTreeFile function', () => {
    it('should return tree file values', () => {
      const o = operations;
      const { file1, dir2 } = tree;
      const { file2, dir4 } = dir2;
      const { file3, dir6 } = dir4;
      const { file4 } = dir6;

      expect(getTreeFile(o.file1)).toBe(file1);
      expect(getTreeFile(o.dir2.file2)).toBe(file2);
      expect(getTreeFile(o.dir2.dir4.file3)).toBe(file3);
      expect(getTreeFile(o.dir2.dir4.dir6.file4)).toBe(file4);
    });
  });

  describe('getTreeDir function', () => {
    it('should return tree directory values', () => {
      const o = operations;
      const { dir1, dir2 } = tree;
      const { dir3, dir4 } = dir2;
      const { dir5, dir6 } = dir4;

      expect(getTreeDir(o)).toBe(tree);
      expect(getTreeDir(o.dir1)).toBe(dir1);
      expect(getTreeDir(o.dir2)).toBe(dir2);
      expect(getTreeDir(o.dir2.dir3)).toBe(dir3);
      expect(getTreeDir(o.dir2.dir4)).toBe(dir4);
      expect(getTreeDir(o.dir2.dir4.dir5)).toBe(dir5);
      expect(getTreeDir(o.dir2.dir4.dir6)).toBe(dir6);
    });
  });
});
