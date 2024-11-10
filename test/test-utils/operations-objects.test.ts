import { beforeAll, describe, expect, it, suite } from 'vitest';
import type { FileTreeInterface } from '../../src/types/file-tree.types.js';
import {
  buildOperationsObject,
  buildOperationsTreeObject,
  dirOperationsObject,
  fileOperationsObject,
} from '../operations-objects.js';
import { testSetup } from '../test-setup.js';
import { Test } from './constants.js';

const { setup } = testSetup(Test.OperationsObjects, import.meta);

interface FileTree {
  file1: any;
  dir1: any;
  dir2: {
    file2: any;
    dir3: any;
    dir4: {
      file3: any;
      dir5: any;
      dir6: {
        file4: any;
      };
    };
  };
}

const tree: FileTreeInterface = {
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
} satisfies FileTree;

suite('operations objects test utils', () => {
  beforeAll(() => setup());

  describe('buildOperationsObject function', () => {
    it('should build an operations object', () => {
      const value = expect.any(Function);

      const obj = {
        method1: value,
        method2: value,
        method3: value,
      };

      const result = buildOperationsObject(Object.keys(obj));
      expect(result).toEqual(obj);
    });
  });

  describe('buildOperationsTreeObject function', () => {
    const operations: FileTree = {
      ...dirOperationsObject,
      file1: fileOperationsObject,
      dir1: dirOperationsObject,
      dir2: {
        ...dirOperationsObject,
        file2: fileOperationsObject,
        dir3: dirOperationsObject,
        dir4: {
          ...dirOperationsObject,
          file3: fileOperationsObject,
          dir5: dirOperationsObject,
          dir6: {
            ...dirOperationsObject,
            file4: fileOperationsObject,
          },
        },
      },
    };

    it('should build an operations tree object', () => {
      expect(buildOperationsTreeObject(tree)).toEqual(operations);
    });
  });
});
