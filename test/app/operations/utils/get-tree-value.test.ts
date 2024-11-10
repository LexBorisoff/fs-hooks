import { beforeAll, describe, expect, it, suite } from 'vitest';
import { buildOperations } from '../../../../src/operations/build-operations.js';
import {
  getTreeDir,
  getTreeFile,
} from '../../../../src/operations/utils/get-tree-value.js';
import type { FileTreeInterface } from '../../../../src/types/file-tree.types.js';
import { testSetup } from '../../../test-setup.js';
import { Test } from './constants.js';

const { setup, testPath } = testSetup(Test.GetTreeValue, import.meta);

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
  beforeAll(() => setup());

  const operations = buildOperations(testPath, tree);

  describe('getTreeFile function', () => {
    it('should return tree file values', () => {
      const { file1, dir2 } = tree;
      const { file2, dir4 } = dir2;
      const { file3, dir6 } = dir4;
      const { file4 } = dir6;

      expect(getTreeFile(operations.file1)).toBe(file1);
      expect(getTreeFile(operations.dir2.file2)).toBe(file2);
      expect(getTreeFile(operations.dir2.dir4.file3)).toBe(file3);
      expect(getTreeFile(operations.dir2.dir4.dir6.file4)).toBe(file4);
    });
  });

  describe('getTreeDir function', () => {
    it('should return tree directory values', () => {
      const { dir1, dir2 } = tree;
      const { dir3, dir4 } = dir2;
      const { dir5, dir6 } = dir4;

      expect(getTreeDir(operations)).toBe(tree);
      expect(getTreeDir(operations.dir1)).toBe(dir1);
      expect(getTreeDir(operations.dir2)).toBe(dir2);
      expect(getTreeDir(operations.dir2.dir3)).toBe(dir3);
      expect(getTreeDir(operations.dir2.dir4)).toBe(dir4);
      expect(getTreeDir(operations.dir2.dir4.dir5)).toBe(dir5);
      expect(getTreeDir(operations.dir2.dir4.dir6)).toBe(dir6);
    });
  });
});
