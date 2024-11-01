import fs from 'node:fs';
import { beforeAll, beforeEach, describe, expect, it, suite } from 'vitest';
import { buildOperations } from '../../../src/operations/build-operations.js';
import type { FileTreeInterface } from '../../../src/types/file-tree.types.js';
import type {
  DirOperationsFn,
  DirOperationsInterface,
  OperationsRecord,
  OperationsType,
} from '../../../src/types/operation.types.js';
import { testSetup } from '../../test-setup.js';
import { deleteFolder } from '../../utils.js';
import { dirOperationsObject, tree, type Tree } from '../../constants.js';
import { Test } from './constants.js';

const { setup, joinPath } = testSetup(Test.ExtraDirOperations, import.meta);

enum ExtraOperations {
  ObjectProperties = 'object-properties',
  GetDirPath = 'get-dir-path',
  GetDirChildren = 'get-dir-children',
  GetDirType = 'get-dir-type',
  PlusOne = 'plus-one',
}

suite(
  'buildOperations - extra directory operations',
  { concurrent: false },
  () => {
    type ExtraDirOperations = {
      getDirPath: () => string;
      getDirChildren: () => string[];
      plusOne: (num: number) => number;
    };

    const dirOperations: DirOperationsFn<ExtraDirOperations> = (dir) => ({
      getDirPath() {
        return dir.path;
      },
      getDirChildren() {
        return Object.keys(dir.children ?? {});
      },
      plusOne(num) {
        return num + 1;
      },
    });

    type ExtraFileOperations = OperationsRecord;
    type DirOperations = ExtraDirOperations &
      DirOperationsInterface<
        FileTreeInterface,
        ExtraFileOperations,
        ExtraDirOperations
      >;

    type ExtraDiroperationsObject = Record<
      keyof ExtraDirOperations,
      ReturnType<typeof expect.any>
    >;

    const extraDirOperationsObject: ExtraDiroperationsObject = {
      getDirPath: expect.any(Function),
      getDirChildren: expect.any(Function),
      plusOne: expect.any(Function),
    };

    let result: OperationsType<Tree, ExtraFileOperations, ExtraDirOperations>;

    beforeAll(() => {
      return setup();
    });

    type GetDescribePathFn = (...args: string[]) => string;
    type UseDirsCb = (
      dir: DirOperations,
      info: {
        parentDirs: string[];
        children: string[];
      },
    ) => void;

    function describeTest(testName: string): {
      getDescribePath: GetDescribePathFn;
      useDirs: (cb: UseDirsCb) => void;
    } {
      function getDescribePath(...args: string[]): string {
        return joinPath(testName, ...args);
      }

      const testPath = getDescribePath();

      beforeEach(() => {
        result = buildOperations(testPath, tree, { dirOperations });

        fs.mkdirSync(testPath);
        return (): void => {
          deleteFolder(testPath);
        };
      });

      interface DirType {
        dir: DirOperations;
        parentDirs: string[];
        children: string[];
      }

      function useDirs(cb: UseDirsCb): void {
        const dirs: DirType[] = [];

        function buildDirs(
          dir: DirOperations,
          parentDirs: string[] = [],
        ): void {
          const children = Object.entries(dir)
            .filter(([, value]) => !(value instanceof Function))
            .map(([key]) => key);

          dirs.push({
            dir,
            parentDirs,
            children,
          });

          Object.entries(children).forEach(([key, child]) => {
            if (
              typeof child === 'object' &&
              child !== null &&
              !Array.isArray(child)
            ) {
              buildDirs(child, [...parentDirs, key]);
            }
          });
        }

        buildDirs(result);

        const dirName = 'new-dir';

        /**
         * Types of directories for testing
         * 1. from the file tree
         * 2. created with $dirCreate
         */
        dirs.forEach(({ dir, parentDirs, children }) => {
          const dirPath = getDescribePath(...parentDirs);
          fs.mkdirSync(dirPath, { recursive: true });

          cb(dir, { parentDirs, children });
          cb(dir.$dirCreate(dirName), {
            parentDirs: parentDirs.concat(dirName),
            children: [],
          });
        });
      }

      return {
        getDescribePath,
        useDirs,
      };
    }

    describe('extra directory operations properties', () => {
      const { useDirs } = describeTest(ExtraOperations.ObjectProperties);

      const operationsObject = {
        ...dirOperationsObject,
        ...extraDirOperationsObject,
      };

      it('should be defined', () => {
        expect(result).toBeDefined();
      });

      it('should have extra directory operations', () => {
        useDirs((dir) => {
          expect(dir).toMatchObject(operationsObject);
        });
      });
    });

    describe('getDirPath extra operation', () => {
      const { getDescribePath, useDirs } = describeTest(
        ExtraOperations.GetDirPath,
      );

      it('should return directory path', () => {
        useDirs((dir, { parentDirs }) => {
          expect(dir.getDirPath()).toBe(getDescribePath(...parentDirs));
        });
      });
    });

    describe('getDirChildren extra operation', () => {
      const { useDirs } = describeTest(ExtraOperations.GetDirChildren);

      function sort(array: string[]): string[] {
        return array.concat().sort();
      }

      it('should return directory children keys', () => {
        useDirs((dir, { children }) => {
          expect(sort(dir.getDirChildren())).toEqual(sort(children));
        });
      });
    });

    describe('plusOne extra operation', () => {
      const { useDirs } = describeTest(ExtraOperations.PlusOne);

      it('should add 1 on directory objects', () => {
        useDirs((dir) => {
          expect(dir.plusOne(1)).toBe(2);
        });
      });
    });
  },
);
