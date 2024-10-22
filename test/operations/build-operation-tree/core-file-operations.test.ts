import fs from 'node:fs';
import { beforeAll, beforeEach, describe, expect, it, suite } from 'vitest';
import type { FileTreeOperationsType } from '../../../src/operations/operation.types.js';
import { buildOperationTree } from '../../../src/operations/build-operation-tree.js';
import { testSetup } from '../../test-setup.js';
import { deleteFolder } from '../../utils.js';
import { Test, tree, type Tree } from './constants.js';

const { setup, joinPath } = testSetup(Test.CoreFileOperations, import.meta);

enum CoreOperations {
  GetPath = 'get-path',
  Exists = 'exists',
  Read = 'read',
  Write = 'write',
  Clear = 'clear',
}

suite(
  'buildOperationTree - core file operations',
  { concurrent: false },
  () => {
    let result: FileTreeOperationsType<Tree>;

    beforeAll(() => {
      return setup();
    });

    type OperationPathFn = (...args: string[]) => string;

    function describeOperation(testName: string): OperationPathFn {
      function operationPath(...args: string[]): string {
        return joinPath(testName, ...args);
      }

      const testPath = operationPath();

      beforeEach(() => {
        result = buildOperationTree(testPath, tree);
        fs.mkdirSync(testPath);
        return (): void => {
          deleteFolder(testPath);
        };
      });

      return operationPath;
    }

    describe('getPath operation on file objects', () => {
      const operationPath = describeOperation(CoreOperations.GetPath);

      it('should return file path (file tree)', () => {
        interface TestItem {
          filePath: string;
          getPath: () => string;
        }

        const files: TestItem[] = [
          {
            filePath: operationPath('file1'),
            getPath: () => result.file1.$getPath(),
          },
          {
            filePath: operationPath('file2'),
            getPath: () => result.file2.$getPath(),
          },
          {
            filePath: operationPath('dir2', 'file1'),
            getPath: () => result.dir2.file1.$getPath(),
          },
          {
            filePath: operationPath('dir2', 'file2'),
            getPath: () => result.dir2.file2.$getPath(),
          },
          {
            filePath: operationPath('dir2', 'dir2', 'file1'),
            getPath: () => result.dir2.dir2.file1.$getPath(),
          },
          {
            filePath: operationPath('dir2', 'dir2', 'file2'),
            getPath: () => result.dir2.dir2.file2.$getPath(),
          },
        ];

        files.forEach(({ filePath, getPath }) => {
          expect(getPath()).toBe(filePath);
        });
      });

      it('should return file path (fileCreate)', () => {
        const fileName = 'new-file';
      });

      it('should return file path (dirCreate + fileCreate)', () => {
        // TODO
      });
    });

    describe('exists operation on file objects', () => {
      const operationPath = describeOperation(CoreOperations.Exists);

      it('should check if file exists (file tree)', () => {
        // TODO
      });

      it('should check if file exists (fileCreate)', () => {
        // TODO
      });

      it('should check if file exists (dirCreate + fileCreate)', () => {
        // TODO
      });
    });

    describe('read operation', () => {
      const operationPath = describeOperation(CoreOperations.Read);

      it('should read file data (file tree)', () => {
        // TODO
      });

      it('should read file data (fileCreate)', () => {
        // TODO
      });

      it('should read file data (dirCreate + fileCreate)', () => {
        // TODO
      });
    });

    describe('write operation', () => {
      const operationPath = describeOperation(CoreOperations.Write);

      it('should write data to the file (file tree)', () => {
        // TODO
      });

      it('should write data to the file (fileCreate)', () => {
        // TODO
      });

      it('should write data to the file (dirCreate + fileCreate)', () => {
        // TODO
      });
    });

    describe('clear operation', () => {
      const operationPath = describeOperation(CoreOperations.Clear);

      it('should clear file data (file tree)', () => {
        // TODO
      });

      it('should clear file data (fileCreate)', () => {
        // TODO
      });

      it('should clear file data (dirCreate + fileCreate)', () => {
        // TODO
      });
    });
  },
);
