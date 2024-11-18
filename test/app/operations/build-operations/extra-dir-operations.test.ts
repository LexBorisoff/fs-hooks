import fs from 'node:fs';
import { beforeAll, beforeEach, describe, expect, it, suite } from 'vitest';
import { buildOperations } from '@app/operations/build-operations.js';
import type { FileTreeInterface } from '@app-types/file-tree.types.js';
import type { DirOperationsType } from '@app-types/operation.types.js';
import { testSetup } from '@test-setup';
import { deleteDir } from '@test-utils/delete-dir.js';
import {
  extraDirOperations,
  type ExtraDirOperations,
} from '@test-utils/extra-operations.js';
import {
  buildOperationsObject,
  dirOperationsObject,
} from '@test-utils/operations-objects.js';
import { tree } from '@test-utils/tree.js';
import { getUseDirs, type UseDirsFn } from '@test-utils/use-dirs.js';
import { TestEnum } from './test.enum.js';

const { setup, joinPath } = testSetup(TestEnum.ExtraDirOperations, import.meta);

enum ExtraOperationsTest {
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

    const methods: (keyof ExtraDirOperations)[] = [
      'getDirPath',
      'getDirChildren',
      'plusOne',
    ];

    const extraDirOperationsObject = buildOperationsObject(methods);

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
        result = buildOperations(testPath, tree, { dir: extraDirOperations });
        useDirs = getUseDirs(result, getDescribePath);

        fs.mkdirSync(testPath);
        return (): void => {
          deleteDir(testPath);
        };
      });
    }

    describe('extra directory operations properties', () => {
      describeSetup(ExtraOperationsTest.ObjectProperties);

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
      describeSetup(ExtraOperationsTest.GetDirPath);

      it('should return directory path', () => {
        useDirs((dir, { pathDirs }) => {
          expect(dir.getDirPath()).toBe(getDescribePath(...pathDirs));
        });
      });
    });

    describe('getDirChildren extra operation', () => {
      describeSetup(ExtraOperationsTest.GetDirChildren);

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
      describeSetup(ExtraOperationsTest.PlusOne);

      it('should add 1 on directory objects', () => {
        useDirs((dir) => {
          expect(dir.plusOne(1)).toBe(2);
        });
      });
    });
  },
);
