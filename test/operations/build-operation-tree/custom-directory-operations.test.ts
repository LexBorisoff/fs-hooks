import fs from 'node:fs';
import { beforeAll, beforeEach, describe, expect, it, suite } from 'vitest';
import { buildOperationTree } from '../../../src/operations/build-operation-tree.js';
import type {
  DirOperationsInterface,
  FileTreeOperationsType,
} from '../../../src/operations/operation.types.js';
import { buildDirOperations } from '../../../src/operations/build-operations.js';
import { testSetup } from '../../test-setup.js';
import { deleteFolder } from '../../utils.js';
import { dirOperationsObject, Test, tree, type Tree } from './constants.js';

const { setup, joinPath } = testSetup(Test.CustomFileOperations, import.meta);

enum CustomOperations {
  ObjectProperties = 'object-properties',
  GetDirPath = 'get-dir-path',
  GetDirChildren = 'get-dir-children',
  GetDirType = 'get-dir-type',
  PlusOne = 'plus-one',
}

suite(
  'buildOperationTree - custom directory operations',
  { concurrent: false },
  () => {
    const getDirOperations = buildDirOperations((dir) => ({
      getDirPath(): string {
        return dir.path;
      },
      getDirType(): 'dir' {
        return dir.type;
      },
      getDirChildren(): string[] {
        return Object.keys(dir.children ?? {});
      },
      plusOne(value: number): number {
        return value + 1;
      },
    }));

    type CustomDirOperations = ReturnType<typeof getDirOperations>;
    type DirOperations = CustomDirOperations &
      DirOperationsInterface<undefined, undefined, CustomDirOperations>;

    const customDirOperationsObject = {
      getDirPath: expect.any(Function),
      getDirType: expect.any(Function),
      getDirChildren: expect.any(Function),
      plusOne: expect.any(Function),
    };

    let result: FileTreeOperationsType<Tree, undefined, CustomDirOperations>;

    beforeAll(() => {
      return setup();
    });

    type OperationPathFn = (...args: string[]) => string;
    type UseFileTreeDirsCb = (dir: DirOperations) => void;
    type UseDirCreateCb = (dir: DirOperations, path: string) => void;

    function describeOperation(testName: string): {
      operationPath: OperationPathFn;
      useFileTreeDirs: (testCb: UseFileTreeDirsCb) => void;
      useDirCreate: (testCb: UseDirCreateCb) => void;
    } {
      function operationPath(...args: string[]): string {
        return joinPath(testName, ...args);
      }

      const testPath = operationPath();

      beforeEach(() => {
        result = buildOperationTree(testPath, tree, {
          dir: getDirOperations,
        });

        fs.mkdirSync(testPath);
        return (): void => {
          deleteFolder(testPath);
        };
      });

      /**
       * Tests directories from the file tree
       */
      function useFileTreeDirs(testCb: UseFileTreeDirsCb): void {
        const dirs = [
          result,
          result.dir1,
          result.dir2,
          result.dir2.dir1,
          result.dir2.dir2,
        ];

        dirs.forEach((dir) => {
          testCb(dir);
        });
      }

      /**
       * Tests directories created via dirCreate
       */
      function useDirCreate(testCb: UseDirCreateCb): void {
        const dirName = 'new-dir';
        const dir1 = result.$dirCreate(dirName);
        const dir2 = result.dir1.$dirCreate(dirName);
        const dir3 = result.dir2.dir1.$dirCreate(dirName);

        testCb(dir1, joinPath(testName, dirName));
        testCb(dir2, joinPath(testName, 'dir1', dirName));
        testCb(dir3, joinPath(testName, 'dir2', 'dir1', dirName));
      }

      return {
        operationPath,
        useFileTreeDirs,
        useDirCreate,
      };
    }

    describe('custom directory operations properties', () => {
      const { useFileTreeDirs, useDirCreate } = describeOperation(
        CustomOperations.ObjectProperties,
      );

      const fullDirOperations = {
        ...dirOperationsObject,
        ...customDirOperationsObject,
      };

      it('should be defined', () => {
        expect(result).toBeDefined();
      });

      it('should have custom directory operations (file tree)', () => {
        useFileTreeDirs((dir) => {
          expect(dir).toMatchObject(fullDirOperations);
        });
      });

      it('should have custom directory operations (dirCreate)', () => {
        useDirCreate((dir) => {
          expect(dir).toMatchObject(fullDirOperations);
        });
      });
    });

    describe('getDirPath custom operation', () => {
      const { operationPath, useDirCreate } = describeOperation(
        CustomOperations.GetDirPath,
      );

      it('should return directory path (file tree)', () => {
        expect(result.getDirPath()).toBe(operationPath());
        expect(result.dir1.getDirPath()).toBe(operationPath('dir1'));
        expect(result.dir2.getDirPath()).toBe(operationPath('dir2'));
        expect(result.dir2.dir1.getDirPath()).toBe(
          operationPath('dir2', 'dir1'),
        );
        expect(result.dir2.dir2.getDirPath()).toBe(
          operationPath('dir2', 'dir2'),
        );
      });

      it('should return directory path (dirCreate)', () => {
        useDirCreate((dir, dirPath) => {
          expect(dir.getDirPath()).toBe(dirPath);
        });
      });
    });

    describe('getDirType custom operation', () => {
      const { useFileTreeDirs, useDirCreate } = describeOperation(
        CustomOperations.GetDirType,
      );

      it('should return directory type (file tree)', () => {
        useFileTreeDirs((dir) => {
          expect(dir.getDirType()).toBe('dir');
        });
      });

      it('should return directory type (dirCreate)', () => {
        useDirCreate((dir) => {
          expect(dir.getDirType()).toBe('dir');
        });
      });
    });

    describe('getDirChildren custom operation', () => {
      const { useDirCreate } = describeOperation(
        CustomOperations.GetDirChildren,
      );

      it('should return directory children keys (file tree)', () => {
        function sort(array: string[]): string[] {
          return array.concat().sort();
        }

        expect(sort(result.getDirChildren())).toEqual(
          sort(['dir1', 'dir2', 'file1', 'file2']),
        );
        expect(result.dir1.getDirChildren()).toEqual([]);
        expect(sort(result.dir2.getDirChildren())).toEqual(
          sort(['dir1', 'dir2', 'file1', 'file2']),
        );
        expect(result.dir2.dir1.getDirChildren()).toEqual([]);
        expect(sort(result.dir2.dir2.getDirChildren())).toEqual(
          sort(['file1', 'file2']),
        );
      });

      it('should return directory children keys (dirCreate)', () => {
        useDirCreate((dir) => {
          expect(dir.getDirChildren()).toEqual([]);
        });
      });
    });

    describe('plusOne custom operation', () => {
      const { useFileTreeDirs, useDirCreate } = describeOperation(
        CustomOperations.PlusOne,
      );

      it('should add 1 (file tree)', () => {
        useFileTreeDirs((dir) => {
          expect(dir.plusOne(1)).toBe(2);
        });
      });

      it('should add 1 (dirCreate)', () => {
        useDirCreate((dir) => {
          expect(dir.plusOne(1)).toBe(2);
        });
      });
    });
  },
);
