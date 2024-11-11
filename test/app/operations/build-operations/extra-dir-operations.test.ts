import fs from 'node:fs';
import { beforeAll, beforeEach, describe, expect, it, suite } from 'vitest';
import { buildOperations } from '../../../../src/operations/build-operations.js';
import type { FileTreeInterface } from '../../../../src/types/file-tree.types.js';
import type {
  DirOperationsFn,
  DirOperationsType,
} from '../../../../src/types/operation.types.js';
import {
  buildOperationsObject,
  dirOperationsObject,
} from '../../../operations-objects.js';
import { testSetup } from '../../../test-setup.js';
import { tree } from '../../../tree.js';
import { getUseDirs, type UseDirsFn } from '../../../use-dirs.js';
import { deleteFolder } from '../../../utils.js';
import { Test } from './constants.js';

const { setup, joinPath } = testSetup(Test.ExtraDirOperations, import.meta);

enum ExtraOperations {
  ObjectProperties = 'object-properties',
  GetDirPath = 'get-dir-path',
  GetDirChildren = 'get-dir-children',
  PlusOne = 'plus-one',
}

suite(
  'buildOperations - extra directory operations',
  { concurrent: false },
  () => {
    beforeAll(() => setup());

    type ExtraDirOperations = {
      getDirPath: () => string;
      getDirChildren: () => string[];
      plusOne: (num: number) => number;
    };

    const methods: (keyof ExtraDirOperations)[] = [
      'getDirPath',
      'getDirChildren',
      'plusOne',
    ];

    const extraDirOperationsObject = buildOperationsObject(methods);

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

    let result: DirOperationsType<
      FileTreeInterface,
      undefined,
      ExtraDirOperations
    >;
    let useDirs: UseDirsFn<undefined, ExtraDirOperations>;
    let getDescribePath: (...args: string[]) => string;

    function describeSetup(testName: string): void {
      beforeEach(() => {
        getDescribePath = (...args) => joinPath(testName, ...args);
        const testPath = getDescribePath();
        result = buildOperations(testPath, tree, { dirOperations });
        useDirs = getUseDirs(result, getDescribePath);

        fs.mkdirSync(testPath);
        return (): void => {
          deleteFolder(testPath);
        };
      });
    }

    describe('extra directory operations properties', () => {
      describeSetup(ExtraOperations.ObjectProperties);

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
      describeSetup(ExtraOperations.GetDirPath);

      it('should return directory path', () => {
        useDirs((dir, { pathDirs }) => {
          expect(dir.getDirPath()).toBe(getDescribePath(...pathDirs));
        });
      });
    });

    describe('getDirChildren extra operation', () => {
      describeSetup(ExtraOperations.GetDirChildren);

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
      describeSetup(ExtraOperations.PlusOne);

      it('should add 1 on directory objects', () => {
        useDirs((dir) => {
          expect(dir.plusOne(1)).toBe(2);
        });
      });
    });
  },
);
