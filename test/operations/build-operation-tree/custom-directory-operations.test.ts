import fs from 'node:fs';
import { beforeAll, beforeEach, describe, expect, it, suite } from 'vitest';
import { buildOperationTree } from '../../../src/operations/build-operation-tree.js';
import type {
  DirOperationsInterface,
  GetDirOperationsFn,
  OperationsType,
  RootOperationTreeType,
} from '../../../src/operations/operation.types.js';
import type { FileTreeInterface } from '../../../src/file-tree/file-tree.types.js';
import { testSetup } from '../../test-setup.js';
import { deleteFolder } from '../../utils.js';
import { dirOperationsObject, Test, tree, type Tree } from './constants.js';

const { setup, joinPath } = testSetup(Test.CustomDirOperations, import.meta);

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
    const dirOperations: GetDirOperationsFn = (dir) => ({
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
    });

    type CustomDirOperations = ReturnType<typeof dirOperations>;
    type DirOperations = CustomDirOperations &
      DirOperationsInterface<
        FileTreeInterface,
        OperationsType,
        CustomDirOperations
      >;

    const customDirOperationsObject = {
      getDirPath: expect.any(Function),
      getDirType: expect.any(Function),
      getDirChildren: expect.any(Function),
      plusOne: expect.any(Function),
    };

    let result: RootOperationTreeType<
      Tree,
      OperationsType,
      CustomDirOperations
    >;

    beforeAll(() => {
      return setup();
    });

    type GetDescribePathFn = (...args: string[]) => string;
    type UseFileTreeDirsCb = (dir: DirOperations) => void;
    type UseDirCreateCb = (dir: DirOperations, path: string) => void;

    function describeTest(testName: string): {
      getDescribePath: GetDescribePathFn;
      useFileTreeDirs: (testCb: UseFileTreeDirsCb) => void;
      useDirCreate: (testCb: UseDirCreateCb) => void;
    } {
      function getDescribePath(...args: string[]): string {
        return joinPath(testName, ...args);
      }

      const testPath = getDescribePath();

      beforeEach(() => {
        result = buildOperationTree(testPath, tree, { dirOperations });

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
        fs.mkdirSync(joinPath(testName, 'dir1'), { recursive: true });
        fs.mkdirSync(joinPath(testName, 'dir2', 'dir1'), { recursive: true });

        const dirName = 'new-dir';
        const dir1 = result.$dirCreate(dirName);
        const dir2 = result.dir1.$dirCreate(dirName);
        const dir3 = result.dir2.dir1.$dirCreate(dirName);

        testCb(dir1, joinPath(testName, dirName));
        testCb(dir2, joinPath(testName, 'dir1', dirName));
        testCb(dir3, joinPath(testName, 'dir2', 'dir1', dirName));
      }

      return {
        getDescribePath,
        useFileTreeDirs,
        useDirCreate,
      };
    }

    describe('custom directory operations properties', () => {
      const { useFileTreeDirs, useDirCreate } = describeTest(
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
      const { getDescribePath, useDirCreate } = describeTest(
        CustomOperations.GetDirPath,
      );

      it('should return directory path (file tree)', () => {
        interface TestItem {
          dirPath: string;
          dir: DirOperations;
        }

        const dirs: TestItem[] = [
          {
            dir: result,
            dirPath: getDescribePath(),
          },
          {
            dir: result.dir1,
            dirPath: getDescribePath('dir1'),
          },
          {
            dir: result.dir2,
            dirPath: getDescribePath('dir2'),
          },
          {
            dir: result.dir2.dir1,
            dirPath: getDescribePath('dir2', 'dir1'),
          },
          {
            dir: result.dir2.dir2,
            dirPath: getDescribePath('dir2', 'dir2'),
          },
        ];

        dirs.forEach(({ dir, dirPath }) => {
          expect(dir.getDirPath()).toBe(dirPath);
        });
      });

      it('should return directory path (dirCreate)', () => {
        useDirCreate((dir, dirPath) => {
          expect(dir.getDirPath()).toBe(dirPath);
        });
      });
    });

    describe('getDirType custom operation', () => {
      const { useFileTreeDirs, useDirCreate } = describeTest(
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
      const { useDirCreate } = describeTest(CustomOperations.GetDirChildren);

      it('should return directory children keys (file tree)', () => {
        interface TestItem {
          children: string[];
          dir: DirOperations;
        }

        const dirs: TestItem[] = [
          {
            dir: result,
            children: ['dir1', 'dir2', 'file1', 'file2'],
          },
          {
            dir: result.dir1,
            children: [],
          },
          {
            dir: result.dir2,
            children: ['dir1', 'dir2', 'file1', 'file2'],
          },
          {
            dir: result.dir2.dir1,
            children: [],
          },
          {
            dir: result.dir2.dir2,
            children: ['file1', 'file2'],
          },
        ];

        function sort(array: string[]): string[] {
          return array.concat().sort();
        }

        dirs.forEach(({ dir, children }) => {
          expect(sort(dir.getDirChildren())).toEqual(sort(children));
        });
      });

      it('should return directory children keys (dirCreate)', () => {
        useDirCreate((dir) => {
          expect(dir.getDirChildren()).toEqual([]);
        });
      });
    });

    describe('plusOne custom operation', () => {
      const { useFileTreeDirs, useDirCreate } = describeTest(
        CustomOperations.PlusOne,
      );

      it('should add 1 on directory objects (file tree)', () => {
        useFileTreeDirs((dir) => {
          expect(dir.plusOne(1)).toBe(2);
        });
      });

      it('should add 1 on directory objects (dirCreate)', () => {
        useDirCreate((dir) => {
          expect(dir.plusOne(1)).toBe(2);
        });
      });
    });
  },
);
